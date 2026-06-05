import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Loader2, CheckCircle, AlertCircle, KeyRound, ChevronRight } from "lucide-react";
import { api, Account } from "../api/client";

const REGIONS = [
  { value: "ap-northeast-2", label: "서울 (ap-northeast-2)" },
  { value: "ap-northeast-1", label: "도쿄 (ap-northeast-1)" },
  { value: "us-east-1",      label: "버지니아 (us-east-1)" },
  { value: "us-west-2",      label: "오레곤 (us-west-2)" },
  { value: "eu-west-1",      label: "아일랜드 (eu-west-1)" },
];

const inputClass =
  "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.05] transition-all";

export function AccountsPage() {
  const qc = useQueryClient();
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: api.accounts.list,
  });

  const [form, setForm] = useState({
    name: "", access_key: "", secret_key: "", region: "ap-northeast-2",
  });
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
    <div className="p-8 max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-100">계정 관리</h1>
          <p className="text-gray-600 text-sm mt-1">IAM Access Key로 AWS 계정을 연결합니다.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gradient-brand text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-glow hover:opacity-90 transition-opacity"
        >
          <Plus size={15} /> 계정 추가
        </button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
          className="glass rounded-xl p-6 mb-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-200 text-sm">새 AWS 계정 등록</h2>

          {/* 안내 */}
          <div className="flex items-start gap-2.5 bg-brand-500/5 border border-brand-500/15 rounded-lg p-3">
            <KeyRound size={13} className="text-brand-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="text-brand-400 font-medium">ReadOnlyAccess</span> + <span className="text-brand-400 font-medium">AWSBillingReadOnlyAccess</span> 권한을 가진 IAM 사용자의 키를 입력하세요. 키는 암호화되어 로컬에만 저장됩니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">계정 이름</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 팀 프로젝트"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">리전</label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className={inputClass}
              >
                {REGIONS.map((r) => (
                  <option key={r.value} value={r.value} className="bg-gray-900">{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5 font-medium">Access Key ID</label>
            <input
              required
              value={form.access_key}
              onChange={(e) => setForm({ ...form, access_key: e.target.value })}
              placeholder="AKIA..."
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1.5 font-medium">Secret Access Key</label>
            <input
              required
              type="password"
              value={form.secret_key}
              onChange={(e) => setForm({ ...form, secret_key: e.target.value })}
              placeholder="••••••••••••••••"
              className={`${inputClass} font-mono`}
            />
          </div>

          {createMutation.isError && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle size={13} />
              {(createMutation.error as Error).message}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 bg-gradient-brand hover:opacity-90 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-opacity shadow-glow"
            >
              {createMutation.isPending
                ? <><Loader2 size={13} className="animate-spin" /> 검증 중...</>
                : <><CheckCircle size={13} /> 등록</>
              }
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-all"
            >
              취소
            </button>
          </div>
        </form>
      )}

      {/* 계정 목록 */}
      <div className="space-y-2">
        {isLoading && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="glass rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        )}

        {accounts.length === 0 && !isLoading && (
          <div className="text-center py-16 text-gray-700">
            <KeyRound size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">등록된 AWS 계정이 없습니다.</p>
            <p className="text-xs mt-1">위 버튼을 눌러 첫 번째 계정을 추가하세요.</p>
          </div>
        )}

        {accounts.map((account: Account) => (
          <div
            key={account.id}
            className="glass glass-hover rounded-xl px-5 py-4 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <KeyRound size={13} className="text-brand-400" />
              </div>
              <div>
                <p className="font-medium text-gray-200 text-sm">{account.name}</p>
                <p className="text-xs text-gray-600 font-mono mt-0.5">
                  {account.access_key_preview} · {account.region}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-500 transition-colors" />
              <button
                onClick={() => deleteMutation.mutate(account.id)}
                className="text-gray-700 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
