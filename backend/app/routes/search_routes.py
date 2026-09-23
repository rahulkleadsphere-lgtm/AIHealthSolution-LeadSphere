from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from ..config.db import get_db
from ..models.search_model import Provider, MedicalTerm
from ..models.scheme_model import SchemeCache
from ..services.qdrant_service import qdrant_service
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

router = APIRouter()

class SearchResponse(BaseModel):
    providers: List[dict] = []
    medicines: List[dict] = []
    kendras: List[dict] = []
    terms: List[dict] = []
    schemes: List[dict] = []

@router.get("/search", response_model=SearchResponse)
async def global_search_endpoint(
    query: str = Query(..., min_length=2),
    district: Optional[str] = None,
    state: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    db: Session = Depends(get_db)
):
    q = f"%{query}%"
    
    # 1. Search Verified National Hospitals via Qdrant (<30ms, 30,273 records)
    hospital_results = qdrant_service.search_hospitals(
        query=query,
        lat=lat,
        lon=lon,
        district=district,
        state=state,
        top_k=8
    )

    # 2. Search Jan Aushadhi Generic Medicines & Kendras
    jan_aushadhi_results = qdrant_service.search_jan_aushadhi(
        query=query,
        district=district,
        state=state,
        top_k=4
    )

    # 3. Search Medical Terms from DB
    found_terms = db.query(MedicalTerm).filter(
        or_(
            MedicalTerm.term.ilike(q),
            MedicalTerm.description.ilike(q)
        )
    ).limit(6).all()
    
    # 4. Search Schemes (BSKY, PMJAY, etc.) from Qdrant and DB
    schemes_res = qdrant_service.search_schemes(query, state=state, top_k=4)
    if not schemes_res:
        found_schemes = db.query(SchemeCache).filter(
            or_(
                SchemeCache.name.ilike(q),
                SchemeCache.eligibility.ilike(q),
                SchemeCache.benefits.ilike(q)
            )
        ).limit(4).all()
        schemes_res = [{"name": s.name, "benefits": s.benefits, "state": s.state or "All-India"} for s in found_schemes]

    return SearchResponse(
        providers=hospital_results,
        medicines=jan_aushadhi_results.get("medicines", []),
        kendras=jan_aushadhi_results.get("kendras", []),
        terms=[{"term": t.term, "description": t.description} for t in found_terms],
        schemes=[
            {
                "name": s.get("title") or s.get("name", ""),
                "desc": (s.get("benefits") or s.get("description", ""))[:140] + "...",
                "state": s.get("state", "All-India")
            }
            for s in schemes_res
        ]
    )

@router.get("/directory")
async def get_directory_endpoint(
    district: Optional[str] = None,
    state: Optional[str] = None,
    query: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    radius_km: float = 25.0
):
    """
    Dedicated endpoint for Health Directory page backed by 30,273 verified 
    Government of India (data.gov.in) healthcare facilities and Jan Aushadhi Kendras.
    Replaces slow OpenStreetMap Overpass scraping with sub-50ms Qdrant hybrid retrieval.
    """
    # 1. Fetch verified hospitals from Qdrant
    hospitals = qdrant_service.search_hospitals(
        query=query or "",
        lat=lat,
        lon=lon,
        radius_km=radius_km,
        district=district,
        state=state,
        top_k=25
    )

    # 2. Fetch nearby Jan Aushadhi Kendras as 'Pharmacy' type
    kendras_res = qdrant_service.search_jan_aushadhi(
        query=district or query or "jan aushadhi kendra",
        district=district,
        state=state,
        top_k=5
    )

    formatted_kendras = []
    for k in kendras_res.get("kendras", []):
        formatted_kendras.append({
            "id": f"kendra_{k.get('kendra_code', '')}",
            "name": k.get("name", "Jan Aushadhi Kendra"),
            "specialty": "PMBJP Generic Medicines (50-90% Discount)",
            "type": "Pharmacy",
            "district": k.get("district", ""),
            "state": k.get("state", ""),
            "pincode": k.get("pincode", ""),
            "address": k.get("address", ""),
            "contact": k.get("contact", "1800-180-8080"),
            "location": k.get("location"),
            "score": 1.0
        })

    # Combine facilities
    all_facilities = hospitals + formatted_kendras
    return all_facilities

@router.get("/jan-aushadhi")
async def get_jan_aushadhi_endpoint(
    query: str = Query(..., min_length=2),
    district: Optional[str] = None,
    state: Optional[str] = None
):
    """
    Search PMBJP Jan Aushadhi generic equivalents, salt formulations, 
    and price comparisons (branded vs generic savings).
    """
    return qdrant_service.search_jan_aushadhi(
        query=query,
        district=district,
        state=state,
        top_k=6
    )
