import uuid
import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from ..config.db import Base

class HealthMemory(Base):
    __tablename__ = "health_memories"

    id = Column(String(255), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    memory_type = Column(String(50), nullable=False)  # 'allergy', 'condition', 'medication', 'vital', 'lifestyle'
    key = Column(String(255), nullable=False)          # e.g., 'penicillin', 'asthma', 'metformin'
    value = Column(Text, nullable=False)                # e.g., 'Severe allergic reaction / hives', '500mg daily'
    confidence = Column(Float, default=1.0)
    classification = Column(String(50), default="CONFIRMED") # 'CONFIRMED', 'USER_REPORTED', 'INFERRED', 'TEMPORARY'
    source_context = Column(Text, nullable=True)        # The user message or report snippet that triggered this
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    confirmed_at = Column(DateTime, nullable=True)
