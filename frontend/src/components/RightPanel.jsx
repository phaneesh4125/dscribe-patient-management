import { useMemo, useState } from "react";
import {
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  UserPlus,
  X,
} from "lucide-react";
import {
  formatDisplayDate,
  getInitials,
  getTodayISO,
} from "../utils/dateHelpers";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const TOTAL_BEDS = 30;

const toISODate = (year, monthIndex, day) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export default function RightPanel({
  patients,
  selectedDate,
  onSelectDate,
  onDischarge,
  onEdit,
  onRegisterPatient,
  className = "hidden xl:block w-80 bg-white border-l border-[#E8ECEC] p-5 space-y-6 shrink-0",
}) {
  // Default to November 2026 (0-indexed month = 10)
  const [currentMonth, setCurrentMonth] = useState({ year: 2026, month: 10 });
  const todayISO = getTodayISO();

  const admissionDateSet = useMemo(() => {
    const dates = new Set();
    for (const patient of patients) {
      if (patient.admission_date) {
        dates.add(patient.admission_date);
      }
    }
    return dates;
  }, [patients]);

  const admittedPatients = useMemo(
    () => patients.filter((p) => p.status === "Admitted"),
    [patients]
  );

  const admittedCount = admittedPatients.length;
  const occupancyPct = Math.min(
    100,
    Math.round((admittedCount / TOTAL_BEDS) * 100)
  );
  const occupancyBarWidth =
    admittedCount === 0
      ? 0
      : Math.min(100, Math.max(4, (admittedCount / TOTAL_BEDS) * 100));

  const { year, month } = currentMonth;
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const goToPrevMonth = () => {
    setCurrentMonth((prev) =>
      prev.month === 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: prev.month - 1 }
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) =>
      prev.month === 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: prev.month + 1 }
    );
  };

  return (
    <aside className={className}>
      {/* Interactive Monthly Calendar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goToPrevMonth}
            aria-label="Previous month"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-800">{monthLabel}</span>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 mb-2">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
          {leadingBlanks.map((blank) => (
            <div key={`blank-${blank}`} />
          ))}
          {days.map((day) => {
            const iso = toISODate(year, month, day);
            const isToday = iso === todayISO;
            const isSelected = iso === selectedDate;
            const hasAdmissions = admissionDateSet.has(iso);

            return (
              <div key={iso} className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onSelectDate(isSelected ? "" : iso)}
                  title={
                    hasAdmissions
                      ? `Filter admissions on ${formatDisplayDate(iso)}`
                      : `No admissions recorded on ${formatDisplayDate(iso)}`
                  }
                  className={`relative w-8 h-8 flex flex-col items-center justify-center rounded-full font-medium transition cursor-pointer ${
                    isSelected
                      ? "bg-[#1F5E55] text-white font-bold ring-2 ring-[#2A7B6F]/30 shadow-xs"
                      : isToday
                        ? "bg-[#2A7B6F] text-white font-bold shadow-xs"
                        : "text-slate-600 hover:bg-[#E6F3F0] hover:text-[#2A7B6F]"
                  }`}
                >
                  <span className="leading-none">{day}</span>
                  {hasAdmissions && (
                    <span
                      className={`w-1 h-1 rounded-full mt-0.5 ${
                        isSelected || isToday ? "bg-teal-100" : "bg-[#2A7B6F]"
                      }`}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-3 flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-[#E6F3F0] text-[#2A7B6F]">
            <span className="text-[11px] font-semibold truncate">
              Date: {formatDisplayDate(selectedDate)}
            </span>
            <button
              type="button"
              onClick={() => onSelectDate("")}
              className="inline-flex items-center gap-1 text-[11px] font-bold hover:text-[#1E5C53] shrink-0 cursor-pointer"
            >
              <X className="w-3 h-3" />
              Clear date
            </button>
          </div>
        )}
      </div>

      {/* Live Active Admissions Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Admissions
          </h3>
          <span className="text-[11px] font-semibold text-[#2A7B6F] bg-[#E6F3F0] px-2 py-0.5 rounded-full">
            {admittedCount} Admitted
          </span>
        </div>

        {admittedPatients.length === 0 ? (
          <div className="p-4 rounded-2xl border border-dashed border-[#D3E3E0] bg-[#F8FAFA] text-center space-y-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E6F3F0] text-[#2A7B6F] flex items-center justify-center mx-auto">
              <BedDouble className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">
                No active admissions
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Register a patient to track live ward occupancy.
              </p>
            </div>
            <button
              type="button"
              onClick={onRegisterPatient}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2A7B6F] hover:bg-[#22665C] text-white text-[11px] font-semibold transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register Patient
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-0.5">
            {admittedPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => onEdit(patient)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onEdit(patient);
                  }
                }}
                className="bg-[#2A7B6F] hover:bg-[#246C61] text-white p-3.5 rounded-2xl shadow-2xs space-y-2 transition cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold truncate">
                    {patient.name}
                  </span>
                  <span className="text-[10px] text-teal-100 whitespace-nowrap">
                    {formatDisplayDate(patient.admission_date)}
                  </span>
                </div>

                <div className="text-[11px] text-teal-100/90 leading-snug">
                  <p className="truncate font-medium text-white/95">
                    {patient.ward} • {patient.department}
                  </p>
                  <p className="truncate">{patient.doctor}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="w-6 h-6 rounded-full bg-white/20 border border-white/40 text-[10px] font-bold flex items-center justify-center">
                    {getInitials(patient.name)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(patient);
                      }}
                      title={`Edit ${patient.name}`}
                      aria-label={`Edit ${patient.name}`}
                      className="w-6 h-6 rounded-md bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDischarge(patient);
                      }}
                      title={`Mark ${patient.name} as Discharged`}
                      aria-label={`Mark ${patient.name} as Discharged`}
                      className="w-6 h-6 rounded-md bg-white hover:bg-teal-50 text-[#2A7B6F] flex items-center justify-center transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live Bed Occupancy Summary */}
      <div className="pt-2 border-t border-[#E8ECEC] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="font-bold text-slate-800">Bed Occupancy</p>
            <p className="text-[11px] text-slate-400">
              {admittedCount} / {TOTAL_BEDS} active ward beds
            </p>
          </div>
          <span className="font-bold text-[#2A7B6F]">{occupancyPct}%</span>
        </div>
        <div className="w-full h-2 bg-[#E6F3F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2A7B6F] rounded-full transition-all duration-300"
            style={{ width: `${occupancyBarWidth}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
