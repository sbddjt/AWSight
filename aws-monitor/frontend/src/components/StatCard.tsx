import clsx from "clsx";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  color?: "default" | "green" | "yellow" | "red" | "blue";
}

const colorMap = {
  default: "text-gray-100",
  green: "text-emerald-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
  blue: "text-brand-500",
};

export function StatCard({ label, value, sub, color = "default" }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={clsx("text-3xl font-bold", colorMap[color])}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
