"""
Guardrail Service for SevaSetu Health Platform:
1. Medical Intent Firewall: Zero-token deterministic pre-filter for non-health queries.
2. Emergency Detector: High-urgency keyword detector that bypasses normal chat.
"""

import re
from typing import Dict, Any, Optional

class GuardrailService:
    # 1. Non-Health / Coding / Irrelevant query triggers
    NON_HEALTH_PATTERNS = [
        r'\b(write|create|generate|show)\s+(python|javascript|code|java|c\+\+|html|css|sql|script|program)\b',
        r'\b(code|algorithm|function|debug|compile|syntax)\b',
        r'\b(capital of|who is the president|who won|score of|ipl|cricket match|crypto|bitcoin|stock market)\b',
        r'\b(write an essay|write a poem|write a song|write a story)\b',
        r'\b(solve math|calculate integral|derivative of|solve equation)\b'
    ]

    # Health whitelist keywords to avoid false positives (e.g. "genetic code" or "medical code")
    HEALTH_ALLOWLIST = [
        "health", "doctor", "medicine", "symptom", "hospital", "fever", "pain",
        "sugar", "blood", "ayushman", "scheme", "allergy", "report", "diet"
    ]

    # 2. Emergency keywords triggering immediate hard-stop
    EMERGENCY_PATTERNS = [
        r'\b(chest pain|heart attack|angina|chest tightness|crushing chest)\b',
        r'\b(can\'?t breathe|cannot breathe|choking|gasping|severe breathlessness|difficulty breathing)\b',
        r'\b(unconscious|passed out|unresponsive|fainted|coma|collapsed)\b',
        r'\b(heavy bleeding|bleeding profusely|arterial bleed|severe hemorrhage)\b',
        r'\b(stroke|facial droop|slurred speech|arm numbness|paralysis)\b',
        r'\b(snake bite|snakebite|poisoning|swallowed poison|consumed pesticide|rat poison)\b',
        r'\b(severe burn|third degree burn|electric shock)\b',
        r'\b(suicide|kill myself|end my life|self harm)\b'
    ]

    @staticmethod
    def check_intent(query: str) -> Dict[str, Any]:
        """
        Runs Tier-0 pre-filter in ~10-15ms.
        Returns:
            {"is_health": bool, "rejection_message": Optional[str]}
        """
        clean = query.lower().strip()
        
        # Check if clearly non-health
        for pattern in GuardrailService.NON_HEALTH_PATTERNS:
            if re.search(pattern, clean):
                # Ensure no medical keyword was mentioned
                if not any(hw in clean for hw in GuardrailService.HEALTH_ALLOWLIST):
                    return {
                        "is_health": False,
                        "category": "OUT_OF_DOMAIN",
                        "rejection_message": (
                            "**SevaSetu Medical Intent Firewall**\n\n"
                            "I am specialized exclusively for **health, clinical wellness, government schemes, and medical emergency access** for Bharat.\n\n"
                            "I cannot help with computer programming, general trivia, or non-healthcare tasks. "
                            "Please ask me about your symptoms, lab reports, government healthcare benefits (PM-JAY/MJPJAY), or finding a doctor."
                        )
                    }

        return {"is_health": True, "category": "HEALTH_QUERY", "rejection_message": None}

    @staticmethod
    def check_emergency(query: str, local_facility: Optional[str] = None) -> Dict[str, Any]:
        """
        Detects life-threatening emergencies requiring immediate protocol override.
        """
        clean = query.lower().strip()

        for pattern in GuardrailService.EMERGENCY_PATTERNS:
            if re.search(pattern, clean):
                facility_line = (
                    f"4. **Nearest Emergency Facility:** **{local_facility}**\n\n"
                    if local_facility
                    else "4. **Nearest Emergency Facility:** Dialing 108 coordinates directly with the nearest local Government Trauma Care & District Hospital.\n\n"
                )
                return {
                    "is_emergency": True,
                    "severity": "CRITICAL_SOS",
                    "override_response": (
                        "🚨 **CRITICAL MEDICAL EMERGENCY DETECTED**\n\n"
                        "Please act immediately. Do NOT wait for automated chat advice.\n\n"
                        "### ⚡ IMMEDIATE ACTIONS:\n"
                        "1. **CALL 108 IMMEDIATELY** (National Ambulance Service) or have someone transport the patient to the nearest Emergency/Trauma room.\n"
                        "2. **CALL 104** (State Health Help Desk) if you need real-time telephonic first-aid coordination.\n"
                        "3. **Keep Patient Still & Calm:** Loosen tight clothing around neck and chest. If chest pain, sit the patient comfortably with back supported.\n"
                        f"{facility_line}"
                        "*⚠️ Tap the emergency dialers below for instant cellular connection.*"
                    ),
                    "actions": ["CALL_108", "CALL_104", "OPEN_OFFLINE_FIRST_AID", "LOCATE_TRAUMA_CENTER"]
                }

        return {"is_emergency": False, "severity": "NORMAL", "override_response": None, "actions": []}
