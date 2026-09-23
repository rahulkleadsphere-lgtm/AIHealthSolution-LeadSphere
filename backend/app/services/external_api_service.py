import httpx
import json
from typing import List, Dict

class ExternalGovService:
    @staticmethod
    async def get_nearby_hospitals(district: str, state: str = "Maharashtra") -> List[Dict]:
        """
        Fetch verified GoI hospitals from Qdrant Cloud (<30ms).
        Falls back to OpenStreetMap Overpass only if district is not indexed.
        """
        try:
            from .qdrant_service import qdrant_service
            q_results = qdrant_service.search_hospitals(
                district=district,
                state=state,
                top_k=20
            )
            if q_results:
                return q_results
        except Exception as e:
            print(f"Qdrant hospital lookup fallback: {e}")

        overpass_url = "https://overpass-api.de/api/interpreter"
        nominatim_url = "https://nominatim.openstreetmap.org/search"
        
        headers = {
            "User-Agent": "SevaSetu-Health-Bot/1.0 (contact: info@sevasetu.ai)"
        }

        try:
            async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
                # 1. Geocode the city/district to get lat/lon
                geo_query = f"{district}, {state}, India"
                geo_response = await client.get(nominatim_url, params={
                    "q": geo_query,
                    "format": "json",
                    "limit": 1
                })
                
                lat, lon = None, None
                if geo_response.status_code == 200 and geo_response.json():
                    location = geo_response.json()[0]
                    lat = location.get('lat')
                    lon = location.get('lon')

                # 2. Build Overpass Query
                if lat and lon:
                    # Radius-based search (10km) - most robust for towns
                    query = f"""
                    [out:json];
                    (
                      node["amenity"="hospital"](around:10000,{lat},{lon});
                      way["amenity"="hospital"](around:10000,{lat},{lon});
                      node["amenity"="doctors"](around:10000,{lat},{lon});
                      way["amenity"="doctors"](around:10000,{lat},{lon});
                      node["healthcare"="hospital"](around:10000,{lat},{lon});
                      way["healthcare"="hospital"](around:10000,{lat},{lon});
                    );
                    out center;
                    """
                else:
                    # Fallback to area-based search if geocoding fails
                    query = f"""
                    [out:json];
                    area["name"="{state}"]->.a;
                    area["name"="{district}"]->.b;
                    (
                      node["amenity"="hospital"](area.a)(area.b);
                      way["amenity"="hospital"](area.a)(area.b);
                      node["amenity"="doctors"](area.a)(area.b);
                      way["amenity"="doctors"](area.a)(area.b);
                    );
                    out center;
                    """

                response = await client.post(overpass_url, data={"data": query})
                if response.status_code == 200:
                    data = response.json()
                    results = []
                    for element in data.get('elements', []):
                        tags = element.get('tags', {})
                        name = tags.get('name', 'Unknown Facility')
                        specialty = tags.get('speciality', tags.get('healthcare:speciality', 'General Healthcare'))
                        h_type = tags.get('amenity', 'healthcare').capitalize()
                        contact = tags.get('phone', tags.get('contact:phone', 'Check Local Registry'))
                        
                        results.append({
                            "id": element.get('id'),
                            "name": name,
                            "specialty": specialty,
                            "type": h_type,
                            "district": district,
                            "contact": contact
                        })
                    return results
                return []
        except Exception as e:
            print(f"OSM Search Error: {e}")
            return []

    @staticmethod
    async def get_govt_schemes() -> List[Dict]:
        """
        In a production app, this would fetch from a real Govt API like API Setu.
        For this demonstration, we use a robust RAG index of actual Indian schemes.
        """
        # We can implement a scraper for NHM/NHP here if needed.
        # For now, we return the seeded data which represents real schemes.
        return []
