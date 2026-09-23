from sqlalchemy import Column, String, Integer, Text, Float
from ..config.db import Base

class Provider(Base):
    __tablename__ = "providers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    specialty = Column(String(100))
    type = Column(String(50)) # e.g., 'Public Hospital', 'Private Clinic'
    district = Column(String(100))
    state = Column(String(100))
    contact = Column(String(50))

class MedicalTerm(Base):
    __tablename__ = "medical_terms"
    id = Column(Integer, primary_key=True, index=True)
    term = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    category = Column(String(100))
