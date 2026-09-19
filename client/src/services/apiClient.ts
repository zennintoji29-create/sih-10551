import {
  CurrentRiskResponse,
  AttributionSummary,
  RosiOptimizationPlan,
  TelemetryRecord,
  SecMaterialityAssessment,
  DoraStressTestResult,
  AuditLogEntry,
  Asset,
  VendorConcentrationResponse,
  DataConnectorConfig,
  HistoricalRiskSnapshot,
  DeployedControlTracker,
  UserRole
} from '../types/risk';

const API_BASE = '/api';
let activeUserRole: UserRole = 'CISO';

export function setActiveRole(role: UserRole) {
  activeUserRole = role;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-user-role': activeUserRole,
    'x-org-id': 'org-acme-fintech'
  };
}

export async function fetchCurrentRisk(): Promise<CurrentRiskResponse> {
  const res = await fetch(`${API_BASE}/risk/current`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function fetchRiskHistory(): Promise<{ history: HistoricalRiskSnapshot[] }> {
  const res = await fetch(`${API_BASE}/risk/history`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function runWhatIfSimulation(params: {
  mfaAdoptionPercent?: number;
  edrCoveragePercent?: number;
  zeroTrustMaturity?: number;
  aiThreatSurge?: boolean;
}) {
  const res = await fetch(`${API_BASE}/risk/what-if`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function fetchAttribution(): Promise<AttributionSummary> {
  const res = await fetch(`${API_BASE}/risk/attribution`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function fetchRosiOptimization(budget: number = 500000): Promise<RosiOptimizationPlan> {
  const res = await fetch(`${API_BASE}/rosi/optimize`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ budget })
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function fetchDeployedControls(): Promise<{ deployedControls: DeployedControlTracker[] }> {
  const res = await fetch(`${API_BASE}/controls/deployed`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function deployControl(controlName: string, costUsd: number, predictedEalReductionUsd: number) {
  const res = await fetch(`${API_BASE}/controls/deploy`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ controlName, costUsd, predictedEalReductionUsd })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function fetchAssets(): Promise<{ assets: Asset[]; totalValuationUsd: number; totalAssetEalUsd: number }> {
  const res = await fetch(`${API_BASE}/assets`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function createAsset(asset: Partial<Asset>) {
  const res = await fetch(`${API_BASE}/assets`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(asset)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function fetchVendors(): Promise<VendorConcentrationResponse> {
  const res = await fetch(`${API_BASE}/vendors`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function createVendor(vendor: any) {
  const res = await fetch(`${API_BASE}/vendors`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(vendor)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function fetchConnectors(): Promise<{ connectors: DataConnectorConfig[] }> {
  const res = await fetch(`${API_BASE}/connectors`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function syncConnector(connectorId: string) {
  const res = await fetch(`${API_BASE}/connectors/${connectorId}/sync`, {
    method: 'POST',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

// AI Copilot & Role-Guardrailed Assistant
export interface AiChatPayload {
  message: string;
  role: UserRole;
  provider?: 'ollama' | 'groq' | 'builtin';
  ollamaModel?: string;
  groqApiKey?: string;
  groqModel?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: any;
}

export interface AiChatResponse {
  reply: string;
  providerUsed: 'ollama' | 'groq' | 'builtin';
  roleEnforced: UserRole;
  allowedScope: string[];
  disallowedScope: string[];
  disclaimer?: string;
}

export interface AiProvidersStatus {
  ollama: {
    available: boolean;
    models: string[];
    endpoint: string;
  };
  groq: {
    configured: boolean;
    defaultModel: string;
  };
  builtin: {
    available: boolean;
    roleGuardrailsActive: boolean;
  };
}

export async function fetchAiProviders(): Promise<AiProvidersStatus> {
  const res = await fetch(`${API_BASE}/chat/providers`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function sendChatMessage(payload: AiChatPayload): Promise<AiChatResponse> {
  const res = await fetch(`${API_BASE}/chat/assistant`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function updateConnector(id: string, updates: Partial<DataConnectorConfig>) {
  const res = await fetch(`${API_BASE}/connectors/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function uploadConnectorFile(category: string, content: string, format: 'CSV' | 'JSON') {
  const res = await fetch(`${API_BASE}/connectors/upload`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ category, content, format })
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function fetchTelemetry(): Promise<{ records: TelemetryRecord[]; count: number }> {
  const res = await fetch(`${API_BASE}/telemetry`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function ingestFinding(payload: any) {
  const res = await fetch(`${API_BASE}/telemetry/ingest`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
}

export async function evaluateSecMateriality(params: any): Promise<SecMaterialityAssessment> {
  const res = await fetch(`${API_BASE}/compliance/sec-materiality`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function fetchDoraStressTest(): Promise<DoraStressTestResult> {
  const res = await fetch(`${API_BASE}/compliance/dora-stress-test`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function fetchAuditTrail(): Promise<{ auditLogs: AuditLogEntry[] }> {
  const res = await fetch(`${API_BASE}/compliance/audit-trail`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function fetchDemoScenarios(): Promise<{ scenarios: any[] }> {
  const res = await fetch(`${API_BASE}/demo/scenarios`, { headers: getHeaders() });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}
