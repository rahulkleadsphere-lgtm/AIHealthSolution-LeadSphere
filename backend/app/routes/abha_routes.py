from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from ..config.db import get_db
from ..services.abha_service import AbhaService

router = APIRouter(prefix="/abha", tags=["ABDM / ABHA Sovereign Service"])

# Request Schemas
class AbhaOtpRequest(BaseModel):
    identity_type: str = Field(default="aadhaar", description="'aadhaar' or 'mobile'")
    identity_value: str = Field(..., description="12-digit Aadhaar or 10-digit Mobile number")

class AbhaCreateRequest(BaseModel):
    txn_id: str
    otp: str
    preferred_abha_address: Optional[str] = None
    user_id: Optional[str] = "rahul_mumbai_demo"

class AbhaVerifyInitRequest(BaseModel):
    abha_id: str = Field(..., description="14-digit ABHA Number (e.g. 91-8273-4920-1124) or @abdm address")
    user_id: Optional[str] = "rahul_mumbai_demo"

class AbhaVerifyConfirmRequest(BaseModel):
    txn_id: str
    otp: str
    user_id: Optional[str] = "rahul_mumbai_demo"

class ConsentCreateRequest(BaseModel):
    user_id: str = "rahul_mumbai_demo"
    document_ids: List[str] = []
    document_titles: List[str] = []
    duration_hours: int = 2
    purpose: str = "Clinical Consultation & Diagnosis"
    doctor_name: Optional[str] = "Consulting Physician"

class ConsentVerifyRequest(BaseModel):
    consent_id: str
    pass_code: str

class FhirExportRequest(BaseModel):
    user_id: str = "rahul_mumbai_demo"
    documents: Optional[List[Dict[str, Any]]] = []

class HipSyncRequest(BaseModel):
    user_id: str = "rahul_mumbai_demo"
    facility_name: Optional[str] = "KEM Hospital & Research Centre, Mumbai"


# =============================================================================
# 1. ABHA ENROLLMENT & CREATION
# =============================================================================
@router.post("/create/generate-otp")
async def generate_creation_otp(data: AbhaOtpRequest):
    result = AbhaService.generate_creation_otp(
        identity_type=data.identity_type,
        identity_value=data.identity_value
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@router.post("/create/verify-otp")
async def verify_and_create_abha(data: AbhaCreateRequest, db: Session = Depends(get_db)):
    result = AbhaService.verify_and_create_abha(
        txn_id=data.txn_id,
        otp=data.otp,
        preferred_abha_address=data.preferred_abha_address,
        user_id=data.user_id,
        db=db
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result


# =============================================================================
# 2. ABHA VERIFICATION (LINK EXISTING ID)
# =============================================================================
@router.post("/verify/init")
async def initiate_abha_verification(data: AbhaVerifyInitRequest, db: Session = Depends(get_db)):
    result = AbhaService.initiate_abha_verification(
        abha_id=data.abha_id,
        user_id=data.user_id,
        db=db
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

@router.post("/verify/confirm")
async def confirm_abha_verification(data: AbhaVerifyConfirmRequest, db: Session = Depends(get_db)):
    result = AbhaService.confirm_abha_verification(
        txn_id=data.txn_id,
        otp=data.otp,
        user_id=data.user_id,
        db=db
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result


# =============================================================================
# 3. CONSENT-DRIVEN DOCTOR ACCESS PASSES
# =============================================================================
@router.post("/consent/create")
async def create_doctor_consent_pass(data: ConsentCreateRequest, db: Session = Depends(get_db)):
    result = AbhaService.create_doctor_consent_token(
        user_id=data.user_id,
        document_ids=data.document_ids,
        document_titles=data.document_titles,
        duration_hours=data.duration_hours,
        purpose=data.purpose,
        doctor_name=data.doctor_name,
        db=db
    )
    return result

@router.post("/consent/verify")
async def verify_doctor_consent_pass(data: ConsentVerifyRequest, db: Session = Depends(get_db)):
    result = AbhaService.verify_and_view_shared_records(
        consent_id=data.consent_id,
        pass_code=data.pass_code,
        db=db
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=403, detail=result["message"])
    return result


# =============================================================================
# 4. HL7 / FHIR R4 JSON BUNDLE EXPORT
# =============================================================================
@router.post("/fhir/export")
async def export_fhir_bundle(data: FhirExportRequest, db: Session = Depends(get_db)):
    result = AbhaService.generate_fhir_bundle(
        user_id=data.user_id,
        db=db,
        client_documents=data.documents
    )
    return result


# =============================================================================
# 5. HOSPITAL HIP RECORD SYNC (SIMULATOR)
# =============================================================================
@router.post("/hip/sync")
async def sync_hospital_records(data: HipSyncRequest, db: Session = Depends(get_db)):
    result = AbhaService.fetch_hospital_records_simulation(
        user_id=data.user_id,
        facility_name=data.facility_name
    )
    return result
