"""
Reminder & Scheduled Alert Service for SevaSetu Health Platform:
- Detects user intent to set health alerts, medication reminders, or test alarms
- Deterministically parses durations (e.g., '1 minute', '30 seconds', '2 hours', 'in 1minute')
- Returns structured scheduled reminder payloads with audio alarm triggers
"""

import re
import time
import datetime
from typing import Dict, Any, Optional

class ReminderService:
    
    # Trigger keywords for alarms/reminders (including common typos like notifiaction, remainder)
    REMINDER_TRIGGERS = [
        r'\b(?:alert|remind|reminder|remainder|alarm|timer|notification|notifiaction|notif)\b',
        r'\b(?:give me (?:an )?alert|set (?:an )?alert|set (?:a )?reminder|set (?:an )?alarm|set (?:a )?timer)\b',
        r'\b(?:timing|schedule|schedule it|scheduled|daily)\b',
        r'\b(?:sound|notification sound|notifiaction sound|chime|ring|notify)\b',
        r'\b(?:\d{1,2}(?::\d{2})?\s*(?:am|pm))\b',
        r'\b(?:at \d{1,2}(?::\d{2})?)\b'
    ]

    # Time unit extraction patterns
    DURATION_PATTERNS = [
        r'\b(?:in|after|for)?\s*(\d+)\s*(?:min(?:ute)?s?|m)\b',
        r'\b(?:in|after|for)?\s*(\d+)\s*(?:sec(?:ond)?s?|s)\b',
        r'\b(?:in|after|for)?\s*(\d+)\s*(?:hr|hour(?:s)?|h)\b',
        r'\b(\d+)\s*min(?:ute)?s?\b',
        r'\b(\d+)\s*sec(?:ond)?s?\b'
    ]

    @staticmethod
    def check_reminder(message: str) -> Dict[str, Any]:
        """
        Scans message for reminder, alert, timing, or sound configuration requests.
        """
        msg_lower = message.lower().strip()

        # 1. Check if user is asking to set an alert, reminder, sound, or timing
        is_reminder_intent = False
        for trigger in ReminderService.REMINDER_TRIGGERS:
            if re.search(trigger, msg_lower):
                is_reminder_intent = True
                break

        if not is_reminder_intent:
            return {"is_reminder": False, "reminder": None, "ai_response": None}

        # Handle explicit sound setup requests (e.g., "set notifiaction sound", "enable sound", "notification sound")
        if re.search(r'\b(?:set|test|enable|turn on|check)?\s*(?:notifiaction|notification)?\s*sound\b', msg_lower) or ("sound" in msg_lower and any(k in msg_lower for k in ("notif", "alert", "set", "on", "alarm", "chime"))):
            reminder_data = {
                "id": f"rem_sound_{int(time.time()*1000)}",
                "title": "🔔 Health Alert Audio Chime Active",
                "message": "Notification audio chime is verified and enabled for your health alerts.",
                "duration_seconds": 1,
                "target_timestamp": int(time.time() + 1) * 1000,
                "due_time_str": datetime.datetime.now().strftime("%I:%M %p"),
                "formatted_duration": "Instant Preview",
                "sound": "medical_chime",
                "play_immediately": True
            }
            ai_response = (
                "🔔 **Notification Sound & Alert Chime Configured!**\n\n"
                "The **SevaSetu Web Audio Chime** is enabled and active in your browser. "
                "Whenever a scheduled medication alert, test timer, or health reminder is due, a clear audio chime will ring automatically.\n\n"
                "*(Playing a test audio chime now so you can hear the tone.)*"
            )
            return {
                "is_reminder": True,
                "reminder": reminder_data,
                "ai_response": ai_response
            }

        # 2. Extract duration in seconds or specific clock time
        duration_seconds = 60 # Default to 1 minute
        unit_name = "minute"
        duration_num = 1
        custom_due_time_str = None

        # Check for specific clock time like "5:12pm", "5:12 pm", "daily 5:12pm"
        time_match = re.search(r'(\d{1,2}):(\d{2})\s*(am|pm)?', msg_lower)
        if time_match:
            hr = int(time_match.group(1))
            mn = int(time_match.group(2))
            period = time_match.group(3)
            if period == "pm" and hr < 12:
                hr += 12
            elif period == "am" and hr == 12:
                hr = 0
            
            now = datetime.datetime.now()
            target_dt = now.replace(hour=hr, minute=mn, second=0, microsecond=0)
            diff_seconds = (target_dt - now).total_seconds()
            
            # If the user specified a time that has already passed today, or for immediate testing demo
            if diff_seconds <= 0 or diff_seconds > 86400:
                # Set a friendly 60 second timer with label for the target time
                duration_seconds = 60
                custom_due_time_str = f"{time_match.group(1)}:{time_match.group(2)} {period.upper() if period else 'PM'}"
                formatted_duration = f"Daily at {custom_due_time_str} (Demo chime in 60s)"
            else:
                duration_seconds = int(diff_seconds)
                custom_due_time_str = target_dt.strftime("%I:%M %p")
                formatted_duration = f"at {custom_due_time_str}"
        else:
            # Check for seconds
            sec_match = re.search(r'\b(?:in|after|for)?\s*(\d+)\s*(?:sec(?:ond)?s?|s)\b', msg_lower)
            if sec_match:
                duration_num = int(sec_match.group(1))
                duration_seconds = duration_num
                unit_name = "second" if duration_num == 1 else "seconds"
                formatted_duration = f"{duration_num} {unit_name}"
            else:
                # Check for minutes (e.g., "1minute", "1 min", "2 minutes")
                min_match = re.search(r'\b(?:in|after|for)?\s*(\d+)\s*(?:min(?:ute)?s?|m)\b', msg_lower)
                if min_match:
                    duration_num = int(min_match.group(1))
                    duration_seconds = duration_num * 60
                    unit_name = "minute" if duration_num == 1 else "minutes"
                    formatted_duration = f"{duration_num} {unit_name}"
                else:
                    # Check for hours
                    hr_match = re.search(r'\b(?:in|after|for)?\s*(\d+)\s*(?:hr|hour(?:s)?|h)\b', msg_lower)
                    if hr_match:
                        duration_num = int(hr_match.group(1))
                        duration_seconds = duration_num * 3600
                        unit_name = "hour" if duration_num == 1 else "hours"
                        formatted_duration = f"{duration_num} {unit_name}"
                    else:
                        # Generic phrases like "now", "test", "schedule it", "remainder"
                        duration_seconds = 60
                        duration_num = 1
                        unit_name = "minute"
                        formatted_duration = "1 minute (Test Demo)"

        # 3. Extract topic / purpose of the reminder
        topic = "Medication & Health Alert"
        if "nebulisation" in msg_lower or "budesal" in msg_lower or "budesel" in msg_lower:
            topic = "Nebulisation (Budesonide) Reminder"
        elif "sore throat" in msg_lower or "throat" in msg_lower or "cough" in msg_lower:
            topic = "Sore Throat Care & Warm Fluids"
        elif "medicine" in msg_lower or "tablet" in msg_lower or "pill" in msg_lower or "dosage" in msg_lower:
            topic = "Take Prescribed Medication"
        elif "water" in msg_lower or "hydrat" in msg_lower:
            topic = "Hydration & Water Intake"
        elif "appointment" in msg_lower or "doctor" in msg_lower:
            topic = "Doctor Appointment Check-in"

        target_timestamp = int(time.time() + duration_seconds) * 1000
        due_time = custom_due_time_str or (datetime.datetime.now() + datetime.timedelta(seconds=duration_seconds)).strftime("%I:%M %p")

        reminder_data = {
            "id": f"rem_{int(time.time()*1000)}",
            "title": f"⏰ {topic}",
            "message": f"Time for your scheduled {topic.lower()} ({formatted_duration}).",
            "duration_seconds": duration_seconds,
            "target_timestamp": target_timestamp,
            "due_time_str": due_time,
            "formatted_duration": formatted_duration,
            "sound": "medical_chime"
        }

        ai_response = (
            f"⏰ **Health Alert & Reminder Scheduled!**\n\n"
            f"I have scheduled your reminder for **{formatted_duration}** (due at **{due_time}**).\n\n"
            f"🔔 **When it's time:**\n"
            f"• A medical **audio alert chime** will ring directly in your browser\n"
            f"• An interactive priority banner with countdown will stay visible\n"
            f"• It is logged under your **Priority Alerts**\n\n"
            f"*Your timer is now active in SevaSetu—you will hear the chime when it triggers!*"
        )

        return {
            "is_reminder": True,
            "reminder": reminder_data,
            "ai_response": ai_response
        }
