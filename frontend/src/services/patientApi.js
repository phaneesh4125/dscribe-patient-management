import axios from "axios";
import { getTodayISO } from "../utils/dateHelpers";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const apiClient = axios.create({
  baseURL: API_BASE,
});

export const getPatients = async (params = {}) => {
  const res = await apiClient.get("/api/patients", { params });
  return res.data;
};

export const createPatient = async (payload) => {
  const res = await apiClient.post("/api/patients", payload);
  return res.data;
};

export const updatePatient = async (id, payload) => {
  const res = await apiClient.put(`/api/patients/${id}`, payload);
  return res.data;
};

export const dischargePatient = async (id) => {
  const res = await apiClient.patch(`/api/patients/${id}/discharge`);
  return res.data;
};

export const deletePatient = async (id) => {
  const res = await apiClient.delete(`/api/patients/${id}`);
  return res.data;
};

export const seedDemoPatients = async () => {
  const today = getTodayISO();
  const samplePatients = [
    {
      name: "Robert Brown",
      age: 54,
      gender: "Male",
      ward: "ICU",
      department: "Cardiology",
      doctor: "Dr. Ananya Sharma",
      admission_date: today,
      status: "Admitted",
    },
    {
      name: "Swati Jain",
      age: 32,
      gender: "Female",
      ward: "Maternity",
      department: "General Medicine",
      doctor: "Dr. Meera Nair",
      admission_date: today,
      status: "Admitted",
    },
    {
      name: "Shaileja Desai",
      age: 46,
      gender: "Female",
      ward: "Surgical",
      department: "Orthopedics",
      doctor: "Dr. Rajesh Verma",
      admission_date: today,
      status: "Admitted",
    },
    {
      name: "Ritu Arora",
      age: 29,
      gender: "Female",
      ward: "General Ward",
      department: "Neurology",
      doctor: "Dr. Vikram Rao",
      admission_date: today,
      status: "Discharged",
    },
  ];

  const created = [];
  for (const patient of samplePatients) {
    created.push(await createPatient(patient));
  }
  return created;
};
