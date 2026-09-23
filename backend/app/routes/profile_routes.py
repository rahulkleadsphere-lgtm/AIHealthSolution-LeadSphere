from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..config.db import get_db
from ..models.user_model import User
from ..models.memory_model import HealthMemory
from ..services.memory_service import MemoryService
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import json
import datetime

router = APIRouter(prefix="/profile")

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    blood_group: Optional[str] = None
    weight: Optional[str] = None
    height: Optional[str] = None
    age: Optional[str] = None
    gender: Optional[str] = None
    primary_condition: Optional[str] = None
    district: Optional[str] = None
    allergies: Optional[List[str]] = None
    conditions: Optional[List[str]] = None

class MemoryConfirmRequest(BaseModel):
    memory_type: str
    key: str
    value: str
    source_context: Optional[str] = ""

@router.get("/{userId}")
async def get_profile(userId: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    try:
        allergies = json.loads(user.allergies or "[]")
    except Exception:
        allergies = [user.allergies] if user.allergies else []

    try:
        conditions = json.loads(user.conditions or "[]")
    except Exception:
        conditions = [user.conditions] if user.conditions else []

    try:
        medications = json.loads(user.medications or "[]")
    except Exception:
        medications = []

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "gender": user.gender,
            "district": user.district or "Mumbai",
            "abha_id": user.abha_id or "91-8273-4920-1124",
            "profile_completion_pct": user.profile_completion_pct or 82,
            "allergies": allergies,
            "conditions": conditions,
            "medications": medications,
            "profile": {
                "bio": user.bio,
                "blood_group": user.blood_group,
                "weight": user.weight,
                "height": user.height,
                "age": user.age,
                "gender": user.gender,
                "primary_condition": user.primary_condition
            }
        }
    }

@router.put("/{userId}")
async def update_profile(userId: str, data: ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == userId).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    update_data = data.dict(exclude_unset=True)
    if "allergies" in update_data and isinstance(update_data["allergies"], list):
        user.allergies = json.dumps(update_data.pop("allergies"))
    if "conditions" in update_data and isinstance(update_data["conditions"], list):
        user.conditions = json.dumps(update_data.pop("conditions"))

    for key, value in update_data.items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    
    return await get_profile(userId, db)

@router.get("/{userId}/memories")
async def get_user_memories(userId: str, db: Session = Depends(get_db)):
    memories = db.query(HealthMemory).filter(HealthMemory.user_id == userId).order_by(HealthMemory.created_at.desc()).all()
    return {
        "status": "success",
        "memories": [
            {
                "id": m.id,
                "memory_type": m.memory_type,
                "key": m.key,
                "value": m.value,
                "confidence": m.confidence,
                "classification": m.classification,
                "source_context": m.source_context,
                "created_at": m.created_at.isoformat() if m.created_at else None,
                "confirmed_at": m.confirmed_at.isoformat() if m.confirmed_at else None
            }
            for m in memories
        ]
    }

@router.post("/{userId}/memory/confirm")
async def confirm_memory(userId: str, data: MemoryConfirmRequest, db: Session = Depends(get_db)):
    result = MemoryService.confirm_and_save_memory(
        db=db,
        user_id=userId,
        memory_type=data.memory_type,
        key=data.key,
        value=data.value,
        source_context=data.source_context or ""
    )
    return result

@router.delete("/{userId}/memory/{memoryId}")
async def delete_memory(userId: str, memoryId: str, db: Session = Depends(get_db)):
    memory = db.query(HealthMemory).filter(HealthMemory.id == memoryId, HealthMemory.user_id == userId).first()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found.")
    
    db.delete(memory)
    db.commit()
    return {"status": "success", "message": "Health memory removed."}

