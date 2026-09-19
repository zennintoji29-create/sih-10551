"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Terminal,
  LogOut,
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
  X,
  Zap,
  Activity,
  Layers,
  MapPin,
  Compass,
  Check,
  Eye,
  Shield,
  ArrowDownRight,
  Crosshair,
  Filter,
  ArrowUpDown,
  Radio,
  FileText,
  Database,
  Network,
  Flame,
  Search,
  Code,
  Clock,
  ExternalLink,
  ShieldOff,
  Cpu,
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
type MapTab = "failure" | "alert" | "log" | "solution";

export default function DashboardPage() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<Role>("ciso");
  const [currentUser, setCurrentUser] = useState<any>(null);
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

  // Root-cause failure & loss map modal state
  const [showFailureMapModal, setShowFailureMapModal] = useState(false);
  const [failureMapMode, setFailureMapMode] = useState<MapTab>("failure");
  const [selectedPointLabel, setSelectedPointLabel] = useState("T-0 (Current Incident)");
  const [solutionApplied, setSolutionApplied] = useState(false);
  const [activeAlertId, setActiveAlertId] = useState<string>("ALT-9041");
  const [logFilter, setLogFilter] = useState<"all" | "vpc" | "auth" | "iam" | "db">("all");

  // Analyst view sorting & filtering
  const [analystSortBy, setAnalystSortBy] = useState<"financialImpact" | "cvss">("financialImpact");
  const [analystFilter, setAnalystFilter] = useState<"all" | "open" | "remediated">("all");

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
    const token = typeof window !== "undefined" ? localStorage.getItem("aegis_token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    const storedRole = (localStorage.getItem("aegis_role") as Role) || "ciso";
    const storedUserStr = typeof window !== "undefined" ? localStorage.getItem("aegis_user") : null;
    if (storedUserStr) {
      try {
        const u = JSON.parse(storedUserStr);
        setCurrentUser(u);
      } catch (e) {}
    }
    setCurrentRole(storedRole);
    setActiveRole(storedRole);

    if (storedRole === "analyst") setActiveTab("analyst");
    else if (storedRole === "auditor") setActiveTab("auditor");
    else if (storedRole === "admin") setActiveTab("admin");
    else setActiveTab("cockpit");

    loadAllData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("aegis_token");
    localStorage.removeItem("aegis_role");
    localStorage.removeItem("aegis_user");
    localStorage.removeItem("aegis_org");
    router.push("/login");
  };

  const userInitials = currentUser?.name
    ? currentUser.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : currentRole === "ciso" ? "DC" : currentRole === "analyst" ? "MB" : currentRole === "auditor" ? "ER" : "SV";

  const userDisplayName = currentUser?.name || (
    currentRole === "ciso" ? "David Chen" :
    currentRole === "analyst" ? "Marcus Brody" :
    currentRole === "auditor" ? "Elena Rostova" : "Sarah Vance"
  );

  const userRoleTitle = currentRole === "ciso" ? "Chief Information Security Officer" :
    currentRole === "analyst" ? "Lead Security Analyst" :
    currentRole === "auditor" ? "Compliance Auditor" : "Organization Administrator";

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
      if (ov?.organization) {
        setOrg(ov.organization);
      }
      setFindings(fnd.findings || []);
      setAssets(ast.assets || []);
      setControls(ctrl.controls || []);
      setConnectors(conn.connectors || []);
      setThirdParty(tp);
      setAuditLogs(aud.auditLogs || aud.logs || []);
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

    if (newRole === "analyst") setActiveTab("analyst");
    else if (newRole === "auditor") setActiveTab("auditor");
    else if (newRole === "admin") setActiveTab("admin");
    else if (newRole === "ciso") setActiveTab("cockpit");
  };


  // What-if simulator recompute with live backend quantification & smooth fallback
  useEffect(() => {
    let isMounted = true;
    const compute = async () => {
      try {
        const res = await api.runWhatIf({
          mfaRolloutPct: whatIfMfa,
          edrCoveragePct: whatIfEdr,
          aiThreatSurge: whatIfAiSurge,
        });
        if (isMounted) {
          setWhatIfResult({
            projectedEal: res.simulatedEal,
            deltaEal: res.deltaEal,
            deltaPercentage: res.deltaPercentage,
            projectedVaR: res.simulatedVar95,
          });
        }
      } catch {
        const baseEal = overview?.metrics?.portfolioEal || 1245000;
        const mfaReduction = (whatIfMfa - 50) * 8500;
        const edrReduction = (whatIfEdr - 50) * 6200;
        const surgeMultiplier = whatIfAiSurge ? 1.45 : 1.0;

        const projectedEal = Math.max(250000, (baseEal - mfaReduction - edrReduction) * surgeMultiplier);
        const delta = projectedEal - baseEal;

        if (isMounted) {
          setWhatIfResult({
            projectedEal: Math.round(projectedEal),
            deltaEal: Math.round(delta),
            deltaPercentage: Math.round((delta / baseEal) * 100),
            projectedVaR: Math.round(projectedEal * 3.8),
          });
        }
      }
    };
    compute();
    return () => {
      isMounted = false;
    };
  }, [whatIfMfa, whatIfEdr, whatIfAiSurge, overview]);

  const handleRemediate = async (findingId: string) => {
    try {
      await api.remediateFinding(findingId);
      await loadAllData();
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
      setUploadSuccessMsg(`Successfully ingested ${res.ingestedCount ?? res.recordsIngested ?? 0} findings. Re-quantifying...`);
      setCsvContent("");
      await loadAllData();
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
      await loadAllData();
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
      await loadAllData();
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

  const metrics = overview?.metrics || {
    portfolioEal: 1245000,
    var90: 3200000,
    var95: 4850000,
    var99: 8900000,
    worstCaseLoss: 14200000,
    dataConfidenceIndex: 0.88,
    activeAssetsCount: 42,
    activeFindingsCount: 18,
  };

  const currentVaR =
    selectedConfidence === "90" ? metrics.var90 : selectedConfidence === "99" ? metrics.var99 : metrics.var95;

  const trendChartData = (overview?.history || []).map((h: any, idx: number) => {
    const dayLabels = ["T-18d", "T-15d", "T-9d", "T-6d", "T-3d"];
    const dayLabel = dayLabels[idx] || `T-${(5 - idx) * 3}d`;
    let incident: any = null;

    if (idx === 0) {
      incident = {
        type: "alert" as const,
        label: "🚨 Threat Alert ALT-9041: Pre-Auth RCE Infiltration",
        desc: "CVE-2024-55591 signature detected on Bastion Ingress (Akira Syndicate)",
        badge: "THREAT ALERT",
        color: "#E11D48",
      };
    } else if (idx === 1) {
      incident = {
        type: "failure" as const,
        label: "⚠️ System Failure: Blast Radius Spike ($27.3M)",
        desc: "Missing Hardware MFA + Permissive Cross-VPC Peering cascade",
        badge: "SYSTEM FAILURE",
        color: "#EA580C",
      };
    } else if (idx === 2) {
      incident = {
        type: "log" as const,
        label: "📋 SIEM Log: Lateral VPC Data Exfiltration",
        desc: "4.2 GB PostgreSQL dump to unauthorized drop IP 185.220.101.5",
        badge: "LOG ANOMALY",
        color: "#0284C7",
      };
    } else if (idx === 4) {
      incident = {
        type: "solution" as const,
        label: "✨ Simulated Defense: Virtual Patch & Standby",
        desc: "Optimal architecture cuts loss from $2.55M to $15k (-99.4%)",
        badge: "OPTIMAL FIX",
        color: "#059669",
      };
    }

    return {
      name: dayLabel,
      eal: Math.round((h.portfolioEal / 1e6) * 100) / 100,
      var95: Math.round((h.var95 / 1e6) * 100) / 100,
      incident,
    };
  });

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

            {/* Authenticated Corporate User Profile & Sign Out */}
            <div className="flex items-center space-x-3 pl-3 border-l border-[#A6E3E9]">
              <div className="w-8 h-8 rounded-xl bg-[#71C9CE] text-[#042F2E] font-black text-xs flex items-center justify-center border border-[#A6E3E9] shadow-sm">
                {userInitials}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-extrabold text-[#0C262D] leading-tight">
                  {userDisplayName}
                </div>
                <div className="text-[10px] font-mono text-[#164E63] font-bold">
                  {userRoleTitle}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-[#164E63] text-xs font-mono font-bold border border-[#A6E3E9] transition-all flex items-center gap-1 shadow-sm"
                title="Sign Out of Corporate Session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Workspace Tab Bar - Strictly Filtered to Authorized Role */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 border-t border-[#A6E3E9]/60 overflow-x-auto text-xs font-bold py-1">
          {currentRole === "ciso" && (
            <>
              <button
                onClick={() => setActiveTab("cockpit")}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === "cockpit"
                    ? "bg-[#71C9CE] text-[#042F2E] shadow-sm border border-[#71C9CE]"
                    : "text-[#164E63] hover:text-[#0C262D] hover:bg-white/60"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Executive Risk Cockpit</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("cockpit");
                  const el = document.getElementById("what-if-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-2 rounded-lg flex items-center gap-1.5 text-[#164E63] hover:text-[#0C262D] hover:bg-white/60 transition-all"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>What-If ROSI Simulator</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("cockpit");
                  const el = document.getElementById("closed-loop-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-2 rounded-lg flex items-center gap-1.5 text-[#164E63] hover:text-[#0C262D] hover:bg-white/60 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Closed-Loop Model Assurance</span>
              </button>
            </>
          )}

          {currentRole === "analyst" && (
            <>
              <button
                onClick={() => setActiveTab("analyst")}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === "analyst"
                    ? "bg-[#71C9CE] text-[#042F2E] shadow-sm border border-[#71C9CE]"
                    : "text-[#164E63] hover:text-[#0C262D] hover:bg-white/60"
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Vulnerability Triage Queue ({findings.filter((f) => !f.isPatched).length})</span>
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
                <span>Telemetry Ingestion & Scanners</span>
              </button>
            </>
          )}

          {currentRole === "auditor" && (
            <button
              onClick={() => setActiveTab("auditor")}
              className="px-3 py-2 rounded-lg flex items-center gap-1.5 bg-purple-600 text-white shadow-sm border border-purple-600 font-bold"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Regulatory Assurance & Cryptographic Audit Logs (SEC 8-K / DORA)</span>
            </button>
          )}

          {currentRole === "admin" && (
            <>
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === "admin"
                    ? "bg-emerald-600 text-white shadow-sm border border-emerald-600"
                    : "text-[#164E63] hover:text-[#0C262D] hover:bg-white/60"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Tenant Administration & RBAC</span>
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
                <span>Connect Security Tools</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Real Corporate Executive Banner (No Demo Switchers) */}
        <div className="p-5 rounded-2xl bg-[#CBF1F5] border-2 border-[#71C9CE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] font-black shrink-0 border border-[#A6E3E9] shadow-sm">
              {currentRole === "ciso" && <BarChart3 className="w-5 h-5" />}
              {currentRole === "analyst" && <Terminal className="w-5 h-5" />}
              {currentRole === "auditor" && <Scale className="w-5 h-5" />}
              {currentRole === "admin" && <Settings className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#0C262D]">
                  {currentRole === "ciso" && "Executive Risk & Capital Allocation Cockpit"}
                  {currentRole === "analyst" && "Vulnerability Risk Prioritization & Triage"}
                  {currentRole === "auditor" && "Independent Regulatory Assurance & Cryptographic Audit"}
                  {currentRole === "admin" && "Enterprise Tenant Administration & Security Connectors"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-extrabold bg-white text-[#083344] border border-[#71C9CE]">
                  SOC2 TYPE II • LIVE
                </span>
              </div>
              <p className="text-xs text-[#164E63] mt-1 font-medium">
                {currentRole === "ciso" && "Real-time OpenFAIR quantification, 95% tail VaR, and root-cause failure blast radius modeling for Acme CyberFin Corp."}
                {currentRole === "analyst" && "Tactical vulnerability triage prioritized by financial loss ($), active CISA KEV exploitation, asset criticality weights, and 1-click remediation."}
                {currentRole === "auditor" && "Independent compliance assurance. SEC Form 8-K Item 1.05 4-Day materiality evaluation, DORA Art. 16 concentration risk, and cryptographic audit log."}
                {currentRole === "admin" && "Configure live API connectors, ingest manual CSV/SIEM telemetry feeds, and manage organization teammates and RBAC roles."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-white border border-[#A6E3E9] text-[11px] font-mono text-[#083344] font-bold shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Pipeline Active</span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: EXECUTIVE COCKPIT (CISO)                              */}
        {/* ============================================================ */}
        {activeTab === "cockpit" && (currentRole === "ciso" || currentRole === "admin") && (
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

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setSelectedPointLabel("T-0 (Current Incident: Core Payment Gateway Spike)");
                    setFailureMapMode("failure");
                    setShowFailureMapModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs transition-all shadow-sm flex items-center gap-1.5 border border-[#71C9CE]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Blast Radius Map</span>
                </button>
                <div className="px-3.5 py-2 rounded-xl bg-[#CBF1F5] border border-[#71C9CE] text-[#083344] font-mono text-xs font-extrabold shadow-sm">
                  Δ EAL: +{formatCurrency(overview?.changeAttribution?.deltaEal || 75000)}
                </div>
              </div>
            </div>

            {/* Historical Risk Movement Chart */}
            <div className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0C262D] flex items-center gap-2">
                    <span>Historical Financial Risk Trend Line</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#71C9CE]/30 text-[#083344] font-bold">
                      Interactive Drilldown
                    </span>
                  </h3>
                  <p className="text-xs text-[#164E63]">Point-in-time EAL and 95% VaR movements across continuous re-calculations</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 text-xs font-mono mr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#083344]" />
                      <span className="text-[#083344] font-bold">EAL ($M)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#71C9CE]" />
                      <span className="text-[#164E63] font-bold">95% VaR ($M)</span>
                    </div>
                  </div>

                  {/* Interactive Map Category Quick Switchers */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-[#A6E3E9] shadow-sm">
                    <button
                      onClick={() => {
                        setSelectedPointLabel("T-18d (Security Alert: CVE-2024-55591 Pre-Auth RCE)");
                        setFailureMapMode("alert");
                        setShowFailureMapModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
                      title="View Threat Alert Map"
                    >
                      <Zap className="w-3 h-3 text-amber-700" />
                      <span>Alerts (ALT-9041)</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPointLabel("T-15d (System Architecture Failure & Blast Radius)");
                        setFailureMapMode("failure");
                        setShowFailureMapModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
                      title="View System Failure & Blast Radius Map"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-700" />
                      <span>Failure Map (3 Breakdowns)</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPointLabel("T-9d (Forensic SIEM Log Activity & Audit Trace)");
                        setFailureMapMode("log");
                        setShowFailureMapModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-[11px] font-mono font-bold flex items-center gap-1 transition-all"
                      title="View Log Activity & Audit Map"
                    >
                      <Terminal className="w-3 h-3 text-sky-700" />
                      <span>Logs (5 Events)</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPointLabel("T-3d (Simulated Optimal Security Architecture)");
                        setFailureMapMode("solution");
                        setShowFailureMapModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] text-[11px] font-mono font-black flex items-center gap-1 transition-all shadow-sm"
                      title="Simulate Optimal Solution"
                    >
                      <Sparkles className="w-3 h-3 text-[#042F2E]" />
                      <span>Simulate Fix (-99.4%)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Canvas with Interactive Clickable Graph Points */}
              <div className="h-64 w-full bg-white p-4 rounded-xl border border-[#A6E3E9] transition-all relative">
                <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-[#083344] text-white text-[10px] font-mono font-bold shadow-md flex items-center gap-1.5 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-[#71C9CE] animate-ping" />
                  <span>Click individual pins (Alert, Failure, Log, Fix) on the curve to inspect</span>
                </div>
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
                      content={({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          const inc = d.incident;
                          return (
                            <div className="bg-[#0C262D] text-white p-3 rounded-xl border-2 border-[#71C9CE] shadow-2xl text-xs max-w-xs space-y-1.5 font-mono">
                              <div className="flex items-center justify-between border-b border-[#71C9CE]/40 pb-1">
                                <span className="font-extrabold text-[#71C9CE] text-sm">{d.name}</span>
                                <span className="text-[10px] text-[#A6E3E9] uppercase font-bold">OpenFAIR Quant</span>
                              </div>
                              <div className="flex justify-between gap-4 text-[11px]">
                                <span className="text-gray-300">Expected Annual Loss:</span>
                                <span className="font-extrabold text-white">${d.eal}M</span>
                              </div>
                              <div className="flex justify-between gap-4 text-[11px]">
                                <span className="text-gray-300">95% Value at Risk:</span>
                                <span className="font-extrabold text-[#71C9CE]">${d.var95}M</span>
                              </div>
                              {inc && (
                                <div className="pt-2 border-t border-white/20 space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: inc.color }} />
                                    <span className="text-[11px] font-black" style={{ color: inc.color }}>
                                      {inc.label}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-300 font-sans leading-tight">{inc.desc}</p>
                                  <div className="text-[10px] text-[#71C9CE] font-bold underline cursor-pointer pt-1">
                                    👉 Click to expand {inc.badge} Map & Simulation
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="var95"
                      stroke="#71C9CE"
                      fill="url(#varGrad)"
                      strokeWidth={2.5}
                      name="95% VaR"
                      dot={(props: any) => {
                        const { cx, cy, payload, index } = props;
                        if (!payload?.incident) return <g key={`dot-empty-${payload?.name}`} />;
                        const inc = payload.incident;
                        const isLast = index === trendChartData.length - 1;
                        const isFirst = index === 0;
                        const badgeOffsetX = isLast ? cx - 74 : isFirst ? cx - 4 : cx - 36;
                        return (
                          <g
                            key={`inc-dot-${payload.name}`}
                            className="cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPointLabel(`${payload.name}: ${inc.label}`);
                              setFailureMapMode(inc.type);
                              setShowFailureMapModal(true);
                            }}
                          >
                            {/* Generous Clickable Hit Target */}
                            <circle cx={cx} cy={cy} r={22} fill="transparent" />

                            {/* Pulsing Radar Ring */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={12}
                              fill="none"
                              stroke={inc.color}
                              strokeWidth={2}
                              className="animate-ping opacity-75"
                            />

                            {/* Solid Marker Node */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={8}
                              fill={inc.color}
                              stroke="#ffffff"
                              strokeWidth={2.5}
                              className="shadow-lg"
                            />

                            {/* Inner Dot */}
                            <circle cx={cx} cy={cy} r={3} fill="#ffffff" />

                            {/* Interactive Floating Badge Tag */}
                            <g transform={`translate(${badgeOffsetX}, ${cy - 26})`}>
                              <rect
                                width={72}
                                height={18}
                                rx={9}
                                fill="#0C262D"
                                stroke={inc.color}
                                strokeWidth={1.5}
                                className="shadow-md"
                              />
                              <text
                                x={36}
                                y={12}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={9}
                                fontFamily="monospace"
                                fontWeight="bold"
                              >
                                {inc.badge}
                              </text>
                            </g>
                          </g>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="eal"
                      stroke="#083344"
                      fill="url(#ealGrad)"
                      strokeWidth={2.5}
                      name="EAL"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Interactive Timeline Event Drilldown Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#A6E3E9]/60">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#164E63] font-bold">
                  <Compass className="w-3.5 h-3.5 text-[#083344]" />
                  <span>Click timeline point to expand interactive architecture & attack map:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedPointLabel("T-18d (Security Alert: CVE-2024-55591 Pre-Auth RCE)");
                      setFailureMapMode("alert");
                      setShowFailureMapModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                    <span>📍 T-18d | ⚡ Threat Alert: Pre-Auth RCE</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPointLabel("T-15d (System Failure: SPoF & Blast Radius Spike to $27.3M)");
                      setFailureMapMode("failure");
                      setShowFailureMapModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <span>📍 T-15d | 🚨 System Failure ($27.3M Spike)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPointLabel("T-9d (SIEM Forensic Log Activity: Lateral Exfiltration)");
                      setFailureMapMode("log");
                      setShowFailureMapModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-900 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                    <span>📍 T-9d | 📋 SIEM Log: Lateral Exfil (4.2GB)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPointLabel("T-3d (Simulated Optimal Solution Architecture)");
                      setFailureMapMode("solution");
                      setShowFailureMapModal(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>📍 T-3d | ✨ Simulate Optimal Fix (-99.4%)</span>
                  </button>
                </div>
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
        {activeTab === "analyst" && (currentRole === "analyst" || currentRole === "admin") && (
          <div className="space-y-6">
            {/* Analyst Tactical KPI Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#164E63]">Total Triage Exposure</span>
                <div className="text-2xl font-black text-rose-700 mt-1">
                  {formatCurrency(findings.filter((f) => !f.isPatched).reduce((s, f) => s + (f.financialImpact || 0), 0))}
                </div>
                <p className="text-[11px] text-[#164E63] mt-0.5 font-medium">Unpatched loss exposure across active assets</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#CBF1F5] border-2 border-[#71C9CE] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#083344]">CISA KEV Actively Exploited</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="text-2xl font-black text-[#042F2E] mt-1">
                  {findings.filter((f) => !f.isPatched && f.inCisaKev).length} Critical CVEs
                </div>
                <p className="text-[11px] text-[#164E63] mt-0.5 font-medium">Known Exploited Vulnerabilities catalog</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#164E63]">Priority Asset at Risk</span>
                <div className="text-base font-extrabold text-[#0C262D] mt-1 truncate">Core Payment Gateway</div>
                <p className="text-[11px] text-[#164E63] mt-0.5 font-medium">95% Criticality • Direct PII linkage</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] shadow-sm">
                <span className="text-[10px] font-mono uppercase font-bold text-[#164E63]">Model Remediation MTTR</span>
                <div className="text-2xl font-black text-emerald-800 mt-1">3.4 Days</div>
                <p className="text-[11px] text-[#164E63] mt-0.5 font-medium">Continuous telemetry feedback loop</p>
              </div>
            </div>

            {/* Analyst Controls & Sort Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] shadow-sm">
              <div>
                <h2 className="text-base font-extrabold text-[#0C262D] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#083344]" />
                  <span>Vulnerability Finding & Triage Queue</span>
                </h2>
                <p className="text-xs text-[#164E63] font-medium mt-0.5">
                  Financial Exposure ($) prioritizes by actual potential business loss rather than arbitrary technical CVSS score alone.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sort Option Toggle */}
                <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#A6E3E9] text-xs font-mono shadow-sm">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#164E63] ml-1.5" />
                  <span className="text-[10px] text-[#164E63] font-bold">Sort:</span>
                  <button
                    onClick={() => setAnalystSortBy("financialImpact")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      analystSortBy === "financialImpact"
                        ? "bg-[#71C9CE] text-[#042F2E]"
                        : "text-[#164E63] hover:text-[#0C262D]"
                    }`}
                  >
                    Financial Loss ($)
                  </button>
                  <button
                    onClick={() => setAnalystSortBy("cvss")}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      analystSortBy === "cvss"
                        ? "bg-[#71C9CE] text-[#042F2E]"
                        : "text-[#164E63] hover:text-[#0C262D]"
                    }`}
                  >
                    CVSS Score
                  </button>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#A6E3E9] text-xs font-mono shadow-sm">
                  <Filter className="w-3 h-3 text-[#164E63] ml-1.5" />
                  {(["all", "open", "remediated"] as const).map((fil) => (
                    <button
                      key={fil}
                      onClick={() => setAnalystFilter(fil)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        analystFilter === fil ? "bg-[#71C9CE] text-[#042F2E]" : "text-[#164E63] hover:text-[#0C262D]"
                      }`}
                    >
                      {fil}
                    </button>
                  ))}
                </div>

                {currentRole === "auditor" && (
                  <span className="px-3 py-1 rounded-xl bg-purple-100 border border-purple-300 text-purple-900 text-xs font-mono font-bold">
                    Auditor Mode: Read-Only
                  </span>
                )}
              </div>
            </div>

            {/* Findings Cards */}
            <div className="space-y-3">
              {[...findings]
                .filter((f) => {
                  if (analystFilter === "open") return !f.isPatched;
                  if (analystFilter === "remediated") return f.isPatched;
                  return true;
                })
                .sort((a, b) => {
                  if (analystSortBy === "cvss") return b.cvssScore - a.cvssScore;
                  return (b.financialImpact || 0) - (a.financialImpact || 0);
                })
                .map((f) => (
                  <div
                    key={f.id}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm ${
                      f.isPatched
                        ? "bg-slate-100/70 border-slate-300 opacity-60"
                        : "bg-white border-[#A6E3E9] hover:border-[#71C9CE] hover:shadow-md"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center flex-wrap gap-2">
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
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                            <span>CISA KEV ACTIVE</span>
                          </span>
                        )}
                        {f.isPatched && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                            REMEDIATED & VERIFIED
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#164E63] px-2 py-0.5 rounded bg-[#CBF1F5] border border-[#A6E3E9]">
                          Exploitability: {(f.exploitability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-[#164E63] font-medium">{f.title}</p>
                      <div className="flex items-center gap-3 text-[11px] text-[#083344] font-mono font-semibold">
                        <span>Target Asset: <strong>{f.assetName}</strong></span>
                        <span>•</span>
                        <span>Source: <strong className="text-[#164E63]">{f.sourceMode === "live" ? "Tenable Live API" : "Benchmark Ingestion"}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#164E63] font-mono uppercase font-bold block">Financial Loss Exposure</span>
                        <span className={`text-lg font-black font-mono ${f.isPatched ? "text-slate-400" : "text-rose-700"}`}>
                          {formatCurrency(f.financialImpact)}
                        </span>
                      </div>

                      {!f.isPatched && (
                        <button
                          onClick={() => handleRemediate(f.id)}
                          disabled={currentRole === "auditor"}
                          className="px-4 py-2 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm border border-[#71C9CE] flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Remediate Finding</span>
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
        {activeTab === "connectors" && (currentRole === "analyst" || currentRole === "admin") && (
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
                    onClick={async () => {
                      try {
                        await api.configureLiveConnector({ category: activeConnectorCat });
                        setUploadSuccessMsg("Live API connector configured.");
                        await loadAllData();
                        setTimeout(() => setUploadSuccessMsg(null), 5000);
                      } catch (err: any) {
                        alert(err.message || "Failed to configure live connector");
                      }
                    }}
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
                    onClick={async () => {
                      try {
                        await api.switchConnectorToSample(activeConnectorCat);
                        setUploadSuccessMsg(`Switched ${activeConnectorCat} to Sample Data.`);
                        await loadAllData();
                        setTimeout(() => setUploadSuccessMsg(null), 5000);
                      } catch (err: any) {
                        alert(err.message || "Failed to load sample data");
                      }
                    }}
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
        {activeTab === "auditor" && (currentRole === "auditor" || currentRole === "admin") && (
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
        {activeTab === "admin" && currentRole === "admin" && (
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
                        <td className="py-2.5 px-3 font-mono text-[#164E63]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* INTERACTIVE SYSTEM FAILURE & LOSS BLAST RADIUS MAP MODAL     */}
        {/* ============================================================ */}
        {showFailureMapModal && (
          <div className="fixed inset-0 z-50 bg-[#0C262D]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#E3FDFD] border-2 border-[#71C9CE] rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Top Bar */}
              <div className="p-5 bg-[#CBF1F5] border-b border-[#A6E3E9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] font-black border border-[#A6E3E9] shadow-sm">
                      {failureMapMode === "failure" && <AlertTriangle className="w-4 h-4 text-rose-800" />}
                      {failureMapMode === "alert" && <Zap className="w-4 h-4 text-amber-700" />}
                      {failureMapMode === "log" && <Terminal className="w-4 h-4 text-sky-700" />}
                      {failureMapMode === "solution" && <Sparkles className="w-4 h-4 text-[#042F2E]" />}
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-[#0C262D]">
                        {failureMapMode === "failure" && "System Architecture Failure & Attack Blast Radius Map"}
                        {failureMapMode === "alert" && "Security Threat Alert Triage & Exploitation Vector Map"}
                        {failureMapMode === "log" && "Forensic SIEM Log Activity & Audit Telemetry Trace"}
                        {failureMapMode === "solution" && "Simulated Optimal Security Architecture & Solution Map"}
                      </h2>
                      <p className="text-xs text-[#164E63] font-medium mt-0.5">
                        Active Timeline Point: <strong className="text-[#083344] font-mono">{selectedPointLabel}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mode Navigation Tabs */}
                  <div className="flex flex-wrap rounded-xl bg-white p-1 border border-[#A6E3E9] text-xs font-mono shadow-sm gap-1">
                    <button
                      onClick={() => setFailureMapMode("failure")}
                      className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center gap-1.5 ${
                        failureMapMode === "failure"
                          ? "bg-rose-100 text-rose-900 border border-rose-300 shadow-sm"
                          : "text-[#164E63] hover:text-[#0C262D]"
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                      <span>🚨 Failure Map</span>
                    </button>

                    <button
                      onClick={() => setFailureMapMode("alert")}
                      className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center gap-1.5 ${
                        failureMapMode === "alert"
                          ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                          : "text-[#164E63] hover:text-[#0C262D]"
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-700" />
                      <span>⚡ Threat Alerts</span>
                    </button>

                    <button
                      onClick={() => setFailureMapMode("log")}
                      className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center gap-1.5 ${
                        failureMapMode === "log"
                          ? "bg-sky-100 text-sky-900 border border-sky-300 shadow-sm"
                          : "text-[#164E63] hover:text-[#0C262D]"
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5 text-sky-700" />
                      <span>📋 Log Activity</span>
                    </button>

                    <button
                      onClick={() => setFailureMapMode("solution")}
                      className={`px-3 py-1.5 rounded-lg font-extrabold transition-all flex items-center gap-1.5 ${
                        failureMapMode === "solution"
                          ? "bg-[#71C9CE] text-[#042F2E] border border-[#71C9CE] shadow-sm font-black"
                          : "text-[#164E63] hover:text-[#0C262D]"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#042F2E]" />
                      <span>✨ Simulate Solution</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowFailureMapModal(false)}
                    className="p-2 rounded-xl bg-white border border-[#A6E3E9] hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-[#164E63] transition-all"
                    title="Close Modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body with Multi-Mode Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* TAB 1: SYSTEM FAILURE & ATTACK BLAST RADIUS MAP */}
                {failureMapMode === "failure" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-1 shadow-sm">
                      <div className="flex items-center gap-2 font-black font-mono uppercase tracking-wider text-xs">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
                        <span>System Failure Detected • Blast Radius & Root Cause Map</span>
                      </div>
                      <p className="text-xs text-rose-800 font-medium leading-relaxed">
                        System failure detected. The blast radius map visualizes the impact; initial assessment points towards a database connection issue, potentially cascading to dependent services. Further investigation confirms the root cause within the failure map below (pool depletion, SPoF lock, and lateral access causing $2.55M cascading loss).
                      </p>
                    </div>

                    {/* 4-Tier Breakdown Visual Topology */}
                    <div className="space-y-4">
                      {/* Tier 1 */}
                      <div className="p-4 rounded-2xl border-2 border-rose-300 bg-white ring-2 ring-rose-200/60 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs bg-rose-100 text-rose-800">
                              <ShieldAlert className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black uppercase text-rose-900">
                                  Tier 1 — Threat Source & Attack Vector
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-rose-200 text-rose-900">
                                  CISA KEV EXPLOITED
                                </span>
                              </div>
                              <p className="text-xs text-[#164E63] font-medium mt-0.5">
                                Akira Ransomware Syndicate • Pre-Auth Remote Code Execution (FortiOS CVE-2024-55591)
                              </p>
                            </div>
                          </div>
                          <div className="text-right font-mono text-[11px] font-bold text-rose-800">
                            CVSS 9.8 Critical • Ingress Port 443
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center my-0.5">
                        <div className="w-0.5 h-5 border-l-2 border-dashed border-rose-400" />
                      </div>

                      {/* Tier 2 */}
                      <div className="p-5 rounded-2xl bg-white border-2 border-rose-300 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-[#0C262D] uppercase font-mono flex items-center gap-2">
                            <span>Tier 2 — Critical System Architecture Breakdowns (Root Cause)</span>
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-bold text-[10px]">
                              3 Fault Points
                            </span>
                          </h4>
                          <span className="text-[10px] font-mono text-rose-700 font-bold">Unmitigated Exposure</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-900 text-xs">Breakdown #1: Missing Hardware MFA</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">CRITICAL</span>
                            </div>
                            <p className="text-[11px] text-[#164E63] font-medium">
                              Administrative Bastion jumpbox relied on single-factor fallback tokens without FIDO2 WebAuthn enforcement.
                            </p>
                            <div className="text-[10px] font-mono font-bold text-rose-800">
                              Loss Factor: Lateral Credential Pivot (100% Ease)
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-900 text-xs">Breakdown #2: Permissive Peering</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">HIGH</span>
                            </div>
                            <p className="text-[11px] text-[#164E63] font-medium">
                              Cross-VPC Peering lacked micro-segmentation. Ingress traffic pivoted directly into internal database subnets.
                            </p>
                            <div className="text-[10px] font-mono font-bold text-rose-800">
                              Loss Factor: 145,000 Cardholder Records Exposed
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-900 text-xs">Breakdown #3: AWS SPoF Lock</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">HIGH</span>
                            </div>
                            <p className="text-[11px] text-[#164E63] font-medium">
                              Entire settlement pipeline deployed in single region AWS us-east-1 with no automated warm standby in secondary region.
                            </p>
                            <div className="text-[10px] font-mono font-bold text-rose-800">
                              Loss Factor: 36h Full Production Downtime
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center my-0.5">
                        <div className="w-0.5 h-5 border-l-2 border-dashed border-rose-400" />
                      </div>

                      {/* Tier 3 */}
                      <div className="p-5 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-3 shadow-sm">
                        <h4 className="font-extrabold text-xs text-[#0C262D] uppercase font-mono">
                          Tier 3 — Compromised Asset Blast Radius
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-white rounded-xl border border-rose-300">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0C262D] text-xs">Core Payment Gateway API</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">Primary Breach</span>
                            </div>
                            <span className="text-[10px] text-[#164E63] block mt-1">Tier-1 Revenue Engine • 10.0.1.4</span>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-rose-300">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0C262D] text-xs">RDS PostgreSQL Cluster</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">Data Exfiltration</span>
                            </div>
                            <span className="text-[10px] text-[#164E63] block mt-1">145k Customer Records • 10.0.3.18</span>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-rose-300">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0C262D] text-xs">Settlement Ledger Queue</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">Outage Stall</span>
                            </div>
                            <span className="text-[10px] text-[#164E63] block mt-1">Kafka/SQS Cluster • us-east-1 SPoF</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center my-0.5">
                        <div className="w-0.5 h-5 border-l-2 border-dashed border-rose-400" />
                      </div>

                      {/* Tier 4 */}
                      <div className="p-5 rounded-2xl bg-white border-2 border-rose-300 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-[#0C262D] uppercase font-mono">
                            Tier 4 — OpenFAIR Cascading Financial Loss Breakdown ($)
                          </h4>
                          <span className="text-[10px] font-mono text-rose-800 font-bold">Single-Event Exposure</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 shadow-sm">
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">1. Forensics & Incident Response</span>
                            <div className="text-lg font-black font-mono mt-1 text-rose-800">$850,000</div>
                            <span className="text-[10px] text-[#164E63] font-medium">IR retainers, forensic triage, and audit</span>
                          </div>

                          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 shadow-sm">
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">2. Revenue Downtime (Interruption)</span>
                            <div className="text-lg font-black font-mono mt-1 text-rose-800">$1,200,000</div>
                            <span className="text-[10px] text-[#164E63] font-medium">36h total outage across transactions</span>
                          </div>

                          <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 shadow-sm">
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">3. Regulatory Fines (SEC & DORA)</span>
                            <div className="text-lg font-black font-mono mt-1 text-rose-800">$500,000</div>
                            <span className="text-[10px] text-[#164E63] font-medium">SEC Form 8-K mandatory disclosure penalty</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-rose-100 border border-rose-300 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                          <div>
                            <span className="text-xs font-black uppercase font-mono block">
                              Total Single-Event Failure Exposure: $2,550,000
                            </span>
                            <span className="text-xs font-medium">
                              Elevates continuous Expected Annual Loss (EAL) by +$75,000/year until remediated.
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setFailureMapMode("alert")}
                              className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-900 text-xs font-bold hover:bg-rose-50"
                            >
                              ⚡ View Alerts
                            </button>
                            <button
                              onClick={() => setFailureMapMode("log")}
                              className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-900 text-xs font-bold hover:bg-rose-50"
                            >
                              📋 View Logs
                            </button>
                            <button
                              onClick={() => setFailureMapMode("solution")}
                              className="px-3 py-1.5 rounded-lg bg-[#71C9CE] text-[#042F2E] text-xs font-black hover:bg-[#A6E3E9] shadow-sm flex items-center gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Simulate Solution</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SECURITY THREAT ALERTS & VECTOR MAP */}
                {failureMapMode === "alert" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-black font-mono uppercase tracking-wider text-xs">
                          <Zap className="w-4 h-4 text-amber-700" />
                          <span>Security Threat Alert Triggered • Attack Vector Map</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-extrabold">
                          4 CORRELATED ALERTS
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 font-medium leading-relaxed">
                        Security threat alert triggered. The vector map highlights a suspicious login attempt originating from an unknown geographical location (Tor exit node / anonymous proxy). Analyzing the network traffic and security logs to determine the specific attack vector. A potential brute-force attack is suspected.
                      </p>
                    </div>

                    {/* MITRE ATT&CK Progression Banner */}
                    <div className="p-4 rounded-2xl bg-white border border-[#A6E3E9] space-y-2 shadow-sm">
                      <span className="text-[10px] font-mono font-extrabold text-[#0C262D] uppercase tracking-wider block">
                        MITRE ATT&CK® Killchain Progression Flow:
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 font-bold flex items-center gap-1">
                          <span>1. T1190: Initial Ingress</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#71C9CE]" />
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
                          <span>2. T1078: Privilege Escalation</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#71C9CE]" />
                        <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 border border-sky-300 font-bold flex items-center gap-1">
                          <span>3. T1021.004: Lateral Peering</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#71C9CE]" />
                        <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 border border-purple-300 font-bold flex items-center gap-1">
                          <span>4. T1048: Data Exfiltration</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#71C9CE]" />
                        <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-950 border border-red-300 font-bold flex items-center gap-1">
                          <span>5. T1499: SPoF Outage</span>
                        </span>
                      </div>
                    </div>

                    {/* Alert Cards List */}
                    <div className="space-y-3">
                      <div
                        onClick={() => setActiveAlertId("ALT-9041")}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${
                          activeAlertId === "ALT-9041"
                            ? "bg-white border-rose-400 ring-2 ring-rose-200"
                            : "bg-white/80 border-[#A6E3E9] hover:border-rose-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#A6E3E9]/50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-black text-[10px]">
                              CRITICAL • CVSS 9.8
                            </span>
                            <span className="font-mono text-xs font-black text-[#0C262D]">
                              ALT-9041: Pre-Authentication RCE Exploit Signature Detected
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#164E63] font-bold">
                            Engine: AWS GuardDuty & CrowdStrike Falcon
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Target Asset:</span>
                            <span className="font-bold text-[#0C262D]">bastion-jumpbox-01 (10.0.1.4:443)</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Source Ingress:</span>
                            <span className="font-mono text-rose-800 font-bold">45.33.32.156 (Tor Exit Node)</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Financial Risk Attribution:</span>
                            <span className="font-bold text-rose-800">+$27.3M EAL Exposure Surge</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#164E63] mt-2 font-medium bg-[#CBF1F5]/40 p-2 rounded-lg border border-[#A6E3E9]">
                          Inbound TCP request matched exploit pattern for Fortinet/FortiOS Pre-Auth RCE (CVE-2024-55591). Attacker acquired root shell and minted unauthorized local administrator tokens.
                        </p>
                      </div>

                      <div
                        onClick={() => setActiveAlertId("ALT-9042")}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${
                          activeAlertId === "ALT-9042"
                            ? "bg-white border-amber-400 ring-2 ring-amber-200"
                            : "bg-white/80 border-[#A6E3E9] hover:border-amber-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#A6E3E9]/50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono font-black text-[10px]">
                              HIGH • CVSS 8.4
                            </span>
                            <span className="font-mono text-xs font-black text-[#0C262D]">
                              ALT-9042: IAM STS Role Assumed Without FIDO2 Hardware MFA
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#164E63] font-bold">
                            Engine: Splunk ES Rule SEC_IAM_MFA_01
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Principal:</span>
                            <span className="font-bold text-[#0C262D]">arn:aws:iam::role/payment-settlement-role</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Auth Mechanism:</span>
                            <span className="font-mono text-amber-800 font-bold">Single-Factor Fallback Token</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Policy Violation:</span>
                            <span className="font-bold text-amber-900">Zero-Trust & PCI-DSS 4.0 Fail</span>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setActiveAlertId("ALT-9043")}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${
                          activeAlertId === "ALT-9043"
                            ? "bg-white border-rose-400 ring-2 ring-rose-200"
                            : "bg-white/80 border-[#A6E3E9] hover:border-rose-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#A6E3E9]/50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-black text-[10px]">
                              CRITICAL • EXFILTRATION
                            </span>
                            <span className="font-mono text-xs font-black text-[#0C262D]">
                              ALT-9043: Cross-VPC Peering Lateral Data Streaming Anomaly (4.2 GB)
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#164E63] font-bold">
                            Engine: AWS VPC Flow Log Anomaly Detector
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Compromised DB:</span>
                            <span className="font-bold text-[#0C262D]">rds-payment-prod-primary (10.0.3.18)</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">External Drop IP:</span>
                            <span className="font-mono text-rose-800 font-bold">185.220.101.5 (Known C2)</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Records Exposed:</span>
                            <span className="font-bold text-rose-800">145,000 Cardholder Records</span>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => setActiveAlertId("ALT-9044")}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${
                          activeAlertId === "ALT-9044"
                            ? "bg-white border-amber-400 ring-2 ring-amber-200"
                            : "bg-white/80 border-[#A6E3E9] hover:border-amber-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#A6E3E9]/50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono font-black text-[10px]">
                              MEDIUM • RESILIENCY
                            </span>
                            <span className="font-mono text-xs font-black text-[#0C262D]">
                              ALT-9044: Single Point of Failure (SPoF) in AWS Region us-east-1
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#164E63] font-bold">
                            Engine: Aegis Resiliency Engine
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Primary Region:</span>
                            <span className="font-bold text-[#0C262D]">AWS us-east-1 (N. Virginia)</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Standby Region:</span>
                            <span className="font-mono text-rose-800 font-bold">NONE (0% Warm Redundancy)</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">Downtime Penalty:</span>
                            <span className="font-bold text-rose-800">$1,200,000 Outage Exposure</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#CBF1F5] border border-[#A6E3E9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="text-xs text-[#0C262D] font-medium">
                        Alert triage correlated to <strong>Active Incident INC-2024-8819</strong>. Review forensic raw logs or simulate optimal defense controls.
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setFailureMapMode("log")}
                          className="px-3.5 py-2 rounded-xl bg-white border border-[#A6E3E9] text-[#164E63] text-xs font-bold hover:bg-[#E3FDFD] flex items-center gap-1.5"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Inspect Telemetry Logs</span>
                        </button>
                        <button
                          onClick={() => setFailureMapMode("solution")}
                          className="px-4 py-2 rounded-xl bg-[#71C9CE] text-[#042F2E] text-xs font-black hover:bg-[#A6E3E9] shadow-sm flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Simulate Defense & Patch</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: FORENSIC LOG ACTIVITY & AUDIT TRACE MAP */}
                {failureMapMode === "log" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 text-sky-950 space-y-1 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-black font-mono uppercase tracking-wider text-xs">
                          <Terminal className="w-4 h-4 text-sky-700" />
                          <span>Forensic SIEM Log Activity & Audit Telemetry Trace</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-sky-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>SHA256 Cryptographic Immutability Seal Verified</span>
                        </div>
                      </div>
                      <p className="text-xs text-sky-900 font-medium leading-relaxed">
                        Forensic SIEM log activity reveals a series of unauthorized file access attempts. The audit telemetry trace shows anomalous user behavior after authentication. This activity correlates with the earlier security alert, pointing to a potential compromise.
                      </p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#164E63] mr-1">Filter Telemetry:</span>
                      {[
                        { id: "all", label: "All Telemetry (5 Events)" },
                        { id: "vpc", label: "VPC Flow Logs" },
                        { id: "auth", label: "Auth & SSH" },
                        { id: "iam", label: "CloudTrail IAM" },
                        { id: "db", label: "PostgreSQL Audit" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setLogFilter(tab.id as any)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                            logFilter === tab.id
                              ? "bg-[#71C9CE] text-[#042F2E] border border-[#71C9CE] shadow-sm font-black"
                              : "bg-white text-[#164E63] border border-[#A6E3E9] hover:bg-[#CBF1F5]"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Forensic Terminal Event Stream */}
                    <div className="space-y-3 font-mono">
                      {(logFilter === "all" || logFilter === "vpc") && (
                        <div className="p-4 rounded-xl bg-[#082026] text-[#E3FDFD] border border-[#71C9CE]/40 space-y-2 shadow-sm">
                          <div className="flex items-center justify-between text-[11px] border-b border-white/15 pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 font-black text-[10px]">
                                VPC_FLOW_LOG
                              </span>
                              <span className="text-[#A6E3E9] font-bold">14:21:03.112 UTC</span>
                            </div>
                            <span className="text-rose-400 font-bold">INGRESS BREACH ACCEPTED</span>
                          </div>
                          <div className="bg-black/40 p-2.5 rounded-lg text-[11px] text-[#A6E3E9] leading-relaxed break-all">
                            <code>
                              version 2 123456789012 eni-0a1b2c3d4e5f 45.33.32.156 10.0.1.4 44123 443 6 42 2688 1718804463 1718804523 ACCEPT OK
                            </code>
                          </div>
                          <div className="text-[11px] text-gray-300 font-sans flex items-center justify-between">
                            <span>
                              <strong>Forensic Analysis:</strong> Unfiltered ingress on port 443 directly reached the bastion interface without WAF inspection.
                            </span>
                            <span className="text-rose-400 font-mono text-[10px] font-bold shrink-0 ml-2">Exploit: CVE-2024-55591</span>
                          </div>
                        </div>
                      )}

                      {(logFilter === "all" || logFilter === "auth") && (
                        <div className="p-4 rounded-xl bg-[#082026] text-[#E3FDFD] border border-[#71C9CE]/40 space-y-2 shadow-sm">
                          <div className="flex items-center justify-between text-[11px] border-b border-white/15 pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 font-black text-[10px]">
                                AUDITD / AUTH.LOG
                              </span>
                              <span className="text-[#A6E3E9] font-bold">14:22:15.890 UTC</span>
                            </div>
                            <span className="text-amber-400 font-bold">MFA BYPASS DETECTED</span>
                          </div>
                          <div className="bg-black/40 p-2.5 rounded-lg text-[11px] text-[#A6E3E9] leading-relaxed break-all">
                            <code>
                              bastion-jumpbox sshd[14892]: Accepted publickey for ec2-user from 10.0.1.4 port 51234 ssh2: RSA SHA256:8f4c... [MFA Bypass Active via legacy flag]
                            </code>
                          </div>
                          <div className="text-[11px] text-gray-300 font-sans">
                            <strong>Forensic Analysis:</strong> Session authentication succeeded using a stolen SSH certificate. Absence of hardware FIDO2 WebAuthn token requirement permitted unauthorized interactive shell.
                          </div>
                        </div>
                      )}

                      {(logFilter === "all" || logFilter === "iam") && (
                        <div className="p-4 rounded-xl bg-[#082026] text-[#E3FDFD] border border-[#71C9CE]/40 space-y-2 shadow-sm">
                          <div className="flex items-center justify-between text-[11px] border-b border-white/15 pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 font-black text-[10px]">
                                AWS_CLOUDTRAIL
                              </span>
                              <span className="text-[#A6E3E9] font-bold">14:24:08.402 UTC</span>
                            </div>
                            <span className="text-purple-400 font-bold">PRIVILEGE ESCALATION</span>
                          </div>
                          <div className="bg-black/40 p-2.5 rounded-lg text-[11px] text-[#A6E3E9] leading-relaxed break-all">
                            <code>
                              &#123;&quot;eventSource&quot;:&quot;sts.amazonaws.com&quot;,&quot;eventName&quot;:&quot;AssumeRole&quot;,&quot;roleArn&quot;:&quot;arn:aws:iam::123456789012:role/payment-settlement-role&quot;,&quot;sourceIPAddress&quot;:&quot;10.0.1.4&quot;&#125;
                            </code>
                          </div>
                          <div className="text-[11px] text-gray-300 font-sans">
                            <strong>Forensic Analysis:</strong> Attacker escalated from bastion host to high-privilege settlement service role, gaining direct read access to production database credentials.
                          </div>
                        </div>
                      )}

                      {(logFilter === "all" || logFilter === "db") && (
                        <div className="p-4 rounded-xl bg-[#082026] text-[#E3FDFD] border border-[#71C9CE]/40 space-y-2 shadow-sm">
                          <div className="flex items-center justify-between text-[11px] border-b border-white/15 pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 font-black text-[10px]">
                                POSTGRESQL_AUDIT
                              </span>
                              <span className="text-[#A6E3E9] font-bold">14:25:40.719 UTC</span>
                            </div>
                            <span className="text-rose-400 font-bold">MASS DATA DUMP</span>
                          </div>
                          <div className="bg-black/40 p-2.5 rounded-lg text-[11px] text-[#A6E3E9] leading-relaxed break-all">
                            <code>
                              LOG: AUDIT: SESSION,3,1,READ,COPY,TABLE,customers_pii,SELECT * FROM payment_ledger_transactions; [Rows affected: 145,000]
                            </code>
                          </div>
                          <div className="text-[11px] text-gray-300 font-sans">
                            <strong>Forensic Analysis:</strong> Bulk exfiltration query executed across cross-VPC peering tunnel. 145,000 cardholder records dumped to unencrypted staging directory.
                          </div>
                        </div>
                      )}

                      {(logFilter === "all" || logFilter === "vpc") && (
                        <div className="p-4 rounded-xl bg-[#082026] text-[#E3FDFD] border border-[#71C9CE]/40 space-y-2 shadow-sm">
                          <div className="flex items-center justify-between text-[11px] border-b border-white/15 pb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 font-black text-[10px]">
                                NETWORK_EGRESS
                              </span>
                              <span className="text-[#A6E3E9] font-bold">14:28:11.004 UTC</span>
                            </div>
                            <span className="text-rose-400 font-bold">4.29 GB EXFILTRATION</span>
                          </div>
                          <div className="bg-black/40 p-2.5 rounded-lg text-[11px] text-[#A6E3E9] leading-relaxed break-all">
                            <code>
                              flow_monitor: CRITICAL_EXFILTRATION: 4,294,967,296 bytes dispatched to 185.220.101.5:443 via encrypted tunnel in 162 seconds.
                            </code>
                          </div>
                          <div className="text-[11px] text-gray-300 font-sans">
                            <strong>Forensic Analysis:</strong> Data package successfully exfiltrated to adversary infrastructure before automated security group isolation could engage.
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-[#A6E3E9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                      <div className="space-y-0.5 text-xs text-[#164E63]">
                        <span className="font-bold text-[#0C262D] block">Incident Timeline Forensic Totals:</span>
                        <span>Attack Velocity: <strong>7m 08s</strong> from Ingress to Exfil • Records Exposed: <strong>145,000</strong> • Forensics Retainer: <strong>$850,000</strong></span>
                      </div>
                      <button
                        onClick={() => setFailureMapMode("solution")}
                        className="px-4 py-2 rounded-xl bg-[#71C9CE] text-[#042F2E] text-xs font-black hover:bg-[#A6E3E9] shadow-sm flex items-center gap-1.5 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Simulate Prevention Architecture</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 4: SIMULATED OPTIMAL SOLUTION & ROSI MAP */}
                {failureMapMode === "solution" && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-1 shadow-sm">
                      <div className="flex items-center gap-2 font-black font-mono uppercase tracking-wider text-xs">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <span>Simulated Optimal Security Architecture & Solution Map</span>
                      </div>
                      <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                        A simulated optimal security architecture is generated based on identified vulnerabilities. The solution map proposes isolating the compromised system and applying access control. The map will provide a one-click live application of the proposed security configuration.
                      </p>
                    </div>

                    {/* Shielded Visual Topology */}
                    <div className="space-y-4">
                      {/* Tier 1 */}
                      <div className="p-4 rounded-2xl border-2 border-emerald-300 bg-white ring-2 ring-emerald-200/50 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs bg-emerald-100 text-emerald-800">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black uppercase text-emerald-900">
                                  Tier 1 — Threat Neutralized at Perimeter
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-emerald-200 text-emerald-900">
                                  EXPLOIT DROPPED IN 0ms
                                </span>
                              </div>
                              <p className="text-xs text-[#164E63] font-medium mt-0.5">
                                Akira Exploit Payload intercepted by Cloudflare & AWS WAF Virtual Patching rule set
                              </p>
                            </div>
                          </div>
                          <div className="text-right font-mono text-[11px] font-bold text-emerald-800">
                            Pre-Execution Drop • Zero Ingress Penetration
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center my-0.5">
                        <div className="w-0.5 h-5 border-l-2 border-dashed border-[#71C9CE]" />
                      </div>

                      {/* Tier 2 */}
                      <div className="p-5 rounded-2xl bg-white border-2 border-emerald-300 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-[#0C262D] uppercase font-mono flex items-center gap-2">
                            <span>Tier 2 — Fortified Defense Architecture Controls</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                              3 Optimal Controls
                            </span>
                          </h4>
                          <span className="text-[10px] font-mono text-emerald-800 font-bold">ROSI Validated (+520%)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-950 text-xs">Control #1: WAF Virtual Patching</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">ACTIVE</span>
                            </div>
                            <p className="text-[11px] text-[#164E63] font-medium">
                              Instant rule deployment on Cloudflare edge drops CVE-2024-55591 buffer overruns before reaching bastion listeners.
                            </p>
                            <div className="text-[10px] font-mono font-bold text-emerald-800">
                              Protection: 100% Perimeter Block
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-950 text-xs">Control #2: FIDO2 Hardware MFA</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">ACTIVE</span>
                            </div>
                            <p className="text-[11px] text-[#164E63] font-medium">
                              YubiKey / WebAuthn physical hardware token required on all bastion and AWS IAM STS administrative role sessions.
                            </p>
                            <div className="text-[10px] font-mono font-bold text-emerald-800">
                              Protection: Zero Credential Replay
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-950 text-xs">Control #3: Multi-Region Standby</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">ACTIVE</span>
                            </div>
                            <p className="text-[11px] text-[#164E63] font-medium">
                              Active-active warm standby in AWS us-west-2 with Route 53 health check failover in under 90 seconds.
                            </p>
                            <div className="text-[10px] font-mono font-bold text-emerald-800">
                              Protection: 98.8% Downtime Loss Saved
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center my-0.5">
                        <div className="w-0.5 h-5 border-l-2 border-dashed border-[#71C9CE]" />
                      </div>

                      {/* Tier 3 */}
                      <div className="p-5 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-3 shadow-sm">
                        <h4 className="font-extrabold text-xs text-[#0C262D] uppercase font-mono">
                          Tier 3 — Fortified Assets with Zero-Trust Micro-Segmentation
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-white rounded-xl border border-emerald-300">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0C262D] text-xs">Core Payment Gateway API</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Shielded</span>
                            </div>
                            <span className="text-[10px] text-[#164E63] block mt-1">WAF Protected • Zero Exploit Ingress</span>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-emerald-300">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0C262D] text-xs">RDS PostgreSQL Cluster</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Isolated</span>
                            </div>
                            <span className="text-[10px] text-[#164E63] block mt-1">AWS PrivateLink Only • 0 Records Stolen</span>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-emerald-300">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0C262D] text-xs">Settlement Ledger Queue</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Resilient</span>
                            </div>
                            <span className="text-[10px] text-[#164E63] block mt-1">Multi-Region Standby • &lt; 90s Failover</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center my-0.5">
                        <div className="w-0.5 h-5 border-l-2 border-dashed border-[#71C9CE]" />
                      </div>

                      {/* Tier 4 */}
                      <div className="p-5 rounded-2xl bg-white border-2 border-emerald-400 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-xs text-[#0C262D] uppercase font-mono">
                            Tier 4 — Optimal Financial Savings & Return on Investment (ROSI)
                          </h4>
                          <span className="text-[10px] font-mono text-emerald-800 font-bold">OpenFAIR Quantified</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 shadow-sm">
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">1. Forensics & Incident Response</span>
                            <div className="text-lg font-black font-mono mt-1 text-emerald-800">$0 (100% Saved)</div>
                            <span className="text-[10px] text-[#164E63] font-medium">$850k retainer completely avoided</span>
                          </div>

                          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 shadow-sm">
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">2. Revenue Downtime (Interruption)</span>
                            <div className="text-lg font-black font-mono mt-1 text-emerald-800">$15,000 (98.8% Saved)</div>
                            <span className="text-[10px] text-[#164E63] font-medium">Outage slashed from 36h to 90 seconds</span>
                          </div>

                          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 shadow-sm">
                            <span className="text-[10px] font-mono text-[#164E63] font-bold block">3. Regulatory Fines (SEC & DORA)</span>
                            <div className="text-lg font-black font-mono mt-1 text-emerald-800">$0 (100% Saved)</div>
                            <span className="text-[10px] text-[#164E63] font-medium">Zero PII breach = No SEC 8-K penalty</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                          <div>
                            <span className="text-xs font-black uppercase font-mono block">
                              Net Single-Event Loss: $15,000 (Down from $2,550,000 — 99.4% Reduction)
                            </span>
                            <span className="text-xs font-medium">
                              Slashes continuous Expected Annual Loss (EAL) by -$75,000/year. Return on Investment: +520% • Payback: 1.8 Months.
                            </span>
                          </div>
                          <div className="text-right shrink-0 font-mono">
                            <div className="text-2xl font-black text-emerald-900">$15,000</div>
                            <span className="text-[11px] font-bold text-emerald-800">Optimal Defended State</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 bg-[#CBF1F5] border-t border-[#A6E3E9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[#164E63] font-mono">
                  {failureMapMode === "failure" && (
                    <span>Click <strong>'Simulate Optimal Solution'</strong> to preview the defended architecture and ROSI metrics.</span>
                  )}
                  {failureMapMode === "alert" && (
                    <span>Correlated Alert: <strong>ALT-9041 (Pre-Auth RCE)</strong> • Threat Actor: Akira / FIN7</span>
                  )}
                  {failureMapMode === "log" && (
                    <span>Telemetry Ingestion: <strong>5 events logged</strong> • Ingestion latency: 120ms</span>
                  )}
                  {failureMapMode === "solution" && (
                    <span>Optimal solution validated: <strong>WAF Virtual Patch + FIDO2 MFA + Multi-Region Standby</strong></span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {failureMapMode !== "solution" ? (
                    <>
                      <button
                        onClick={() => setFailureMapMode("solution")}
                        className="px-5 py-2.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-black text-xs transition-all shadow-md shadow-[#71C9CE]/30 border border-[#71C9CE] flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-[#042F2E]" />
                        <span>Simulate Optimal Solution</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setFailureMapMode("failure")}
                        className="px-4 py-2 rounded-xl bg-white border border-[#A6E3E9] text-[#164E63] text-xs font-bold hover:bg-[#E3FDFD]"
                      >
                        Back to Failure View
                      </button>

                      <button
                        onClick={async () => {
                          const target = findings.find((f) => !f.isPatched);
                          if (target) {
                            await handleRemediate(target.id);
                          }
                          setSolutionApplied(true);
                          setTimeout(() => {
                            setShowFailureMapModal(false);
                            setSolutionApplied(false);
                          }, 1500);
                        }}
                        disabled={solutionApplied}
                        className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{solutionApplied ? "Optimal Solution Applied!" : "Apply Solution to Live Portfolio Model"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
