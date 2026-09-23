from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from ..config.db import get_db
from ..services.storage_service import StorageService
from ..services.ocr_service import OCRService
from ..services.ai_service import AIService
from ..services.image_quality_service import ImageQualityService
from pydantic import BaseModel
import json
import datetime

from ..models.report_model import Report
from typing import Optional, Any, List
router = APIRouter()

class CreateVaultItemRequest(BaseModel):
    title: str
    category: str = "prescription"
    facility: Optional[str] = "Clinical Consultation"
    summary: str
    biomarkers: Optional[str] = ""
    file_url: Optional[str] = "#"

@router.get("/reports/{userId}")
async def get_reports_history(userId: str, db: Session = Depends(get_db)):
    reports = db.query(Report).filter(Report.user_id == userId).order_by(Report.created_at.desc()).all()
    
    result = []
    for r in reports:
        raw_bio = getattr(r, "biomarkers", None) or ""
        vitals_dict = {}
        abnormalities_list = []
        display_bio = raw_bio

        if isinstance(raw_bio, str) and raw_bio.strip().startswith("{"):
            try:
                parsed_bio = json.loads(raw_bio)
                if isinstance(parsed_bio, dict):
                    if "vitals" in parsed_bio or "abnormalities" in parsed_bio:
                        vitals_dict = parsed_bio.get("vitals", {}) or {}
                        abnormalities_list = parsed_bio.get("abnormalities", []) or []
                        display_bio = parsed_bio.get("display", "") or ""
                    else:
                        vitals_dict = parsed_bio
                        display_bio = ", ".join([f"{k.replace('_', ' ').title()}: {v}" for k, v in parsed_bio.items()])
                        for k, v in parsed_bio.items():
                            status = "NORMAL"
                            if "sugar" in k.lower() and float(v) > 100:
                                status = "HIGH"
                            elif "hemoglobin" in k.lower() and float(v) < 13:
                                status = "LOW"
                            abnormalities_list.append({
                                "name": k.replace("_", " ").title(),
                                "value": str(v),
                                "status": status,
                                "explanation": f"Clinical baseline {k.replace('_', ' ')} parameter."
                            })
            except Exception:
                pass
        elif isinstance(raw_bio, str) and (":" in raw_bio or "•" in raw_bio):
            # Parse text biomarkers e.g. "Hemoglobin (Hb): 13.5 gm/dL (Mildly Low), Total WBC Count: 14.7 thou/µL (High)"
            import re
            parts = [p.strip() for p in re.split(r"[,•\n]+", raw_bio) if p.strip()]
            for p in parts:
                if ":" in p:
                    name_part, val_part = p.split(":", 1)
                    name_part = name_part.strip()
                    val_part = val_part.strip()
                    status = "NORMAL"
                    if "high" in val_part.lower():
                        status = "HIGH"
                    elif "low" in val_part.lower():
                        status = "LOW"
                    elif "abnormal" in val_part.lower():
                        status = "ABNORMAL"

                    # Check for hemoglobin / sugar in vitals_dict
                    hb_m = re.search(r"([\d.]+)", val_part)
                    if "hemoglobin" in name_part.lower() and hb_m:
                        vitals_dict["hemoglobin"] = float(hb_m.group(1))
                    elif ("sugar" in name_part.lower() or "glucose" in name_part.lower()) and hb_m:
                        vitals_dict["blood_sugar"] = float(hb_m.group(1))

                    abnormalities_list.append({
                        "name": name_part,
                        "value": val_part,
                        "status": status,
                        "explanation": f"Extracted clinical parameter from {getattr(r, 'title', None) or 'diagnostic report'}."
                    })

        result.append({
            "id": r.id,
            "file_url": r.file_url,
            "title": getattr(r, "title", None) or "Medical Record",
            "category": getattr(r, "category", None) or "lab",
            "facility": getattr(r, "facility", None) or "Diagnostic Wing",
            "biomarkers": display_bio,
            "vitals": vitals_dict,
            "abnormalities": abnormalities_list,
            "summary": r.summary,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
        
    return {
        "status": "success",
        "reports": result
    }


@router.post("/reports/{userId}")
async def create_vault_report(userId: str, data: CreateVaultItemRequest, db: Session = Depends(get_db)):
    new_rep = Report(
        user_id=userId,
        file_url=data.file_url or "#",
        title=data.title,
        category=data.category,
        facility=data.facility or "Clinical Consultation",
        summary=data.summary,
        biomarkers=data.biomarkers or "",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_rep)
    db.commit()
    db.refresh(new_rep)
    return {
        "status": "success",
        "report": {
            "id": new_rep.id,
            "file_url": new_rep.file_url,
            "title": new_rep.title,
            "category": new_rep.category,
            "facility": new_rep.facility,
            "summary": new_rep.summary,
            "biomarkers": new_rep.biomarkers,
            "created_at": new_rep.created_at.isoformat() if new_rep.created_at else None
        }
    }

@router.delete("/reports/{userId}")
async def delete_user_reports(userId: str, db: Session = Depends(get_db)):
    deleted = db.query(Report).filter(Report.user_id == userId).delete()
    db.commit()
    return {
        "status": "success",
        "message": f"Deleted {deleted} reports for user {userId}"
    }

@router.delete("/reports/{userId}/{reportId}")
async def delete_single_report(
    userId: str, 
    reportId: str, 
    title: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    deleted = 0
    clean_title = (title or "").strip()
    try:
        # 1. Try deleting by integer primary key
        if reportId.isdigit():
            r_id = int(reportId)
            record = db.query(Report).filter(Report.user_id == userId, Report.id == r_id).first()
            if record:
                clean_title = clean_title or record.title
                db.delete(record)
                db.commit()
                deleted = 1
        
        # 2. If not deleted and title provided, delete matching by user_id and title
        if deleted == 0 and clean_title:
            matches = db.query(Report).filter(Report.user_id == userId, Report.title == clean_title).all()
            if matches:
                deleted = len(matches)
                for m in matches:
                    db.delete(m)
                db.commit()

        # 3. If still not deleted and reportId was not purely digits, check by title equals reportId
        if deleted == 0 and not reportId.isdigit():
            matches = db.query(Report).filter(
                Report.user_id == userId,
                (Report.title == reportId) | (Report.title.ilike(f"%{reportId}%"))
            ).all()
            if matches:
                deleted = len(matches)
                for m in matches:
                    clean_title = clean_title or m.title
                    db.delete(m)
                db.commit()

        # Also remove associated HealthMemory vitals extracted from this report
        if clean_title:
            try:
                from ..models.memory_model import HealthMemory
                db.query(HealthMemory).filter(
                    HealthMemory.user_id == userId,
                    HealthMemory.source_context.ilike(f"%{clean_title}%")
                ).delete()
                db.commit()
            except Exception as me:
                print(f"HealthMemory cleanup notice: {me}")

        # Also remove from Qdrant Cloud vector collection
        try:
            from ..services.qdrant_service import qdrant_service
            qdrant_service.delete_medical_report(user_id=userId, report_id=reportId)
        except Exception as qe:
            print(f"Qdrant delete notice: {qe}")

        print(f"✅ Deleted report (id={reportId}, title='{clean_title}') from Supabase DB. Rows affected: {deleted}")

    except Exception as e:
        print(f"Error deleting report {reportId}: {e}")
        db.rollback()

    return {
        "status": "success",
        "deleted": deleted,
        "message": f"Deleted report {reportId} (rows affected: {deleted})"
    }

@router.get("/vitals/{userId}")
async def get_user_vitals(userId: str, db: Session = Depends(get_db)):
    from ..models.memory_model import HealthMemory
    vitals = db.query(HealthMemory).filter(
        HealthMemory.user_id == userId,
        HealthMemory.memory_type == "vital"
    ).order_by(HealthMemory.created_at.desc()).all()
    
    return {
        "status": "success",
        "vitals": [
            {
                "id": v.id,
                "key": v.key,
                "value": v.value,
                "source_context": v.source_context,
                "created_at": v.created_at.isoformat() if v.created_at else None
            }
            for v in vitals
        ]
    }

class RecordVitalRequest(BaseModel):
    key: str
    value: str
    source_context: Optional[str] = "Clinical Observation / Patient Log"

@router.post("/vitals/{userId}")
async def record_user_vital(userId: str, data: RecordVitalRequest, db: Session = Depends(get_db)):
    from ..models.memory_model import HealthMemory
    import uuid
    clean_key = str(data.key).strip().lower()
    clean_val = str(data.value).strip()

    new_vital = HealthMemory(
        id=str(uuid.uuid4()),
        user_id=userId,
        memory_type="vital",
        key=clean_key,
        value=clean_val,
        confidence=1.0,
        classification="CONFIRMED",
        source_context=data.source_context or "Recorded by User"
    )
    db.add(new_vital)
    db.commit()
    db.refresh(new_vital)

    return {
        "status": "success",
        "vital": {
            "id": new_vital.id,
            "key": new_vital.key,
            "value": new_vital.value,
            "source_context": new_vital.source_context,
            "created_at": new_vital.created_at.isoformat() if new_vital.created_at else None
        }
    }


@router.post("/analysis")
async def report_analysis_endpoint(
    file: UploadFile = File(...),
    userId: str = Form("guest"),
    db: Session = Depends(get_db)
):
    # 1. Read file content
    content = await file.read()
    filename = file.filename or "medical_document"
    content_type = file.content_type or ""
    is_image = content_type.startswith("image/") or any(filename.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".webp", ".bmp"])

    # 2. Pre-analysis Image Clarity & Quality Check (for image uploads)
    if is_image:
        is_clear, clarity_msg = ImageQualityService.check_image_clarity(content, filename)
        if not is_clear:
            print(f"Image clarity check rejected: {clarity_msg}")
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "is_clear": False,
                    "error": clarity_msg,
                    "detail": clarity_msg
                }
            )

    # 3. Extract text via OCR (supporting PDFs and images)
    ocr_text = await OCRService.extract_text(content, filename)
    
    # 4. Analyze with AI (Use Vision for images if OCR text is sparse, or for X-rays)
    filename_lower = filename.lower()
    is_xray_scan = any(k in filename_lower for k in ["x-ray", "xray", "scan", "radiograph", "mri", "ct"])
    
    if (not ocr_text.strip() or is_xray_scan) and is_image:
        # Fallback to Vision for images with no readable text (like X-rays)
        analysis_json = await AIService.analyze_medical_image(content, content_type or "image/jpeg")
    else:
        # Standard report analysis
        analysis_json = await AIService.analyze_medical_report(ocr_text)
    
    # Parse JSON
    try:
        # Check if the output contains triple backticks markdown block
        if "```json" in analysis_json:
            clean_json = analysis_json.split("```json")[1].split("```")[0].strip()
        elif "```" in analysis_json:
            clean_json = analysis_json.split("```")[1].split("```")[0].strip()
        else:
            clean_json = analysis_json.strip()
        
        analysis_data: dict[str, Any] = json.loads(clean_json)
    except Exception as e:
        print(f"JSON parsing error: {e}. Raw: {analysis_json[:200]}...")
        analysis_data: dict[str, Any] = {
            "title": "Medical Document",
            "category": "lab",
            "facility": "Diagnostic Wing",
            "summary": "Analysis received but formatting was unexpected.",
            "detailed_explanation": str(analysis_json),
            "biomarkers": "Diagnostic Observation",
            "abnormalities": [],
            "recommendations": ["Review report with a doctor."]
        }

    # 5. Check if AI Vision marked the image as unclear / illegible
    if analysis_data.get("is_clear") is False:
        clarity_error = analysis_data.get("error") or "The uploaded image was not clear or readable. Please capture a steady, focused, well-lit photo and retry."
        print(f"AI Vision clarity check rejected: {clarity_error}")
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "is_clear": False,
                "error": clarity_error,
                "detail": analysis_data.get("clarity_reason", clarity_error)
            }
        )

    # 6. Upload to Cloudinary (only after clarity validation succeeds)
    file_url = await StorageService.upload_file(content, filename)
    if not file_url:
        file_url = "#"

    # Ensure consistent structure for frontend
    if "findings" in analysis_data and "abnormalities" not in analysis_data:
        analysis_data["abnormalities"] = [
            {
                "name": "Note", 
                "value": "Visual Observation", 
                "status": "INFO", 
                "explanation": analysis_data.get("findings", "See summary for details.")
            }
        ]
    
    # Merge detailed explanation into summary if available
    summary = analysis_data.get("summary", "")
    detailed = analysis_data.get("detailed_explanation", "")
    if detailed:
        analysis_data["summary_full"] = f"{summary}\n\n{detailed}"
    else:
        analysis_data["summary_full"] = summary

    # Persist report to Supabase DB and Qdrant Cloud Knowledge Base
    import uuid
    report_id = str(uuid.uuid4())
    try:
        if userId and userId != "guest":
            # Structure biomarkers payload to preserve vitals and abnormalities
            biomarkers_payload = json.dumps({
                "display": analysis_data.get("biomarkers", ""),
                "vitals": analysis_data.get("vitals", {}),
                "abnormalities": analysis_data.get("abnormalities", [])
            })
            new_report = Report(
                user_id=userId,
                file_url=file_url,
                title=analysis_data.get("title", file.filename or "Medical Document"),
                category=analysis_data.get("category", "lab"),
                facility=analysis_data.get("facility", "Diagnostic Wing"),
                biomarkers=biomarkers_payload,
                summary=summary,
                ocr_text=ocr_text
            )
            db.add(new_report)
            db.commit()
            db.refresh(new_report)
            report_id = str(new_report.id)
            analysis_data["id"] = new_report.id
    except Exception as e:
        print(f"⚠️ Failed to save report to database: {e}")

    # Persist extracted vitals and imaging metrics to HealthMemory (memory_type='vital')
    try:
        if userId and userId != "guest":
            from ..models.memory_model import HealthMemory
            vitals_dict = analysis_data.get("vitals", {})
            if isinstance(vitals_dict, dict):
                for vkey, vval in vitals_dict.items():
                    if vval is not None and str(vval).strip() != "":
                        try:
                            vital_memory = HealthMemory(
                                id=str(uuid.uuid4()),
                                user_id=userId,
                                memory_type="vital",
                                key=str(vkey).lower(),
                                value=str(vval),
                                confidence=0.95,
                                classification="CONFIRMED",
                                source_context=f"Extracted from {analysis_data.get('title', file.filename or 'Medical Document')}"
                            )
                            db.add(vital_memory)
                            db.commit()
                        except Exception as ve:
                            print(f"⚠️ Error saving vital {vkey}: {ve}")
    except Exception as e:
        print(f"⚠️ Error processing vitals memories: {e}")

    try:
        from ..services.qdrant_service import qdrant_service
        qdrant_service.index_medical_report(
            user_id=userId,
            report_id=report_id,
            summary=summary,
            abnormalities=analysis_data.get("abnormalities", []),
            recommendations=analysis_data.get("recommendations", []),
            file_url=file_url
        )
    except Exception as e:
        print(f"⚠️ Failed to index report in Qdrant: {e}")
    
    analysis_data["file_url"] = file_url
    return analysis_data

class AnalysisChatRequest(BaseModel):
    userId: str = "guest"
    question: str
    reportContext: Optional[str] = None

@router.post("/analysis/chat")
async def report_chat_endpoint(request: AnalysisChatRequest):
    response = await AIService.chat_about_medical_report(
        request.question, 
        request.reportContext or "No previous report text uploaded."
    )
    return {"response": response}
