import whisper
import os
from TTS.api import TTS
import tempfile
from ..config.settings import get_settings

# Note: These can be model-heavy. In production, these should be on a separate GPU server or use APIs.

class VoiceInputService:
    def __init__(self):
        # Load model lazily
        self.model = None

    def get_model(self):
        if not self.model:
            self.model = whisper.load_model("base")
        return self.model

    async def transcribe(self, audio_content: bytes):
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            temp_audio.write(audio_content)
            temp_audio_path = temp_audio.name
            
        try:
            model = self.get_model()
            result = model.transcribe(temp_audio_path)
            return result["text"]
        finally:
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)

class VoiceOutputService:
    def __init__(self):
        # Using a default Coqui model that supports multilingual
        self.tts = None

    def get_tts(self):
        if not self.tts:
            device = "cpu" # Default to CPU, as many servers don't have GPU
            self.tts = TTS(model_name="tts_models/multilingual/multi-dataset/your_tts", progress_bar=False).to(device)
        return self.tts

    async def synthesize(self, text: str, language_code: str):
        # Coqui supports language-specific synthesis
        # 'hi' for Hindi, 'en' for English, 'mr' for Marathi depends on model
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            temp_audio_path = temp_audio.name
            
        try:
            tts = self.get_tts()
            # Speaker ID required for multi-speaker models, using a generic one
            tts.tts_to_file(text=text, file_path=temp_audio_path, speaker=tts.speakers[0], language=language_code if language_code in tts.languages else "en")
            
            with open(temp_audio_path, "rb") as audio_file:
                return audio_file.read()
        finally:
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)
