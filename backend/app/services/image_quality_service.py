import io
from typing import Tuple
from PIL import Image
import numpy as np

class ImageQualityService:
    """
    Evaluates medical document/scan image clarity, focus, and illumination
    before running clinical OCR or multimodal vision models.
    """

    @staticmethod
    def check_image_clarity(image_bytes: bytes, filename: str = "") -> Tuple[bool, str]:
        """
        Returns (is_clear, reason_or_error_message).
        If False, gives user-facing feedback instructing to retry.
        """
        try:
            # 1. Verify valid image stream
            try:
                img = Image.open(io.BytesIO(image_bytes))
            except Exception:
                return False, "The uploaded file could not be read as a valid image. Please retry with a valid PNG, JPG, or PDF."

            # 2. Check resolution / dimensions
            width, height = img.size
            if width < 120 or height < 120:
                return False, "The uploaded image is too small or low-resolution to extract medical details. Please retry with a higher-resolution photo."

            # 3. Grayscale conversion for photometric & edge analysis
            gray = img.convert("L")

            # Downsample if extremely large to maintain reliable variance metrics
            max_dim = max(width, height)
            if max_dim > 1024:
                scale = 1024.0 / max_dim
                gray = gray.resize((int(width * scale), int(height * scale)), Image.Resampling.BILINEAR)

            arr = np.array(gray, dtype=np.float32)

            # 4. Illumination / Brightness checks
            mean_brightness = float(np.mean(arr))
            std_contrast = float(np.std(arr))

            # Too dark (underexposed or pitch black photo)
            if mean_brightness < 18.0:
                return False, "The uploaded image is too dark to read. Please ensure adequate lighting and retry."

            # Too bright with zero contrast (blank white screen / overexposed flash)
            if mean_brightness > 245.0 and std_contrast < 10.0:
                return False, "The uploaded image is overexposed or blank. Please capture a clear photo of the document and retry."

            # 5. Blur / Sharpness check via 2D Laplacian operator
            # 3x3 Laplacian discrete kernel: [0, 1, 0; 1, -4, 1; 0, 1, 0]
            top = arr[:-2, 1:-1]
            bottom = arr[2:, 1:-1]
            left = arr[1:-1, :-2]
            right = arr[1:-1, 2:]
            center = arr[1:-1, 1:-1]
            laplacian = top + bottom + left + right - 4.0 * center
            var_laplacian = float(np.var(laplacian))

            # If variance of laplacian is extraordinarily low, the image lacks high-frequency edges (heavily blurred / completely out of focus)
            if var_laplacian < 6.0:
                return False, "The uploaded image appears blurry or out of focus. Please hold the camera steady, ensure clear focus, and retry."

            return True, ""

        except Exception as e:
            print(f"ImageQualityService evaluation notice: {e}")
            # If error during calculation, default to True so we don't block valid uploads unnecessarily
            return True, ""
