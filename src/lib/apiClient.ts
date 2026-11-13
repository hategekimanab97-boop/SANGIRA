export interface ServiceReadiness {
  configured: boolean;
  label: string;
  missingKeys: string[];
  requiredKeys: string[];
  description: string;
  setupHint: string;
}

export interface IntegrationStatusReport {
  overallReady: boolean;
  databaseReachable: boolean;
  databaseError: string | null;
  services: {
    supabase: ServiceReadiness;
    betterAuth: ServiceReadiness;
    resend: ServiceReadiness;
  };
  allMissingKeys: string[];
  checkedAt: string;
}

export interface StaffUserSession {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  businessId: string;
  department: string;
  phone: string;
  employeeId: string;
}

export interface StaffSessionResponse {
  authenticated: boolean;
  configured: boolean;
  user: StaffUserSession | null;
}

export interface EmailDispatchOutcome {
  sent: boolean;
  status: 'sent' | 'skipped_missing_key' | 'failed';
  providerId?: string;
  missingKeys?: string[];
  error?: string;
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const sangiraApi = {
  getIntegrationStatus: () => fetchJson<IntegrationStatusReport>('/api/integrations/status'),
  getStaffSession: () => fetchJson<StaffSessionResponse>('/api/staff/session'),
  getBootstrap: (businessId?: string) =>
    fetchJson<Record<string, unknown>>(
      `/api/bootstrap${businessId ? `?businessId=${encodeURIComponent(businessId)}` : ''}`
    ),
  submitApplication: (payload: Record<string, unknown>) =>
    fetchJson<{ persisted: boolean; reason?: string }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  reviewApplication: (appId: string, payload: Record<string, unknown>) =>
    fetchJson<{ ok: boolean; dbPersisted: boolean; emailResult: EmailDispatchOutcome }>(
      `/api/applications/${encodeURIComponent(appId)}/review`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  placeOrder: (payload: Record<string, unknown>) =>
    fetchJson<{ ok: boolean; dbPersisted: boolean; emailResult: EmailDispatchOutcome | null }>(
      '/api/orders',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  deliverOrder: (orderId: string, payload: Record<string, unknown>) =>
    fetchJson<{ ok: boolean; dbPersisted: boolean }>(
      `/api/orders/${encodeURIComponent(orderId)}/deliver`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  verifyPayment: (paymentId: string, payload: Record<string, unknown>) =>
    fetchJson<{ ok: boolean; dbPersisted: boolean; emailResult: EmailDispatchOutcome | null }>(
      `/api/payments/${encodeURIComponent(paymentId)}/verify`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  recordStaffShift: (payload: Record<string, unknown>) =>
    fetchJson<{ ok: boolean; dbPersisted: boolean; emailResult: EmailDispatchOutcome | null }>(
      '/api/staff/shifts',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),
  sendTestEmail: (recipientEmail: string, businessName?: string, employeeName?: string) =>
    fetchJson<{ ok: boolean; emailResult: EmailDispatchOutcome }>('/api/emails/test', {
      method: 'POST',
      body: JSON.stringify({ recipientEmail, businessName, employeeName }),
    }),
};
