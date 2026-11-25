import {
  BedDouble,
  Building2,
  Cross,
  LayoutDashboard,
  Stethoscope,
  UserPlus,
  Users,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "patients", label: "Patients", icon: Users },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "wards", label: "Wards", icon: BedDouble },
  { id: "departments", label: "Departments", icon: Building2 },
];

export default function Sidebar({
  activeNav,
  onSelectNav,
  mobileMenuOpen,
  onCloseMobileMenu,
  onQuickAdmit,
}) {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={onCloseMobileMenu}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* Left White Navigation Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-[#E8ECEC] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#2A7B6F] text-white flex items-center justify-center shadow-xs shrink-0">
              <Cross className="w-4 h-4 fill-current" />
            </div>
            <div className="leading-tight min-w-0">
              <span className="block text-sm font-bold text-slate-900 tracking-tight truncate">
                Patient Admission
              </span>
              <span className="block text-[10px] font-medium text-[#2A7B6F] tracking-wider uppercase mt-0.5 truncate">
                Hospital Staff Portal
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobileMenu}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectNav(item.id);
                  onCloseMobileMenu();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? "bg-[#2A7B6F] text-white shadow-sm shadow-[#2A7B6F]/25"
                    : "text-slate-500 hover:bg-[#F2F6F5] hover:text-[#2A7B6F]"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Admin Profile Card */}
        <div className="p-4 border-t border-[#E8ECEC] space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-[#2A7B6F] text-white text-xs font-bold flex items-center justify-center shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                Admissions Desk
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                staff@hospitaldesk.in
              </p>
            </div>
          </div>

          <button
            onClick={onQuickAdmit}
            className="w-full py-2 px-3 rounded-xl border border-[#2A7B6F]/30 text-[#2A7B6F] hover:bg-[#E6F3F0] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Quick Admit
          </button>
        </div>
      </aside>
    </>
  );
}
