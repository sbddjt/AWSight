import clsx from "clsx";

const stateColors: Record<string, string> = {
  running: "bg-emerald-900 text-emerald-400",
  available: "bg-emerald-900 text-emerald-400",
  active: "bg-emerald-900 text-emerald-400",
  stopped: "bg-gray-800 text-gray-400",
  stopping: "bg-yellow-900 text-yellow-400",
  pending: "bg-blue-900 text-blue-400",
};

export function StateBadge({ state }: { state: string }) {
  return (
    <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", stateColors[state] ?? "bg-gray-800 text-gray-400")}>
      {state}
    </span>
  );
}

const typeColors: Record<string, string> = {
  EC2: "bg-orange-900 text-orange-300",
  RDS: "bg-blue-900 text-blue-300",
  Lambda: "bg-purple-900 text-purple-300",
  S3: "bg-green-900 text-green-300",
};

export function TypeBadge({ type }: { type: string }) {
  return (
    <span className={clsx("text-xs px-2 py-0.5 rounded font-mono font-semibold", typeColors[type] ?? "bg-gray-800 text-gray-400")}>
      {type}
    </span>
  );
}
