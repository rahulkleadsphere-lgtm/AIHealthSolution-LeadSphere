import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..config.db import get_db
from ..models.user_model import User
from ..models.chat_model import ChatHistory, ChatEpisode
from ..services.ai_service import AIService
from ..services.guardrail_service import GuardrailService
from ..services.memory_service import MemoryService
from ..services.reminder_service import ReminderService
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from ..services.qdrant_service import qdrant_service

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    userId: Optional[str] = None # Support from PRD
    user_id: Optional[str] = None # Actual field from frontend
    language: str = "English"
    episode_id: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    district: Optional[str] = None
    state: Optional[str] = None

    @property
    def effective_user_id(self) -> str:
        return self.user_id or self.userId or "guest"

class ChatResponse(BaseModel):
    response: str
    actions: List[str] = []
    category: Optional[str] = "HEALTH_QUERY"
    is_emergency: bool = False
    pending_memory: Optional[Dict[str, Any]] = None
    scheduled_reminder: Optional[Dict[str, Any]] = None
    emergency_facility: Optional[Dict[str, Any]] = None
    episode_id: Optional[str] = None
    episode_title: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    user_id = request.effective_user_id
    
    # 1. Fetch/Register user if they don't exist
    user = None
    if user_id != "guest":
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(id=user_id, language=request.language)
            db.add(user)
            db.commit()
        
        # Update user's language preference if changed
        if user.language != request.language:
            user.language = request.language
            db.commit()

    # Helper function to get or create episode
    def get_or_create_episode(ep_id_param: Optional[str], initial_msg: str) -> tuple[str, str]:
        if not user:
            return ep_id_param or "guest_session", "Guest Consultation"
        if ep_id_param:
            existing = db.query(ChatEpisode).filter(ChatEpisode.id == ep_id_param).first()
            if existing:
                return existing.id, existing.title
        # Generate new episode
        clean_title = initial_msg.strip().replace("\n", " ")
        if len(clean_title) > 36:
            clean_title = clean_title[:33] + "..."
        new_ep_id = f"ep_{int(datetime.datetime.utcnow().timestamp()*1000)}"
        new_ep = ChatEpisode(
            id=new_ep_id,
            user_id=user.id,
            title=clean_title,
            summary=f"Health consultation: {initial_msg[:80]}",
            tags="Consultation, Clinical",
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow()
        )
        db.add(new_ep)
        db.commit()
        return new_ep.id, new_ep.title

    # 2. Tier-0 Medical Intent Firewall check (<15ms, 0 tokens)
    intent_result = GuardrailService.check_intent(request.message)
    if not intent_result.get("is_health", True):
        active_ep_id, active_ep_title = get_or_create_episode(request.episode_id, request.message)
        if user:
            chat_log = ChatHistory(
                user_id=user.id,
                episode_id=active_ep_id,
                message=request.message,
                response=intent_result["rejection_message"],
                language=request.language
            )
            db.add(chat_log)
            db.commit()
        return ChatResponse(
            response=intent_result["rejection_message"],
            actions=["ASK_HEALTH_QUESTION", "VIEW_GOVT_SCHEMES"],
            category="OUT_OF_DOMAIN",
            is_emergency=False,
            pending_memory=None,
            episode_id=active_ep_id,
            episode_title=active_ep_title
        )

    # 3. Scheduled Alert / Health Reminder Check
    reminder_result = ReminderService.check_reminder(request.message)
    if reminder_result.get("is_reminder"):
        active_ep_id, active_ep_title = get_or_create_episode(request.episode_id, request.message)
        ai_response = reminder_result["ai_response"]
        if user:
            chat_log = ChatHistory(
                user_id=user.id,
                episode_id=active_ep_id,
                message=request.message,
                response=ai_response,
                language=request.language
            )
            db.add(chat_log)
            db.commit()

        return ChatResponse(
            response=ai_response,
            actions=["SCHEDULE_REMINDER", "VIEW_PRIORITY_ALERTS"],
            category="HEALTH_REMINDER",
            is_emergency=False,
            pending_memory=None,
            scheduled_reminder=reminder_result["reminder"],
            episode_id=active_ep_id,
            episode_title=active_ep_title
        )

    # 3.5 Emergency Guardrail Check
    candidate_facility = None
    target_district = request.district
    target_state = request.state

    # Heuristic: Detect district/state mentioned in query
    if not target_district:
        import re
        common_places = ["thane", "mumbai", "kalyan", "badlapur", "pune", "delhi", "bhubaneswar", "cuttack", "kolkata", "chennai", "bangalore", "bengaluru", "hyderabad", "ahmedabad", "jaipur", "lucknow", "port blair", "puri", "south andaman"]
        msg_l = request.message.lower()
        for cp in common_places:
            if re.search(r'\b' + re.escape(cp) + r'\b', msg_l):
                target_district = cp.title()
                break

    emergency_result = GuardrailService.check_emergency(request.message)
    if emergency_result.get("is_emergency", False):
        active_ep_id, active_ep_title = get_or_create_episode(request.episode_id, request.message)

        # Dynamic verified GoI hospital lookup from Qdrant
        nearby_hospitals = qdrant_service.search_hospitals(
            query="emergency trauma casualty ICU cardiac 24x7",
            lat=request.lat,
            lon=request.lon,
            district=target_district,
            state=target_state,
            top_k=1
        )

        if nearby_hospitals:
            candidate_facility = nearby_hospitals[0]
            loc_label = f" in {candidate_facility['district']}" if candidate_facility.get('district') else ""
            facility_text = (
                f"• **Nearest Verified Emergency Facility{loc_label}:** **{candidate_facility['name']}**\n"
                f"  - Address: {candidate_facility.get('address') or candidate_facility.get('district', '')}\n"
                f"  - Emergency / Contact: **{candidate_facility.get('contact', '108')}**\n"
            )
        else:
            facility_text = (
                "• **Immediate Emergency Routing:** Dialing 108 connects you with your local Emergency Dispatcher for immediate ambulance and trauma triage.\n"
            )

        sos_response = (
            "**CRITICAL MEDICAL EMERGENCY DETECTED**\n\n"
            "Your symptoms suggest an acute emergency requiring immediate intervention.\n\n"
            "**Immediate Direct Action:**\n"
            "• **Call 108** immediately for Emergency Ambulance dispatch (Toll-Free, 24x7).\n"
            "• **Call 104** for the State Medical Helpline.\n"
            f"{facility_text}\n"
            "*Keep calm, sit in a comfortable position, and stay on the line with 108.*"
        )
        if user:
            chat_log = ChatHistory(
                user_id=user.id,
                episode_id=active_ep_id,
                message=request.message,
                response=sos_response,
                language=request.language
            )
            db.add(chat_log)
            db.commit()

        return ChatResponse(
            response=sos_response,
            actions=["CALL_108", "CALL_104", "LOCATE_EMERGENCY_CENTER"],
            category="CRITICAL_SOS",
            is_emergency=True,
            pending_memory=None,
            emergency_facility=candidate_facility,
            episode_id=active_ep_id,
            episode_title=active_ep_title
        )

    # 3.6 Location-Based Healthcare Facilities & Medical Stores Lookup ("near me")
    import re
    msg_lower = request.message.lower().strip()
    
    # Expand common places detection
    expanded_places = [
        "thane", "mumbai", "kalyan", "badlapur", "pune", "delhi", "bhubaneswar", "cuttack", 
        "kolkata", "chennai", "bangalore", "bengaluru", "hyderabad", "ahmedabad", "jaipur", 
        "lucknow", "port blair", "puri", "south andaman", "patna", "nagpur", "surat", "indore", 
        "bhopal", "chandigarh", "kochi", "guwahati", "ranchi", "coimbatore", "visakhapatnam", 
        "dadar", "andheri", "borivali", "kurla", "bandra", "chembur", "goregaon", "malad", "navi mumbai"
    ]
    if not target_district:
        for ep in expanded_places:
            if re.search(r'\b' + re.escape(ep) + r'\b', msg_lower):
                target_district = ep.title()
                break

    NEAR_ME_TRIGGERS = [
        r'\bnear\s*(me|by|here|us)?\b',
        r'\baround\s*(me|here|us)\b',
        r'\bclose\s*to\s*(me|here|us)\b',
        r'\bclosest\b',
        r'\bnearest\b',
        r'\bin\s*my\s*(area|city|locality|district|town|village)\b',
        r'\bwhere\s*can\s*i\s*(buy|get|find)\b',
        r'\bwhere\s*(is|are)\s*(the\s*)?(nearest|closest|nearby|local)\b'
    ]
    
    PHARMACY_TRIGGERS = [
        r'\b(medical|medicals|pharmacy|pharmacies|chemist|chemists|drugstore|drug\s*store|medicine\s*shop|janaushadhi|jan\s*aushadhi|kendra|dawakhana|aushadhi|medicine|medicines)\b'
    ]
    
    HOSPITAL_TRIGGERS = [
        r'\b(hospital|hospitals|clinic|clinics|dispensary|phc|chc|casualty|emergency\s*room|doctor|doctors|icu|nursing\s*home|blood\s*bank|pathology|lab|diagnostic\s*center)\b'
    ]

    has_near_me = any(re.search(p, msg_lower) for p in NEAR_ME_TRIGGERS)
    is_pharmacy_query = any(re.search(f, msg_lower) for f in PHARMACY_TRIGGERS)
    is_hospital_query = any(re.search(h, msg_lower) for h in HOSPITAL_TRIGGERS)

    # Check if the previous message asked where the user is currently located
    last_assistant_msg = ""
    if user:
        last_turn = db.query(ChatHistory).filter(ChatHistory.user_id == user.id).order_by(ChatHistory.created_at.desc()).first()
        if last_turn:
            last_assistant_msg = (last_turn.response or "").lower()
    
    was_prompted_for_location = "where are you currently located" in last_assistant_msg

    # If the user is answering the location prompt (e.g. "currently im in mumbai" or "mumbai") or sharing GPS
    is_gps_answer = bool((request.lat and request.lon) and (re.search(r'\b(gps|location|coord|latitude|longitude|here|near)\b', msg_lower) or was_prompted_for_location))
    is_answering_location = (was_prompted_for_location and bool(target_district or (request.lat and request.lon))) or is_gps_answer

    if (has_near_me and (is_pharmacy_query or is_hospital_query)) or is_answering_location:
        has_coords = bool(request.lat and request.lon)
        has_place = bool(target_district)

        # 1. If location is NOT known yet, ask where they are currently located or to share GPS
        if not has_coords and not has_place:
            active_ep_id, active_ep_title = get_or_create_episode(request.episode_id, request.message)
            loc_prompt = (
                "**Where are you currently located?**\n\n"
                "To locate verified **medical stores, Pradhan Mantri Jan Aushadhi Kendras, and government hospitals** in your vicinity, please specify your current location.\n\n"
                "Select **'Share Current Location'** below or specify your city (for example: **'Mumbai'**, **'Pune'**, **'Thane'**, or **'Delhi'**)."
            )
            if user:
                chat_log = ChatHistory(
                    user_id=user.id,
                    episode_id=active_ep_id,
                    message=request.message,
                    response=loc_prompt,
                    language=request.language
                )
                db.add(chat_log)
                db.commit()

            return ChatResponse(
                response=loc_prompt,
                actions=["SHARE_LOCATION", "SEARCH_DIRECTORY", "MUMBAI", "PUNE", "THANE", "DELHI"],
                category="LOCATION_REQUEST",
                is_emergency=False,
                pending_memory=None,
                episode_id=active_ep_id,
                episode_title=active_ep_title
            )

        # 2. If location IS known, fetch verified facilities from Qdrant Cloud
        active_ep_id, active_ep_title = get_or_create_episode(request.episode_id, request.message)
        place_label = target_district or (f"your GPS coordinates ({request.lat:.2f}, {request.lon:.2f})" if has_coords else "your area")

        # When target_district is explicitly known, do NOT pass conflicting or ISP-routed coordinates
        query_lat = request.lat if not target_district else None
        query_lon = request.lon if not target_district else None

        # Fetch nearby Jan Aushadhi Kendras
        ja_res = qdrant_service.search_jan_aushadhi(
            query=target_district or "jan aushadhi",
            district=target_district,
            lat=query_lat,
            lon=query_lon,
            top_k=3
        )
        kendras = ja_res.get("kendras", [])

        # Fetch verified National Hospitals (data.gov.in)
        hosp_query = "hospital clinic dispensary" if is_hospital_query or not kendras else "dispensary hospital"
        nearby_hosp = qdrant_service.search_hospitals(
            query=hosp_query,
            district=target_district,
            lat=query_lat,
            lon=query_lon,
            top_k=3
        )

        lines = [f"**Verified Healthcare Facilities and Medicals in {place_label}:**\n"]
        
        if kendras:
            lines.append("### Pradhan Mantri Jan Aushadhi Kendras (50%–90% Generic Savings):")
            for idx, k in enumerate(kendras[:3], 1):
                k_addr = k.get('address') or f"{k.get('district', '')}, PIN {k.get('pincode', '')}"
                k_phone = k.get('contact') or "1800-180-8080"
                lines.append(f"{idx}. **{k.get('name')}**\n   • **Address:** {k_addr}\n   • **Phone:** {k_phone}\n   • **Benefits:** Certified generic medicines at government-capped prices.")
            lines.append("")

        if nearby_hosp:
            lines.append("### Verified Government Hospitals and Centers (data.gov.in):")
            for idx, h in enumerate(nearby_hosp[:3], 1):
                h_addr = h.get('address') or h.get('district') or 'City Center'
                h_phone = h.get('contact') or "108 (Emergency Dispatch)"
                lines.append(f"{idx}. **{h.get('name')}** ({h.get('type', 'Hospital')})\n   • **Address:** {h_addr}\n   • **Contact:** {h_phone}")
            lines.append("")

        lines.append("*Note: Jan Aushadhi Kendras provide certified generic medicines with identical active salts to branded prescriptions at 50% to 90% savings. You can also view all facilities on the **Health Directory** tab.*")

        loc_response = "\n".join(lines)

        if user:
            chat_log = ChatHistory(
                user_id=user.id,
                episode_id=active_ep_id,
                message=request.message,
                response=loc_response,
                language=request.language
            )
            db.add(chat_log)
            db.commit()

        return ChatResponse(
            response=loc_response,
            actions=["SEARCH_DIRECTORY", "FIND_GENERIC_MEDICINES", "SHARE_LOCATION"],
            category="HEALTH_QUERY",
            is_emergency=False,
            pending_memory=None,
            episode_id=active_ep_id,
            episode_title=active_ep_title
        )

    # 4. Extract Candidate Clinical Memory for Explicit User Confirmation
    pending_memory = MemoryService.extract_candidate_memory(request.message)
    if pending_memory and user:
        MemoryService.record_user_reported_memory(db, user.id, pending_memory)

    # 5. Fetch Patient Longitudinal Health Context (from Supabase)
    patient_context = ""
    if user:
        patient_context = MemoryService.get_patient_health_context(db, user.id)

    # 6. Retrieve chat history (last 10 messages for rich multi-turn continuity)
    history_formatted = []
    if user:
        history = db.query(ChatHistory).filter(ChatHistory.user_id == user.id).order_by(ChatHistory.created_at.desc()).limit(10).all()
        for h in reversed(history):
            history_formatted.append({"role": "user", "content": h.message})
            history_formatted.append({"role": "assistant", "content": h.response})

    # 7. Generate AI response with user's selected language, Qdrant context, and patient clinical profile
    ai_response = await AIService.get_chat_response(
        message=request.message,
        history=history_formatted,
        language=request.language,
        user_id=user.id if user else "guest",
        patient_context=patient_context
    )

    # 8. Store session & episode
    active_ep_id, active_ep_title = get_or_create_episode(request.episode_id, request.message)
    if user:
        chat_log = ChatHistory(
            user_id=user.id,
            episode_id=active_ep_id,
            message=request.message,
            response=ai_response,
            language=request.language
        )
        db.add(chat_log)
        db.commit()

    return ChatResponse(
        response=ai_response,
        actions=[],
        category="HEALTH_QUERY",
        is_emergency=False,
        pending_memory=pending_memory,
        episode_id=active_ep_id,
        episode_title=active_ep_title
    )

@router.get("/chat/sessions")
@router.get("/chat/sessions/{userId}")
async def get_chat_sessions(userId: Optional[str] = None, user_id: Optional[str] = None, db: Session = Depends(get_db)):
    effective_id = userId or user_id or "rahul_mumbai_demo"
    episodes = db.query(ChatEpisode).filter(ChatEpisode.user_id == effective_id).order_by(ChatEpisode.created_at.desc()).all()
    if not episodes and effective_id != "rahul_mumbai_demo":
        episodes = db.query(ChatEpisode).filter(ChatEpisode.user_id == "rahul_mumbai_demo").order_by(ChatEpisode.created_at.desc()).all()
    
    result = []
    for ep in episodes:
        msg_count = db.query(ChatHistory).filter(ChatHistory.episode_id == ep.id).count()
        result.append({
            "id": ep.id,
            "title": ep.title,
            "summary": ep.summary or "",
            "tags": ep.tags or "",
            "created_at": ep.created_at.isoformat() if ep.created_at else None,
            "message_count": msg_count
        })
    return {"status": "success", "sessions": result}

@router.get("/chat/session/{sessionId}")
async def get_session_messages(sessionId: str, db: Session = Depends(get_db)):
    episode = db.query(ChatEpisode).filter(ChatEpisode.id == sessionId).first()
    messages = db.query(ChatHistory).filter(ChatHistory.episode_id == sessionId).order_by(ChatHistory.created_at.asc()).all()
    
    return {
        "status": "success",
        "session": {
            "id": episode.id if episode else sessionId,
            "title": episode.title if episode else "Consultation",
            "summary": episode.summary if episode else "",
            "tags": episode.tags if episode else ""
        } if episode else None,
        "messages": [
            {
                "id": str(h.id),
                "message": h.message,
                "response": h.response,
                "language": h.language,
                "created_at": h.created_at.isoformat() if h.created_at else None
            }
            for h in messages
        ]
    }

class CreateSessionRequest(BaseModel):
    user_id: Optional[str] = "rahul_mumbai_demo"
    title: Optional[str] = "New Consultation"
    summary: Optional[str] = ""
    tags: Optional[str] = "General Health"

@router.post("/chat/session/new")
async def create_chat_session(data: CreateSessionRequest, db: Session = Depends(get_db)):
    new_id = f"ep_{int(datetime.datetime.utcnow().timestamp()*1000)}"
    new_ep = ChatEpisode(
        id=new_id,
        user_id=data.user_id or "rahul_mumbai_demo",
        title=data.title or "New Consultation",
        summary=data.summary or "",
        tags=data.tags or "General Health",
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(new_ep)
    db.commit()
    db.refresh(new_ep)
    return {
        "status": "success",
        "session": {
            "id": new_ep.id,
            "title": new_ep.title,
            "summary": new_ep.summary,
            "tags": new_ep.tags,
            "created_at": new_ep.created_at.isoformat()
        }
    }

@router.delete("/chat/session/{sessionId}")
async def delete_chat_session(sessionId: str, db: Session = Depends(get_db)):
    db.query(ChatHistory).filter(ChatHistory.episode_id == sessionId).delete()
    db.query(ChatEpisode).filter(ChatEpisode.id == sessionId).delete()
    db.commit()
    return {"status": "success", "message": "Session deleted."}

@router.get("/chat/history")
@router.get("/chat/history/{userId}")
async def get_chat_history(userId: Optional[str] = None, user_id: Optional[str] = None, limit: int = 50, db: Session = Depends(get_db)):
    effective_id = userId or user_id or "rahul_mumbai_demo"
    history = db.query(ChatHistory).filter(ChatHistory.user_id == effective_id).order_by(ChatHistory.created_at.asc()).limit(limit).all()
    return {
        "status": "success",
        "user_id": effective_id,
        "messages": [
            {
                "id": str(h.id),
                "message": h.message,
                "response": h.response,
                "language": h.language,
                "created_at": h.created_at.isoformat() if h.created_at else None
            }
            for h in history
        ]
    }

@router.delete("/chat/history")
@router.delete("/chat/history/{userId}")
async def clear_chat_history(userId: Optional[str] = None, user_id: Optional[str] = None, db: Session = Depends(get_db)):
    effective_id = userId or user_id or "rahul_mumbai_demo"
    db.query(ChatHistory).filter(ChatHistory.user_id == effective_id).delete()
    db.commit()
    return {"status": "success", "user_id": effective_id, "message": "Chat history cleared."}



