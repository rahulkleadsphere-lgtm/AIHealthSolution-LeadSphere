from sqlalchemy import Column, Integer, String, Text, DateTime
from ..config.db import Base
import datetime

class Alert(Base):
    __tablename__ = "health_alerts"

    id = Column(Integer, primary_key=True, index=True)
    district = Column(String(100), index=True)
    type = Column(String(100)) # e.g., "Dengue", "Heatwave"
    severity = Column(String(20)) # "HIGH", "MEDIUM", "WARNING"
    message = Column(Text)
    precautions = Column(Text)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
