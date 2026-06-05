import clsx from "clsx";

const stateStyles: Record<string, string> = {
  running:   "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  available: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  active:    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  stopped:   "bg-gray-500/10 text-gray-500 border border-gray-500/20",
  stopping:  "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  pending:   "bg-blue-500/10 text-blue-400 border border-blue-500/20",
};

export function StateBadge({ state }: { state: string }) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium",
      stateStyles[state] ?? "bg-gray-500/10 text-gray-500 border border-gray-500/20"
    )}>
      <span className={clsx(
        "w-1.5 h-1.5 rounded-full",
        state === "running" || state === "available" || state === "active"
          ? "bg-emerald-400 animate-pulse"
          : state === "stopping" ? "bg-amber-400" : "bg-gray-500"
      )} />
      {state}
    </span>
  );
}

const typeStyles: Record<string, string> = {
  EC2:    "bg-orange-500/10 text-orange-300 border border-orange-500/20",
  RDS:    "bg-blue-500/10 text-blue-300 border border-blue-500/20",
  Lambda: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
  S3:     "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
};

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className={clsx(
      "text-xs px-2 py-0.5 rounded font-mono font-semibold border",
      typeStyles[type] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"
    )}>
      {type}
    </span>
  );
}
