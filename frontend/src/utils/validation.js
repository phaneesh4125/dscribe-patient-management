import { GENDERS, WARDS, DEPARTMENTS, DOCTORS } from "../constants";
import { getTodayISO } from "./dateHelpers";

export const validatePatientForm = (formData) => {
  const errors = {};
  const trimmedName = (formData.name || "").trim();

  if (!trimmedName) {
    errors.name = "Patient name is required.";
  } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
    errors.name = "Name must contain letters only.";
  }

  const rawAge = formData.age;
  if (rawAge === "" || rawAge === null || rawAge === undefined || String(rawAge).trim() === "") {
    errors.age = "Age is required.";
  } else {
    const ageNum = Number(rawAge);
    if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 120) {
      errors.age = "Age must be a number between 0 and 120.";
    }
  }

  if (!GENDERS.includes(formData.gender)) errors.gender = "Please select a gender.";
  if (!WARDS.includes(formData.ward)) errors.ward = "Please select a ward.";
  if (!DEPARTMENTS.includes(formData.department)) {
    errors.department = "Please select a department.";
  }
  if (!DOCTORS.includes(formData.doctor)) errors.doctor = "Please select a doctor.";

  if (!formData.admission_date) {
    errors.admission_date = "Admission date is required.";
  } else if (formData.admission_date > getTodayISO()) {
    errors.admission_date = "Admission date cannot be a future date.";
  }

  return errors;
};
