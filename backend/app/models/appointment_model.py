from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from ..config.db import Base
import datetime
import uuid

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), ForeignKey("users.id"), index=True)
    patient_name = Column(String(255))
    facility_name = Column(String(255))
    appointment_date = Column(DateTime)
    phone_number = Column(String(20))
    symptoms = Column(Text, nullable=True)
    status = Column(String(50), default="Scheduled") # "Scheduled", "Completed", "Cancelled"
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
