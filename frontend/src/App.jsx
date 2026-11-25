import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Plus, Sparkles, UserPlus, X } from "lucide-react";
import DeleteModal from "./components/DeleteModal";
import Header from "./components/Header";
import PatientLedger from "./components/PatientLedger";
import PatientModal from "./components/PatientModal";
import RightPanel from "./components/RightPanel";
import Sidebar from "./components/Sidebar";
import StatsCards from "./components/StatsCards";
import { DEPARTMENTS, DOCTORS, WARDS } from "./constants";
import {
  deletePatient,
  dischargePatient,
  getPatients,
  seedDemoPatients,
} from "./services/patientApi";

export default function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [seeding, setSeeding] = useState(false);

  // Navigation & Layout
  const [activeNav, setActiveNav] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (wardFilter) params.ward = wardFilter;
      if (deptFilter) params.department = deptFilter;
      if (doctorFilter) params.doctor = doctorFilter;

      const data = await getPatients(params);
      setPatients(data);
    } catch (err) {
      setFetchError(
        err.response?.data?.error ||
          "Unable to connect to backend API. Ensure Flask server is running."
      );
    } finally {
      setLoading(false);
    }
  }, [search, wardFilter, deptFilter, doctorFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 180);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const handleSeedSamplePatients = async () => {
    try {
      setSeeding(true);
      await seedDemoPatients();
      showToast("Loaded 4 sample patient records");
      fetchPatients();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Could not load sample records.",
        "error"
      );
    } finally {
      setSeeding(false);
    }
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setScheduleOpen(false);
    setIsModalOpen(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setScheduleOpen(false);
    setIsModalOpen(true);
  };

  const handleModalSaved = (message) => {
    setIsModalOpen(false);
    showToast(message);
    fetchPatients();
  };

  const handleDischarge = async (patient) => {
    try {
      await dischargePatient(patient.id);
      showToast(`${patient.name} marked as Discharged`);
      fetchPatients();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to discharge patient.",
        "error"
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const deletedName = deleteTarget.name;
      await deletePatient(deleteTarget.id);
      setDeleteTarget(null);
      showToast(`Deleted record for ${deletedName}`);
      fetchPatients();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to delete patient.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setWardFilter("");
    setDeptFilter("");
    setDoctorFilter("");
    setDateFilter("");
  };

  const defaultModalFilters = useMemo(
    () => ({
      ward: wardFilter,
      department: deptFilter,
      doctor: doctorFilter,
    }),
    [wardFilter, deptFilter, doctorFilter]
  );

  const displayedPatients = useMemo(
    () =>
      dateFilter
        ? patients.filter((p) => p.admission_date === dateFilter)
        : patients,
    [patients, dateFilter]
  );

  const hasActiveFilters = Boolean(
    search || wardFilter || deptFilter || doctorFilter || dateFilter
  );
  const admittedCount = patients.filter((p) => p.status === "Admitted").length;
  const dischargedCount = patients.filter(
    (p) => p.status === "Discharged"
  ).length;
  const criticalCount = patients.filter(
    (p) =>
      p.status === "Admitted" &&
      (p.ward === "ICU" || p.ward === "Emergency")
  ).length;

  const quickChipConfigs = {
    doctors: {
      label: "Select Doctor Roster:",
      options: DOCTORS,
      value: doctorFilter,
      onSelect: (val) => setDoctorFilter(doctorFilter === val ? "" : val),
    },
    wards: {
      label: "Select Ward:",
      options: WARDS,
      value: wardFilter,
      onSelect: (val) => setWardFilter(wardFilter === val ? "" : val),
    },
    departments: {
      label: "Select Department:",
      options: DEPARTMENTS,
      value: deptFilter,
      onSelect: (val) => setDeptFilter(deptFilter === val ? "" : val),
    },
  };
  const activeQuickChips = quickChipConfigs[activeNav];

  return (
    <div className="min-h-screen flex bg-[#F5F7F7] text-slate-800">
      <Sidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onQuickAdmit={openAddModal}
      />

      {/* Main + Right Panel Wrapper */}
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0">
        <Header
          search={search}
          onSearchChange={setSearch}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSchedule={() => setScheduleOpen(true)}
          admittedCount={admittedCount}
        />

        {/* Body Split: Center Workspace + Right Schedule/Calendar Panel */}
        <div className="flex-1 flex flex-col xl:flex-row min-w-0">
          {/* Center Column */}
          <main className="flex-1 p-3.5 sm:p-7 pb-24 md:pb-7 space-y-4 sm:space-y-6 min-w-0">
            {/* Title & Action Buttons Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight capitalize">
                  {activeNav === "dashboard"
                    ? "Dashboard"
                    : `${activeNav} Management`}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Welcome back! Here&apos;s what&apos;s happening in the
                  hospital today.
                </p>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3">
                {patients.length === 0 && !loading && (
                  <button
                    onClick={handleSeedSamplePatients}
                    disabled={seeding}
                    className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#2A7B6F] text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#2A7B6F]" />
                    {seeding ? "Loading..." : "Load Sample Data"}
                  </button>
                )}
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#2A7B6F] hover:bg-[#22665C] text-white text-xs sm:text-sm font-semibold shadow-sm shadow-[#2A7B6F]/20 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Register Patient
                </button>
              </div>
            </div>

            <StatsCards
              totalCount={patients.length}
              admittedCount={admittedCount}
              dischargedCount={dischargedCount}
              criticalCount={criticalCount}
            />

            {activeQuickChips && (
              <div className="bg-white rounded-2xl p-4 border border-[#E8ECEC] flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 mr-1">
                  {activeQuickChips.label}
                </span>
                {activeQuickChips.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => activeQuickChips.onSelect(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                      activeQuickChips.value === opt
                        ? "bg-[#2A7B6F] text-white"
                        : "bg-[#F4F6F6] text-slate-700 hover:bg-[#E6F3F0]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            <PatientLedger
              patients={displayedPatients}
              loading={loading}
              fetchError={fetchError}
              wardFilter={wardFilter}
              deptFilter={deptFilter}
              doctorFilter={doctorFilter}
              dateFilter={dateFilter}
              hasActiveFilters={hasActiveFilters}
              onWardFilterChange={setWardFilter}
              onDeptFilterChange={setDeptFilter}
              onDoctorFilterChange={setDoctorFilter}
              onClearDateFilter={() => setDateFilter("")}
              onResetFilters={resetFilters}
              onDischarge={handleDischarge}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
            />
          </main>

          {/* Desktop Docked Right Panel (xl: and above) */}
          <RightPanel
            patients={patients}
            selectedDate={dateFilter}
            onSelectDate={setDateFilter}
            onDischarge={handleDischarge}
            onEdit={openEditModal}
            onRegisterPatient={openAddModal}
            className="hidden xl:block w-80 bg-white border-l border-[#E8ECEC] p-5 space-y-6 shrink-0"
          />
        </div>
      </div>

      {/* Mobile & Tablet Slide-Over Schedule Drawer (below xl:) */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
          <div
            onClick={() => setScheduleOpen(false)}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]"
          />
          <div className="relative z-10 w-full max-w-sm bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-[#E8ECEC] flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Schedule &amp; Admissions
                </h2>
                <p className="text-[11px] text-slate-400">
                  Calendar filter &amp; live ward occupancy
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScheduleOpen(false)}
                aria-label="Close schedule drawer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <RightPanel
              patients={patients}
              selectedDate={dateFilter}
              onSelectDate={(date) => {
                setDateFilter(date);
                setScheduleOpen(false);
              }}
              onDischarge={handleDischarge}
              onEdit={openEditModal}
              onRegisterPatient={openAddModal}
              className="w-full p-5 space-y-6"
            />
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button (below md:) */}
      <button
        type="button"
        onClick={openAddModal}
        aria-label="Register Patient"
        title="Register Patient"
        className="fixed bottom-5 right-5 z-40 md:hidden w-13 h-13 rounded-full bg-[#2A7B6F] hover:bg-[#22665C] text-white shadow-lg shadow-[#2A7B6F]/30 flex items-center justify-center transition active:scale-95 cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <PatientModal
          key={editingPatient ? `edit-${editingPatient.id}` : "new"}
          editingPatient={editingPatient}
          defaultFilters={defaultModalFilters}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleModalSaved}
        />
      )}

      <DeleteModal
        deleteTarget={deleteTarget}
        deleting={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-20 right-4 md:bottom-5 md:right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold ${
            toast.type === "error"
              ? "bg-rose-900 text-white"
              : "bg-[#2A7B6F] text-white"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
