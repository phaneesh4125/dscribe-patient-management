import re
from datetime import date, datetime

ALLOWED_GENDERS = ["Male", "Female", "Other"]
ALLOWED_WARDS = ["General Ward", "ICU", "Emergency", "Maternity", "Pediatrics", "Surgical"]
ALLOWED_DEPARTMENTS = [
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "General Medicine",
    "Pediatrics",
    "Oncology",
]
ALLOWED_DOCTORS = [
    "Dr. Ananya Sharma",
    "Dr. Rajesh Verma",
    "Dr. Meera Nair",
    "Dr. Vikram Rao",
    "Dr. Priya Menon",
]
ALLOWED_STATUSES = ["Admitted", "Discharged"]


def validate_patient_payload(data):
    """Validate and normalize a patient JSON payload for creation or update."""
    if not isinstance(data, dict):
        return None, "Invalid JSON payload."

    name = str(data.get("name", "")).strip()
    if not name:
        return None, "Patient name is required."
    if not re.fullmatch(r"[A-Za-z\s]+", name):
        return None, "Patient name must contain letters and spaces only."

    raw_age = data.get("age")
    if raw_age is None or str(raw_age).strip() == "":
        return None, "Age is required."
    if isinstance(raw_age, bool):
        return None, "Age must be a valid whole number."
    if isinstance(raw_age, float) and not raw_age.is_integer():
        return None, "Age must be a valid whole number."
    try:
        age = int(raw_age)
        if not isinstance(raw_age, int) and str(raw_age).strip() != str(age):
            return None, "Age must be a valid whole number."
    except (ValueError, TypeError):
        return None, "Age must be a valid number."
    if age < 0 or age > 120:
        return None, "Age must be between 0 and 120."

    gender = str(data.get("gender", "")).strip()
    if gender not in ALLOWED_GENDERS:
        return None, f"Gender must be one of: {', '.join(ALLOWED_GENDERS)}."

    ward = str(data.get("ward", "")).strip()
    if ward not in ALLOWED_WARDS:
        return None, f"Ward must be one of: {', '.join(ALLOWED_WARDS)}."

    department = str(data.get("department", "")).strip()
    if department not in ALLOWED_DEPARTMENTS:
        return None, f"Department must be one of: {', '.join(ALLOWED_DEPARTMENTS)}."

    doctor = str(data.get("doctor", "")).strip()
    if doctor not in ALLOWED_DOCTORS:
        return None, f"Doctor must be one of: {', '.join(ALLOWED_DOCTORS)}."

    raw_date = str(data.get("admission_date", "")).strip()
    if not raw_date:
        return None, "Admission date is required."
    try:
        parsed_date = datetime.strptime(raw_date, "%Y-%m-%d").date()
    except ValueError:
        return None, "Admission date must be in YYYY-MM-DD format."
    if parsed_date > date.today():
        return None, "Admission date cannot be a future date."

    status = str(data.get("status", "Admitted")).strip() or "Admitted"
    if status not in ALLOWED_STATUSES:
        return None, "Status must be either Admitted or Discharged."

    return {
        "name": name,
        "age": age,
        "gender": gender,
        "ward": ward,
        "department": department,
        "doctor": doctor,
        "admission_date": parsed_date,
        "status": status,
    }, None