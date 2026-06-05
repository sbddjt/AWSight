import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { api, Account, Resource } from "../api/client";
import { StateBadge, TypeBadge } from "../components/ResourceBadge";

export function ResourcesPage() {
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: api.accounts.list });
  const [selectedId, setSelectedId] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("전체");

  const accountId = selectedId || accounts[0]?.id;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["resources", accountId],
    queryFn: () => api.resources.list(accountId),
    enabled: !!accountId,
  });

  const resources = data?.resources ?? [];
  const idle = data?.idle ?? [];
  const types = ["전체", ...Array.from(new Set(resources.map((r) => r.type)))];
  const filtered = filterType === "전체" ? resources : resources.filter((r) => r.type === filterType);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">리소스</h1>
        <div className="flex items-center gap-3">
          <select
            value={accountId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            {accounts.map((a: Account) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            새로고침
          </button>
        </div>
      </div>

      {idle.length > 0 && (
        <div className="mb-6 bg-yellow-950 border border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-3">
            <AlertTriangle size={16} /> 안 끈 리소스 경고 ({idle.length}개)
          </div>
          <div className="space-y-2">
            {idle.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TypeBadge type={r.type} />
                  <span className="text-gray-200">{r.name}</span>
                </div>
                <span className="text-yellow-500 text-xs">{r.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === t ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-400 hover:text-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-gray-500 text-sm">리소스를 불러오는 중...</p>}
      {!accountId && <p className="text-gray-600 text-sm">먼저 계정을 등록하세요.</p>}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left px-4 py-3">타입</th>
              <th className="text-left px-4 py-3">이름 / ID</th>
              <th className="text-left px-4 py-3">상태</th>
              <th className="text-left px-4 py-3">인스턴스 타입</th>
              <th className="text-left px-4 py-3">실행 시간</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r: Resource) => (
              <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3"><TypeBadge type={r.type} /></td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-200">{r.name}</p>
                  <p className="text-gray-600 font-mono text-xs">{r.id}</p>
                </td>
                <td className="px-4 py-3"><StateBadge state={r.state} /></td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{r.instance_type ?? "-"}</td>
                <td className="px-4 py-3 text-gray-400">
                  {r.running_days != null ? `${r.running_days}일` : "-"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-600">리소스가 없습니다</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
