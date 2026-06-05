import { NavLink } from "react-router-dom";
import { LayoutDashboard, Server, KeyRound, DollarSign, CloudCog } from "lucide-react";
import clsx from "clsx";

const links = [
  { to: "/", label: "대시보드", icon: LayoutDashboard },
  { to: "/accounts", label: "계정 관리", icon: KeyRound },
  { to: "/resources", label: "리소스", icon: Server },
  { to: "/costs", label: "비용", icon: DollarSign },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06]"
      style={{ background: "linear-gradient(180deg, #0d0d1a 0%, #080810 100%)" }}>

      {/* 로고 */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow">
          <CloudCog size={15} className="text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white">AWS Monitor</span>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-brand-500/20 text-brand-400 shadow-glow-sm"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.05]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={isActive ? "text-brand-400" : ""} />
                {label}
                {isActive && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-brand-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 하단 */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <p className="text-[10px] text-gray-700">AWS Monitor v0.1.0</p>
      </div>
    </aside>
  );
}
