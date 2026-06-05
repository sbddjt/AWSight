import clsx from "clsx";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: "default" | "green" | "yellow" | "red" | "brand";
  icon?: React.ReactNode;
}

const colorMap = {
  default: "text-gray-100",
  green:   "text-emerald-400",
  yellow:  "text-amber-400",
  red:     "text-red-400",
  brand:   "text-brand-400",
};

const glowMap = {
  default: "",
  green:   "hover:shadow-[0_0_20px_rgba(52,211,153,0.1)]",
  yellow:  "hover:shadow-[0_0_20px_rgba(251,191,36,0.1)]",
  red:     "hover:shadow-[0_0_20px_rgba(248,113,113,0.1)]",
  brand:   "hover:shadow-glow",
};

export function StatCard({ label, value, sub, color = "default", icon }: Props) {
  return (
    <div className={clsx(
      "glass glass-hover rounded-xl p-5 transition-all duration-200",
      glowMap[color]
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium">{label}</p>
        {icon && <span className="text-gray-600">{icon}</span>}
      </div>
      <p className={clsx("text-3xl font-bold tracking-tight", colorMap[color])}>{value}</p>
      {sub && <p className="text-[11px] text-gray-600 mt-1.5">{sub}</p>}
    </div>
  );
}
