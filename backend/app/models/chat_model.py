from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..config.db import Base
import datetime

class ChatEpisode(Base):
    __tablename__ = "chat_episodes"

    id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    tags = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

    messages = relationship("ChatHistory", back_populates="episode", cascade="all, delete-orphan")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), ForeignKey("users.id"), index=True)
    episode_id = Column(String(255), ForeignKey("chat_episodes.id", ondelete="SET NULL"), nullable=True)
    message = Column(Text)
    response = Column(Text)
    language = Column(String(10))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    episode = relationship("ChatEpisode", back_populates="messages")
