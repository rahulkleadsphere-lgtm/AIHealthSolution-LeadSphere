import bcrypt
import uuid
import json
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from ..models.user_model import User

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_user(
    db: Session, 
    name: str, 
    email: str, 
    password: str,
    blood_group: Optional[str] = "O+",
    weight: Optional[str] = "68 kg",
    height: Optional[str] = "174 cm",
    age: Optional[str] = "21",
    gender: Optional[str] = "Male",
    district: Optional[str] = "Mumbai",
    primary_condition: Optional[str] = "None (Preventive Fitness)",
    allergies: Optional[List[str]] = None,
    conditions: Optional[List[str]] = None,
    emergency_contacts: Optional[str] = "[]",
    abha_id: Optional[str] = None,
    bio: Optional[str] = None,
    **kwargs
) -> User:
    hashed = hash_password(password)
    # Generate random ABHA format 91-XXXX-XXXX-XXXX if not provided
    u_rand = str(uuid.uuid4().int)
    clean_abha = abha_id or f"91-{u_rand[:4]}-{u_rand[4:8]}-{u_rand[8:12]}"
    
    clean_allergies = json.dumps(allergies) if isinstance(allergies, list) else (allergies or json.dumps(["None"]))
    clean_conditions = json.dumps(conditions) if isinstance(conditions, list) else (conditions or json.dumps([]))
    
    new_user = User(
        id=str(uuid.uuid4()),
        name=name,
        email=email.lower().strip(),
        hashed_password=hashed,
        role="user",
        blood_group=blood_group or "O+",
        weight=weight or "68 kg",
        height=height or "174 cm",
        age=age or "21",
        gender=gender or "Male",
        district=district or "Mumbai",
        primary_condition=primary_condition or "None (Preventive Fitness)",
        allergies=clean_allergies,
        conditions=clean_conditions,
        emergency_contacts=emergency_contacts or "[]",
        abha_id=clean_abha,
        bio=bio or f"Verified patient from {district or 'Mumbai'}.",
        profile_completion_pct=88
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email.lower().strip()).first()

def get_user_by_id(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()
