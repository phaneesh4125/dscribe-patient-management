import { Bell, CalendarDays, Menu, Search } from "lucide-react";

export default function Header({
  search,
  onSearchChange,
  onOpenMobileMenu,
  onOpenSchedule,
  admittedCount,
}) {
  return (
    <header className="h-16 sm:h-20 bg-white border-b border-[#E8ECEC] sticky top-0 z-30 px-3 sm:px-7 flex items-center justify-between gap-2.5 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl min-w-0">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm bg-[#F4F6F6] border border-transparent focus:bg-white focus:border-[#2A7B6F]/40 rounded-xl focus:outline-none transition"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile & Tablet Schedule Drawer Trigger (hidden on xl: where RightPanel is docked) */}
        <button
          type="button"
          onClick={onOpenSchedule}
          aria-label="Open schedule and active admissions"
          title="Schedule & Active Admissions"
          className="xl:hidden relative inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#E6F3F0] text-[#2A7B6F] hover:bg-[#d5ebe6] text-xs font-semibold transition cursor-pointer"
        >
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span className="hidden xs:inline sm:inline">Schedule</span>
          {admittedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#2A7B6F] text-white text-[10px] font-bold leading-tight">
              {admittedCount}
            </span>
          )}
        </button>

        {/* Desktop / Tablet Status Indicators */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer">
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-[#2A7B6F] absolute top-2 right-2" />
          </div>
          <div className="w-9 h-9 rounded-full bg-[#E6F3F0] text-[#2A7B6F] font-bold text-xs flex items-center justify-center border border-[#2A7B6F]/20">
            HC
          </div>
        </div>
      </div>
    </header>
  );
}
