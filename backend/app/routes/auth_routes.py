from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..config.db import get_db
from ..services import auth_service
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth")

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

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
        user = auth_service.create_user(db, request.name, request.email, request.password)
        return {
            "status": "success",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create user.")

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
        
    if not auth_service.verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
        
    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "profile": {
                "bio": user.bio,
                "blood_group": user.blood_group,
                "weight": user.weight,
                "height": user.height,
                "primary_condition": user.primary_condition
            }
        }
    }
