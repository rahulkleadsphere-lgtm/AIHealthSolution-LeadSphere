import cloudinary
import cloudinary.uploader
from ..config.settings import get_settings

settings = get_settings()

cloudinary.config( 
  cloud_name = settings.CLOUDINARY_CLOUD_NAME, 
  api_key = settings.CLOUDINARY_API_KEY, 
  api_secret = settings.CLOUDINARY_API_SECRET 
)

class StorageService:
    @staticmethod
    async def upload_file(file_content: bytes, filename: str):
        try:
            result = cloudinary.uploader.upload(file_content, public_id=filename)
            return result.get("secure_url")
        except Exception as e:
            print(f"Error uploading to Cloudinary: {e}")
            return None
