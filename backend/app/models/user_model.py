from sqlalchemy import Column, Integer, String, DateTime, Text
from ..config.db import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(String(255), primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    
    # Profile fields (Inlining for simplicity in this MVP)
    bio = Column(Text, nullable=True)
    blood_group = Column(String(10), nullable=True)
    weight = Column(String(20), nullable=True)
    height = Column(String(20), nullable=True)
    age = Column(String(10), nullable=True)
    gender = Column(String(20), nullable=True, default="Male")
    primary_condition = Column(String(255), nullable=True)
    
    # Clinical Identity & Persistent Memory
    allergies = Column(Text, nullable=True, default="[]")           # JSON string of confirmed allergies
    conditions = Column(Text, nullable=True, default="[]")          # JSON string of chronic conditions
    medications = Column(Text, nullable=True, default="[]")         # JSON string of active medications
    emergency_contacts = Column(Text, nullable=True, default="[]")  # JSON string of emergency contacts
    surgeries = Column(Text, nullable=True, default="[]")           # JSON string of past surgeries
    abha_id = Column(String(50), nullable=True, default="91-8273-4920-1124") # ABDM / ABHA ID
    is_abha_verified = Column(Integer, default=1)                   # 1 if verified via NHA/OTP, 0 if unverified
    abha_address = Column(String(100), nullable=True, default="rahul.sharma@abdm") # e.g. username@abdm
    abha_verified_at = Column(DateTime, nullable=True, default=datetime.datetime.utcnow)
    profile_completion_pct = Column(Integer, default=82)            # e.g., 82%
    
    language = Column(String(10), default="en")
    district = Column(String(100), index=True, default="Mumbai")
    role = Column(String(20), default="user") # 'user', 'admin'
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
