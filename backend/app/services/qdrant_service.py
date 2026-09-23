import os
import uuid
from typing import Optional, List, Dict, Any
from ..config.settings import get_settings

settings = get_settings()

class QdrantService:
    def __init__(self):
        self.client = None
        self.embedder = None
        self._init_client()

    def _init_client(self):
        if settings.QDRANT_URL and settings.QDRANT_API_KEY:
            try:
                from qdrant_client import QdrantClient
                self.client = QdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY,
                    timeout=10.0
                )
                print(" Connected to Qdrant Cloud Cluster successfully.")
            except Exception as e:
                print(f"⚠️ Failed to connect to Qdrant Cloud: {e}")
                self.client = None

    def _load_embedder(self):
        if self.embedder is None:
            try:
                from fastembed import TextEmbedding
                self.embedder = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
            except Exception:
                self.embedder = False

    def embed_text(self, text: str) -> List[float]:
        self._load_embedder()
        if self.embedder:
            try:
                generator = self.embedder.embed([text])
                return list(next(generator))
            except Exception:
                pass
        
        # Fast, deterministic L2-normalized 384-dim semantic feature vector
        import hashlib
        import math
        import re

        dim = 384
        vec = [0.0] * dim
        clean_text = text.lower().strip()
        words = re.findall(r'\b\w+\b', clean_text)
        
        # Word and bigram feature hashing
        features = list(words)
        for i in range(len(words) - 1):
            features.append(f"{words[i]}_{words[i+1]}")
            
        for feat in features:
            h = int(hashlib.md5(feat.encode('utf-8')).hexdigest(), 16)
            idx = h % dim
            sign = 1.0 if ((h >> 16) & 1) == 0 else -1.0
            vec[idx] += sign
            
        # L2-normalize to unit length
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    def ensure_collections(self):
        """Creates collections and payload indexes if they do not exist."""
        if not self.client:
            return

        from qdrant_client.http import models

        collections = {
            "health_schemes": ["state", "category", "target_group"],
            "medical_reports": ["user_id", "report_type"],
            "rural_first_aid": ["emergency_type", "urgency_level"],
            "national_hospitals": ["state", "district", "pincode", "care_type", "discipline"],
            "jan_aushadhi": ["item_type", "category", "district", "state"]
        }

        existing_names = [c.name for c in self.client.get_collections().collections]

        for coll_name, index_fields in collections.items():
            if coll_name not in existing_names:
                print(f"📦 Creating Qdrant collection: {coll_name}...")
                self.client.create_collection(
                    collection_name=coll_name,
                    vectors_config=models.VectorParams(
                        size=384,
                        distance=models.Distance.COSINE
                    )
                )

            # Ensure payload indexes for high performance filtering
            for field in index_fields:
                try:
                    self.client.create_payload_index(
                        collection_name=coll_name,
                        field_name=field,
                        field_schema=models.PayloadSchemaType.KEYWORD
                    )
                except Exception:
                    pass  # Already indexed or exists

            # Geo payload index for hospital and kendra locations
            if coll_name in ("national_hospitals", "jan_aushadhi"):
                try:
                    self.client.create_payload_index(
                        collection_name=coll_name,
                        field_name="location",
                        field_schema=models.PayloadSchemaType.GEO
                    )
                except Exception:
                    pass

    # =========================================================================
    # 1. Government Schemes KB
    # =========================================================================
    def upsert_schemes(self, schemes: List[Dict[str, Any]]):
        if not self.client:
            return False

        from qdrant_client.http import models

        points = []
        for s in schemes:
            embed_content = f"Title: {s.get('title', '')}. State: {s.get('state', 'All-India')}. Category: {s.get('category', '')}. Eligibility: {s.get('eligibility', '')}. Benefits: {s.get('benefits', s.get('description', ''))}"
            vector = self.embed_text(embed_content)
            
            point_id = s.get("id") or str(uuid.uuid4())
            points.append(
                models.PointStruct(
                    id=point_id if isinstance(point_id, str) and len(point_id) == 36 else str(uuid.uuid5(uuid.NAMESPACE_DNS, str(s.get('title', '')))),
                    vector=vector,
                    payload=s
                )
            )

        self.client.upsert(collection_name="health_schemes", points=points)
        print(f"✅ Upserted {len(points)} schemes into Qdrant 'health_schemes'.")
        return True

    def search_schemes(self, query: str = "", state: Optional[str] = None, top_k: int = 15) -> List[Dict[str, Any]]:
        """Hybrid Search: Combines dense vector similarity with token keyword boosting for guaranteed accuracy."""
        if not self.client:
            return []

        import re
        from qdrant_client.http import models

        clean_query = query.strip() if query else "government health scheme hospitalization welfare"
        query_vector = self.embed_text(clean_query)

        query_filter = None
        if state and state.strip().lower() not in ("all", "all-india", "india", "national", ""):
            state_val = state.strip().title()
            query_filter = models.Filter(
                should=[
                    models.FieldCondition(key="state", match=models.MatchValue(value=state_val)),
                    models.FieldCondition(key="state", match=models.MatchValue(value="All-India"))
                ]
            )

        # Retrieve top candidates via vector cosine distance
        candidate_limit = max(top_k * 2, 20)
        if hasattr(self.client, "query_points"):
            results = self.client.query_points(
                collection_name="health_schemes",
                query=query_vector,
                query_filter=query_filter,
                limit=candidate_limit
            ).points
        else:
            results = self.client.search(
                collection_name="health_schemes",
                query_vector=query_vector,
                query_filter=query_filter,
                limit=candidate_limit
            )

        # Keyword token scoring for hybrid re-ranking
        tokens = set(re.findall(r'\b\w{3,}\b', query.lower()))
        scored_results = []

        for hit in results:
            payload = hit.payload or {}
            score = getattr(hit, 'score', 0.0) or 0.0

            # Match tokens against title, category, eligibility, benefits
            searchable_text = f"{payload.get('title', '')} {payload.get('category', '')} {payload.get('eligibility', '')} {payload.get('benefits', '')}".lower()
            token_matches = sum(1 for token in tokens if token in searchable_text)
            
            # Exact title boost
            title_boost = 0.5 if any(token in payload.get('title', '').lower() for token in tokens) else 0.0
            hybrid_score = score + (token_matches * 0.15) + title_boost

            scored_results.append((hybrid_score, payload))

        # Sort by hybrid score descending
        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored_results[:top_k]]


    # =========================================================================
    # 2. Patient Medical Reports KB (Longitudinal Patient Memory)
    # =========================================================================
    def index_medical_report(
        self,
        user_id: str,
        report_id: str,
        summary: str,
        abnormalities: List[Dict[str, Any]],
        recommendations: List[str],
        file_url: str = "",
        report_type: str = "Medical Report"
    ):
        if not self.client:
            return False

        from qdrant_client.http import models

        embed_content = f"Patient Report Summary: {summary}. Abnormal markers: {abnormalities}. Recommendations: {recommendations}"
        vector = self.embed_text(embed_content)

        payload = {
            "user_id": user_id,
            "report_id": report_id,
            "report_type": report_type,
            "summary": summary,
            "abnormalities": abnormalities,
            "recommendations": recommendations,
            "file_url": file_url
        }

        self.client.upsert(
            collection_name="medical_reports",
            points=[
                models.PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload=payload
                )
            ]
        )
        print(f" Indexed medical report for user '{user_id}' in Qdrant.")
        return True

    def delete_medical_report(self, user_id: str, report_id: str):
        """Deletes vector embeddings for a specific report in Qdrant."""
        if not self.client or not user_id:
            return False
        from qdrant_client.http import models
        try:
            self.client.delete(
                collection_name="medical_reports",
                points_selector=models.FilterSelector(
                    filter=models.Filter(
                        must=[
                            models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id)),
                            models.FieldCondition(key="report_id", match=models.MatchValue(value=str(report_id)))
                        ]
                    )
                )
            )
            print(f"🗑️ Deleted report {report_id} for user {user_id} from Qdrant 'medical_reports'.")
            return True
        except Exception as e:
            print(f"⚠️ Error deleting Qdrant medical report: {e}")
            return False

    def search_patient_reports(self, user_id: str, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Strictly searches reports belonging ONLY to the authenticated user_id."""
        if not self.client or not user_id or not query:
            return []

        from qdrant_client.http import models

        query_vector = self.embed_text(query)

        user_filter = models.Filter(
            must=[
                models.FieldCondition(key="user_id", match=models.MatchValue(value=user_id))
            ]
        )

        if hasattr(self.client, "query_points"):
            results = self.client.query_points(
                collection_name="medical_reports",
                query=query_vector,
                query_filter=user_filter,
                limit=top_k
            ).points
        else:
            results = self.client.search(
                collection_name="medical_reports",
                query_vector=query_vector,
                query_filter=user_filter,
                limit=top_k
            )

        return [hit.payload for hit in results]

    # =========================================================================
    # 3. Rural First Aid & Emergency KB
    # =========================================================================
    def upsert_first_aid(self, protocols: List[Dict[str, Any]]):
        if not self.client:
            return False

        from qdrant_client.http import models

        points = []
        for p in protocols:
            embed_content = f"Emergency: {p.get('title', '')} ({p.get('emergency_type', '')}). Actions: {p.get('immediate_dos', '')}. Avoid: {p.get('strict_donts', '')}"
            vector = self.embed_text(embed_content)

            points.append(
                models.PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, str(p.get('emergency_type', '')))),
                    vector=vector,
                    payload=p
                )
            )

        self.client.upsert(collection_name="rural_first_aid", points=points)
        print(f"✅ Upserted {len(points)} emergency protocols into Qdrant 'rural_first_aid'.")
        return True

    def search_first_aid(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """Hybrid Search: Matches emergency vector similarity and boosts exact trauma/symptom types."""
        if not self.client or not query:
            return []

        import re

        query_vector = self.embed_text(query)
        candidate_limit = max(top_k * 2, 4)

        if hasattr(self.client, "query_points"):
            results = self.client.query_points(
                collection_name="rural_first_aid",
                query=query_vector,
                limit=candidate_limit
            ).points
        else:
            results = self.client.search(
                collection_name="rural_first_aid",
                query_vector=query_vector,
                limit=candidate_limit
            )

        tokens = set(re.findall(r'\b\w{3,}\b', query.lower()))
        scored_results = []

        for hit in results:
            payload = hit.payload or {}
            score = getattr(hit, 'score', 0.0) or 0.0

            searchable_text = f"{payload.get('emergency_type', '')} {payload.get('title', '')} {payload.get('immediate_dos', '')}".lower()
            token_matches = sum(1 for token in tokens if token in searchable_text)

            # Boost exact emergency type match (e.g. "snake" -> "snake_bite")
            type_boost = 0.6 if any(token in payload.get('emergency_type', '').lower() for token in tokens) else 0.0
            hybrid_score = score + (token_matches * 0.15) + type_boost

            scored_results.append((hybrid_score, payload))

        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored_results[:top_k]]

    # =========================================================================
    # 4. National Hospital Directory (Geo + Semantic Hybrid Search)
    # =========================================================================
    def search_hospitals(
        self,
        query: str = "",
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        radius_km: float = 25.0,
        district: Optional[str] = None,
        state: Optional[str] = None,
        care_type: Optional[str] = None,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Unified search across 30,273 verified GoI healthcare facilities:
        - If lat/lon provided: filters within radius_km using native Qdrant GeoRadius
        - If district/state provided: matches exact administrative geography
        - Combines dense vector cosine similarity on clinical intent with keyword token boosts
        """
        if not self.client:
            return []

        import re
        from qdrant_client.http import models

        clean_query = query.strip() if query else "emergency hospital healthcare clinic"
        query_vector = self.embed_text(clean_query)

        must_conditions = []

        # 1. Geo-Radius Filter
        if lat is not None and lon is not None:
            try:
                lat_f = float(lat)
                lon_f = float(lon)
                if -90 <= lat_f <= 90 and -180 <= lon_f <= 180 and (lat_f != 0 or lon_f != 0):
                    must_conditions.append(
                        models.FieldCondition(
                            key="location",
                            geo_radius=models.GeoRadius(
                                center=models.GeoPoint(lat=lat_f, lon=lon_f),
                                radius=float(radius_km) * 1000.0  # convert km to meters
                            )
                        )
                    )
            except Exception:
                pass

        # 2. Administrative Geography Filter
        if district and district.strip().lower() not in ("all", "any", ""):
            dist_val = district.strip().title()
            must_conditions.append(
                models.FieldCondition(key="district", match=models.MatchValue(value=dist_val))
            )

        if state and state.strip().lower() not in ("all", "all-india", "india", ""):
            state_val = state.strip().title()
            must_conditions.append(
                models.FieldCondition(key="state", match=models.MatchValue(value=state_val))
            )

        if care_type and care_type.strip().lower() not in ("all", "any", ""):
            must_conditions.append(
                models.FieldCondition(key="care_type", match=models.MatchValue(value=care_type.strip()))
            )

        query_filter = None
        if must_conditions:
            query_filter = models.Filter(must=must_conditions)

        candidate_limit = max(top_k * 2, 10)
        try:
            if hasattr(self.client, "query_points"):
                results = self.client.query_points(
                    collection_name="national_hospitals",
                    query=query_vector,
                    query_filter=query_filter,
                    limit=candidate_limit
                ).points
            else:
                results = self.client.search(
                    collection_name="national_hospitals",
                    query_vector=query_vector,
                    query_filter=query_filter,
                    limit=candidate_limit
                )
        except Exception as e:
            print(f"⚠️ Qdrant hospital search error: {e}")
            return []

        # Keyword token scoring for hybrid re-ranking
        tokens = set(re.findall(r'\b\w{3,}\b', clean_query.lower()))
        scored_results = []

        for hit in results:
            payload = hit.payload or {}
            score = getattr(hit, 'score', 0.0) or 0.0

            searchable_text = f"{payload.get('name', '')} {payload.get('care_type', '')} {payload.get('specialties', '')} {payload.get('facilities', '')}".lower()
            token_matches = sum(1 for token in tokens if token in searchable_text)
            
            # Boost exact emergency match
            emergency_boost = 0.4 if any(t in searchable_text for t in ("emergency", "icu", "cardiac", "trauma", "casualty")) else 0.0
            hybrid_score = score + (token_matches * 0.15) + emergency_boost

            # Normalize payload keys to match frontend expectations
            normalized = {
                "id": payload.get("sr_no") or hit.id,
                "name": payload.get("name", "Unknown Facility"),
                "specialty": payload.get("specialties") or payload.get("care_type", "General Healthcare"),
                "type": "Hospital" if "hospital" in payload.get("care_type", "").lower() else payload.get("care_type", "Healthcare Center"),
                "district": payload.get("district", ""),
                "state": payload.get("state", ""),
                "pincode": payload.get("pincode", ""),
                "address": payload.get("address", ""),
                "contact": payload.get("contact", "108"),
                "location": payload.get("location"),
                "discipline": payload.get("discipline", "Allopathic"),
                "score": round(hybrid_score, 4)
            }
            scored_results.append((hybrid_score, normalized))

        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [p for _, p in scored_results[:top_k]]

    # =========================================================================
    # 5. Jan Aushadhi Generic Medicines & Kendras KB
    # =========================================================================
    def search_jan_aushadhi(
        self,
        query: str,
        district: Optional[str] = None,
        state: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        top_k: int = 4,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Searches PMBJP generic alternatives and nearby Kendras.
        """
        if not self.client or not query:
            return {"medicines": [], "kendras": []}

        from qdrant_client.http import models

        query_vector = self.embed_text(query)

        # 1. Search generic medicines
        med_filter = models.Filter(
            must=[models.FieldCondition(key="item_type", match=models.MatchValue(value="medicine"))]
        )

        candidate_limit = max(top_k * 4, 15)
        try:
            if hasattr(self.client, "query_points"):
                med_results = self.client.query_points(
                    collection_name="jan_aushadhi",
                    query=query_vector,
                    query_filter=med_filter,
                    limit=candidate_limit
                ).points
            else:
                med_results = self.client.search(
                    collection_name="jan_aushadhi",
                    query_vector=query_vector,
                    query_filter=med_filter,
                    limit=candidate_limit
                )

            import re
            tokens = set(re.findall(r'\b\w{3,}\b', query.lower()))
            scored_meds = []
            for hit in med_results:
                payload = hit.payload or {}
                score = getattr(hit, 'score', 0.0) or 0.0

                b_name = payload.get('branded_name', '').lower()
                g_name = payload.get('generic_name', '').lower()
                salt = payload.get('salt', '').lower()
                cat = payload.get('category', '').lower()
                searchable = f"{b_name} {g_name} {salt} {cat}"

                token_matches = sum(1 for t in tokens if t in searchable)
                exact_brand_boost = 1.0 if any(t in b_name for t in tokens) else 0.0
                salt_boost = 0.6 if any(t in salt for t in tokens) else 0.0

                hybrid_score = score + (token_matches * 0.2) + exact_brand_boost + salt_boost
                scored_meds.append((hybrid_score, payload))

            scored_meds.sort(key=lambda x: x[0], reverse=True)
            medicines = [p for _, p in scored_meds[:top_k]]
        except Exception:
            medicines = []

        # 2. Search nearby Kendras
        kendra_must = [models.FieldCondition(key="item_type", match=models.MatchValue(value="kendra"))]
        if district and district.strip().lower() not in ("all", "any", ""):
            kendra_must.append(models.FieldCondition(key="district", match=models.MatchValue(value=district.strip().title())))
        if state and state.strip().lower() not in ("all", "india", ""):
            kendra_must.append(models.FieldCondition(key="state", match=models.MatchValue(value=state.strip().title())))

        kendra_filter = models.Filter(must=kendra_must)

        try:
            if hasattr(self.client, "query_points"):
                kendra_results = self.client.query_points(
                    collection_name="jan_aushadhi",
                    query=query_vector,
                    query_filter=kendra_filter,
                    limit=top_k
                ).points
            else:
                kendra_results = self.client.search(
                    collection_name="jan_aushadhi",
                    query_vector=query_vector,
                    query_filter=kendra_filter,
                    limit=top_k
                )
            kendras = [hit.payload for hit in kendra_results if hit.payload]

            # Fallback to general kendras if district has none seeded
            if not kendras and len(kendra_must) > 1:
                general_kendra_filter = models.Filter(
                    must=[models.FieldCondition(key="item_type", match=models.MatchValue(value="kendra"))]
                )
                if hasattr(self.client, "query_points"):
                    kendras = [h.payload for h in self.client.query_points(
                        collection_name="jan_aushadhi",
                        query=query_vector,
                        query_filter=general_kendra_filter,
                        limit=top_k
                    ).points if h.payload]
        except Exception:
            kendras = []

        return {
            "medicines": medicines,
            "kendras": kendras
        }


# Singleton instance
qdrant_service = QdrantService()
