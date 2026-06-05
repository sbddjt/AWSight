import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Server, DollarSign, Activity } from "lucide-react";
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

  if (loadingAccounts) return <div className="p-8 text-gray-500">불러오는 중...</div>;

  if (accounts.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <Server size={48} className="text-gray-700 mb-4" />
        <h2 className="text-xl font-semibold text-gray-300 mb-2">AWS 계정을 연결하세요</h2>
        <p className="text-gray-600 text-sm mb-6">IAM Access Key를 등록하면 리소스와 비용을 한눈에 확인할 수 있습니다.</p>
        <button
          onClick={() => navigate("/accounts")}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          계정 추가하기
        </button>
      </div>
    );
  }

  const summary = resourceData?.summary;
  const idle = resourceData?.idle ?? [];
  const recentResources = resourceData?.resources.slice(0, 5) ?? [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">
          {firstAccount?.name} · {firstAccount?.region}
          {accounts.length > 1 && <span className="ml-2 text-gray-600">외 {accounts.length - 1}개 계정</span>}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="전체 리소스" value={summary?.total ?? "-"} color="blue" />
        <StatCard label="실행 중" value={summary?.running ?? "-"} sub="EC2, RDS, Lambda 등" color="green" />
        <StatCard label="중지됨" value={summary?.stopped ?? "-"} color="default" />
        <StatCard
          label="이달 비용"
          value={costData ? `$${costData.total_usd.toFixed(2)}` : "-"}
          sub={costData?.month}
          color="yellow"
        />
      </div>

      {idle.length > 0 && (
        <div className="mb-8 bg-yellow-950 border border-yellow-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-3">
            <AlertTriangle size={16} />
            안 끈 리소스 경고 ({idle.length}개)
          </div>
          <div className="space-y-2">
            {idle.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm py-1">
                <div className="flex items-center gap-2">
                  <TypeBadge type={r.type} />
                  <span className="text-gray-200 font-medium">{r.name}</span>
                </div>
                <span className="text-yellow-500 text-xs bg-yellow-900/50 px-2 py-0.5 rounded">{r.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-800">
          <Activity size={14} className="text-brand-500" />
          <h2 className="font-semibold text-sm">최근 리소스</h2>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {recentResources.map((r) => (
              <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-5 py-3 w-20"><TypeBadge type={r.type} /></td>
                <td className="px-5 py-3">
                  <p className="text-gray-200 font-medium">{r.name}</p>
                  <p className="text-gray-600 font-mono text-xs">{r.id}</p>
                </td>
                <td className="px-5 py-3"><StateBadge state={r.state} /></td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {r.running_days != null ? `${r.running_days}일째 실행 중` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentResources.length === 0 && (
          <p className="text-center text-gray-600 py-8 text-sm">리소스가 없습니다</p>
        )}
      </div>
    </div>
  );
}
