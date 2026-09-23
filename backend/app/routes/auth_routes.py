from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..config.db import get_db
from ..services import auth_service
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
import json

router = APIRouter(prefix="/auth")

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    blood_group: Optional[str] = "O+"
    weight: Optional[str] = "68 kg"
    height: Optional[str] = "174 cm"
    age: Optional[str] = "21"
    gender: Optional[str] = "Male"
    district: Optional[str] = "Mumbai"
    primary_condition: Optional[str] = "None (Preventive Fitness)"
    allergies: Optional[List[str]] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relation: Optional[str] = "Next of Kin"
    abha_id: Optional[str] = None
    bio: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
async def signup(request: SignupRequest, db: Session = Depends(get_db)):
    # Check if existing user
    existing = auth_service.get_user_by_email(db, request.email)
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
        
    try:
        emergency_contacts_str = "[]"
        if request.emergency_contact_name:
            emergency_contacts_str = json.dumps([{
                "name": request.emergency_contact_name,
                "relationship": request.emergency_contact_relation or "Next of Kin",
                "phone": request.emergency_contact_phone or ""
            }])

        user = auth_service.create_user(
            db=db,
            name=request.name,
            email=request.email,
            password=request.password,
            blood_group=request.blood_group,
            weight=request.weight,
            height=request.height,
            age=request.age,
            gender=request.gender,
            district=request.district,
            primary_condition=request.primary_condition,
            allergies=request.allergies,
            emergency_contacts=emergency_contacts_str,
            abha_id=request.abha_id,
            bio=request.bio
        )

        parsed_allergies = []
        if user.allergies:
            try:
                parsed_allergies = json.loads(user.allergies) if user.allergies.startswith("[") else [user.allergies]
            except Exception:
                parsed_allergies = [user.allergies]

        return {
            "status": "success",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "district": user.district,
                "profile": {
                    "bio": user.bio,
                    "blood_group": user.blood_group,
                    "weight": user.weight,
                    "height": user.height,
                    "age": user.age,
                    "gender": user.gender,
                    "district": user.district,
                    "primary_condition": user.primary_condition,
                    "allergies": parsed_allergies,
                    "abha_id": user.abha_id,
                    "profile_completion_pct": user.profile_completion_pct or 88
                }
            }
        }
    except Exception as e:
        print(f"[AUTH ERROR] Signup failure: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
        
    if not auth_service.verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    parsed_allergies = []
    if user.allergies:
        try:
            parsed_allergies = json.loads(user.allergies) if user.allergies.startswith("[") else [user.allergies]
        except Exception:
            parsed_allergies = [user.allergies]

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "district": user.district,
            "profile": {
                "bio": user.bio,
                "blood_group": user.blood_group,
                "weight": user.weight,
                "height": user.height,
                "age": user.age,
                "gender": user.gender,
                "district": user.district,
                "primary_condition": user.primary_condition,
                "allergies": parsed_allergies,
                "abha_id": user.abha_id,
                "profile_completion_pct": user.profile_completion_pct or 88
            }
        }
    }
