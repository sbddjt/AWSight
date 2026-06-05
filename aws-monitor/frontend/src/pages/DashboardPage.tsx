import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Server, DollarSign, Activity, Layers, Power } from "lucide-react";
import { api, Account } from "../api/client";
import { StatCard } from "../components/StatCard";
import { TypeBadge, StateBadge } from "../components/ResourceBadge";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: api.accounts.list,
  });

  const firstAccount: Account | undefined = accounts[0];

  const { data: resourceData } = useQuery({
    queryKey: ["resources", firstAccount?.id],
    queryFn: () => api.resources.list(firstAccount!.id),
    enabled: !!firstAccount,
  });

  const { data: costData } = useQuery({
    queryKey: ["costs-monthly", firstAccount?.id],
    queryFn: () => api.costs.monthly(firstAccount!.id),
    enabled: !!firstAccount,
  });

  if (loadingAccounts) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-6 shadow-glow">
          <Server size={28} className="text-brand-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-200 mb-2">AWS 계정을 연결하세요</h2>
        <p className="text-gray-600 text-sm mb-8 max-w-xs leading-relaxed">
          IAM Access Key를 등록하면 리소스와 비용을 한눈에 확인할 수 있습니다.
        </p>
        <button
          onClick={() => navigate("/accounts")}
          className="bg-gradient-brand text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity"
        >
          계정 추가하기
        </button>
      </div>
    );
  }

  const summary = resourceData?.summary;
  const idle = resourceData?.idle ?? [];
  const recentResources = resourceData?.resources.slice(0, 6) ?? [];

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-100">대시보드</h1>
        <p className="text-gray-600 text-sm mt-1">
          {firstAccount?.name} · {firstAccount?.region}
          {accounts.length > 1 && <span className="ml-2">외 {accounts.length - 1}개 계정</span>}
        </p>
      </div>

      {/* 스탯 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="전체 리소스"
          value={summary?.total ?? "-"}
          icon={<Layers size={14} />}
          color="brand"
        />
        <StatCard
          label="실행 중"
          value={summary?.running ?? "-"}
          sub="EC2 · RDS · Lambda"
          icon={<Power size={14} />}
          color="green"
        />
        <StatCard
          label="중지됨"
          value={summary?.stopped ?? "-"}
          icon={<Server size={14} />}
          color="default"
        />
        <StatCard
          label="이달 비용"
          value={costData ? `$${costData.total_usd.toFixed(2)}` : "-"}
          sub={costData?.month}
          icon={<DollarSign size={14} />}
          color="yellow"
        />
      </div>

      {/* 경고 패널 */}
      {idle.length > 0 && (
        <div className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-4">
            <AlertTriangle size={15} />
            안 끈 리소스 경고 ({idle.length}개)
          </div>
          <div className="space-y-3">
            {idle.map((r) => (
              <div key={r.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TypeBadge type={r.type} />
                  <span className="text-gray-200 text-sm font-medium">{r.name}</span>
                </div>
                <span className="text-amber-500/80 text-xs bg-amber-500/10 px-2.5 py-1 rounded-full">
                  {r.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 리소스 테이블 */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06]">
          <Activity size={13} className="text-brand-400" />
          <h2 className="text-sm font-semibold text-gray-300">최근 리소스</h2>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {recentResources.map((r) => (
              <tr key={r.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5 w-20"><TypeBadge type={r.type} /></td>
                <td className="px-5 py-3.5">
                  <p className="text-gray-200 font-medium">{r.name}</p>
                  <p className="text-gray-600 font-mono text-xs mt-0.5">{r.id}</p>
                </td>
                <td className="px-5 py-3.5"><StateBadge state={r.state} /></td>
                <td className="px-5 py-3.5 text-gray-600 text-xs">
                  {r.running_days != null ? `${r.running_days}일째 실행 중` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentResources.length === 0 && (
          <p className="text-center text-gray-700 py-10 text-sm">리소스가 없습니다</p>
        )}
      </div>
    </div>
  );
}
