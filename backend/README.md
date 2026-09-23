# SevaSetu AI - Backend API Gateway

High-performance, asynchronous FastAPI backend engine powering real-time clinical triage, medical report OCR parsing, scheme eligibility matching, and facility vector search across India.

---

## 🛠️ Technology Stack

- **Framework**: FastAPI (Python 3.11+) with Pydantic v2 schemas
- **Relational Database**: PostgreSQL 15 via Supabase Connection Pooler (`ap-south-1`)
- **ORM & Migrations**: SQLAlchemy & Alembic
- **Vector Database**: Qdrant Cloud Cluster (Dense 384-dimensional semantic embeddings for 40,000+ facilities)
- **AI Inference**: Groq Cloud LPU (`llama-3.3-70b-versatile`, `meta-llama/llama-4-scout-17b`)
- **Document OCR**: High-speed Vision LLM & Canvas pre-processing
- **Cloud Storage**: Cloudinary secure CDN with signed presets

---

## 🚀 Setup & Execution

### 1. Virtual Environment Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and verify credentials:
```env
DATABASE_URL="postgresql+psycopg2://<user>:<password>@<host>:5432/postgres?sslmode=require"
GROQ_API_KEY="gsk_..."
QDRANT_URL="https://your-cluster.qdrant.tech:6333"
QDRANT_API_KEY="..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

### 4. Run Server

```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API Base URL: `http://127.0.0.1:8000`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc UI: `http://127.0.0.1:8000/redoc`

---

## 📡 API Endpoints Overview

| Route | Method | Description |
|---|---|---|
| `/api/auth/login` | POST | Authenticates users and returns profile & clinical context |
| `/api/auth/signup` | POST | Registers new patients with full clinical demographics |
| `/api/chat` | POST | Multilingual clinical voice/text conversation engine |
| `/api/chat/sessions/{user_id}` | GET | Retrieves previous triage dialogue threads |
| `/api/analysis` | POST | Medical lab report upload and clinical parameter explanation |
| `/api/schemes` | GET / POST | Government welfare scheme eligibility calculation |
| `/api/hospitals` | GET | Geospatial & semantic facility search (Qdrant) |

---

## 🔒 Security & Git Hygiene

- All sensitive keys (`.env`, `.env.*`, `secret.txt`, `credentials*.json`) are strictly excluded in `.gitignore`.
- One-off scripts (`test_*.py`, `seed_*.py`, `check_*.py`, `verify_*.py`) are ignored from Git commits.
- Database access is secured via SSL connection pooling.
