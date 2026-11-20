// In the browser, an empty string uses relative URLs (/api/...) transparently routed by Vercel rewrites.
// In SSR / server functions, Vercel injects the internal backend URL via the BACKEND_URL service binding.
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window === "undefined"
    ? (process.env.BACKEND_URL || "http://localhost:4000")
    : "");

let activeRole: string = "ciso";
let activeOrgId: string = "org-aegis-prod";

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
  const currentOrg = storedOrg || activeOrgId || "org-aegis-prod";

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

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
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
    const err: any = new Error(errorData.message || errorData.error || `HTTP ${res.status} on ${path}`);
    err.status = res.status;
    err.data = errorData;
    throw err;
  }

  return res.json();
}

// ============================================================================
// 1. CISO EXCLUSIVE MODULE (/api/ciso/*) — Tier 4
// ============================================================================
export const cisoApi = {
  getCockpit: () =>
    request<{
      organization: any;
      role: string;
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
    }>("/api/ciso/cockpit"),

  getBoardReport: () =>
    request<{
      organization: any;
      generatedAt: string;
      executiveSummary: {
        annualRevenueExposurePct: number;
        portfolioEal: number;
        var95: number;
        totalCapitalProposed: number;
        totalPredictedRiskReduction: number;
        blendedRosiPercentage: number;
        boardDecision: string;
      };
      regulatoryAttestation: any;
      controlsPortfolio: any[];
    }>("/api/ciso/board-report"),

  signOffCapital: (data: { approvedBudgetCap: number; selectedControlIds: string[] }) =>
    request<{ success: boolean; signOffId: string; status: string }>("/api/ciso/capital-allocation", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  simulateWhatIf: (data: { mfaRolloutPct?: number; edrCoveragePct?: number; aiThreatSurge?: boolean }) =>
    request<{
      baselineEal: number;
      simulatedEal: number;
      deltaEal: number;
      deltaPercentage: number;
      simulatedVar95: number;
    }>("/api/ciso/what-if", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// 2. ADMIN MODULE (/api/admin/*) — Tier 3 (Admin & CISO)
// ============================================================================
export const adminApi = {
  getUsers: () => request<{ users: any[]; count: number }>("/api/admin/users"),

  inviteUser: (data: { email: string; name?: string; role: string }) =>
    request<{ success: boolean; user: any }>("/api/admin/invite", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        name: data.name || data.email.split("@")[0],
      }),
    }),

  updateUserRole: (id: string, role: string) =>
    request<{ success: boolean; user: any }>(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  getTenantSettings: () => request<{ tenant: any; limits: any }>("/api/admin/tenant"),
};

// ============================================================================
// 3. RISK ANALYSIS MODULE (/api/risk/*) — Tier 2 (Analyst, Admin, CISO)
// ============================================================================
export const riskApi = {
  getFindings: (sortBy: "financialImpact" | "cvss" = "financialImpact") =>
    request<{ findings: any[]; count: number }>(`/api/risk/findings?sort=${sortBy}`),

  remediateFinding: (findingId: string) =>
    request<{ success: boolean; finding: any; savedEal?: number; deltaEal?: number; recalculation: any }>("/api/risk/findings/remediate", {
      method: "POST",
      body: JSON.stringify({ findingId }),
    }),

  reopenFinding: (findingId: string) =>
    request<{ success: boolean; finding: any; restoredImpact?: number; deltaEal?: number; recalculation: any }>("/api/risk/findings/reopen", {
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

  runMonteCarlo: (data: { confidence?: number; simulations?: number }) =>
    request<{ success: boolean; simulations: number; confidence: number; results: any }>("/api/risk/monte-carlo", {
      method: "POST",
      body: JSON.stringify(data),
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

  recalculateRisk: (reason?: string) =>
    request<{ success: boolean; result: any }>("/api/risk/recalculate", {
      method: "POST",
      body: JSON.stringify({ reason: reason || "Manual user re-quantification" }),
    }),
};

// ============================================================================
// 4. CONNECTORS MODULE (/api/connectors/*) — Tier 2 (Analyst, Admin, CISO)
// ============================================================================
export const connectorsApi = {
  getConnectors: () => request<{ connectors: any[] }>("/api/connectors"),

  configureLiveConnector: (data: { category: string; apiKey?: string; endpoint?: string; pollIntervalHours?: number }) =>
    request<{ success: boolean; connector: any }>("/api/connectors/configure", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  testConnection: (data: { category: string; endpoint?: string; apiKey?: string }) =>
    request<{
      success: boolean;
      category: string;
      toolName?: string;
      status: string;
      latencyMs: number;
      tlsVersion: string;
      authStatus: string;
      cipherSuite?: string;
      protocol?: string;
      authType?: string;
      sampleMetric?: string;
      timestamp: string;
      details: string;
    }>("/api/connectors/test-connection", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  uploadConnectorFile: (data: { category: string; content: string; format?: string }) =>
    request<{ success: boolean; recordsIngested: number; confidence: number; recalculation: any }>("/api/connectors/upload", {
      method: "POST",
      body: JSON.stringify({ format: "csv", ...data }),
    }),

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
};

// ============================================================================
// 5. AUDIT & COMPLIANCE MODULE (/api/audit/*) — Tier 1 (Auditor, Analyst, Admin, CISO)
// ============================================================================
export const auditApi = {
  getLogs: () =>
    request<{ auditLogs: any[]; count: number; integrityVerified: boolean; verificationStandard: string }>("/api/audit/logs").then((res) => ({
      ...res,
      logs: res.auditLogs,
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
    }>("/api/audit/sec-materiality", {
      method: "POST",
      body: JSON.stringify({
        annualRevenueUsd: data.annualRevenueUsd ?? 120000000,
        estimatedLossUsd: data.estimatedLossUsd ?? data.financialLoss ?? 2800000,
        recordsExposed: data.recordsExposed ?? data.affectedRecords ?? 145000,
        downtimeHours: data.downtimeHours ?? (data.isProductionHalted ? 48 : 24),
      }),
    }),

  getDoraArticle16: () =>
    request<{
      regulation: string;
      scope: string;
      vendors: any[];
      accumulation: any;
      spofGroupsCount: number;
      status: string;
    }>("/api/audit/dora-art16"),
};

// ============================================================================
// 6. AI EXECUTIVE & GROQ LLM MODULE (/api/ai/*) — All Roles
// ============================================================================
export const aiApi = {
  getExecutiveSummary: () => request<any>("/api/ai/executive-summary"),
  generateExecutiveSummary: () =>
    request<any>("/api/ai/executive-summary", {
      method: "POST",
    }),
  chat: (data: { message: string; history?: Array<{ role: "user" | "assistant"; content: string }> }) =>
    request<{ reply: string; model: string; role: string; orgName: string; guardrailTriggered?: boolean }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// UNIFIED FACADE FOR BACKWARD COMPATIBILITY
// ============================================================================
export const api = {
  // Auth
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

  // Admin Module
  getUsers: () => adminApi.getUsers(),
  inviteUser: (data: { email: string; name?: string; role: string }) => adminApi.inviteUser(data),
  updateUserRole: (id: string, role: string) => adminApi.updateUserRole(id, role),

  // Connectors Module
  getConnectors: () => connectorsApi.getConnectors(),
  configureLiveConnector: (data: any) => connectorsApi.configureLiveConnector(data),
  uploadConnectorFile: (data: any) => connectorsApi.uploadConnectorFile(data),
  uploadConnectorCsv: (data: any) => connectorsApi.uploadConnectorCsv(data),
  switchConnectorToSample: (category: string) => connectorsApi.switchConnectorToSample(category),
  syncConnector: (category: string) => connectorsApi.syncConnector(category),
  submitSiemManual: (data: any) => connectorsApi.submitSiemManual(data),
  submitSiemManualTelemetry: (data: any) => connectorsApi.submitSiemManual(data),

  // CISO & Risk
  getRiskOverview: () => cisoApi.getCockpit(),
  getFindings: (sortBy?: "financialImpact" | "cvss") => riskApi.getFindings(sortBy),
  remediateFinding: (findingId: string) => riskApi.remediateFinding(findingId),
  patchFinding: (findingId: string) => riskApi.remediateFinding(findingId),
  getAssets: () => riskApi.getAssets(),
  createAsset: (data: any) => riskApi.createAsset(data),
  getControls: () => riskApi.getControls(),
  deployControl: (controlId: string, observedEalReduction?: number) => riskApi.deployControl(controlId, observedEalReduction),
  runWhatIf: (data: any) => riskApi.runWhatIf(data),
  getThirdPartyVendors: () => riskApi.getThirdPartyVendors(),
  getThirdPartyRisk: () => riskApi.getThirdPartyVendors(),

  // Audit Module
  getAuditTrail: () => auditApi.getLogs(),
  getAuditLogs: () => auditApi.getLogs(),
  evaluateSecMateriality: (data: any) => auditApi.evaluateSecMateriality(data),
};
