import os
import re
from datetime import date, datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

database_url = os.getenv("DATABASE_URL", "sqlite:///patients.db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

ALLOWED_GENDERS = ["Male", "Female", "Other"]
ALLOWED_WARDS = ["General Ward", "ICU", "Emergency", "Maternity", "Pediatrics", "Surgical"]
ALLOWED_DEPARTMENTS = ["Cardiology", "Neurology", "Orthopedics", "General Medicine", "Pediatrics", "Oncology"]
ALLOWED_DOCTORS = [
    "Dr. Ananya Sharma",
    "Dr. Rajesh Verma",
    "Dr. Meera Nair",
    "Dr. Vikram Rao",
    "Dr. Priya Menon",
]
ALLOWED_STATUSES = ["Admitted", "Discharged"]


class Patient(db.Model):
    __tablename__ = "patients"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    ward = db.Column(db.String(50), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    doctor = db.Column(db.String(100), nullable=False)
    admission_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Admitted")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "gender": self.gender,
            "ward": self.ward,
            "department": self.department,
            "doctor": self.doctor,
            "admission_date": self.admission_date.isoformat(),
            "status": self.status,
        }


with app.app_context():
    db.create_all()


def validate_patient_payload(data):
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
    try:
        age = int(raw_age)
        if str(raw_age).strip() != str(age) and not isinstance(raw_age, int):
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


@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "DScribe Patient Management API running"}), 200


@app.route("/api/patients", methods=["GET"])
def get_patients():
    query = Patient.query

    search = request.args.get("search", "").strip()
    ward = request.args.get("ward", "").strip()
    department = request.args.get("department", "").strip()
    doctor = request.args.get("doctor", "").strip()

    if search:
        query = query.filter(Patient.name.ilike(f"%{search}%"))
    if ward:
        query = query.filter(Patient.ward == ward)
    if department:
        query = query.filter(Patient.department == department)
    if doctor:
        query = query.filter(Patient.doctor == doctor)

    patients = query.order_by(Patient.id.desc()).all()
    return jsonify([p.to_dict() for p in patients]), 200


@app.route("/api/patients", methods=["POST"])
def add_patient():
    cleaned, error = validate_patient_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    patient = Patient(**cleaned)
    db.session.add(patient)
    db.session.commit()
    return jsonify(patient.to_dict()), 201


@app.route("/api/patients/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found."}), 404

    cleaned, error = validate_patient_payload(request.get_json(silent=True))
    if error:
        return jsonify({"error": error}), 400

    for key, value in cleaned.items():
        setattr(patient, key, value)

    db.session.commit()
    return jsonify(patient.to_dict()), 200


@app.route("/api/patients/<int:patient_id>/discharge", methods=["PATCH"])
def discharge_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found."}), 404

    patient.status = "Discharged"
    db.session.commit()
    return jsonify(patient.to_dict()), 200


@app.route("/api/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found."}), 404

    db.session.delete(patient)
    db.session.commit()
    return jsonify({"message": "Patient deleted successfully."}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)