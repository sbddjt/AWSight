import { NavLink } from "react-router-dom";
import { LayoutDashboard, Server, KeyRound, DollarSign } from "lucide-react";
import clsx from "clsx";

const links = [
  { to: "/", label: "대시보드", icon: LayoutDashboard },
  { to: "/accounts", label: "계정 관리", icon: KeyRound },
  { to: "/resources", label: "리소스", icon: Server },
  { to: "/costs", label: "비용", icon: DollarSign },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-800">
        <span className="text-lg font-bold tracking-tight text-brand-500">AWS Monitor</span>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
