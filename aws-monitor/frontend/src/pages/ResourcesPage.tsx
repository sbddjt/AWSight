import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw, Search } from "lucide-react";
import { api, Account, Resource } from "../api/client";
import { StateBadge, TypeBadge } from "../components/ResourceBadge";

export function ResourcesPage() {
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: api.accounts.list });
  const [selectedId, setSelectedId] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("전체");
  const [search, setSearch] = useState("");

  const accountId = selectedId || accounts[0]?.id;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["resources", accountId],
    queryFn: () => api.resources.list(accountId),
    enabled: !!accountId,
  });

  const resources = data?.resources ?? [];
  const idle = data?.idle ?? [];
  const types = ["전체", ...Array.from(new Set(resources.map((r) => r.type)))];

  const filtered = resources.filter((r) => {
    const matchType = filterType === "전체" || r.type === filterType;
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-100">리소스</h1>
        <div className="flex items-center gap-2">
          <select
            value={accountId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-brand-500/50"
          >
            {accounts.map((a: Account) => (
              <option key={a.id} value={a.id} className="bg-gray-900">{a.name}</option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] px-3 py-2 rounded-lg text-sm text-gray-400 transition-all"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
            새로고침
          </button>
        </div>
      </div>

      {/* 경고 배너 */}
      {idle.length > 0 && (
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-3">
            <AlertTriangle size={14} /> 안 끈 리소스 경고 ({idle.length}개)
          </div>
          <div className="space-y-2">
            {idle.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TypeBadge type={r.type} />
                  <span className="text-gray-300">{r.name}</span>
                </div>
                <span className="text-amber-500/70 text-xs">{r.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 필터 & 검색 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === t
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                  : "bg-white/[0.03] border border-white/[0.06] text-gray-500 hover:text-gray-300 hover:bg-white/[0.06]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 ID 검색"
            className="bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-brand-500/50 w-52"
          />
        </div>
      </div>

      {/* 테이블 */}
      {!accountId && (
        <div className="text-center py-16 text-gray-700 text-sm">먼저 계정을 등록하세요.</div>
      )}

      {isLoading && (
        <div className="glass rounded-xl overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.04]">
              <div className="w-12 h-5 bg-white/[0.05] rounded animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="w-32 h-3 bg-white/[0.05] rounded animate-pulse" />
                <div className="w-48 h-2.5 bg-white/[0.03] rounded animate-pulse" />
              </div>
              <div className="w-16 h-5 bg-white/[0.05] rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && accountId && (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] text-gray-600 uppercase tracking-widest">
                <th className="text-left px-5 py-3 font-medium">타입</th>
                <th className="text-left px-5 py-3 font-medium">이름 / ID</th>
                <th className="text-left px-5 py-3 font-medium">상태</th>
                <th className="text-left px-5 py-3 font-medium">스펙</th>
                <th className="text-left px-5 py-3 font-medium">실행 기간</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r: Resource) => (
                <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5"><TypeBadge type={r.type} /></td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-200">{r.name}</p>
                    <p className="text-gray-600 font-mono text-xs mt-0.5">{r.id}</p>
                  </td>
                  <td className="px-5 py-3.5"><StateBadge state={r.state} /></td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{r.instance_type ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    {r.running_days != null
                      ? <span className={`text-xs ${r.running_days >= 30 ? "text-amber-400" : "text-gray-500"}`}>{r.running_days}일</span>
                      : <span className="text-gray-700">—</span>
                    }
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-700 text-sm">리소스가 없습니다</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
