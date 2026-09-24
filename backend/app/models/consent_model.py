from sqlalchemy import Column, String, DateTime, Text, Integer
from ..config.db import Base
import datetime

class ConsentShare(Base):
    __tablename__ = "consent_shares"

    id = Column(String(255), primary_key=True, index=True)
    user_id = Column(String(255), index=True, nullable=False)
    pass_code = Column(String(20), nullable=False) # e.g. 'SEVA-8291'
    doctor_name = Column(String(255), nullable=True)
    purpose = Column(String(255), default="Clinical Consultation & Diagnosis")
    document_ids = Column(Text, default="[]") # JSON array of shared document IDs
    document_titles = Column(Text, default="[]") # JSON array of titles for quick lookup
    valid_until = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
