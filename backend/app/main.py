import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .config.db import engine, Base, get_db
from .routes import chat_routes, analysis_routes, scheme_routes, translation_routes, search_routes, auth_routes, profile_routes, appointment_routes, voice_routes
from .services.rag_service import rag_service
from .models.search_model import Base as SearchBase
from .models.scheme_model import SchemeCache
from .config.settings import get_settings
import uvicorn

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SevaSetu AI Health Chatbot Backend")
print("[INFO] Backend service is initializing...")

# Middleware
settings = get_settings()
allowed_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
for extra_origin in [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://aihealthsolution-leadsphere-production.up.railway.app",
    "https://aihealthsolution-leadsphere.vercel.app",
    "https://ai-health-solution-leadsphere.vercel.app",
    "https://ai-health-solution-lead-sphere.vercel.app",
]:
    if extra_origin not in allowed_origins:
        allowed_origins.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"^https?:\/\/([a-zA-Z0-9_\-]+\.)*(vercel\.app|railway\.app|localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to load RAG index
@app.on_event("startup")
def startup_event():
    # 1. Fetch schemes from DB
    db = next(get_db())
    schemes = db.query(SchemeCache).all()
    
    # 2. Convert to list
    schemes_list = [
        {
            "title": s.name or "Untitled Scheme",
            "eligibility": s.eligibility or "Contact department for eligibility",
            "description": s.benefits or "Details pending",
            "benefits": (s.benefits or "").split(",") if s.benefits else ["Comprehensive Care"],
            "steps": (s.steps or "").split(",") if s.steps else ["Contact department"],
            "documents": (s.documents or "").split(",") if s.documents else ["Aadhaar Card"],
            "timeline": s.timeline or "Variable",
            "apply_url": getattr(s, 'official_link', "https://www.india.gov.in/my-government/schemes")
        } for s in schemes
    ]
    
    # 3. If DB is empty, use sample data for initial indexing
    if not schemes_list:
        schemes_list = [
            {
                "title": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
                "eligibility": "BPL card holders, low-income families",
                "description": "Rs 5 Lakh per family per year coverage",
                "benefits": ["Rs 5 Lakh Coverage", "Cashless Hospitalization"],
                "steps": ["Apply at CSC center", "Verify Aadhar"],
                "documents": ["Aadhar Card", "Ration Card"],
                "timeline": "Instant after verification",
                "apply_url": "https://pmjay.gov.in/"
            },
            {
                "title": "Long Term Fellowship under the Human Resource Development Programme for Health Research",
                "eligibility": "Indian citizens with MD/MS/MDS/PhD degree and below 45 years of age.",
                "description": "Financial support for research and training in India or abroad.",
                "benefits": ["Stipend", "Research Grant"],
                "steps": ["Register on the portal", "Upload research proposal", "Submit recommendation letters", "Online interview"],
                "documents": ["Academic Certificates", "Research Abstract", "NO Objection Certificate", "Aadhaar Card"],
                "timeline": "3-6 Months after application",
                "apply_url": "https://dhr.gov.in/fellowship/long-term-fellowship"
            }
        ]
    
    # 4. Initialize FAISS index
    rag_service.initialize_index(schemes_list)

    # 5. Warm up FastEmbed model for instantaneous inference
    try:
        from .services.qdrant_service import qdrant_service
        qdrant_service._load_embedder()
        print(" FastEmbed model warmed up successfully.")
    except Exception as e:
        print(f"⚠️ FastEmbed warmup notice: {e}")

# Include Routers with /api prefix as expected by frontend
app.include_router(chat_routes.router, prefix="/api", tags=["Chat"])
app.include_router(analysis_routes.router, prefix="/api", tags=["Analysis"])
app.include_router(scheme_routes.router, prefix="/api", tags=["Schemes"])
app.include_router(search_routes.router, prefix="/api", tags=["Search"])
app.include_router(voice_routes.router, prefix="/api", tags=["Voice"])
app.include_router(translation_routes.router, prefix="/api", tags=["Translation"])
app.include_router(auth_routes.router, prefix="/api", tags=["Auth"])
app.include_router(profile_routes.router, prefix="/api", tags=["Profile"])
app.include_router(appointment_routes.router, prefix="/api", tags=["Appointments"])

@app.get("/")
def health_check():
    return {"status": "ok", "service": "SevaSetu Backend"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


# reloading...
