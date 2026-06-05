import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { api, Account } from "../api/client";

const REGIONS = [
  { value: "ap-northeast-2", label: "서울 (ap-northeast-2)" },
  { value: "ap-northeast-1", label: "도쿄 (ap-northeast-1)" },
  { value: "us-east-1", label: "버지니아 (us-east-1)" },
  { value: "us-west-2", label: "오레곤 (us-west-2)" },
  { value: "eu-west-1", label: "아일랜드 (eu-west-1)" },
];

export function AccountsPage() {
  const qc = useQueryClient();
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: api.accounts.list,
  });

  const [form, setForm] = useState({ name: "", access_key: "", secret_key: "", region: "ap-northeast-2" });
  const [showForm, setShowForm] = useState(false);

  const createMutation = useMutation({
    mutationFn: api.accounts.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      setForm({ name: "", access_key: "", secret_key: "", region: "ap-northeast-2" });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.accounts.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">계정 관리</h1>
          <p className="text-gray-500 text-sm mt-1">AWS IAM Access Key를 등록하여 리소스를 모니터링합니다.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> 계정 추가
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(form);
          }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-200">새 AWS 계정 등록</h2>

          <div className="bg-blue-950 border border-blue-800 rounded-lg p-3 text-xs text-blue-300">
            <strong>권장 IAM 권한:</strong> ReadOnlyAccess + CostExplorer 정책만 부여하세요. 최소 권한 원칙으로 안전하게 사용하세요.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">계정 이름</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 개인 AWS 계정"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">리전</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Access Key ID</label>
            <input
              required
              value={form.access_key}
              onChange={(e) => setForm({ ...form, access_key: e.target.value })}
              placeholder="AKIA..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Secret Access Key</label>
            <input
              required
              type="password"
              value={form.secret_key}
              onChange={(e) => setForm({ ...form, secret_key: e.target.value })}
              placeholder="Secret key..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          {createMutation.isError && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={14} />
              {(createMutation.error as Error).message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {createMutation.isPending ? "검증 중..." : "등록"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
            >
              취소
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {isLoading && <p className="text-gray-500 text-sm">불러오는 중...</p>}
        {accounts.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-600">
            <p>등록된 AWS 계정이 없습니다.</p>
            <p className="text-sm mt-1">위 버튼을 눌러 첫 번째 계정을 추가하세요.</p>
          </div>
        )}
        {accounts.map((account: Account) => (
          <div key={account.id} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-100">{account.name}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{account.access_key_preview} · {account.region}</p>
            </div>
            <button
              onClick={() => deleteMutation.mutate(account.id)}
              className="text-gray-600 hover:text-red-400 transition-colors p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
