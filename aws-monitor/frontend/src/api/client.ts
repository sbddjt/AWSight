const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "요청 실패");
  }
  return res.json();
}

export interface Account {
  id: string;
  name: string;
  region: string;
  access_key_preview: string;
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  state: string;
  instance_type: string | null;
  region: string;
  launch_time: string | null;
  running_days: number | null;
}

export interface IdleResource extends Resource {
  reason: string;
}

export const api = {
  accounts: {
    list: () => request<Account[]>("/accounts"),
    create: (body: { name: string; access_key: string; secret_key: string; region: string }) =>
      request<Account>("/accounts", { method: "POST", body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/accounts/${id}`, { method: "DELETE" }),
  },
  resources: {
    list: (accountId: string) =>
      request<{ resources: Resource[]; idle: IdleResource[]; summary: Record<string, number> }>(
        `/accounts/${accountId}/resources`
      ),
  },
  costs: {
    monthly: (accountId: string) =>
      request<{ month: string; total_usd: number }>(`/accounts/${accountId}/costs/monthly`),
    daily: (accountId: string) =>
      request<{ data: { date: string; cost_usd: number }[] }>(`/accounts/${accountId}/costs/daily`),
    byService: (accountId: string) =>
      request<{ data: { service: string; cost_usd: number }[] }>(
        `/accounts/${accountId}/costs/by-service`
      ),
  },
};
