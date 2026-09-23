import io
import pytesseract
from PIL import Image

# Optional: Path if not in PATH (on windows)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

class OCRService:
    @staticmethod
    async def extract_text(file_content: bytes, filename: str = "") -> str:
        # 1. PDF Text Extraction
        is_pdf = file_content.startswith(b"%PDF") or (filename and filename.lower().endswith(".pdf"))
        if is_pdf:
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(file_content))
                extracted_pages = []
                for idx, page in enumerate(reader.pages):
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        extracted_pages.append(page_text.strip())
                pdf_text = "\n\n".join(extracted_pages).strip()
                if pdf_text:
                    print(f"Extracted {len(pdf_text)} characters from PDF via pypdf.")
                    return pdf_text
            except Exception as pe:
                print(f"pypdf extraction notice: {pe}")

        # 2. Image OCR via Tesseract
        try:
            image = Image.open(io.BytesIO(file_content))
            text = pytesseract.image_to_string(image, lang='eng+hin+mar+tel')
            return text or ""
        except Exception as e:
            print(f"Error in OCR: {e}")
            return ""

