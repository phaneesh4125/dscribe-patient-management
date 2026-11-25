import { useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  LogOut,
  Pencil,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { DEPARTMENTS, DOCTORS, WARDS } from "../constants";
import { formatDisplayDate, getInitials } from "../utils/dateHelpers";

export default function PatientLedger({
  patients,
  loading,
  fetchError,
  wardFilter,
  deptFilter,
  doctorFilter,
  dateFilter,
  hasActiveFilters,
  onWardFilterChange,
  onDeptFilterChange,
  onDoctorFilterChange,
  onClearDateFilter,
  onResetFilters,
  onDischarge,
  onEdit,
  onDelete,
}) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeSelectCount = [wardFilter, deptFilter, doctorFilter].filter(
    Boolean
  ).length;

  return (
    <div className="bg-white rounded-2xl border border-[#E8ECEC] shadow-2xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[#E8ECEC] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Admitted Patients Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Filter by Ward, Department, Doctor or search by name
          </p>
        </div>

        {/* Mobile Collapsible Filter Pill Row (below md:) */}
        <div className="md:hidden space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              aria-expanded={mobileFiltersOpen}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                mobileFiltersOpen || activeSelectCount > 0
                  ? "bg-[#E6F3F0] border-[#2A7B6F]/30 text-[#2A7B6F]"
                  : "bg-[#F4F6F6] border-transparent text-slate-700"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeSelectCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#2A7B6F] text-white text-[10px] font-bold">
                  {activeSelectCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  mobileFiltersOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dateFilter && (
              <button
                type="button"
                onClick={onClearDateFilter}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#2A7B6F] bg-[#E6F3F0] rounded-xl cursor-pointer"
              >
                <span>{formatDisplayDate(dateFilter)}</span>
                <span aria-hidden="true">×</span>
              </button>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-[#2A7B6F] bg-[#E6F3F0] hover:bg-[#d5ebe6] rounded-xl transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {mobileFiltersOpen && (
            <div className="grid grid-cols-1 gap-2 pt-1">
              <select
                aria-label="Filter by Ward"
                value={wardFilter}
                onChange={(e) => onWardFilterChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-[#F4F6F6] border border-transparent focus:border-[#2A7B6F] rounded-xl text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">All Wards</option>
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by Department"
                value={deptFilter}
                onChange={(e) => onDeptFilterChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-[#F4F6F6] border border-transparent focus:border-[#2A7B6F] rounded-xl text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by Doctor"
                value={doctorFilter}
                onChange={(e) => onDoctorFilterChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium bg-[#F4F6F6] border border-transparent focus:border-[#2A7B6F] rounded-xl text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">All Doctors</option>
                {DOCTORS.map((doc) => (
                  <option key={doc} value={doc}>
                    {doc}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Desktop & Tablet Inline Filter Dropdowns (md: and up) */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <select
            aria-label="Filter by Ward"
            value={wardFilter}
            onChange={(e) => onWardFilterChange(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F4F6F6] border border-transparent focus:border-[#2A7B6F] rounded-xl text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Wards</option>
            {WARDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Department"
            value={deptFilter}
            onChange={(e) => onDeptFilterChange(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F4F6F6] border border-transparent focus:border-[#2A7B6F] rounded-xl text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Doctor"
            value={doctorFilter}
            onChange={(e) => onDoctorFilterChange(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-[#F4F6F6] border border-transparent focus:border-[#2A7B6F] rounded-xl text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="">All Doctors</option>
            {DOCTORS.map((doc) => (
              <option key={doc} value={doc}>
                {doc}
              </option>
            ))}
          </select>

          {dateFilter && (
            <button
              onClick={onClearDateFilter}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-[#2A7B6F] bg-[#E6F3F0] hover:bg-[#d5ebe6] rounded-xl transition cursor-pointer"
            >
              <span>{formatDisplayDate(dateFilter)}</span>
              <span aria-hidden="true">×</span>
            </button>
          )}

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-[#2A7B6F] bg-[#E6F3F0] hover:bg-[#d5ebe6] rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="m-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">
          Loading patient records...
        </div>
      ) : patients.length === 0 ? (
        <div className="p-12 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-800">
            No patients found
          </p>
          <p className="text-xs text-slate-400">
            Click &ldquo;Register Patient&rdquo; above or load sample records to
            get started.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9FAFA] border-b border-[#E8ECEC] text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3 px-5">Patient</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Ward</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Admission Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F3F3] text-sm">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-[#F8FAFA] transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E6F3F0] text-[#2A7B6F] font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(patient.name)}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {patient.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {patient.age} yrs • {patient.gender}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {patient.ward}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {patient.department}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {patient.doctor}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {formatDisplayDate(patient.admission_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      {patient.status === "Admitted" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#E6F3F0] text-[#2A7B6F]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2A7B6F]" />
                          Admitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700">
                          Discharged
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-1.5">
                        {patient.status === "Admitted" && (
                          <button
                            onClick={() => onDischarge(patient)}
                            title="Mark as Discharged"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-[#E6F3F0] text-[#2A7B6F] hover:bg-[#2A7B6F] hover:text-white rounded-lg transition cursor-pointer"
                          >
                            <LogOut className="w-3 h-3" />
                            Discharge
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(patient)}
                          title="Edit Patient"
                          className="p-1.5 text-slate-400 hover:text-[#2A7B6F] hover:bg-[#E6F3F0] rounded-lg transition cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(patient)}
                          title="Delete Patient"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="p-4 rounded-xl border border-[#E8ECEC] bg-[#FAFBFB] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#E6F3F0] text-[#2A7B6F] font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(patient.name)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">
                        {patient.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {patient.age} yrs • {patient.gender}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      patient.status === "Admitted"
                        ? "bg-[#E6F3F0] text-[#2A7B6F]"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-[#E8ECEC]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Ward
                    </span>
                    <span className="font-medium text-slate-800">
                      {patient.ward}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Department
                    </span>
                    <span className="font-medium text-slate-800">
                      {patient.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Doctor
                    </span>
                    <span className="font-medium text-slate-800">
                      {patient.doctor}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">
                      Admitted
                    </span>
                    <span className="font-medium text-slate-800">
                      {formatDisplayDate(patient.admission_date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  {patient.status === "Admitted" && (
                    <button
                      onClick={() => onDischarge(patient)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#E6F3F0] text-[#2A7B6F] rounded-lg"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Discharge
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(patient)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(patient)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 rounded-lg"
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
    </div>
  );
}
