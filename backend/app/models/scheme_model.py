from sqlalchemy import Column, Integer, String, Text, DateTime
from ..config.db import Base
import datetime

class SchemeCache(Base):
    __tablename__ = "schemes_cache"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    eligibility = Column(Text)
    benefits = Column(Text)
    steps = Column(Text) # JSON string
    documents = Column(Text) # JSON string
    timeline = Column(String(100))
    state = Column(String(100), index=True) # e.g., "Maharashtra"
    official_link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
