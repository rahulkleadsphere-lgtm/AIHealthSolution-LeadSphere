from fastapi import APIRouter
from ..services.ai_service import client, AIService
from pydantic import BaseModel
from ..config.settings import get_settings

settings = get_settings()

router = APIRouter()

class TranslationRequest(BaseModel):
    text: str
    target_language: str

@router.post("/translate")
async def translation_endpoint(request: TranslationRequest):
    # Prompt for translation (simple language for rural users)
    prompt = f"""
    Translate the following text into simple, easy-to-understand {request.target_language}.
    Avoid complex grammar. The target audience is rural people in India.
    Text: {request.text}
    """
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=settings.AI_MODEL,
    )
    
    return {"translated_text": response.choices[0].message.content}
