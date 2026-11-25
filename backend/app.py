import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from models import Patient, db
from validators import validate_patient_payload

load_dotenv()

app = Flask(__name__)
CORS(app)

database_url = os.getenv("DATABASE_URL", "sqlite:///patients.db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()


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
    return jsonify([patient.to_dict() for patient in patients]), 200


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
    patient = db.session.get(Patient, patient_id)
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
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"error": "Patient not found."}), 404

    patient.status = "Discharged"
    db.session.commit()
    return jsonify(patient.to_dict()), 200


@app.route("/api/patients/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    patient = db.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"error": "Patient not found."}), 404

    db.session.delete(patient)
    db.session.commit()
    return jsonify({"message": "Patient deleted successfully."}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
