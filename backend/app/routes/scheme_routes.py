from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..config.db import get_db
from ..models.scheme_model import SchemeCache
from ..services.rag_service import rag_service
from pydantic import BaseModel
from typing import List, Optional, Dict

router = APIRouter()

class SchemeResponse(BaseModel):
    name: str
    eligibility: Optional[str]
    benefits: Optional[str]
    steps: List[str] = []
    documents: List[str] = []
    timeline: Optional[str]

class EligibilityRequest(BaseModel):
    age: int
    income: float
    state: str
    category: str

class PMJAYStatusRequest(BaseModel):
    id_number: str # Could be Aadhaar or Ration Card
    id_type: str # 'aadhaar' or 'ration'

@router.get("/schemes")
async def get_schemes(
    query: Optional[str] = Query(default=""),
    state: Optional[str] = Query(default=None),
    top_k: int = Query(default=30),
    db: Session = Depends(get_db)
):
    # 1. Search in RAG index backed by Qdrant
    results = rag_service.search_schemes(query=query or "", state=state, top_k=top_k)
    
    # 2. Fallback to SQL database if Qdrant returned nothing
    if not results:
        q = db.query(SchemeCache)
        if state and state.lower() not in ("all", "all-india", "india", "national"):
            q = q.filter((SchemeCache.state == state) | (SchemeCache.state == "All-India"))
        if query:
            q = q.filter(SchemeCache.name.ilike(f"%{query}%") | SchemeCache.description.ilike(f"%{query}%"))
        sql_schemes = q.limit(top_k).all()
        for s in sql_schemes:
            benefits_list = [b.strip() for b in s.benefits.split(",") if b.strip()] if s.benefits else ["Cashless healthcare coverage"]
            results.append({
                "title": s.name,
                "state": s.state or "All-India",
                "category": "Healthcare Welfare",
                "coverage_amount": "Cashless Hospitalization",
                "eligibility": s.eligibility or "BPL / Low Income Families",
                "description": s.description or f"Coverage under {s.name}",
                "benefits": benefits_list,
                "steps": [s.how_to_apply] if s.how_to_apply else ["Apply online or visit empanelled hospital"],
                "documents": [s.documents_required] if s.documents_required else ["Aadhaar Card, Ration Card"],
                "timeline": "Instant upon verification",
                "apply_url": "https://pmjay.gov.in/",
                "helpline": "14555"
            })

    return {"schemes": results, "total": len(results)}

@router.post("/schemes/eligibility")
async def scheme_eligibility_endpoint(request: EligibilityRequest, db: Session = Depends(get_db)):
    # 1. Broadly fetch schemes for that state or All-India
    schemes = db.query(SchemeCache).filter(
        (SchemeCache.state == request.state) | (SchemeCache.state == "All-India")
    ).all()
    
    eligible = []
    for s in schemes:
        eligible.append({
            "name": s.name,
            "state": s.state,
            "eligibility": s.eligibility,
            "benefits": s.benefits,
            "description": s.description
        })
    
    return {"eligible_schemes": eligible}

@router.post("/pmjay/check-status")
async def check_pmjay_status(request: PMJAYStatusRequest):
    # Mocking status check
    # In a real scenario, this would call government APIs or check a database
    
    # Simple logic for demo: If last digit is even, it's active
    try:
        last_digit = int(request.id_number[-1])
        is_active = last_digit % 2 == 0
    except ValueError:
        is_active = True # Default to active for demo string IDs
        
    if is_active:
        return {
            "status": "Active",
            "name": "Ayushman Bharat Cardholder",
            "card_number": f"P{'X' * (len(request.id_number) - 4)}{request.id_number[-4:]}",
            "benefits": "Eligible for ₹5 Lakh health cover per family per year."
        }
    else:
        return {
            "status": "Not Found",
            "message": "We could not find a PMJAY record for the provided ID. Please visit your nearest Taluka office."
        }
