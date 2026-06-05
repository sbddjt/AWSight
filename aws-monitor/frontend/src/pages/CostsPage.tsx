import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { api, Account } from "../api/client";

const PIE_COLORS = ["#0ea5e9", "#a78bfa", "#34d399", "#fbbf24", "#f87171", "#fb923c", "#e879f9"];

export function CostsPage() {
  const { data: accounts = [] } = useQuery({ queryKey: ["accounts"], queryFn: api.accounts.list });
  const [selectedId, setSelectedId] = useState<string>("");

  const accountId = selectedId || accounts[0]?.id;

  const { data: monthly } = useQuery({
    queryKey: ["costs-monthly", accountId],
    queryFn: () => api.costs.monthly(accountId),
    enabled: !!accountId,
  });

  const { data: daily } = useQuery({
    queryKey: ["costs-daily", accountId],
    queryFn: () => api.costs.daily(accountId),
    enabled: !!accountId,
  });

  const { data: byService } = useQuery({
    queryKey: ["costs-service", accountId],
    queryFn: () => api.costs.byService(accountId),
    enabled: !!accountId,
  });

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">비용</h1>
        <select
          value={accountId ?? ""}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none"
        >
          {accounts.map((a: Account) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {monthly && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 inline-block">
          <p className="text-xs text-gray-500 uppercase tracking-widest">이번 달 총 비용</p>
          <p className="text-4xl font-bold text-brand-500 mt-1">${monthly.total_usd.toFixed(2)}</p>
          <p className="text-xs text-gray-600 mt-1">{monthly.month}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* 일별 비용 차트 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 col-span-2">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">일별 비용 (최근 14일)</h2>
          {daily?.data ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={daily.data}>
                <defs>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} width={50} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                  formatter={(v: number) => [`$${v.toFixed(4)}`, "비용"]}
                />
                <Area type="monotone" dataKey="cost_usd" stroke="#0ea5e9" fill="url(#costGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-sm text-center py-8">데이터 없음</p>
          )}
        </div>

        {/* 서비스별 비용 파이 차트 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">서비스별 비용</h2>
          {byService?.data && byService.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={byService.data}
                  dataKey="cost_usd"
                  nameKey="service"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {byService.data.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(v) => <span className="text-xs text-gray-400">{v}</span>}
                />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                  formatter={(v: number) => [`$${v.toFixed(4)}`]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-sm text-center py-8">데이터 없음</p>
          )}
        </div>

        {/* 서비스별 비용 리스트 */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">서비스 순위</h2>
          <div className="space-y-2">
            {byService?.data?.slice(0, 8).map((item, i) => (
              <div key={item.service} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-300 truncate max-w-[180px]">{item.service}</span>
                </div>
                <span className="text-gray-400 font-mono">${item.cost_usd.toFixed(3)}</span>
              </div>
            )) ?? <p className="text-gray-600 text-sm">데이터 없음</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
