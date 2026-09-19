"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Terminal,
  Plug,
  Scale,
  Settings,
  Users,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
  Server,
  FileSpreadsheet,
  Upload,
  ArrowRight,
  Sparkles,
  Info,
  DollarSign,
  Lock,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { api, setActiveRole, setActiveOrgId } from "@/lib/api";

type Role = "admin" | "ciso" | "analyst" | "auditor";
type ActiveTab = "cockpit" | "analyst" | "connectors" | "auditor" | "admin";

export default function DashboardPage() {
  const [currentRole, setCurrentRole] = useState<Role>("ciso");
  const [activeTab, setActiveTab] = useState<ActiveTab>("cockpit");
  const [org, setOrg] = useState<any>({ name: "Acme CyberFin Corp", plan: "enterprise" });

  // Data states
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [overview, setOverview] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [controls, setControls] = useState<any[]>([]);
  const [connectors, setConnectors] = useState<any[]>([]);
  const [thirdParty, setThirdParty] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Interactive controls
  const [selectedConfidence, setSelectedConfidence] = useState<"90" | "95" | "99">("95");
  const [whatIfMfa, setWhatIfMfa] = useState(70);
  const [whatIfEdr, setWhatIfEdr] = useState(75);
  const [whatIfAiSurge, setWhatIfAiSurge] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState<any>(null);

  // Connector form state
  const [activeConnectorCat, setActiveConnectorCat] = useState<string>("vulnerability");
  const [connectorSubTab, setConnectorSubTab] = useState<"live" | "upload" | "sample">("live");
  const [csvContent, setCsvContent] = useState("");
  const [siemCritical, setSiemCritical] = useState(12);
  const [siemHigh, setSiemHigh] = useState(45);
  const [siemMedium, setSiemMedium] = useState(180);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // SEC assessment inputs
  const [secLoss, setSecLoss] = useState(2800000);
  const [secRecords, setSecRecords] = useState(145000);
  const [secResult, setSecResult] = useState<any>(null);

  // Invite user state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("analyst");
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = (localStorage.getItem("aegis_role") as Role) || "ciso";
    setCurrentRole(storedRole);
    setActiveRole(storedRole);

    if (storedRole === "analyst") setActiveTab("analyst");
    else if (storedRole === "auditor") setActiveTab("auditor");
    else if (storedRole === "admin") setActiveTab("admin");

    loadAllData();
  }, []);

  const loadAllData = async () => {
    setRecalculating(true);
    try {
      const [ov, fnd, ast, ctrl, conn, tp, aud, usr] = await Promise.all([
        api.getRiskOverview(),
        api.getFindings(),
        api.getAssets(),
        api.getControls(),
        api.getConnectors(),
        api.getThirdPartyRisk(),
        api.getAuditLogs(),
        api.getUsers(),
      ]);

      setOverview(ov);
      setFindings(fnd.findings || []);
      setAssets(ast.assets || []);
      setControls(ctrl.controls || []);
      setConnectors(conn.connectors || []);
      setThirdParty(tp);
      setAuditLogs(aud.logs || []);
      setUsers(usr.users || []);
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  };

  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    setActiveRole(newRole);
    localStorage.setItem("aegis_role", newRole);

    if (newRole === "analyst" && activeTab === "cockpit") setActiveTab("analyst");
    if (newRole === "auditor") setActiveTab("auditor");
    if (newRole === "admin") setActiveTab("admin");
    if (newRole === "ciso") setActiveTab("cockpit");
  };

  // What-if simulator recompute
  useEffect(() => {
    if (!overview) return;
    const baseEal = overview.portfolioEal || 1245000;
    const mfaReduction = (whatIfMfa - 50) * 8500;
    const edrReduction = (whatIfEdr - 50) * 6200;
    const surgeMultiplier = whatIfAiSurge ? 1.45 : 1.0;

    const projectedEal = Math.max(250000, (baseEal - mfaReduction - edrReduction) * surgeMultiplier);
    const delta = projectedEal - baseEal;

    setWhatIfResult({
      projectedEal: Math.round(projectedEal),
      deltaEal: Math.round(delta),
      deltaPercentage: Math.round((delta / baseEal) * 100),
      projectedVaR: Math.round(projectedEal * 3.8),
    });
  }, [whatIfMfa, whatIfEdr, whatIfAiSurge, overview]);

  const handleRemediate = async (findingId: string) => {
    try {
      await api.patchFinding(findingId);
      loadAllData();
    } catch (err: any) {
      alert(err.message || "Failed to remediate finding");
    }
  };

  const handleUploadCsv = async () => {
    if (!csvContent) return;
    try {
      const res = await api.uploadConnectorCsv({
        category: activeConnectorCat,
        csvData: csvContent,
      });
      setUploadSuccessMsg(`Successfully ingested ${res.ingestedCount} findings. Re-quantifying...`);
      setCsvContent("");
      loadAllData();
      setTimeout(() => setUploadSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to upload CSV");
    }
  };

  const handleSiemManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitSiemManualTelemetry({
        criticalIncidents: siemCritical,
        highIncidents: siemHigh,
        mediumIncidents: siemMedium,
      });
      setUploadSuccessMsg("SIEM monthly incident telemetry submitted. TEF updated.");
      loadAllData();
      setTimeout(() => setUploadSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || "Failed to submit telemetry");
    }
  };

  const handleSecAssessment = async () => {
    try {
      const res = await api.evaluateSecMateriality({
        financialLoss: secLoss,
        affectedRecords: secRecords,
        isProductionHalted: true,
      });
      setSecResult(res);
    } catch (err: any) {
      alert(err.message || "SEC evaluation failed");
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await api.inviteUser({ email: inviteEmail, role: inviteRole });
      setInviteMsg(`Invite sent to ${inviteEmail} as ${inviteRole}`);
      setInviteEmail("");
      loadAllData();
      setTimeout(() => setInviteMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to invite user");
    }
  };

  const formatCurrency = (val: number) => {
    if (val === undefined || val === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const metrics = overview || {
    portfolioEal: 1245000,
    var90: 3200000,
    var95: 4850000,
    var99: 8900000,
    worstCaseLoss: 14200000,
    dataConfidenceIndex: 0.88,
    activeAssetsCount: 42,
    openFindingsCount: 18,
  };

  const currentVaR =
    selectedConfidence === "90" ? metrics.var90 : selectedConfidence === "99" ? metrics.var99 : metrics.var95;

  const trendChartData = (overview?.history || []).map((h: any, idx: number) => ({
    name: `T-${(overview.history.length - idx) * 3}d`,
    eal: Math.round((h.portfolioEal / 1e6) * 100) / 100,
    var95: Math.round((h.var95 / 1e6) * 100) / 100,
  }));

  return (
    <div className="min-h-screen bg-[#E3FDFD] text-[#0C262D] flex flex-col selection:bg-[#71C9CE] selection:text-[#042F2E]">
      {/* Top Persistent Navigation & Persona Switcher */}
      <header className="border-b border-[#A6E3E9] bg-[#CBF1F5]/85 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 text-[#083344] font-extrabold text-lg">
              <div className="w-8 h-8 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] border border-[#A6E3E9] shadow-sm">
                <ShieldCheck className="w-4 h-4 text-[#042F2E]" />
              </div>
              <span className="text-[#0C262D]">AegisRisk AI</span>
            </Link>
            <span className="text-[#164E63]/40 font-mono">•</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#0C262D]">{org.name || "Acme CyberFin Corp"}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#71C9CE]/25 text-[#083344] border border-[#71C9CE] uppercase font-extrabold">
                {org.plan || "enterprise"}
              </span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* Active Palette Swatch Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#A6E3E9] text-[11px] font-mono shadow-sm" title="Aegis 4-Tone Color System">
              <div className="flex h-4.5 rounded overflow-hidden border border-[#A6E3E9]">
                <span className="w-3 h-4.5 bg-[#E3FDFD]" title="#E3FDFD (Ice Canvas)" />
                <span className="w-3 h-4.5 bg-[#CBF1F5]" title="#CBF1F5 (Frost Surface)" />
                <span className="w-3 h-4.5 bg-[#A6E3E9]" title="#A6E3E9 (Aqua Border)" />
                <span className="w-3 h-4.5 bg-[#71C9CE]" title="#71C9CE (Teal Accent)" />
              </div>
              <span className="text-[10px] text-[#083344] font-bold">4-Tone System</span>
            </div>

            {/* Live Data Confidence Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white border border-[#A6E3E9] text-xs font-mono shadow-sm">
              <span className="text-[#164E63] font-medium">Data Confidence:</span>
              <span className="text-[#083344] font-extrabold">{(metrics.dataConfidenceIndex * 100).toFixed(0)}%</span>
              <span className="text-[10px] text-[#164E63] font-semibold">(Live API)</span>
            </div>

            {/* Recalculate indicator */}
            <button
              onClick={loadAllData}
              disabled={recalculating}
              className="p-1.5 rounded-xl bg-white border border-[#A6E3E9] hover:border-[#71C9CE] hover:bg-[#E3FDFD] text-[#164E63] transition-all shadow-sm"
              title="Re-run continuous quantification"
            >
              <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin text-[#083344]" : ""}`} />
            </button>

            {/* Persona / Role Switcher Dropdown */}
            <div className="flex items-center space-x-2 pl-2 border-l border-[#A6E3E9]">
              <span className="text-xs text-[#164E63] font-mono font-bold">Active Role:</span>
              <select
                value={currentRole}
                onChange={(e) => handleRoleChange(e.target.value as Role)}
                className={`text-xs font-bold rounded-xl px-3 py-1.5 border focus:outline-none cursor-pointer shadow-sm ${
                  currentRole === "auditor"
                    ? "bg-purple-100 border-purple-300 text-purple-900"
                    : currentRole === "analyst"
                    ? "bg-white border-[#71C9CE] text-[#083344]"
                    : currentRole === "admin"
                    ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                    : "bg-[#71C9CE] border-[#71C9CE] text-[#042F2E]"
                }`}
              >
                <option value="ciso" className="bg-white text-[#0C262D]">CISO (Executive Cockpit)</option>
                <option value="analyst" className="bg-white text-[#0C262D]">Security Analyst (Queue)</option>
                <option value="auditor" className="bg-white text-[#0C262D]">Auditor (Read-Only)</option>
                <option value="admin" className="bg-white text-[#0C262D]">Admin (Connectors & Team)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workspace Tab Bar */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 border-t border-[#A6E3E9]/60 overflow-x-auto text-xs font-bold py-1">
          <button
            onClick={() => setActiveTab("cockpit")}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === "cockpit"
                ? "bg-[#71C9CE] text-[#042F2E] shadow-sm border border-[#71C9CE]"
                : "text-[#164E63] hover:text-[#0C262D] hover:bg-white/60"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive Cockpit (CISO)</span>
          </button>

          <button
            onClick={() => setActiveTab("analyst")}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === "analyst"
                ? "bg-[#71C9CE] text-[#042F2E] shadow-sm border border-[#71C9CE]"
                : "text-[#164E63] hover:text-[#0C262D] hover:bg-white/60"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Analyst Queue ({findings.filter((f) => !f.isPatched).length})</span>
          </button>

          <button
            onClick={() => setActiveTab("connectors")}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === "connectors"
                ? "bg-[#71C9CE] text-[#042F2E] shadow-sm border border-[#71C9CE]"
                : "text-[#164E63] hover:text-[#0C262D] hover:bg-white/60"
            }`}
          >
            <Plug className="w-3.5 h-3.5" />
            <span>Connect Tools (5 Categories)</span>
          </button>

          <button
            onClick={() => setActiveTab("auditor")}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === "auditor"
                ? "bg-purple-600 text-white shadow-sm border border-purple-600"
                : "text-[#164E63] hover:text-[#0C262D] hover:bg-white/60"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Regulatory & Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === "admin"
                ? "bg-emerald-600 text-white shadow-sm border border-emerald-600"
                : "text-[#164E63] hover:text-[#0C262D] hover:bg-white/60"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Admin & Team</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* ============================================================ */}
        {/* TAB 1: EXECUTIVE COCKPIT (CISO)                              */}
        {/* ============================================================ */}
        {activeTab === "cockpit" && (
          <div className="space-y-6">
            {/* Headline KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#CBF1F5] border-2 border-[#71C9CE] hover:shadow-md transition-all shadow-sm">
                <span className="text-xs font-mono font-bold text-[#083344] uppercase">Expected Annual Loss (EAL)</span>
                <div className="text-3xl font-black text-[#042F2E] mt-2">{formatCurrency(metrics.portfolioEal)}</div>
                <p className="text-xs text-[#164E63] mt-1 font-mono font-medium">FAIR: LEF × PLM across {metrics.activeAssetsCount} assets</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] hover:border-[#71C9CE] hover:shadow-md transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#083344] uppercase">Value at Risk (VaR)</span>
                  <div className="flex rounded-lg bg-white p-0.5 border border-[#A6E3E9] text-[10px] font-mono shadow-sm">
                    {(["90", "95", "99"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSelectedConfidence(lvl)}
                        className={`px-2 py-0.5 rounded-md ${selectedConfidence === lvl ? "bg-[#71C9CE] text-[#042F2E] font-bold" : "text-[#164E63]"}`}
                      >
                        {lvl}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-3xl font-black text-[#0C262D] mt-2">{formatCurrency(currentVaR)}</div>
                <p className="text-xs text-[#164E63] mt-1 font-mono font-medium">
                  {selectedConfidence}% Worst-case scenario (EVT tail jump)
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] hover:shadow-md transition-all shadow-sm">
                <span className="text-xs font-mono font-bold text-[#164E63] uppercase">Catastrophic Max Loss</span>
                <div className="text-3xl font-black text-rose-700 mt-2">{formatCurrency(metrics.worstCaseLoss)}</div>
                <p className="text-xs text-[#164E63] mt-1 font-mono font-medium">10,000-run Monte Carlo tail peak</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#CBF1F5] border-2 border-[#71C9CE] hover:shadow-md transition-all shadow-sm">
                <span className="text-xs font-mono font-bold text-[#083344] uppercase">Top Proposed Control ROSI</span>
                <div className="text-3xl font-black text-[#042F2E] mt-2">+150%</div>
                <p className="text-xs text-[#164E63] mt-1 font-mono font-medium">MFA Rollout: $300k EAL drop for $120k cost</p>
              </div>
            </div>

            {/* "What Changed Today and Why" Attribution Card */}
            <div className="p-5 rounded-2xl bg-white border-2 border-[#71C9CE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#083344]">
                  <Sparkles className="w-4 h-4 text-[#083344]" />
                  <span>Continuous Change Attribution ("What Changed & Why")</span>
                </div>
                <p className="text-sm text-[#0C262D] mt-1 font-semibold">
                  {overview?.changeAttribution?.summary ||
                    "EAL increased by $75,000 on asset Core Payment Gateway (API) primarily because Vulnerability moved from 0.55 to 0.65 due to active CISA KEV exploitation."}
                </p>
                <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-[#164E63]">
                  <span>Primary Driver: <strong className="text-[#083344]">{overview?.changeAttribution?.primaryDriver || "Vulnerability"}</strong></span>
                  <span>•</span>
                  <span>Provenance: <strong className="text-[#0C262D]">Tenable API + CISA KEV</strong></span>
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#CBF1F5] border border-[#71C9CE] text-[#083344] font-mono text-xs shrink-0 font-extrabold shadow-sm">
                Δ EAL: +{formatCurrency(overview?.changeAttribution?.deltaEal || 75000)}
              </div>
            </div>

            {/* Historical Risk Movement Chart */}
            <div className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0C262D]">Historical Financial Risk Trend Line</h3>
                  <p className="text-xs text-[#164E63]">Point-in-time EAL and 95% VaR movements across continuous re-calculations</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#083344]" />
                    <span className="text-[#083344] font-bold">EAL ($M)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#71C9CE]" />
                    <span className="text-[#164E63] font-bold">95% VaR ($M)</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full bg-white p-4 rounded-xl border border-[#A6E3E9]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData}>
                    <defs>
                      <linearGradient id="ealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#083344" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#083344" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="varGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#71C9CE" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#71C9CE" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#164E63" fontSize={11} />
                    <YAxis stroke="#164E63" fontSize={11} tickFormatter={(v) => `$${v}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#71C9CE", borderRadius: "8px", fontSize: "12px", color: "#0C262D" }}
                      formatter={(val: any) => [`$${val}M`, ""]}
                    />
                    <Area type="monotone" dataKey="var95" stroke="#71C9CE" fill="url(#varGrad)" strokeWidth={2} name="95% VaR" />
                    <Area type="monotone" dataKey="eal" stroke="#083344" fill="url(#ealGrad)" strokeWidth={2} name="EAL" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interactive "What-If" Control Simulator */}
            <div className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0C262D] flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#083344]" />
                    <span>Interactive "What-If" Control Investment Simulator</span>
                  </h3>
                  <p className="text-xs text-[#164E63]">
                    Adjust control parameters to recalculate projected EAL reductions and 95% VaR in real-time.
                  </p>
                </div>
                {whatIfResult && (
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-[#164E63] font-bold">Projected EAL Impact:</span>
                    <div className="text-sm font-mono font-extrabold text-[#083344]">
                      {formatCurrency(whatIfResult.deltaEal)} ({whatIfResult.deltaPercentage}%)
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="bg-white p-4 rounded-xl border border-[#A6E3E9]">
                  <div className="flex justify-between text-xs font-bold text-[#0C262D] mb-2">
                    <span>MFA Adoption Coverage</span>
                    <span className="font-mono text-[#083344]">{whatIfMfa}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={whatIfMfa}
                    onChange={(e) => setWhatIfMfa(Number(e.target.value))}
                    className="w-full accent-[#71C9CE] cursor-pointer"
                  />
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#A6E3E9]">
                  <div className="flex justify-between text-xs font-bold text-[#0C262D] mb-2">
                    <span>EDR Endpoint Coverage</span>
                    <span className="font-mono text-[#083344]">{whatIfEdr}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={whatIfEdr}
                    onChange={(e) => setWhatIfEdr(Number(e.target.value))}
                    className="w-full accent-[#71C9CE] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-[#A6E3E9]">
                  <div>
                    <span className="text-xs font-bold text-[#0C262D] block">AI Threat Surge</span>
                    <span className="text-[10px] text-[#164E63] font-medium">1.5x TEF adversary acceleration</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatIfAiSurge}
                    onChange={(e) => setWhatIfAiSurge(e.target.checked)}
                    className="w-4 h-4 accent-[#71C9CE] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Closed-Loop Deployed Control Tracker */}
            <div className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-[#0C262D] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#083344]" />
                <span>Closed-Loop Control Tracker (Predicted vs Observed Reality)</span>
              </h3>
              <p className="text-xs text-[#164E63]">
                Audits model veracity by comparing predicted loss reduction against telemetry drops post-deployment.
              </p>

              <div className="overflow-x-auto bg-white rounded-xl border border-[#A6E3E9] p-2">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#A6E3E9] text-[#164E63] font-mono text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Control Name</th>
                      <th className="py-2.5 px-2">Cost</th>
                      <th className="py-2.5 px-2">Predicted EAL Drop</th>
                      <th className="py-2.5 px-2">Observed EAL Drop</th>
                      <th className="py-2.5 px-2">Prediction Variance</th>
                      <th className="py-2.5 px-2">Model Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#A6E3E9]/40">
                    <tr className="hover:bg-[#CBF1F5]/30">
                      <td className="py-2.5 px-3 font-bold text-[#0C262D]">Enterprise Hardware Token MFA Rollout</td>
                      <td className="py-2.5 px-2 font-mono text-[#164E63]">$120,000</td>
                      <td className="py-2.5 px-2 font-mono text-[#083344] font-bold">$300,000</td>
                      <td className="py-2.5 px-2 font-mono text-[#083344] font-bold">$310,000</td>
                      <td className="py-2.5 px-2 font-mono text-emerald-700 font-semibold">+$10,000 (+3.3%)</td>
                      <td className="py-2.5 px-2 font-mono font-extrabold text-emerald-800">96.7%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ANALYST QUEUE (SECURITY ANALYST)                      */}
        {/* ============================================================ */}
        {activeTab === "analyst" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] shadow-sm">
              <div>
                <h2 className="text-base font-extrabold text-[#0C262D]">Live Vulnerability Finding Queue</h2>
                <p className="text-xs text-[#164E63] font-medium">
                  Prioritized by <strong>estimated financial loss ($)</strong> if unpatched, not just technical CVSS score.
                </p>
              </div>

              {currentRole === "auditor" && (
                <span className="px-3 py-1 rounded-xl bg-purple-100 border border-purple-300 text-purple-900 text-xs font-mono font-bold">
                  Auditor Mode: Remediate buttons disabled
                </span>
              )}
            </div>

            <div className="space-y-3">
              {findings.map((f) => (
                <div
                  key={f.id}
                  className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm ${
                    f.isPatched
                      ? "bg-slate-100/70 border-slate-300 opacity-60"
                      : "bg-white border-[#A6E3E9] hover:border-[#71C9CE] hover:shadow-md"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#0C262D]">{f.cve}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          f.severity === "Critical"
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : f.severity === "High"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-slate-100 text-slate-700 border border-slate-300"
                        }`}
                      >
                        {f.severity} (CVSS {f.cvssScore})
                      </span>
                      {f.inCisaKev && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-extrabold">
                          CISA KEV ACTIVE
                        </span>
                      )}
                      {f.isPatched && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                          REMEDIATED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#164E63] font-medium">{f.title}</p>
                    <div className="text-[11px] text-[#083344] font-mono font-semibold">Asset: {f.assetName}</div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[10px] text-[#164E63] font-mono uppercase font-bold block">Financial Loss Exposure</span>
                      <span className={`text-base font-black font-mono ${f.isPatched ? "text-slate-400" : "text-rose-700"}`}>
                        {formatCurrency(f.financialImpact)}
                      </span>
                    </div>

                    {!f.isPatched && (
                      <button
                        onClick={() => handleRemediate(f.id)}
                        disabled={currentRole === "auditor"}
                        className="px-3.5 py-1.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm border border-[#71C9CE]"
                      >
                        Remediate Finding
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* In-App Asset Register */}
            <div className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-[#0C262D] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#083344]" />
                <span>In-App Asset Register & Business Criticality Weights (Category C)</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assets.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-white border border-[#A6E3E9] hover:border-[#71C9CE] space-y-2 transition-all shadow-sm">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-[#0C262D]">{a.name}</h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#CBF1F5] text-[#083344] border border-[#A6E3E9] font-bold">
                        Criticality {(a.criticality * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="text-[11px] text-[#164E63]">Owner: {a.owner}</div>
                    <div className="text-[11px] text-[#083344] font-mono">
                      Costs: IR {formatCurrency(a.directCosts)} • Downtime {formatCurrency(a.indirectCosts)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CONNECT YOUR TOOLS (CONNECTORS HUB)                   */}
        {/* ============================================================ */}
        {activeTab === "connectors" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] shadow-sm">
              <h2 className="text-base font-extrabold text-[#0C262D]">Step 3 — Connect Your Security Tools</h2>
              <p className="text-xs text-[#164E63] mt-1 font-medium">
                For every data category below, connect via <strong>(a) Live API</strong>, <strong>(b) Manual CSV/JSON file upload</strong>, or <strong>(c) Sample benchmark data</strong>.
              </p>
            </div>

            {uploadSuccessMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {/* Connectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {connectors.map((c) => (
                <div
                  key={c.category}
                  onClick={() => setActiveConnectorCat(c.category)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${
                    activeConnectorCat === c.category
                      ? "bg-white border-2 border-[#71C9CE] shadow-md ring-2 ring-[#71C9CE]/30"
                      : "bg-[#CBF1F5] border-[#A6E3E9] hover:border-[#71C9CE]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0C262D]">{c.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-extrabold ${
                        c.mode === "live"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : c.mode === "manual"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}
                    >
                      {c.mode === "live" ? "LIVE API" : c.mode === "manual" ? "MANUAL FILE" : "SAMPLE DATA"}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#164E63] mt-2 font-medium">{c.details}</p>

                  <div className="mt-3 pt-2 border-t border-[#A6E3E9] flex justify-between text-[10px] font-mono text-[#083344] font-semibold">
                    <span>Confidence: {(c.confidence * 100).toFixed(0)}%</span>
                    <span>Records: {c.recordCount}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Connector Configuration Panel */}
            <div className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#A6E3E9]">
                <h3 className="text-sm font-bold text-[#0C262D] uppercase font-mono">
                  Configure Category: {activeConnectorCat.toUpperCase()}
                </h3>

                <div className="flex gap-2">
                  {(["live", "upload", "sample"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setConnectorSubTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                        connectorSubTab === tab ? "bg-[#71C9CE] text-[#042F2E] border border-[#71C9CE]" : "bg-white text-[#164E63] border border-[#A6E3E9] hover:bg-[#E3FDFD]"
                      }`}
                    >
                      {tab === "live" ? "Live API Feed" : tab === "upload" ? "Upload File (CSV/JSON)" : "Sample Data"}
                    </button>
                  ))}
                </div>
              </div>

              {/* SubTab 1: Live API */}
              {connectorSubTab === "live" && (
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-bold text-[#0C262D] mb-1">API Key / Bearer Token</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••••••••••••••••••"
                      disabled={currentRole === "auditor"}
                      className="w-full px-3 py-2 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D] focus:outline-none focus:border-[#71C9CE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0C262D] mb-1">API Query Endpoint URL</label>
                    <input
                      type="text"
                      placeholder="https://cloud.tenable.com/api/v2/findings"
                      disabled={currentRole === "auditor"}
                      className="w-full px-3 py-2 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D] focus:outline-none focus:border-[#71C9CE]"
                    />
                  </div>
                  <button
                    onClick={() =>
                      api.configureLiveConnector({ category: activeConnectorCat }).then(() => {
                        setUploadSuccessMsg("Live API connector configured.");
                        loadAllData();
                      })
                    }
                    disabled={currentRole === "auditor"}
                    className="px-4 py-2.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs disabled:opacity-40 shadow-md border border-[#71C9CE]"
                  >
                    Save & Test Connection
                  </button>
                </div>
              )}

              {/* SubTab 2: Manual Upload & Fallback */}
              {connectorSubTab === "upload" && (
                <div className="space-y-4">
                  {activeConnectorCat === "siem" ? (
                    <form onSubmit={handleSiemManualSubmit} className="space-y-3 max-w-xl">
                      <p className="text-xs text-[#164E63]">
                        For organizations without a dedicated SIEM: manually enter monthly security incident counts to estimate Threat Event Frequency (TEF).
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#0C262D] mb-1">Critical Incidents</label>
                          <input
                            type="number"
                            value={siemCritical}
                            onChange={(e) => setSiemCritical(Number(e.target.value))}
                            disabled={currentRole === "auditor"}
                            className="w-full p-2 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D] font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#0C262D] mb-1">High Severity</label>
                          <input
                            type="number"
                            value={siemHigh}
                            onChange={(e) => setSiemHigh(Number(e.target.value))}
                            disabled={currentRole === "auditor"}
                            className="w-full p-2 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D] font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#0C262D] mb-1">Medium Severity</label>
                          <input
                            type="number"
                            value={siemMedium}
                            onChange={(e) => setSiemMedium(Number(e.target.value))}
                            disabled={currentRole === "auditor"}
                            className="w-full p-2 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D] font-mono"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={currentRole === "auditor"}
                        className="px-4 py-2.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs disabled:opacity-40 border border-[#71C9CE]"
                      >
                        Recalculate TEF from Incidents
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-[#164E63]">
                        Paste scanner export CSV (columns: <code>asset, cve, severity, cvss, exploitability, isPatched</code>):
                      </p>
                      <textarea
                        rows={4}
                        value={csvContent}
                        onChange={(e) => setCsvContent(e.target.value)}
                        placeholder={`asset,cve,severity,cvss,exploitability,isPatched\npayment-api,CVE-2026-9921,Critical,9.8,0.85,false\ncustomer-db,CVE-2026-4412,High,8.4,0.60,false`}
                        disabled={currentRole === "auditor"}
                        className="w-full p-3 bg-white border border-[#A6E3E9] rounded-xl text-xs font-mono text-[#0C262D] focus:outline-none focus:border-[#71C9CE]"
                      />
                      <button
                        onClick={handleUploadCsv}
                        disabled={currentRole === "auditor" || !csvContent}
                        className="px-4 py-2.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs disabled:opacity-40 border border-[#71C9CE]"
                      >
                        Parse & Ingest CSV Findings
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SubTab 3: Sample Data */}
              {connectorSubTab === "sample" && (
                <div className="space-y-3">
                  <p className="text-xs text-[#164E63]">
                    Switch to calibrated SIH26105 benchmark sample telemetry to explore the platform before connecting production credentials.
                  </p>
                  <button
                    onClick={() =>
                      api.switchConnectorToSample(activeConnectorCat).then(() => {
                        setUploadSuccessMsg(`Switched ${activeConnectorCat} to Sample Data.`);
                        loadAllData();
                      })
                    }
                    disabled={currentRole === "auditor"}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#E3FDFD] text-[#083344] border border-[#71C9CE] text-xs font-extrabold disabled:opacity-40 shadow-sm"
                  >
                    Load Sample Benchmark Telemetry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: COMPLIANCE & AUDIT TRAIL (AUDITOR)                    */}
        {/* ============================================================ */}
        {activeTab === "auditor" && (
          <div className="space-y-6">
            {/* Read-Only Assurance Notice */}
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between text-xs shadow-sm">
              <div className="flex items-center gap-2 text-purple-900">
                <ShieldAlert className="w-4 h-4 text-purple-700" />
                <span>
                  <strong>Auditor Assurance Mode Active:</strong> Read-only access enforced. All write and state modification operations are blocked server-side.
                </span>
              </div>
              <span className="text-[10px] font-mono text-purple-800 uppercase font-extrabold">Read-Only</span>
            </div>

            {/* SEC Form 8-K Rule 106 4-Day Materiality Assessment */}
            <div className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0C262D] flex items-center gap-2">
                    <Scale className="w-4 h-4 text-purple-700" />
                    <span>SEC Rule 106 4-Day Materiality Assessment Tool</span>
                  </h3>
                  <p className="text-xs text-[#164E63]">
                    Determines whether an incident meets financial loss threshold ($1.5M+) to mandate SEC Form 8-K disclosure within 4 business days (96 hours).
                  </p>
                </div>

                <button
                  onClick={handleSecAssessment}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-sm"
                >
                  Evaluate Materiality
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0C262D] mb-1">Estimated Financial Loss ($)</label>
                  <input
                    type="number"
                    value={secLoss}
                    onChange={(e) => setSecLoss(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0C262D] mb-1">Customer Records Exposed</label>
                  <input
                    type="number"
                    value={secRecords}
                    onChange={(e) => setSecRecords(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D] font-mono"
                  />
                </div>
              </div>

              {secResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1 shadow-sm ${
                    secResult.isMaterial
                      ? "bg-rose-50 border-rose-300 text-rose-900"
                      : "bg-emerald-50 border-emerald-300 text-emerald-900"
                  }`}
                >
                  <div className="font-extrabold font-mono">
                    Status: {secResult.isMaterial ? "MATERIAL CYBERSECURITY INCIDENT" : "NON-MATERIAL INCIDENT"}
                  </div>
                  <p className="font-medium">{secResult.recommendation}</p>
                  <p className="text-[11px] text-[#164E63] italic mt-1">{secResult.regulatoryDisclaimers}</p>
                </div>
              )}
            </div>

            {/* DORA Concentration Risk (Third-Party SPoF) */}
            {thirdParty && (
              <div className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-3 shadow-sm">
                <h3 className="text-sm font-extrabold text-[#0C262D]">DORA Article 16 Third-Party Concentration Risk</h3>
                <p className="text-xs text-[#164E63]">
                  Accounts for single points of failure across suppliers sharing identical cloud and IAM infrastructure.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-3.5 bg-white rounded-xl border border-[#A6E3E9] shadow-sm">
                    <span className="text-[#164E63] block text-[10px] font-bold">Independent Sum</span>
                    <span className="text-[#0C262D] font-black text-sm">{formatCurrency(thirdParty.accumulation.independentTotal)}</span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-rose-200 shadow-sm">
                    <span className="text-rose-700 block text-[10px] font-bold">SPoF Correlation Surcharge (+15%)</span>
                    <span className="text-rose-700 font-black text-sm">+{formatCurrency(thirdParty.accumulation.correlationSurcharge)}</span>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border-2 border-[#71C9CE] shadow-sm">
                    <span className="text-[#083344] block text-[10px] font-bold">Combined Correlated VaR</span>
                    <span className="text-[#083344] font-black text-sm">{formatCurrency(thirdParty.accumulation.combinedVar)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Immutable Audit Log */}
            <div className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-4 shadow-sm">
              <h3 className="text-sm font-extrabold text-[#0C262D]">Cryptographically Signed Audit Log</h3>
              <div className="space-y-2">
                {auditLogs.map((a) => (
                  <div key={a.id} className="p-3.5 bg-white rounded-xl border border-[#A6E3E9] text-xs space-y-1 shadow-sm">
                    <div className="flex justify-between items-center text-[#164E63] text-[11px] font-mono">
                      <span>{new Date(a.timestamp).toLocaleString()}</span>
                      <span className="uppercase text-purple-800 font-extrabold">{a.actorRole} • {a.actor}</span>
                    </div>
                    <div className="font-bold text-[#0C262D]">{a.action}</div>
                    <p className="text-[#164E63]">{a.details}</p>
                    <div className="flex gap-1.5 pt-1">
                      {a.regulatoryFrameworks.map((f: string) => (
                        <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#CBF1F5] text-[#083344] border border-[#A6E3E9] font-bold">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: ADMIN & TEAM MANAGEMENT                               */}
        {/* ============================================================ */}
        {activeTab === "admin" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] shadow-sm">
              <h2 className="text-base font-extrabold text-[#0C262D]">Step 2 — Invite Teammates & Assign Roles</h2>
              <p className="text-xs text-[#164E63] mt-1 font-medium">
                Assign teammates to one of four isolated roles: Admin, CISO, Security Analyst, or Compliance Auditor.
              </p>
            </div>

            {inviteMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-sm">
                {inviteMsg}
              </div>
            )}

            {/* Invite Form */}
            <form onSubmit={handleInviteUser} className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-4 max-w-xl shadow-sm">
              <h3 className="text-sm font-bold text-[#0C262D]">Invite New Team Member</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0C262D] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0C262D] mb-1">Assign Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Role)}
                    className="w-full p-2.5 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D] font-semibold"
                  >
                    <option value="ciso">CISO (Executive Cockpit)</option>
                    <option value="analyst">Security Analyst (Queue)</option>
                    <option value="auditor">Compliance Auditor (Read-Only)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs shadow-md border border-[#71C9CE]"
              >
                Send Workspace Invite
              </button>
            </form>

            {/* Existing Users Table */}
            <div className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-[#0C262D]">Current Organization Members</h3>
              <div className="overflow-x-auto bg-white rounded-xl border border-[#A6E3E9] p-2">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#A6E3E9] text-[#164E63] font-mono text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Email</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#A6E3E9]/40">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#CBF1F5]/30">
                        <td className="py-2.5 px-3 font-bold text-[#0C262D]">{u.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[#164E63]">{u.email}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                              u.role === "admin"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : u.role === "ciso"
                                ? "bg-[#71C9CE]/25 text-[#083344] border border-[#71C9CE]"
                                : u.role === "analyst"
                                ? "bg-[#CBF1F5] text-[#0C262D] border border-[#A6E3E9]"
                                : "bg-purple-100 text-purple-800 border border-purple-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#164E63]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
