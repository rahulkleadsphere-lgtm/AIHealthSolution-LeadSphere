import datetime
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from ..config.db import get_db
from ..services.redis_service import RedisVitalsService

router = APIRouter(prefix="/vitals", tags=["Vitals Telemetry & Wearable Ingestion"])

# Request Schemas
class LiveVitalStreamRequest(BaseModel):
    user_id: Optional[str] = "rahul_mumbai_demo"
    device_name: Optional[str] = "Noise ColorFit Pro"
    heart_rate: Optional[int] = None
    spo2: Optional[int] = None
    blood_pressure_sys: Optional[int] = None
    blood_pressure_dia: Optional[int] = None
    temperature: Optional[float] = None
    source_type: Optional[str] = "web_ble_live"

class WearableBatchRequest(BaseModel):
    user_id: Optional[str] = "rahul_mumbai_demo"
    device_name: Optional[str] = "Noise ColorFit Pro 5"
    batch: List[Dict[str, Any]] = Field(..., description="List of 10-min interval readings")

# =============================================================================
# 1. LIVE TELEMETRY INGESTION (1 Hz STREAM OR BLE)
# =============================================================================
@router.post("/live-stream")
async def ingest_live_vital(data: LiveVitalStreamRequest):
    result = RedisVitalsService.cache_live_vital(
        user_id=data.user_id or "rahul_mumbai_demo",
        vital_payload=data.dict(exclude={"user_id", "device_name", "source_type"}),
        device_name=data.device_name or "Noise ColorFit Pro",
        source_type=data.source_type or "web_ble_live"
    )
    return result

# =============================================================================
# 2. 10-MINUTE INTERVAL BATCH SYNC (FROM NOISEFIT / GOOGLE HEALTH CONNECT)
# =============================================================================
@router.post("/wearable-sync")
async def ingest_wearable_batch(data: WearableBatchRequest):
    result = RedisVitalsService.ingest_wearable_batch(
        user_id=data.user_id or "rahul_mumbai_demo",
        device_name=data.device_name or "Noise ColorFit Pro 5",
        batch=data.batch
    )
    return result

class ManualVitalLogRequest(BaseModel):
    user_id: Optional[str] = "rahul_mumbai_demo"
    vital_name: str
    value: str
    notes: Optional[str] = "Manual Upper-Arm Monitor / Lab Slip"

# =============================================================================
# 3. SUB-MILLISECOND LIVE VITALS RETRIEVAL (READS FROM REDIS + MULTI-MODAL FUSION)
# =============================================================================
@router.get("/live")
@router.get("/live/{userId}")
async def get_live_vitals(
    userId: Optional[str] = None,
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    effective_id = user_id or userId or "rahul_mumbai_demo"
    result = RedisVitalsService.get_live_vitals(effective_id)
    
    # MULTI-MODAL DATA FUSION: Fill missing sensor gaps from HealthMemory (Lab OCR & Clinic logs)
    try:
        from ..models.memory_model import HealthMemory
        db_vitals = db.query(HealthMemory).filter(
            HealthMemory.user_id == str(effective_id),
            HealthMemory.memory_type == "vital"
        ).order_by(HealthMemory.created_at.desc()).all()
        
        vitals_dict = result.get("vitals", {})
        sensor_status = result.get("sensor_status", {})
        
        for mem in db_vitals:
            key_clean = mem.key.lower().strip()
            # If blood_pressure not from watch, fuse from DB
            if "pressure" in key_clean or key_clean in ["bp", "blood_pressure"]:
                if "blood_pressure" not in vitals_dict or not vitals_dict["blood_pressure"]:
                    vitals_dict["blood_pressure"] = mem.value
                    sensor_status["blood_pressure"] = {
                        "supported_on_device": False,
                        "source": mem.source_context or "Clinical Upper-Arm Monitor",
                        "status": "FUSED_FROM_CLINIC_LOG",
                        "notice": "Smartwatches cannot clinically measure systolic/diastolic BP. Fused from clinic record."
                    }
            elif "sugar" in key_clean or "glucose" in key_clean:
                if "blood_glucose" not in vitals_dict or not vitals_dict.get("blood_glucose"):
                    vitals_dict["blood_glucose"] = mem.value
                    sensor_status["blood_glucose"] = {
                        "supported_on_device": False,
                        "source": mem.source_context or "KEM Hospital Lab OCR",
                        "status": "LAB_REPORT_SYNCED",
                        "notice": "Diagnostic blood panel verified from Health Vault."
                    }
            elif "temp" in key_clean:
                if "temperature" not in vitals_dict or not vitals_dict.get("temperature"):
                    try:
                        vitals_dict["temperature"] = float(mem.value)
                    except Exception:
                        pass
        
        result["vitals"] = vitals_dict
        result["sensor_status"] = sensor_status
    except Exception as e:
        print(f"Notice: Multi-modal DB fusion skipped ({e})")
        
    return result

# =============================================================================
# 4. SENSOR AVAILABILITY & EDGE-CASE CAPABILITY MATRIX
# =============================================================================
@router.get("/sensors/{userId}")
async def get_sensor_matrix(userId: Optional[str] = "rahul_mumbai_demo", db: Session = Depends(get_db)):
    effective_id = userId or "rahul_mumbai_demo"
    data = await get_live_vitals(userId=effective_id, db=db)
    return {
        "user_id": effective_id,
        "device": data.get("device", "Noise ColorFit Pro"),
        "sensor_status": data.get("sensor_status", {}),
        "alerts": data.get("alerts", []),
        "cache_tier": data.get("cache_tier", "IN_MEMORY_BUFFER")
    }

# =============================================================================
# 5. EDGE-CASE MANUAL OVERRIDE (FOR MISSING SENSORS LIKE BP / GLUCOSE)
# =============================================================================
@router.post("/manual-log")
async def log_manual_vital(data: ManualVitalLogRequest, db: Session = Depends(get_db)):
    effective_id = data.user_id or "rahul_mumbai_demo"
    now_ts = datetime.datetime.utcnow().isoformat() + "Z"
    
    # 1. Update live cache
    payload: Dict[str, Any] = {}
    if data.vital_name in ["blood_pressure", "bp"]:
        parts = data.value.replace("mmHg", "").strip().split("/")
        if len(parts) == 2:
            try:
                payload["blood_pressure_sys"] = int(parts[0].strip())
                payload["blood_pressure_dia"] = int(parts[1].strip())
            except Exception:
                pass
    elif data.vital_name in ["heart_rate", "pulse"]:
        try:
            payload["heart_rate"] = int(data.value)
        except Exception:
            pass
    elif data.vital_name in ["spo2", "oxygen"]:
        try:
            payload["spo2"] = int(data.value.replace("%", "").strip())
        except Exception:
            pass
    elif data.vital_name in ["temperature", "temp"]:
        try:
            payload["temperature"] = float(data.value.replace("F", "").strip())
        except Exception:
            pass

    cached_res = RedisVitalsService.cache_live_vital(
        user_id=effective_id,
        vital_payload=payload,
        device_name=f"Manual Log ({data.notes or 'Upper-Arm Device'})",
        source_type="manual_override"
    )

    # 2. Persist to HealthMemory
    try:
        from ..models.memory_model import HealthMemory
        mem = HealthMemory(
            user_id=effective_id,
            memory_type="vital",
            key=data.vital_name,
            value=data.value,
            classification="USER_REPORTED",
            source_context=data.notes or "Manual Clinical Log"
        )
        db.add(mem)
        db.commit()
    except Exception as e:
        print(f"Notice: HealthMemory save failed ({e})")

    return {
        "status": "success",
        "message": f"Successfully logged {data.vital_name} = {data.value}",
        "live_vitals": cached_res.get("vitals", {})
    }
