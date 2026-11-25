import {
  Users,
  BedDouble,
  CheckCircle2,
  Stethoscope,
  MoreHorizontal,
} from "lucide-react";

export default function StatsCards({
  totalCount,
  admittedCount,
  dischargedCount,
  criticalCount,
}) {
  const stats = [
    {
      title: "Total Patients",
      value: totalCount,
      badge: "+100% synced",
      sub: "All registered admissions",
      icon: Users,
    },
    {
      title: "Admitted",
      value: admittedCount,
      badge: "Active",
      sub: "Currently in hospital wards",
      icon: BedDouble,
    },
    {
      title: "Discharged",
      value: dischargedCount,
      badge: "Cleared",
      sub: "Completed inpatient care",
      icon: CheckCircle2,
    },
    {
      title: "ICU & Emergency",
      value: criticalCount,
      badge: "Priority",
      sub: "High-acuity ward beds",
      icon: Stethoscope,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="bg-white rounded-2xl p-3 sm:p-4 border border-[#E8ECEC] shadow-2xs space-y-2 sm:space-y-3"
          >
            <div className="flex items-center justify-between text-slate-500">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium min-w-0">
                <span className="p-1.5 rounded-lg bg-[#F4F7F6] text-[#2A7B6F] shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="truncate">{stat.title}</span>
              </div>
              <MoreHorizontal className="hidden sm:block w-4 h-4 text-slate-300 shrink-0" />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">
                {stat.value}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-[#E6F3F0] text-[#2A7B6F] whitespace-nowrap">
                {stat.badge}
              </span>
            </div>

            <p className="hidden sm:block text-[11px] text-slate-400">
              {stat.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
