# SevaSetu AI - Healthcare Access Platform

<p align="center">
  <img src="assets/sevasetu-logo.png" alt="SevaSetu AI - Smarter Care, Happier Patients, Stronger Clinics" width="540" />
</p>

<p align="center">
  <strong>Democratizing Clinical Guidance, Scheme Eligibility, and Emergency Preparedness for Bharat</strong>
</p>

<p align="center">
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi" alt="FastAPI" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?style=flat&logo=react" alt="React" /></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Build-Vite-646CFF.svg?style=flat&logo=vite" alt="Vite" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/Language-TypeScript-3178C6.svg?style=flat&logo=typescript" alt="TypeScript" /></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/Language-Python_3.11-3776AB.svg?style=flat&logo=python" alt="Python" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Database-PostgreSQL_(Supabase)-336791.svg?style=flat&logo=postgresql" alt="PostgreSQL" /></a>
  <a href="https://qdrant.tech"><img src="https://img.shields.io/badge/Vector_DB-Qdrant_Cloud-DC2626.svg?style=flat" alt="Qdrant" /></a>
  <a href="https://groq.com"><img src="https://img.shields.io/badge/Inference-Groq_LPU-F05A28.svg?style=flat" alt="Groq" /></a>
  <a href="https://railway.com"><img src="https://img.shields.io/badge/Deploy-Railway-0B0D0E.svg?style=flat&logo=railway" alt="Railway" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deploy-Vercel-000000.svg?style=flat&logo=vercel" alt="Vercel" /></a>
</p>

---

## Executive Summary

**SevaSetu AI** is a state-of-the-art, low-bandwidth healthcare access platform engineered to bridge medical disparities across rural and urban India. Built with a unified **Luminous White Medical Aesthetic** (`#F8FAFC`), the application provides real-time multilingual voice triage, AI-driven medical report analysis, an interactive government welfare eligibility calculator, longitudinal physiological vitals tracking, a secure health vault, and an offline-first emergency pocketbook.

---

## Key Capabilities & Modules

### 1. Clinical Command Center (`/dashboard`)
* **Ayushman ABHA Pass**: Ceramic health card with verified 14-digit ABHA ID, micro-QR code, and quick-copy actions.
* **Longitudinal Telemetry Charts**: Real-time AreaCharts tracking Blood Pressure, Heart Rate, SpO2, and Blood Glucose with clinical reference ranges.
* **Clinical Matrix & Quick Actions**: Fast shortcuts to chat triage, lab analysis, appointment booking, and emergency protocols.
* **Active Episode Tracker**: Visual progress bar for ongoing clinical investigations and follow-ups.

### 2. Precision Vitals Studio (`/vitals`)
* **Multi-Vital Telemetry Monitoring**: Dynamic charts for Systolic/Diastolic BP, Heart Rate, SpO2, Blood Glucose, Respiratory Rate, and Core Temperature.
* **Timeframe Switching**: Granular filtering across **24 Hours**, **7 Days**, **30 Days**, and **90 Days**.
* **Clinical Metric Logging Modal**: Patient vital entry with instant calculation and threshold validation.
* **Precision Audit Trail**: Tabular historical record with clinical flags (`Normal`, `Elevated`, `Attention Required`).

### 3. Personal Settings & Account Control (`/profile`)
* **Clinical Demographics**: Age, Gender, Blood Group, Height, Weight, and District.
* **Live Computed BMI Badge**: Automatic calculation of BMI and WHO weight classification with color-coded badges.
* **Curated Cartoon Face Avatars**: Selection of 9 high-resolution cartoon avatars (strictly zero human faces).
* **Two-Factor Authentication (2FA)**: Security modal supporting TOTP authenticator setup and backup codes.
* **Emergency Contacts & Allergies**: Interactive management of next-of-kin contacts and drug/environmental allergy tags.
* **Data Portability**: One-click complete clinical profile export in JSON / FHIR-ready format.

### 4. Secure Health Vault (`/health-vault`)
* **Categorized Clinical Document Explorer**: Instant filtering across **Lab Reports**, **Prescriptions**, **Discharge Summaries**, and **Imaging & Scans**.
* **Bento & Table Views**: Flexible presentation modes for high-density document inspection.
* **Side-Drawer Document Inspector**: Deep inspection of diagnostic summaries, issuing physicians, and download links.

### 5. AI Voice & Chat Triage (`/chat`)
* **Multilingual Bidirectional Interaction**: Full conversational support in English, Hindi (हिन्दी), Telugu (తెలుగు), and Odia (ଓଡ଼ିଆ).
* **Voice-First Engine**: Real-time Speech-to-Text (STT) and Speech-to-Voice (TTS) with dialect-adapted clinical prompts.
* **LPU Inference**: Powered by Groq Cloud LPU (`llama-3.3-70b-versatile`) with under 600 ms time-to-first-token.

### 6. Medical Report & Lab Analysis (`/analysis`)
* **Client-Side Compression**: High-efficiency HTML5 Canvas image optimization reducing multi-megabyte scans to <500 KB in ~50 ms.
* **Vision OCR & Clinical Parsing**: Automatic extraction and explanation of complex medical terminology into patient-friendly language.

### 7. National Healthcare Directory & Jan Aushadhi Locator (`/directory`)
* **Vector Semantic Search**: RAG-powered geospatial search via Qdrant Cloud across **40,000+ national hospitals** and **Jan Aushadhi generic pharmacy centres**.
* **Filter by Care Level**: Immediate triage between Primary Health Centres (PHC), Community Health Centres (CHC), District Civil Hospitals, and Super-Specialty Institutes.

### 8. Government Welfare Scheme Calculator (`/schemes`)
* **3-Step Eligibility Wizard**: Instant qualification check for **Ayushman Bharat (PM-JAY)**, **BSKY**, **Aarogyasri**, **MJPJAY**, and maternal health programs.
* **Document Readiness Checklist**: Automated generation of required identity documents (Ration Card, Income Certificate, Aadhar).

### 9. 100% Offline Emergency First-Aid Pocketbook (`/emergency`)
* **Network-Independent Protocols**: Service-worker cached life-saving workflows for snakebites, severe burns, heatstroke, poisoning, and CPR.
* **Direct Emergency Dialers**: One-touch telephony dialing for National Ambulance (**108**), Health Helpline (**104**), and Women Helpline (**1091**).

---

## Instant Evaluation Credentials

For rapid assessment and testing without registering a new phone number, use the pre-configured BITSoM clinical persona:

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Email** | `rahul@sevasetu.in` | Pre-verified patient profile |
| **Password** | `Rahul@123` | Demo password |
| **Name** | Rahul Sharma | Age: 21, Gender: Male |
| **District** | Mumbai | Blood Group: `O+` |
| **ABHA ID** | `91-8273-4920-1124` | Verified Ayushman ABHA account |
| **Clinical Context** | Penicillin Allergy | Baseline: Preventive Fitness |

*Alternative 1-Click Action*: On the Login page (`/login`), click the **"Quick Demo: Rahul Sharma"** button to immediately authenticate into the platform.

---

## Technical Architecture

```mermaid
graph TD
    User([Citizen / Healthcare Worker]) -->|Interacts via Voice, Chat, or Upload| Client[React 18 PWA + Vite (Vercel)]
    Client -->|Client-Side Compression| CanvasEngine[HTML5 Canvas Pipeline (<500KB in ~50ms)]
    CanvasEngine -->|Compressed Payload| APIGateway[FastAPI Gateway (Railway / Localhost:8000)]
    
    APIGateway -->|Clinical Reasoning & Triage| GroqLLM[Groq LPU Cloud (LLaMA-3.3-70B)]
    APIGateway -->|Semantic Vector Search (40k+ Facilities)| Qdrant[Qdrant Cloud Vector Cluster]
    APIGateway -->|Relational Data & Auth| Supabase[(Supabase PostgreSQL Pooler)]
    APIGateway -->|Secure Medical Records| Cloudinary[(Cloudinary Encrypted Storage)]
    
    Client -.->|Zero-Network Fallback| ServiceWorker[PWA Service Worker Cache]
    ServiceWorker -.->|Offline Protocols| LocalPocketbook[(Offline First-Aid Protocols)]
```

---

## Technology Stack

| Layer | Component | Technologies |
|---|---|---|
| **Frontend Web & PWA** | Client Application | React 18, TypeScript, Vite, Tailwind CSS, Lucide SVG Icons (100% emoji-free), Recharts |
| **Backend API Gateway** | Application Server | FastAPI (Python 3.11), Pydantic v2, Uvicorn, SQLAlchemy, Alembic |
| **AI Inference** | Large Language Models | Groq LPU Cloud (`llama-3.3-70b-versatile`, `llama-4-scout-17b`) |
| **Vector Database & RAG** | Facility Search | Qdrant Cloud Vector Cluster (Dense 384-dim semantic embeddings) |
| **Relational Database** | User & Clinical Data | PostgreSQL 15 via Supabase Connection Pooler (`ap-south-1`) |
| **Authentication** | Identity Provider | Supabase Auth (Email/Password + Google OAuth) + JWT Bearer Tokens |
| **Medical Imaging** | File Storage | Cloudinary CDN with signed upload presets |
| **Hosting & CI/CD** | Infrastructure | Vercel (Edge CDN Frontend), Railway (Containerized Backend) |

---

## Repository Structure & Git Hygiene

```text
Health-AIChatbot/
├── .gitignore                      # Master repository hygiene policy
├── README.md                       # Comprehensive platform documentation
├── hospital_directory.json         # Raw dataset (41MB, excluded from Git)
├── requirements.txt                # Root-level requirements
├── run_all.bat                     # Windows one-click start script
│
├── assets/                         # Brand identity and vector logos
│   ├── sevasetu-icon.png           # Square app icon
│   └── sevasetu-logo.png           # Horizontal brand logo
│
├── AI-Health-Chatbot-n8n-main/    # Frontend Application (React + Vite)
│   ├── .gitignore                  # Frontend-specific exclusions
│   ├── public/                     # PWA manifest, service worker (sw.js), icons
│   ├── src/
│   │   ├── components/             # Reusable clinical UI components & layouts
│   │   ├── contexts/               # Auth, Language, Notification contexts
│   │   ├── data/                   # Offline first-aid protocols & scheme datasets
│   │   ├── pages/                  # Dashboard, Vitals, Profile, Vault, Chat, Analysis
│   │   ├── services/               # API clients, Supabase client, chat service
│   │   └── utils/                  # Canvas image compressor, formatters
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                        # Backend Application (FastAPI)
    ├── .gitignore                  # Backend-specific exclusions
    ├── .env.example                # Safe environment template
    ├── alembic/                    # Database migrations
    ├── app/
    │   ├── config/                 # Pydantic settings & database engine
    │   ├── models/                 # SQLAlchemy models (User, Vital, Episode, Scheme)
    │   ├── routes/                 # API routers (auth, chat, vitals, analysis, schemes)
    │   └── services/               # Groq LLM, Qdrant search, Cloudinary storage
    ├── scripts/                    # Utility, seeding & verification scripts (ignored by Git)
    ├── Dockerfile                  # Container specification
    ├── Procfile                    # Railway process configuration
    └── requirements.txt            # Python backend dependencies
```

### Git Hygiene Policy
All of the following items are strictly ignored and will never be committed to GitHub:
- **Raw Datasets**: Large JSON/CSV dumps (e.g., `hospital_directory.json`).
- **One-off Scripts**: All `test_*.py`, `seed_*.py`, `check_*.py`, and `verify_*.py` files.
- **Environment & Secrets**: `.env`, `.env.*`, `secret.txt`, `credentials*.json` (only `.env.example` is tracked).
- **Caches & Dependencies**: `__pycache__/`, `venv/`, `node_modules/`, `dist/`.

---

## Local Development Setup

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** with `npm`
- **Windows PowerShell** or standard terminal

---

### Step 1: Backend Setup (FastAPI)

1. Open a terminal in `backend/`:
   ```powershell
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install required packages:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure your `.env` file (copy from `.env.example`):
   ```powershell
   cp .env.example .env
   ```

5. Launch the FastAPI server:
   ```powershell
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

* Backend URL: `http://127.0.0.1:8000`
* Swagger Interactive Docs: `http://127.0.0.1:8000/docs`

---

### Step 2: Frontend Setup (Vite + React)

1. Open a separate terminal in `AI-Health-Chatbot-n8n-main/`:
   ```powershell
   cd AI-Health-Chatbot-n8n-main
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite development server:
   ```powershell
   npm run dev
   ```

* Frontend Application: `http://localhost:5173`

---

### Step 3: One-Click Startup (Windows)

To start both the Backend and Frontend concurrently in one step, double-click:
```cmd
run_all.bat
```
This batch file validates Python and Node dependencies, launches the FastAPI server on port 8000, and starts the Vite development server on port 5173.

---

## Production Deployment

### Backend Deployment (Railway)
1. In Railway, create a new project connected to your GitHub repository.
2. Set the **Root Directory** to `/backend`.
3. Set the build command to `pip install -r requirements.txt`.
4. Set the start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Add all required environment variables (`DATABASE_URL`, `GROQ_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `CLOUDINARY_*`).
6. Verify deployment at: `https://<YOUR-RAILWAY-DOMAIN>/api/health`.

### Frontend Deployment (Vercel)
1. In Vercel, import the repository and specify the **Root Directory** as `AI-Health-Chatbot-n8n-main`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Add Environment Variable:
   ```env
   VITE_API_BASE_URL=https://<YOUR-RAILWAY-DOMAIN>/api
   ```
6. Deploy and assign your custom domain.

---

## Clinical Safety & Disclaimer

SevaSetu AI provides supportive clinical guidance, automated welfare scheme matching, and first-aid instructions compiled from verified medical literature. It is **not** a replacement for qualified clinical diagnosis, emergency trauma care, or inpatient hospital treatment.

**In life-threatening situations** (such as chest pain, acute respiratory distress, severe trauma, or loss of consciousness), users must immediately call the National Emergency Ambulance Service at **108** or report to the nearest emergency medical department.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.