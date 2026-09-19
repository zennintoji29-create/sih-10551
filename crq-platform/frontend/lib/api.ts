const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let activeRole: string = "ciso";
let activeOrgId: string = "org-aegis-demo";

export function setActiveRole(role: string) {
  activeRole = role.toLowerCase();
}

export function setActiveOrgId(orgId: string) {
  activeOrgId = orgId;
}

function getHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("aegis_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-user-role": activeRole,
    "x-org-id": activeOrgId,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${res.status} on ${path}`);
  }

  return res.json();
}

export const api = {
  // --- Auth & Org ---
  signup: (data: { orgName: string; domain?: string; plan: string; adminName: string; email: string; password?: string }) =>
    request<{ success: boolean; token: string; user: any; organization: any }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email?: string; password?: string; personaRole?: string; orgId?: string }) =>
    request<{ success: boolean; token: string; user: any; organization: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => request<{ user: any; organization: any }>("/api/auth/me"),
  getUsers: () => request<{ users: any[] }>("/api/auth/users"),
  inviteUser: (data: { email: string; name: string; role: string }) =>
    request<{ success: boolean; user: any }>("/api/auth/invite", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUserRole: (id: string, role: string) =>
    request<{ success: boolean; user: any }>(`/api/auth/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  // --- Connectors ---
  getConnectors: () => request<{ connectors: any[] }>("/api/connectors"),
  configureLiveConnector: (data: { category: string; apiKey?: string; endpoint?: string; pollIntervalHours?: number }) =>
    request<{ success: boolean; connector: any }>("/api/connectors/configure", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  uploadConnectorFile: (data: { category: string; content: string; format: string }) =>
    request<{ success: boolean; recordsIngested: number; confidence: number; recalculation: any }>("/api/connectors/upload", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  switchConnectorToSample: (category: string) =>
    request<{ success: boolean; connector: any }>("/api/connectors/sample", {
      method: "POST",
      body: JSON.stringify({ category }),
    }),
  syncConnector: (category: string) =>
    request<{ success: boolean; connector: any }>("/api/connectors/sync", {
      method: "POST",
      body: JSON.stringify({ category }),
    }),
  submitSiemManual: (data: { criticalAlerts: number; highAlerts: number; mediumAlerts: number; probesPerDay: number }) =>
    request<{ success: boolean; effectiveTef: number; recalculation: any }>("/api/connectors/siem-manual", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // --- Risk & Telemetry ---
  getRiskOverview: () =>
    request<{
      organization: any;
      metrics: {
        portfolioEal: number;
        var90: number;
        var95: number;
        var99: number;
        worstCaseLoss: number;
        dataConfidenceIndex: number;
        activeAssetsCount: number;
        activeFindingsCount: number;
      };
      changeAttribution: {
        assetId: string;
        deltaEal: number;
        primaryDriver: string;
        summary: string;
      };
      history: any[];
    }>("/api/risk/overview"),

  getFindings: (sortBy: "financialImpact" | "cvss" = "financialImpact") =>
    request<{ findings: any[]; count: number }>(`/api/risk/findings?sort=${sortBy}`),

  remediateFinding: (findingId: string) =>
    request<{ success: boolean; finding: any; recalculation: any }>("/api/risk/findings/remediate", {
      method: "POST",
      body: JSON.stringify({ findingId }),
    }),

  getAssets: () => request<{ assets: any[]; count: number }>("/api/risk/assets"),
  createAsset: (data: any) =>
    request<{ success: boolean; asset: any }>("/api/risk/assets", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getControls: () => request<{ controls: any[]; portfolioEal: number }>("/api/risk/controls"),
  deployControl: (controlId: string, observedEalReduction?: number) =>
    request<{ success: boolean; control: any }>("/api/risk/controls/deploy", {
      method: "POST",
      body: JSON.stringify({ controlId, observedEalReduction }),
    }),

  runWhatIf: (data: { mfaRolloutPct?: number; edrCoveragePct?: number; aiThreatSurge?: boolean }) =>
    request<{
      baselineEal: number;
      simulatedEal: number;
      deltaEal: number;
      deltaPercentage: number;
      simulatedVar95: number;
    }>("/api/risk/what-if", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getThirdPartyVendors: () =>
    request<{
      vendors: any[];
      accumulation: {
        independentTotal: number;
        correlationSurcharge: number;
        combinedVar: number;
        spofGroups: Record<string, number>;
      };
      spofGroupsCount: number;
    }>("/api/risk/third-party-vendors"),

  getAuditTrail: () => request<{ auditLogs: any[]; count: number }>("/api/risk/audit-trail"),

  evaluateSecMateriality: (data: { annualRevenueUsd: number; estimatedLossUsd: number; recordsExposed: number; downtimeHours: number }) =>
    request<{
      isMaterial: boolean;
      financialLossPercentage: number;
      recommendation: string;
      regulatoryDisclaimers: string;
    }>("/api/risk/sec-materiality", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
