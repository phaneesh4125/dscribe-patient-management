from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Patient(db.Model):
    """Database model representing an inpatient admission record."""

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
