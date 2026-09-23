from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..config.db import get_db
from ..models.appointment_model import Appointment
from pydantic import BaseModel
import datetime
from typing import List, Optional

router = APIRouter(prefix="/appointments")

class AppointmentCreate(BaseModel):
    userId: str
    patient_name: str
    facility_name: str
    appointment_date: datetime.datetime
    phone_number: str
    symptoms: Optional[str] = None

@router.post("")
async def book_appointment(data: AppointmentCreate, db: Session = Depends(get_db)):
    try:
        new_appointment = Appointment(
            user_id=data.userId,
            patient_name=data.patient_name,
            facility_name=data.facility_name,
            appointment_date=data.appointment_date,
            phone_number=data.phone_number,
            symptoms=data.symptoms
        )
        db.add(new_appointment)
        db.commit()
        db.refresh(new_appointment)
        
        return {
            "status": "success",
            "appointment": {
                "id": new_appointment.id,
                "userId": new_appointment.user_id,
                "patient_name": new_appointment.patient_name,
                "facility_name": new_appointment.facility_name,
                "appointment_date": new_appointment.appointment_date,
                "phone_number": new_appointment.phone_number,
                "symptoms": new_appointment.symptoms,
                "status": new_appointment.status
            }
        }
    except Exception as e:
        print(f"Error booking appointment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to book appointment.")

@router.get("/{userId}")
async def get_appointments(userId: str, db: Session = Depends(get_db)):
    appointments = db.query(Appointment).filter(Appointment.user_id == userId).all()
    
    # Simple list of dicts to return
    result = []
    for app in appointments:
        result.append({
            "id": app.id,
            "patient_name": app.patient_name,
            "facility_name": app.facility_name,
            "appointment_date": app.appointment_date,
            "phone_number": app.phone_number,
            "symptoms": app.symptoms,
            "status": app.status
        })
        
    return {
        "status": "success",
        "appointments": result
    }
