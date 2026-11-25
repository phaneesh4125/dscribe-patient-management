import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Filter,
  RotateCcw,
  Hospital,
} from "lucide-react";
import { GENDERS, WARDS, DEPARTMENTS, DOCTORS, STATUSES } from "./constants";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const getTodayISO = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().split("T")[0];
};

const INITIAL_FORM = {
  name: "",
  age: "",
  gender: "",
  ward: "",
  department: "",
  doctor: "",
  admission_date: getTodayISO(),
  status: "Admitted",
};

export default function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (wardFilter) params.ward = wardFilter;
      if (deptFilter) params.department = deptFilter;
      if (doctorFilter) params.doctor = doctorFilter;

      const res = await axios.get(`${API_BASE}/api/patients`, { params });
      setPatients(res.data);
    } catch (err) {
      setFetchError(
        err.response?.data?.error ||
        "Unable to connect to the server. Please check if the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, [search, wardFilter, deptFilter, doctorFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const validateForm = () => {
    const errors = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errors.name = "Patient name is required.";
    } else if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      errors.name = "Name must contain letters and spaces only.";
    }

    if (formData.age === "" || formData.age === null) {
      errors.age = "Age is required.";
    } else {
      const ageNum = Number(formData.age);
      if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 120) {
        errors.age = "Age must be a whole number between 0 and 120.";
      }
    }

    if (!GENDERS.includes(formData.gender)) {
      errors.gender = "Please select a gender.";
    }
    if (!WARDS.includes(formData.ward)) {
      errors.ward = "Please select a ward.";
    }
    if (!DEPARTMENTS.includes(formData.department)) {
      errors.department = "Please select a department.";
    }
    if (!DOCTORS.includes(formData.doctor)) {
      errors.doctor = "Please select a doctor.";
    }

    if (!formData.admission_date) {
      errors.admission_date = "Admission date is required.";
    } else if (formData.admission_date > getTodayISO()) {
      errors.admission_date = "Admission date cannot be in the future.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setFormData({ ...INITIAL_FORM, admission_date: getTodayISO() });
    setFormErrors({});
    setServerError("");
    setIsFormOpen(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender,
      ward: patient.ward,
      department: patient.department,
      doctor: patient.doctor,
      admission_date: patient.admission_date,
      status: patient.status,
    });
    setFormErrors({});
    setServerError("");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validateForm()) return;

    const payload = {
      ...formData,
      name: formData.name.trim(),
      age: Number(formData.age),
    };

    try {
      setSubmitting(true);
      if (editingPatient) {
        await axios.put(`${API_BASE}/api/patients/${editingPatient.id}`, payload);
      } else {
        await axios.post(`${API_BASE}/api/patients`, payload);
      }
      setIsFormOpen(false);
      fetchPatients();
    } catch (err) {
      setServerError(err.response?.data?.error || "Failed to save patient record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischarge = async (patient) => {
    try {
      await axios.patch(`${API_BASE}/api/patients/${patient.id}/discharge`);
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to discharge patient.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await axios.delete(`${API_BASE}/api/patients/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete patient.");
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setWardFilter("");
    setDeptFilter("");
    setDoctorFilter("");
  };

  const admittedCount = patients.filter((p) => p.status === "Admitted").length;
  const dischargedCount = patients.filter((p) => p.status === "Discharged").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Patient Admission Management
              </h1>
              <p className="text-xs text-slate-500">
                Hospital Ward & Inpatient Tracking System
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-sm text-slate-500">Showing Records</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{patients.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-sm text-slate-500">Currently Admitted</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{admittedCount}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-sm text-slate-500">Discharged</p>
            <p className="text-2xl font-bold text-slate-600 mt-1">{dischargedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-blue-600" /> Search & Filter Patients
            </span>
            {(search || wardFilter || deptFilter || doctorFilter) && (
              <button
                onClick={resetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient name..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Wards</option>
              {WARDS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Doctors</option>
              {DOCTORS.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            Loading patient records...
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
            <p className="text-slate-700 font-medium">No patient records found</p>
            <p className="text-sm text-slate-500">
              Try clearing your filters or click &ldquo;Add Patient&rdquo; to admit a new patient.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Age / Gender</th>
                    <th className="py-3.5 px-4">Ward</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Doctor</th>
                    <th className="py-3.5 px-4">Admission Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {patient.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {patient.age} yrs • {patient.gender}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">{patient.ward}</td>
                      <td className="py-3.5 px-4 text-slate-700">{patient.department}</td>
                      <td className="py-3.5 px-4 text-slate-700">{patient.doctor}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {patient.admission_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.status === "Admitted"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                            }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {patient.status === "Admitted" && (
                            <button
                              onClick={() => handleDischarge(patient)}
                              title="Mark as Discharged"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg transition cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Discharge
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(patient)}
                            title="Edit Patient"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(patient)}
                            title="Delete Patient"
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 md:hidden">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900">{patient.name}</h3>
                      <p className="text-xs text-slate-500">
                        {patient.age} yrs • {patient.gender} • Admitted {patient.admission_date}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.status === "Admitted"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                        }`}
                    >
                      {patient.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg">
                    <div>
                      <span className="text-slate-400 block">Ward</span>
                      <span className="font-medium text-slate-700">{patient.ward}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Department</span>
                      <span className="font-medium text-slate-700">{patient.department}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Assigned Doctor</span>
                      <span className="font-medium text-slate-700">{patient.doctor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    {patient.status === "Admitted" && (
                      <button
                        onClick={() => handleDischarge(patient)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Discharge
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(patient)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(patient)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editingPatient ? "Edit Patient Record" : "Admit New Patient"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4" noValidate>
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Karthik Reddy"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Age (0–120) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 34"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.age && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.age}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  {formErrors.gender && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.gender}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ward *
                  </label>
                  <select
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Ward</option>
                    {WARDS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                  {formErrors.ward && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.ward}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  {formErrors.department && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.department}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Assigned Doctor *
                  </label>
                  <select
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Doctor</option>
                    {DOCTORS.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                  {formErrors.doctor && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.doctor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Admission Date *
                  </label>
                  <input
                    type="date"
                    max={getTodayISO()}
                    value={formData.admission_date}
                    onChange={(e) =>
                      setFormData({ ...formData, admission_date: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formErrors.admission_date && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.admission_date}</p>
                  )}
                </div>
              </div>

              {editingPatient && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting
                    ? "Saving..."
                    : editingPatient
                      ? "Update Patient"
                      : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete the record for{" "}
              <span className="font-semibold text-slate-900">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}