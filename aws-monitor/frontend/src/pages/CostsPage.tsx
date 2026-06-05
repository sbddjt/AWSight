import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { DollarSign, TrendingUp } from "lucide-react";
import { api, Account } from "../api/client";

const PALETTE = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#ec4899"];

function TooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="text-gray-200 font-semibold">${payload[0].value.toFixed(4)}</p>
    </div>
  );
}

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

  const serviceData = byService?.data ?? [];
  const dailyData = daily?.data ?? [];

  return (
    <div className="p-8 max-w-5xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-100">비용</h1>
        <select
          value={accountId ?? ""}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-brand-500/50"
        >
          {accounts.map((a: Account) => (
            <option key={a.id} value={a.id} className="bg-gray-900">{a.name}</option>
          ))}
        </select>
      </div>

      {/* 이달 총액 */}
      {monthly && (
        <div className="glass rounded-xl p-6 mb-6 inline-flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shadow-glow">
            <DollarSign size={20} className="text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-medium mb-1">이달 총 비용</p>
            <p className="text-4xl font-bold tracking-tight text-gray-100">
              ${monthly.total_usd.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600 mt-1">{monthly.month}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-5">
        {/* 일별 비용 — 넓게 */}
        <div className="col-span-3 glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={13} className="text-brand-400" />
            <h2 className="text-sm font-semibold text-gray-300">일별 비용 (최근 14일)</h2>
          </div>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData} margin={{ left: -10 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#4b5563", fontSize: 10 }}
                  tickFormatter={(v) => v.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#4b5563", fontSize: 10 }}
                  tickFormatter={(v) => `$${v}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<TooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="cost_usd"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#grad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-700 text-sm">데이터 없음</div>
          )}
        </div>

        {/* 서비스별 파이 + 리스트 */}
        <div className="col-span-2 glass rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">서비스별 비용</h2>
          {serviceData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    dataKey="cost_usd"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {serviceData.map((_: any, i: number) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,15,23,0.9)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                    formatter={(v: number) => [`$${v.toFixed(4)}`]}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-3">
                {serviceData.slice(0, 6).map((item: any, i: number) => (
                  <div key={item.service} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: PALETTE[i % PALETTE.length] }}
                      />
                      <span className="text-gray-400 truncate">{item.service}</span>
                    </div>
                    <span className="text-gray-500 font-mono shrink-0 ml-2">${item.cost_usd.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-700 text-sm">데이터 없음</div>
          )}
        </div>
      </div>
    </div>
  );
}
