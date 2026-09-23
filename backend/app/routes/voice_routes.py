from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from groq import Groq
from ..config.settings import get_settings
from typing import Optional

router = APIRouter(prefix="/voice")
settings = get_settings()

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: Optional[str] = Form(None)
):
    """
    Ultra-fast high-accuracy STT using Groq Whisper API (whisper-large-v3).
    Supports all major audio formats: webm, wav, mp3, m4a, ogg, etc.
    """
    if not settings.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API Key not configured.")
        
    try:
        content = await file.read()
        filename = file.filename or "audio.webm"
        
        client = Groq(api_key=settings.GROQ_API_KEY)
        
        # Map frontend language code to ISO-639-1
        lang_code = None
        if language:
            clean_lang = language.lower()
            if "hi" in clean_lang:
                lang_code = "hi"
            elif "te" in clean_lang:
                lang_code = "te"
            elif "or" in clean_lang:
                lang_code = "or"
            elif "en" in clean_lang:
                lang_code = "en"
                
        transcription = client.audio.transcriptions.create(
            file=(filename, content),
            model="whisper-large-v3",
            language=lang_code,
            response_format="json"
        )
        
        return {
            "status": "success",
            "text": transcription.text.strip()
        }
    except Exception as e:
        print(f"⚠️ Groq Whisper transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Voice transcription failed: {str(e)}")
