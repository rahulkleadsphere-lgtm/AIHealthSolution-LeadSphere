# 🚀 Deploying SevaSetu AI Backend on Render

This guide provides the exact steps to deploy your FastAPI backend to Render.com.

## 1. Prerequisites
- A **GitHub/GitLab** repository containing the `backend/` folder.
- A **Render.com** account (Free tier is fine).

## 2. Configuration Files (Already Created)
The following files have been prepared in your `backend/` directory:
- **requirements.txt**: Updated to include `gunicorn`.
- **Procfile**: Tells Render how to start the app.
- **render.yaml**: Optional blueprint for one-click setup.

## 3. Step-by-Step Deployment (Manual)

### Option A: Manual Setup (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New > Web Service**.
2. Connect your GitHub/GitLab repository.
3. In the setup form, use these settings:
   - **Name**: `sevasetu-api` (or your choice)
   - **Environment**: `Python 3`
   - **Root Directory**: `backend` (⚠️ This is important!)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT`

### Option B: Blueprint Setup
If you have your repo connected, you can use the `render.yaml` blueprint.

## 4. Environment Variables
You MUST add the following variables in the Render **Environment** tab:

| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | Your Aiven DB URL |
| `GROQ_API_KEY` | Your Groq API Key |
| `CLOUDINARY_CLOUD_NAME` | `your_cloudinary_name` |
| `CLOUDINARY_API_KEY` | `your_cloudinary_key` |
| `CLOUDINARY_API_SECRET` | `your_cloudinary_secret` |
| `SECRET_KEY` | `A-Long-Random-String` |
| `ALGORITHM` | `HS256` |
| `DEBUG` | `False` |

## 5. Handling CORS
In `app/main.py`, we have updated the CORS settings to be more flexible. Once your frontend is deployed (e.g., `https://sevasetu.onrender.com`), make sure to add it to the `allow_origins` list or use `*` for temporary testing.

---

### Need Help?
- Check logs on Render if the build fails.
- Ensure your `DATABASE_URL` uses `postgresql://` (or `postgresql+psycopg2://` for SQLAlchemy).
