from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
from urllib.parse import quote_plus
import os

class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "SevaSetu AI Health Chatbot"
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "https://health-ai-chatbot-lead-sphere.vercel.app,https://health-ai-chatbot-amber.vercel.app,https://health-ai-chatbot.vercel.app,https://health-aichatbot-production.up.railway.app,https://healthaichatbot-leadsphere-production-2f83.up.railway.app,https://healthaichatbot-leadsphere-production-0990.up.railway.app,https://healthaichatbot-leadsphere-production.up.railway.app,http://localhost:5173,http://localhost:8080,http://localhost:3000"
    
    # DB Config (Can be URL or components)
    DATABASE_URL: Optional[str] = None
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "new_healthdb"
    DB_USER: str = "root"
    DB_PASSWORD: str = "rahul@1"
    
    def get_sqlalchemy_url(self):
        if self.DATABASE_URL:
            # Render/Heroku sometimes use 'postgres://', but SQLAlchemy requires 'postgresql://'
            if self.DATABASE_URL and self.DATABASE_URL.startswith("postgres://"):
                return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
            return self.DATABASE_URL
        
        # URL encode user and password to handle special characters like '@'
        safe_user = quote_plus(self.DB_USER)
        safe_password = quote_plus(self.DB_PASSWORD)
        
        # Build MySQL URL as default
        return f"mysql+pymysql://{safe_user}:{safe_password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # Groq Config
    GROQ_API_KEY: str = ""
    AI_MODEL: str = "openai/gpt-oss-20b" 
    VISION_MODEL: str = "qwen/qwen3.8-27b"
    
    # Cloudinary Config
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    
    # Qdrant Cloud Vector Database Config
    QDRANT_URL: Optional[str] = "https://56267e97-8134-439f-9565-25c2611f10a7.ca-central-1-0.aws.cloud.qdrant.io"
    QDRANT_API_KEY: Optional[str] = None

    # JWT Config
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        extra = "allow" # Handle additional env variables

@lru_cache()
def get_settings():
    return Settings()
