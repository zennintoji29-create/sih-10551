const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

let activeRole: string = "ciso";
let activeOrgId: string = "org-aegis-demo";

export function setActiveRole(role: string) {
  if (role) {
    activeRole = role.toLowerCase();
    if (typeof window !== "undefined") {
      localStorage.setItem("aegis_role", activeRole);
    }
  }
}

export function setActiveOrgId(orgId: string) {
  if (orgId) {
    activeOrgId = orgId;
    if (typeof window !== "undefined") {
      localStorage.setItem("aegis_org_id", orgId);
    }
  }
}

function getHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("aegis_token") : null;
  const storedRole = typeof window !== "undefined" ? localStorage.getItem("aegis_role") : null;
  const storedOrg = typeof window !== "undefined" ? localStorage.getItem("aegis_org_id") : null;

  const currentRole = (storedRole || activeRole || "ciso").toLowerCase();
  const currentOrg = storedOrg || activeOrgId || "org-aegis-demo";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-user-role": currentRole,
    "x-org-id": currentOrg,
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
  inviteUser: (data: { email: string; name?: string; role: string }) =>
    request<{ success: boolean; user: any }>("/api/auth/invite", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        name: data.name || data.email.split("@")[0],
      }),
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
  uploadConnectorFile: (data: { category: string; content: string; format?: string }) =>
    request<{ success: boolean; recordsIngested: number; confidence: number; recalculation: any }>("/api/connectors/upload", {
      method: "POST",
      body: JSON.stringify({ format: "csv", ...data }),
    }),
  // Alias for uploadConnectorCsv
  uploadConnectorCsv: (data: { category: string; csvData?: string; content?: string }) =>
    request<{ success: boolean; recordsIngested: number; ingestedCount: number; confidence: number; recalculation: any }>("/api/connectors/upload", {
      method: "POST",
      body: JSON.stringify({
        category: data.category,
        content: data.content || data.csvData,
        format: "csv",
      }),
    }).then((res: any) => ({
      ...res,
      ingestedCount: res.recordsIngested ?? res.ingestedCount ?? 0,
    })),
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
  submitSiemManual: (data: { criticalAlerts?: number; criticalIncidents?: number; highAlerts?: number; highIncidents?: number; mediumAlerts?: number; mediumIncidents?: number; probesPerDay?: number }) =>
    request<{ success: boolean; effectiveTef: number; recalculation: any }>("/api/connectors/siem-manual", {
      method: "POST",
      body: JSON.stringify({
        criticalAlerts: data.criticalAlerts ?? data.criticalIncidents ?? 5,
        highAlerts: data.highAlerts ?? data.highIncidents ?? 20,
        mediumAlerts: data.mediumAlerts ?? data.mediumIncidents ?? 80,
        probesPerDay: data.probesPerDay ?? 2500,
      }),
    }),
  // Alias for submitSiemManualTelemetry
  submitSiemManualTelemetry: (data: { criticalIncidents: number; highIncidents: number; mediumIncidents: number }) =>
    api.submitSiemManual(data),

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
  // Alias for patchFinding
  patchFinding: (findingId: string) => api.remediateFinding(findingId),

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
  // Alias for getThirdPartyRisk
  getThirdPartyRisk: () => api.getThirdPartyVendors(),

  getAuditTrail: () => request<{ auditLogs: any[]; count: number }>("/api/risk/audit-trail"),
  // Alias for getAuditLogs
  getAuditLogs: () =>
    api.getAuditTrail().then((res) => ({
      logs: res.auditLogs || [],
      auditLogs: res.auditLogs || [],
      count: res.count || 0,
    })),

  evaluateSecMateriality: (data: {
    annualRevenueUsd?: number;
    estimatedLossUsd?: number;
    financialLoss?: number;
    recordsExposed?: number;
    affectedRecords?: number;
    downtimeHours?: number;
    isProductionHalted?: boolean;
  }) =>
    request<{
      isMaterial: boolean;
      financialLossPercentage: number;
      recommendation: string;
      regulatoryDisclaimers: string;
    }>("/api/risk/sec-materiality", {
      method: "POST",
      body: JSON.stringify({
        annualRevenueUsd: data.annualRevenueUsd ?? 120000000,
        estimatedLossUsd: data.estimatedLossUsd ?? data.financialLoss ?? 2800000,
        recordsExposed: data.recordsExposed ?? data.affectedRecords ?? 145000,
        downtimeHours: data.downtimeHours ?? (data.isProductionHalted ? 48 : 24),
      }),
    }),
};

