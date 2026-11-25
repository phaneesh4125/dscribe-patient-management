import { useState } from "react";
import { AlertCircle, Calendar as CalendarIcon, X } from "lucide-react";
import { DEPARTMENTS, DOCTORS, GENDERS, STATUSES, WARDS } from "../constants";
import { createPatient, updatePatient } from "../services/patientApi";
import { getTodayISO } from "../utils/dateHelpers";
import { validatePatientForm } from "../utils/validation";

const createInitialForm = (editingPatient, defaults = {}) => {
  if (editingPatient) {
    return {
      name: editingPatient.name,
      age: String(editingPatient.age),
      gender: editingPatient.gender,
      ward: editingPatient.ward,
      department: editingPatient.department,
      doctor: editingPatient.doctor,
      admission_date: editingPatient.admission_date,
      status: editingPatient.status,
    };
  }

  return {
    name: "",
    age: "",
    gender: "",
    ward: defaults.ward || "",
    department: defaults.department || "",
    doctor: defaults.doctor || "",
    admission_date: getTodayISO(),
    status: "Admitted",
  };
};

export default function PatientModal({
  editingPatient,
  defaultFilters,
  onClose,
  onSaved,
}) {
  const [formData, setFormData] = useState(() =>
    createInitialForm(editingPatient, defaultFilters)
  );
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const errors = validatePatientForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      ...formData,
      name: formData.name.trim(),
      age: Number(formData.age),
    };

    try {
      setSubmitting(true);
      if (editingPatient) {
        await updatePatient(editingPatient.id, payload);
        onSaved(`Updated ${payload.name}'s record`);
      } else {
        await createPatient(payload);
        onSaved(`Registered ${payload.name} to ${payload.ward}`);
      }
    } catch (err) {
      setServerError(
        err.response?.data?.error || "Failed to save patient record."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8ECEC]">
        <div className="px-6 py-4 bg-[#2A7B6F] text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">
              {editingPatient ? "Edit Patient Record" : "Register New Patient"}
            </h2>
            <p className="text-xs text-teal-100 mt-0.5">
              Complete all mandatory inpatient admission details
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-teal-100 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {serverError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Patient Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Karthikeya Sharma"
              className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFA] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#2A7B6F]"
            />
            {formErrors.name && (
              <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Age (0–120) *
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                placeholder="e.g. 38"
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFA] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#2A7B6F]"
              />
              {formErrors.age && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.age}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFA] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#2A7B6F]"
              >
                <option value="">Select Gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              {formErrors.gender && (
                <p className="text-xs text-rose-600 mt-1">
                  {formErrors.gender}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ward *
              </label>
              <select
                value={formData.ward}
                onChange={(e) =>
                  setFormData({ ...formData, ward: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFA] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#2A7B6F]"
              >
                <option value="">Select Ward</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              {formErrors.ward && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.ward}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFA] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#2A7B6F]"
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {formErrors.department && (
                <p className="text-xs text-rose-600 mt-1">
                  {formErrors.department}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Doctor *
              </label>
              <select
                value={formData.doctor}
                onChange={(e) =>
                  setFormData({ ...formData, doctor: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFA] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#2A7B6F]"
              >
                <option value="">Select Doctor</option>
                {DOCTORS.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
              {formErrors.doctor && (
                <p className="text-xs text-rose-600 mt-1">
                  {formErrors.doctor}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Admission Date *
              </label>
              <div className="relative">
                <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  max={getTodayISO()}
                  value={formData.admission_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      admission_date: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFA] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#2A7B6F]"
                />
              </div>
              {formErrors.admission_date && (
                <p className="text-xs text-rose-600 mt-1">
                  {formErrors.admission_date}
                </p>
              )}
            </div>
          </div>

          {editingPatient && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFA] border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#2A7B6F]"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E8ECEC]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2A7B6F] hover:bg-[#22665C] rounded-xl disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? "Saving..."
                : editingPatient
                  ? "Update Patient"
                  : "Confirm Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
