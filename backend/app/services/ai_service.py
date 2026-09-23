from typing import Optional, List, Dict, Any
from groq import Groq
import os
import base64
from ..config.settings import get_settings

settings = get_settings()

client = Groq(api_key=settings.GROQ_API_KEY)

class AIService:
    SYSTEM_PROMPT_INITIAL = """
    You are 'SevaSetu AI', a warm, compassionate, and trustworthy health assistant for people in India.

    ### CRITICAL RULES (INITIAL TURN):
    1. NATURAL EMPATHETIC TONE: Speak warmly and naturally like an experienced healthcare professional.
    2. SPECIFIC QUESTIONS vs GENERAL SYMPTOMS:
       - If the user asks a SPECIFIC targeted question (e.g., "Can I take Amoxicillin?", "What is MJPJAY?", "How do I care for a wound?"): Answer THAT question directly, clearly, and concisely in 2-4 sentences. Do NOT generate unnecessary generic sections like "Possible Causes" or "Recommended Relief Steps".
       - If the user describes new, broad, multi-symptom complaints (e.g., "I have had a high fever, cough, and body aches for 3 days"): Provide a clean, concise breakdown:
         • Brief empathetic acknowledgment (1 sentence)
         • **Practical Home Relief** (2-3 short, safe tips)
         • **When to See a Doctor** (2-3 red flag warning signs)
         • Brief 1-line disclaimer: *Note: I am an AI health assistant, not a doctor. Please consult a qualified physician for a formal diagnosis and prescriptions.*
    3. BREVITY: Keep initial responses concise (under 120 words). Avoid overwhelming mobile users with walls of text.
    4. LANGUAGE FIDELITY: Always reply in the user's requested language (English, Hindi, Odia, or Hinglish).
    5. ALLERGY & CROSS-REACTIVITY DEFENSE: Always strictly honor the patient's verified health profile (Allergies, Chronic Conditions). If the user asks about or is considering ANY medication that cross-reacts with their known allergies (e.g., Amoxicillin, Ampicillin, or Augmentin for someone with a Penicillin allergy), you MUST proactively issue a prominent bold safety warning: "**DO NOT TAKE [MEDICINE]**", explain the cross-reactivity risk (severe hives, rash, anaphylaxis), and advise them to ask their physician for safe non-penicillin alternatives (e.g. azithromycin).
    6. HEALTH EVENT & TREATMENT RECALL: If the user asks about past medical events, procedures, or treatments (e.g., "When did I take my last nebulisation?", "Why did I take nebulisation?"), check the "Secondary Clinical Memories" in the VERIFIED PATIENT HEALTH IDENTITY and state the exact date, treatment, and reason recorded.
    7. LIVE REMINDERS & AUDIO NOTIFICATIONS: The SevaSetu platform HAS an integrated scheduled notification and Web Audio chime system. NEVER tell the user "I can't trigger an actual alarm for you" or tell them to open their phone's Clock or Reminders app. When a user asks about setting reminders, timing, or notification sounds, confirm warmly that their alert is set in the platform and the audio chime will ring at the designated time.
    8. LOCATION-BASED HEALTHCARE ACCESS: You HAVE full, native access to the National Hospital Directory (30,273 Government of India facilities from data.gov.in) and 14,000+ Pradhan Mantri Bhartiya Jan Aushadhi Kendras (PMBJP generic medical stores). NEVER refuse with "I can't provide location-based medical assistance" or "I don't have access to location data". When local facilities or Kendras are provided in the context, present them clearly with their names, exact addresses, and contact details. If the user mentions their location (e.g. "I am in Mumbai"), warmly recommend the verified facilities in that city.
    9. PROFESSIONAL TONE - STRICT NO EMOJIS: Do NOT use any emojis in your responses. Always maintain a clean, formal clinical tone.
    """

    SYSTEM_PROMPT_FOLLOWUP = """
    You are 'SevaSetu AI', continuing an ONGOING conversation with the patient.

    ### CRITICAL FOLLOW-UP RULES (DO NOT REPEAT TEMPLATES):
    1. STRICTLY NO REPEATED TEMPLATES: Do NOT repeat sections like "**Possible Causes**", "**Recommended Relief Steps**", or "**When to See a Doctor**". The patient has already received the overview.
    2. NO REPEATED DISCLAIMERS: Do NOT end every message with the robotic medical disclaimer. Only provide advice directly.
    3. BE DIRECT & CONCISE: Answer the patient's exact follow-up question or comment directly, warmly, and concisely in 2-4 sentences or short, focused bullets.
    4. NATURAL CONVERSATION: Converse naturally as a caring clinician continuing a consultation.
    5. ALLERGY DEFENSE: If any prohibited cross-allergen is mentioned, issue an immediate clear warning.
    6. HEALTH EVENT & TREATMENT RECALL: If the user asks about past treatments (e.g., "When did I take my last nebulisation and why?"), answer accurately from the patient's verified health records.
    7. LIVE REMINDERS & AUDIO NOTIFICATIONS: The SevaSetu platform HAS an integrated scheduled notification and Web Audio chime system. NEVER tell the user "I can't trigger an actual alarm for you" or tell them to open their phone's Clock or Reminders app. When a user asks about setting reminders, timing, or notification sounds, confirm warmly that their alert is set in the platform and the audio chime will ring at the designated time.
    8. LOCATION-BASED HEALTHCARE ACCESS: You HAVE full, native access to the National Hospital Directory (30,273 Government of India facilities from data.gov.in) and 14,000+ Pradhan Mantri Bhartiya Jan Aushadhi Kendras (PMBJP generic medical stores). NEVER refuse with "I can't provide location-based medical assistance" or "I don't have access to location data". When local facilities or Kendras are provided in the context, present them clearly with their names, exact addresses, and contact details. If the user mentions their location (e.g. "I am in Mumbai"), warmly recommend the verified facilities in that city.
    9. PROFESSIONAL TONE - STRICT NO EMOJIS: Do NOT use any emojis in your responses. Always maintain a clean, formal clinical tone.
    10. LANGUAGE FIDELITY: Reply in the user's requested language.
    """

    @staticmethod
    async def get_chat_response(
        message: str,
        history: list = None,
        language: str = "English",
        user_id: Optional[str] = None,
        patient_context: Optional[str] = None
    ):
        is_followup = bool(history and len(history) > 0)
        system_content = AIService.SYSTEM_PROMPT_FOLLOWUP if is_followup else AIService.SYSTEM_PROMPT_INITIAL

        if patient_context:
            system_content += f"\n\n{patient_context}"

        if language and language.lower() not in ("english", "en"):
            system_content += f"\n\nCRITICAL LANGUAGE DIRECTIVE:\nThe user's selected language interface is {language}. You MUST formulate your entire response in {language}."

        # Query Qdrant Cloud Knowledge Base for relevant context (max 2.0s timeout to guarantee instant response)
        qdrant_context = []
        try:
            import asyncio

            async def _fetch_qdrant_context():
                ctx = []
                from .qdrant_service import qdrant_service
                if not qdrant_service.client:
                    return ctx

                msg_lower = message.lower()

                # 1. Emergency protocols (only if medical emergency keywords detected)
                emergency_keywords = ("bite", "snake", "poison", "burn", "fever", "bleed", "pain", "fracture", "accident", "heatstroke", "stroke", "convulsion", "seizure", "emergency", "unconscious", "breath", "chok", "wound", "cut")
                if any(k in msg_lower for k in emergency_keywords):
                    first_aid = qdrant_service.search_first_aid(message, top_k=1)
                    for fa in first_aid:
                        ctx.append(f"[EMERGENCY PROTOCOL - {fa.get('emergency_type')}]: DO: {fa.get('immediate_dos')} | DO NOT: {fa.get('strict_donts')} | Helpline: {fa.get('emergency_helpline')}")

                # 2. Government Schemes (only if scheme keywords detected)
                scheme_keywords = ("scheme", "yojana", "card", "free", "money", "help", "fund", "bima", "ayushman", "bsky", "sarkar", "sarkari", "delivery", "hospital", "arogya")
                if any(k in msg_lower for k in scheme_keywords):
                    schemes = qdrant_service.search_schemes(message, top_k=2)
                    for s in schemes:
                        ctx.append(f"[GOVT SCHEME - {s.get('title')} ({s.get('state')})]: Coverage: {s.get('coverage_amount')}. Eligibility: {s.get('eligibility')}. Benefits: {s.get('benefits')}. Portal: {s.get('official_portal')}, Helpline: {s.get('helpline')}")

                # 3. Patient Past Lab Reports (only for authenticated user with report queries)
                if user_id and user_id != "guest":
                    report_keywords = ("report", "test", "hemoglobin", "blood", "sugar", "scan", "last", "past", "history", "previous")
                    if any(k in msg_lower for k in report_keywords):
                        past_reports = qdrant_service.search_patient_reports(user_id, message, top_k=2)
                        for pr in past_reports:
                            ctx.append(f"[PATIENT LAB RECORD ({pr.get('report_type')})]: Summary: {pr.get('summary')}. Abnormal parameters: {pr.get('abnormalities')}")

                # Detect district/city in query if present
                common_places = [
                    "mumbai", "pune", "thane", "delhi", "bhubaneswar", "cuttack", "kolkata", "chennai", 
                    "bangalore", "bengaluru", "hyderabad", "ahmedabad", "jaipur", "lucknow", "kalyan", 
                    "badlapur", "navi mumbai", "dadar", "andheri", "patna", "nagpur", "surat", "puri"
                ]
                detected_place = None
                import re
                for cp in common_places:
                    if re.search(r'\b' + re.escape(cp) + r'\b', msg_lower):
                        detected_place = cp.title()
                        break

                # 4. Jan Aushadhi & Generic Medicine & Pharmacy Inquiries
                med_keywords = (
                    "medicine", "tablet", "generic", "cheap", "cost", "price", "substitute", "alternative", 
                    "augmentin", "metformin", "glycomet", "telma", "atorva", "lipitor", "dolo", "calpol", 
                    "pan-d", "pantocid", "azithral", "janaushadhi", "kendra", "medical", "medicals", 
                    "pharmacy", "pharmacies", "chemist", "chemists", "drugstore", "store", "shop", "dawakhana"
                )
                if any(k in msg_lower for k in med_keywords) or (detected_place and ("near" in msg_lower or "store" in msg_lower or "pharmacy" in msg_lower or "medical" in msg_lower)):
                    ja_res = qdrant_service.search_jan_aushadhi(query=message, district=detected_place, top_k=3)
                    for m in ja_res.get("medicines", []):
                        ctx.append(
                            f"[JAN AUSHADHI GENERIC ALTERNATIVE]: Branded '{m.get('branded_name')}' (Rs {m.get('branded_price')}) -> PMBJP Generic '{m.get('generic_name')}' (Salt: {m.get('salt')}) costs only Rs {m.get('jan_aushadhi_price')} (Save {m.get('savings')}). Available at Pradhan Mantri Bhartiya Janaushadhi Kendras."
                        )
                    for k in ja_res.get("kendras", [])[:2]:
                        ctx.append(f"[JAN AUSHADHI KENDRA]: {k.get('name')} at {k.get('address')}, {k.get('district')}, PIN {k.get('pincode')}. Phone: {k.get('contact')}.")

                # 5. Nearby Hospital & Clinic Inquiries
                hosp_keywords = (
                    "hospital", "hospitals", "clinic", "clinics", "doctor", "doctors", "emergency room", 
                    "casualty", "phc", "chc", "trauma", "ward", "dispensary", "nursing home", "center", "centre"
                )
                if any(k in msg_lower for k in hosp_keywords) and not any(k in msg_lower for k in emergency_keywords):
                    hosp_res = qdrant_service.search_hospitals(query=message, district=detected_place, top_k=2)
                    for h in hosp_res:
                        ctx.append(f"[VERIFIED GOVT HEALTHCARE FACILITY]: {h.get('name')} ({h.get('type')}, {h.get('discipline')}) in {h.get('district')}, {h.get('state')}. Phone: {h.get('contact')}. Address: {h.get('address')}.")
                return ctx

            qdrant_context = await asyncio.wait_for(_fetch_qdrant_context(), timeout=2.0)
        except asyncio.TimeoutError:
            print("⚠️ Qdrant context retrieval timed out (> 2.0s), skipping to prevent request delay.")
        except Exception as e:
            print(f"⚠️ Qdrant context retrieval error: {e}")

        if qdrant_context:
            system_content += "\n\n### VERIFIED KNOWLEDGE BASE CONTEXT (From Qdrant):\n" + "\n".join(qdrant_context) + "\nIncorporate this verified data naturally into your advice when relevant."

        
        messages = [{"role": "system", "content": system_content}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": message})
        
        response = client.chat.completions.create(
            messages=messages,
            model=settings.AI_MODEL,
        )
        return response.choices[0].message.content

    @staticmethod
    async def analyze_medical_report(ocr_text: str):
        if not ocr_text:
            return AIService.get_generic_medical_response()

        prompt = f"""
        Role: You are SevaSetu AI, an expert medical report analyst. 
        Task: Analyze the following medical report text and provide a structured JSON response.
        
        Report Text:
        {ocr_text}
        
        Analysis Instructions:
        1. Summarize the patient's condition in simple, empathetic, non-jargon language for a person in rural India.
        2. Carefully identify every parameter that is outside its reference range.
        3. For each abnormality, determine if it is "HIGH", "LOW", or "ABNORMAL". 
        4. Explain what each abnormality means simply and what might cause it.
        5. Provide 3-5 clear, actionable health recommendations (diet, hydration, follow-up).
        6. Extract document title (e.g. 'Complete Blood Count (CBC) Panel'), category ('lab', 'prescription', 'discharge', or 'insurance'), facility name if present, and key numeric biomarkers (like hemoglobin and blood sugar/glucose).
        
        Format: You MUST return ONLY a valid JSON object. No conversational filler.
        JSON Structure:
        {{
            "title": "Document Title / Test Name",
            "category": "lab",
            "facility": "Hospital or Lab Name (or 'Diagnostic Wing')",
            "summary": "Simple 1-2 sentence overview",
            "detailed_explanation": "A more detailed paragraph explaining the overall results",
            "biomarkers": "Hb: 13.1 g/dL • Sugar: 112 mg/dL",
            "vitals": {{
                "hemoglobin": 13.1,
                "blood_sugar": 112,
                "blood_pressure": "120/80",
                "blood_pressure_sys": 120,
                "blood_pressure_dia": 80,
                "heart_rate": 72,
                "pulse": 72,
                "spo2": 98,
                "temperature": null,
                "platelets": null,
                "wbc": null
            }},
            "abnormalities": [
                {{
                    "name": "Parameter Name", 
                    "value": "Observed Value", 
                    "status": "HIGH/LOW/NORMAL/INFO", 
                    "explanation": "Simple explanation why it is high/low and what it means."
                }}
            ],
            "recommendations": ["Recommendation 1", "Recommendation 2"]
        }}
        """
        try:
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=settings.AI_MODEL,
                response_format={"type": "json_object"},
                max_tokens=800
            )
            return response.choices[0].message.content
        except Exception as e:
            # Fallback if JSON mode fails or isn't supported by the specific model
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=settings.AI_MODEL,
                max_tokens=800
            )
            return response.choices[0].message.content

    @staticmethod
    async def analyze_medical_image(image_bytes: bytes, file_type: str = "image/jpeg"):
        # Encode image to base64 for Groq Vision
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        prompt = """
        Role: You are SevaSetu AI, an expert medical imaging and document analyst. 
        Task: Analyze this medical image (X-ray, scan, prescription, or diagnostic report) accurately and empathetically.
        
        CRITICAL CLARITY CHECK FIRST:
        Carefully evaluate whether this image is clear, legible, and focused enough for accurate clinical evaluation.
        - If the image is blurry, severely out of focus, too dark, completely illegible, obscured, cut off, or NOT a medical record/scan:
          You MUST set "is_clear": false, and return ONLY this JSON:
          {
              "is_clear": false,
              "error": "The uploaded image was not clear or readable. Please hold the camera steady, ensure good lighting and focus, and retry uploading.",
              "clarity_reason": "Image is blurry, out of focus, or illegible."
          }
        - If the image is sufficiently clear and legible:
          Set "is_clear": true, and provide the complete structured analysis.
        
        Instructions for Clear Images:
        1. Identify the type of image (e.g., Chest X-ray, Hand scan, MRI, Prescription, Lab Report, etc.).
        2. Describe the key findings in non-jargon language for a patient in rural India.
        3. Determine category ('imaging' for X-rays/scans/ultrasound, 'lab', 'prescription', 'discharge', or 'insurance').
        4. Be supportive and calm.
        5. If it's a prescription, list the visible medicines and their general purpose.
        6. Extract an imaging vitals summary (e.g. imaging_type, observation, status).
        
        Format: Return ONLY a valid JSON object.
        JSON Structure for Clear Images:
        {
            "is_clear": true,
            "title": "Medical Imaging / Scan Report",
            "category": "imaging",
            "facility": "Radiology & Imaging Wing",
            "summary": "Short 1-sentence identification",
            "detailed_explanation": "Detailed but simple description of what is seen",
            "biomarkers": "Diagnostic Visual Scan",
            "findings": "Key medical observations",
            "vitals": {
                "imaging_type": "Chest X-Ray / Radiograph",
                "observation": "Clear lung fields, normal cardiothoracic ratio",
                "status": "NORMAL"
            },
            "abnormalities": [],
            "recommendations": ["Consult a specialist for a formal diagnosis", "Keep this record safe"]
        }
        """
        
        # Ensure an active multimodal vision model on Groq
        model_name = settings.VISION_MODEL
        if not model_name or "scout" in model_name.lower():
            model_name = "qwen/qwen3.8-27b"

        last_error = None
        for try_model in [model_name, "qwen/qwen3.8-27b", "qwen/qwen3.6-27b"]:
            try:
                response = client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{file_type};base64,{base64_image}",
                                    },
                                },
                            ],
                        }
                    ],
                    model=try_model,
                    response_format={"type": "json_object"},
                    max_tokens=800
                )
                return response.choices[0].message.content
            except Exception as e:
                last_error = e
                if "model_not_found" in str(e).lower() or "does not exist" in str(e).lower():
                    continue
                break
        
        return f'{{ "summary": "Medical scan processed", "detailed_explanation": "Please ensure the report image is clear and well-lit. We recommend verifying any critical readings directly with a medical doctor.", "findings": "Clinical scan recorded.", "recommendations": ["Share this scan with your doctor", "Keep a physical copy safe."] }}'

    @staticmethod
    async def chat_about_medical_report(question: str, report_context: str):
        prompt = f"""
        Based on the following medical report context, answer the user's question.
        Use simple language and be empathetic.
        The user might be asking in Hindi, Marathi, or English. Respond in the SAME language as the question.
        
        Report Context: {report_context}
        User Question: {question}
        """

        system_content = (
            "You are SevaSetu AI, an empathetic, intelligent medical assistant for Bharat. "
            "Explain medical terms and test readings from the report context in simple, reassuring words. "
            "Answer the user's specific question directly. "
            "If they ask 'what is it about?', give a 2-3 sentence friendly summary of the key findings, "
            "and suggest discussing any out-of-range values with their doctor."
        )

        try:
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": prompt}
                ],
                model=settings.AI_MODEL,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq primary model error in report chat: {e}, attempting fallback...")
            for fallback_model in ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]:
                try:
                    res = client.chat.completions.create(
                        messages=[
                            {"role": "system", "content": system_content},
                            {"role": "user", "content": prompt}
                        ],
                        model=fallback_model,
                    )
                    return res.choices[0].message.content
                except Exception:
                    continue
            raise e

    @staticmethod
    def get_generic_medical_response():
        return '{ "summary": "This document seems to contain no readable text.", "abnormalities": [], "recommendations": ["Ensure document is clear and well-lit.", "Consut your doctor."] }'
