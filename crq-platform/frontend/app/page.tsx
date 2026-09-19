"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  Zap,
  Lock,
  Server,
  LineChart,
  BarChart3,
  Terminal,
  Scale,
  Settings,
  SlidersHorizontal,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  FileText,
  UserCheck,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeDemoTab, setActiveDemoTab] = useState<"cockpit" | "simulator" | "rbac">("cockpit");

  // Interactive Demo What-If State
  const [demoMfa, setDemoMfa] = useState(85);
  const [demoEdr, setDemoEdr] = useState(90);
  const [demoAiSurge, setDemoAiSurge] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<"alert" | "failure" | "log" | "solution">("failure");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("aegis_token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("aegis_user") : null;
    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {}
      }
    }
  }, []);

  // Compute live demo simulator figures
  const baseEal = 1245000;
  const mfaSavings = (demoMfa - 50) * 8500;
  const edrSavings = (demoEdr - 50) * 6200;
  const surgeFactor = demoAiSurge ? 1.4 : 1.0;
  const simulatedEal = Math.max(180000, Math.round((baseEal - mfaSavings - edrSavings) * surgeFactor));
  const ealReduction = baseEal - simulatedEal;
  const simulatedVar = Math.round(simulatedEal * 3.8);

  const pillars = [
    {
      icon: Zap,
      label: "Continuous Quantification",
      detail: "Re-quantifies Expected Annual Loss and Value at Risk whenever telemetry changes — replacing static annual assessments with real-time financial exposure.",
    },
    {
      icon: Lock,
      label: "OpenFAIR Explainability",
      detail: "Every dollar figure traces back to transparent drivers: Threat Event Frequency, Vulnerability, Control Effectiveness, and Primary Loss Magnitude.",
    },
    {
      icon: Server,
      label: "Nth-Party SPoF Aware",
      detail: "Models correlated concentration risks across shared cloud and identity infrastructure instead of falsely assuming supplier independence.",
    },
    {
      icon: LineChart,
      label: "Closed-Loop ROSI Optimizer",
      detail: "Calculates Return on Security Investment with honest confidence intervals, comparing pre-deployment projections against observed telemetry drops.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#E3FDFD] text-[#0C262D] flex flex-col selection:bg-[#71C9CE] selection:text-[#042F2E]">
      {/* Navigation Header */}
      <header className="border-b border-[#A6E3E9] bg-[#CBF1F5]/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] font-black shadow-md shadow-[#71C9CE]/30 border border-[#A6E3E9]">
              <ShieldCheck className="w-5 h-5 text-[#042F2E]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#0C262D]">AegisRisk AI</span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-[#71C9CE]/25 text-[#083344] border border-[#71C9CE] font-bold">
                SIH26105
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/90 border border-[#A6E3E9] shadow-sm">
            <div className="flex h-5 rounded overflow-hidden border border-[#A6E3E9]">
              <span className="w-3.5 h-full bg-[#E3FDFD]" title="#E3FDFD (Canvas)" />
              <span className="w-3.5 h-full bg-[#CBF1F5]" title="#CBF1F5 (Surface)" />
              <span className="w-3.5 h-full bg-[#A6E3E9]" title="#A6E3E9 (Border)" />
              <span className="w-3.5 h-full bg-[#71C9CE]" title="#71C9CE (Primary)" />
            </div>
            <span className="text-[10px] font-mono font-bold text-[#083344]">Aegis 4-Tone System</span>
          </div>

          <nav className="flex items-center gap-3 text-sm font-medium">
            <button
              onClick={() => {
                const el = document.getElementById("demo-preview-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-[#164E63] hover:text-[#0C262D] px-3 py-1.5 transition-colors font-bold text-xs"
            >
              Demo & Explainer
            </button>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs transition-all shadow-md shadow-[#71C9CE]/25 flex items-center gap-1.5 border border-[#71C9CE]"
              >
                <span>Live Dashboard ({currentUser?.name?.split(" ")[0] || "Active"})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-[#164E63] hover:text-[#0C262D] px-3 py-1.5 transition-colors font-bold text-xs">
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs transition-all shadow-md shadow-[#71C9CE]/25 flex items-center gap-1.5 border border-[#71C9CE]"
                >
                  <span>Launch Live Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 max-w-7xl mx-auto flex flex-col justify-center">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#CBF1F5] border border-[#A6E3E9] text-[#083344] text-xs font-mono font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-[#083344]" />
            <span>Continuous Cyber Risk Quantification & ROSI Optimization</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#0C262D] leading-tight">
            Turn raw security telemetry into{" "}
            <span className="text-[#083344] underline decoration-[#71C9CE] decoration-wavy decoration-4">
              board-ready financial risk
            </span>{" "}
            — continuously.
          </h1>

          <p className="mt-6 text-lg text-[#164E63] leading-relaxed max-w-2xl font-medium">
            AegisRisk AI replaces static annual spreadsheets with automated OpenFAIR quantification.
            Explore the interactive demo below to see how Expected Annual Loss, Value at Risk, and ROSI
            are calculated from live telemetry.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-6 py-3.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-sm transition-all shadow-lg shadow-[#71C9CE]/30 flex items-center gap-2 border border-[#71C9CE]"
              >
                <span>Enter Your Authenticated Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-sm transition-all shadow-lg shadow-[#71C9CE]/30 flex items-center gap-2 border border-[#71C9CE]"
              >
                <span>Sign In to Live Platform</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <button
              onClick={() => {
                const el = document.getElementById("demo-preview-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3.5 rounded-xl bg-[#CBF1F5] hover:bg-white text-[#0C262D] border border-[#A6E3E9] font-bold text-sm transition-all hover:border-[#71C9CE] flex items-center gap-2 shadow-sm"
            >
              <span>Explore Interactive Demo Below</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* INTERACTIVE DEMO PAGE & PLATFORM EXPLAINER                   */}
      {/* ============================================================ */}
      <section id="demo-preview-section" className="px-6 py-12 max-w-7xl mx-auto w-full space-y-8">
        {/* Demo Notice Banner */}
        <div className="p-5 rounded-2xl bg-[#CBF1F5] border-2 border-[#71C9CE] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] font-black shrink-0 border border-[#A6E3E9] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#0C262D]">
                  Interactive Platform Explainer & Live Demo Mode
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-extrabold bg-white text-[#083344] border border-[#71C9CE]">
                  DEMO PREVIEW
                </span>
              </div>
              <p className="text-xs text-[#164E63] mt-1 font-medium">
                This public demonstration demonstrates the OpenFAIR engine, blast radius architecture, What-If ROSI simulator, and strict role-based separation. To access your production organization, sign in to your authenticated corporate dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-[#083344] hover:bg-[#0C262D] text-white text-xs font-mono font-extrabold shadow-sm flex items-center gap-1.5"
            >
              <span>Sign In to Real Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Demo Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#A6E3E9] pb-3 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveDemoTab("cockpit")}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
              activeDemoTab === "cockpit"
                ? "bg-[#71C9CE] text-[#042F2E] shadow-sm border border-[#71C9CE]"
                : "bg-white text-[#164E63] hover:text-[#0C262D] border border-[#A6E3E9]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>1. Continuous OpenFAIR Engine & Incident Pillars</span>
          </button>

          <button
            onClick={() => setActiveDemoTab("simulator")}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
              activeDemoTab === "simulator"
                ? "bg-[#71C9CE] text-[#042F2E] shadow-sm border border-[#71C9CE]"
                : "bg-white text-[#164E63] hover:text-[#0C262D] border border-[#A6E3E9]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>2. Interactive What-If ROSI Simulator</span>
          </button>

          <button
            onClick={() => setActiveDemoTab("rbac")}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
              activeDemoTab === "rbac"
                ? "bg-[#71C9CE] text-[#042F2E] shadow-sm border border-[#71C9CE]"
                : "bg-white text-[#164E63] hover:text-[#0C262D] border border-[#A6E3E9]"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>3. Strict Production Role-Based Isolation</span>
          </button>
        </div>

        {/* DEMO TAB 1: COCKPIT & INCIDENT TIMELINE */}
        {activeDemoTab === "cockpit" && (
          <div className="space-y-6">
            {/* Live KPI Cards Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border-2 border-[#71C9CE] shadow-sm">
                <span className="text-xs font-mono font-bold text-[#083344] uppercase">Expected Annual Loss (EAL)</span>
                <div className="text-3xl font-black text-[#042F2E] mt-2">$1,245,000</div>
                <p className="text-xs text-[#164E63] mt-1 font-mono font-medium">OpenFAIR: LEF × PLM across 14 assets</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#A6E3E9] shadow-sm">
                <span className="text-xs font-mono font-bold text-[#083344] uppercase">95% Value at Risk (VaR)</span>
                <div className="text-3xl font-black text-[#042F2E] mt-2">$4,730,000</div>
                <p className="text-xs text-[#164E63] mt-1 font-mono font-medium">10,000 Monte Carlo tail simulations</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#A6E3E9] shadow-sm">
                <span className="text-xs font-mono font-bold text-[#083344] uppercase">Simulated Optimal ROSI</span>
                <div className="text-3xl font-black text-emerald-600 mt-2">+420%</div>
                <p className="text-xs text-[#164E63] mt-1 font-mono font-medium">Hardware MFA & Virtual Patching</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#A6E3E9] shadow-sm">
                <span className="text-xs font-mono font-bold text-[#083344] uppercase">Active Blast Radius</span>
                <div className="text-3xl font-black text-rose-600 mt-2">$27,300,000</div>
                <p className="text-xs text-[#164E63] mt-1 font-mono font-medium">Critical PostgreSQL Core Customer DB</p>
              </div>
            </div>

            {/* Interactive Timeline Milestone Explainer */}
            <div className="p-6 rounded-2xl bg-white border border-[#A6E3E9] space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#A6E3E9] pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#0C262D]">
                    4-Pillar Incident & Root Cause Blast Radius Engine
                  </h3>
                  <p className="text-xs text-[#164E63] mt-0.5">
                    Click any milestone below to inspect how AegisRisk AI connects threat detection, architectural blast radius, and optimal defenses.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#083344]">Interactive Explainer</span>
                </div>
              </div>

              {/* Milestone Selector Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setSelectedMilestone("alert")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedMilestone === "alert"
                      ? "bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-200"
                      : "bg-[#CBF1F5]/30 border-[#A6E3E9] text-[#164E63] hover:bg-white"
                  }`}
                >
                  <div className="text-[10px] font-mono font-extrabold text-rose-700 uppercase">T-18d Milestone</div>
                  <div className="text-xs font-bold mt-1">🚨 Threat Alert ALT-9041</div>
                  <div className="text-[11px] opacity-80 mt-0.5">Akira Ransomware Ingress</div>
                </button>

                <button
                  onClick={() => setSelectedMilestone("failure")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedMilestone === "failure"
                      ? "bg-orange-50 border-orange-400 text-orange-950 ring-2 ring-orange-200"
                      : "bg-[#CBF1F5]/30 border-[#A6E3E9] text-[#164E63] hover:bg-white"
                  }`}
                >
                  <div className="text-[10px] font-mono font-extrabold text-orange-700 uppercase">T-15d Milestone</div>
                  <div className="text-xs font-bold mt-1">⚠️ Blast Radius Breakdown</div>
                  <div className="text-[11px] opacity-80 mt-0.5">Cascade to DB & Peering</div>
                </button>

                <button
                  onClick={() => setSelectedMilestone("log")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedMilestone === "log"
                      ? "bg-sky-50 border-sky-400 text-sky-950 ring-2 ring-sky-200"
                      : "bg-[#CBF1F5]/30 border-[#A6E3E9] text-[#164E63] hover:bg-white"
                  }`}
                >
                  <div className="text-[10px] font-mono font-extrabold text-sky-700 uppercase">T-9d Milestone</div>
                  <div className="text-xs font-bold mt-1">📋 Forensic SIEM Trace</div>
                  <div className="text-[11px] opacity-80 mt-0.5">4.2 GB DB Exfiltration</div>
                </button>

                <button
                  onClick={() => setSelectedMilestone("solution")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedMilestone === "solution"
                      ? "bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-200"
                      : "bg-[#CBF1F5]/30 border-[#A6E3E9] text-[#164E63] hover:bg-white"
                  }`}
                >
                  <div className="text-[10px] font-mono font-extrabold text-emerald-700 uppercase">T-3d Milestone</div>
                  <div className="text-xs font-bold mt-1">✨ Optimal Solution Fix</div>
                  <div className="text-[11px] opacity-80 mt-0.5">-99.4% Risk Reduction</div>
                </button>
              </div>

              {/* Milestone Details Canvas */}
              <div className="p-5 rounded-xl bg-[#CBF1F5]/40 border border-[#A6E3E9] space-y-3">
                {selectedMilestone === "alert" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Security Threat Alert: CVE-2024-55591 Pre-Auth RCE Infiltration</span>
                    </div>
                    <p className="text-xs text-[#164E63] leading-relaxed">
                      Sophisticated Akira threat syndicate weaponized an unauthenticated remote code execution vulnerability on public ingress port 443. The AegisRisk threat engine automatically adjusted the asset Threat Event Frequency from 0.05/yr to 2.4/yr, immediately elevating the asset Expected Annual Loss to $2.55M.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                      <div className="p-3 bg-white rounded-lg border border-rose-200">
                        <span className="text-[#164E63] block text-[10px]">Threat Actor</span>
                        <strong className="text-rose-700">Akira Ransomware Group</strong>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-rose-200">
                        <span className="text-[#164E63] block text-[10px]">Exploit Vector</span>
                        <strong className="text-rose-700">Pre-Auth Buffer Overflow RCE</strong>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-rose-200">
                        <span className="text-[#164E63] block text-[10px]">CISA KEV Status</span>
                        <strong className="text-rose-700">Actively Exploited in the Wild</strong>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMilestone === "failure" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-orange-900 font-extrabold text-sm">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      <span>System Architecture Failure: 3 Critical Cascading Breakdowns</span>
                    </div>
                    <p className="text-xs text-[#164E63] leading-relaxed">
                      Rather than stopping at the edge, the compromised Bastion accessed internal subnet routes due to permissive cross-VPC peering. A lack of hardware MFA on SSH private keys permitted unauthorized lateral traversal into the primary customer database, exposing $27.3M in blast radius.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                      <div className="p-3 bg-white rounded-lg border border-orange-200">
                        <span className="text-[#164E63] block text-[10px]">Breakdown 1</span>
                        <strong className="text-orange-800">Missing Hardware MFA (SSH Keys)</strong>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-orange-200">
                        <span className="text-[#164E63] block text-[10px]">Breakdown 2</span>
                        <strong className="text-orange-800">Permissive 0.0.0.0/0 Peering</strong>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-orange-200">
                        <span className="text-[#164E63] block text-[10px]">Breakdown 3</span>
                        <strong className="text-orange-800">Direct DB Egress to Internet</strong>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMilestone === "log" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sky-900 font-extrabold text-sm">
                      <Terminal className="w-4 h-4 text-sky-700" />
                      <span>Forensic SIEM Telemetry Trace: Correlated VPC Flow Logs</span>
                    </div>
                    <p className="text-xs text-[#164E63] leading-relaxed">
                      SIEM telemetry correlated 5 distinct forensic stages: initial TCP handshake on port 443, memory injection of reverse shell, credential extraction from /root/.ssh, internal pg_dump query execution, and high-volume data exfiltration to an unauthorized offshore IP.
                    </p>
                    <div className="p-3 bg-[#0C262D] text-white rounded-lg font-mono text-[11px] space-y-1">
                      <div className="text-emerald-400">2026-09-01T04:12:00Z [NGINX] POST /api/v1/auth/exchange HTTP/1.1 500 (Overflow)</div>
                      <div className="text-yellow-400">2026-09-01T04:12:15Z [AUDITD] /bin/bash spawned by nginx uid=33 /dev/shm/.k</div>
                      <div className="text-sky-300">2026-09-01T04:12:45Z [VPC_FLOW] 10.0.1.15 -&gt; 10.0.2.40:5432 ACCEPT 4.2GB</div>
                      <div className="text-rose-400">2026-09-01T04:13:20Z [ZEEK] DNS query .su drop domain; 4.2GB egress to 185.220.101.5</div>
                    </div>
                  </div>
                )}

                {selectedMilestone === "solution" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>Simulated Optimal Security Architecture & Solution Fix</span>
                    </div>
                    <p className="text-xs text-[#164E63] leading-relaxed">
                      By deploying an automated WAF virtual patch rule, enforcing FIDO2 WebAuthn hardware security keys, and activating isolated microsegmentation with a warm PostgreSQL failover standby, expected dollar loss collapses from $2.55M to $15,000 (-99.4% risk reduction).
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-xs">
                      <div className="p-3 bg-white rounded-lg border border-emerald-200">
                        <span className="text-[#164E63] block text-[10px]">Net Risk Reduction</span>
                        <strong className="text-emerald-700">-$2,535,000 (-99.4%)</strong>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-emerald-200">
                        <span className="text-[#164E63] block text-[10px]">Implementation Cost</span>
                        <strong className="text-[#0C262D]">$12,400 Total</strong>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-emerald-200">
                        <span className="text-[#164E63] block text-[10px]">Capital ROSI</span>
                        <strong className="text-emerald-700">+420% Financial Return</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DEMO TAB 2: WHAT-IF ROSI SIMULATOR */}
        {activeDemoTab === "simulator" && (
          <div className="p-6 rounded-2xl bg-white border border-[#A6E3E9] space-y-6 shadow-sm">
            <div className="border-b border-[#A6E3E9] pb-3">
              <h3 className="text-base font-extrabold text-[#0C262D]">
                Interactive What-If Return on Security Investment (ROSI) Simulator
              </h3>
              <p className="text-xs text-[#164E63] mt-1">
                Drag the controls below to model defensive investments before allocating security capital. Watch the simulated Expected Annual Loss and 95% Tail VaR recalculate dynamically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Sliders */}
              <div className="space-y-5 bg-[#CBF1F5]/30 p-5 rounded-2xl border border-[#A6E3E9]">
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#0C262D] mb-2">
                    <span>Hardware MFA Rollout (FIDO2 Keys)</span>
                    <span className="font-mono text-[#083344] bg-white px-2 py-0.5 rounded border border-[#A6E3E9]">
                      {demoMfa}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={demoMfa}
                    onChange={(e) => setDemoMfa(Number(e.target.value))}
                    className="w-full accent-[#71C9CE] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#164E63] font-mono mt-1">
                    <span>0% (Passwords only)</span>
                    <span>100% (Strict hardware token)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-[#0C262D] mb-2">
                    <span>Endpoint Detection & Response (EDR) Fleet Coverage</span>
                    <span className="font-mono text-[#083344] bg-white px-2 py-0.5 rounded border border-[#A6E3E9]">
                      {demoEdr}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={demoEdr}
                    onChange={(e) => setDemoEdr(Number(e.target.value))}
                    className="w-full accent-[#71C9CE] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#164E63] font-mono mt-1">
                    <span>0% Unmanaged</span>
                    <span>100% Zero-Trust Managed</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#A6E3E9]/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#0C262D]">Simulate Akira AI Threat Surge (+40%)</div>
                    <div className="text-[11px] text-[#164E63]">Model automated autonomous exploit agent campaigns</div>
                  </div>
                  <button
                    onClick={() => setDemoAiSurge(!demoAiSurge)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                      demoAiSurge
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-white text-[#164E63] border border-[#A6E3E9]"
                    }`}
                  >
                    {demoAiSurge ? "SURGE ACTIVE" : "NORMAL THREAT"}
                  </button>
                </div>
              </div>

              {/* Dynamic Results Card */}
              <div className="p-6 rounded-2xl bg-[#CBF1F5] border-2 border-[#71C9CE] space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-[#71C9CE]/50 pb-2">
                  <span className="text-xs font-mono font-extrabold uppercase text-[#083344]">Simulated Outcome</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-[#042F2E] font-bold border border-[#71C9CE]">
                    Monte Carlo N=10,000
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-[#164E63] font-medium">Projected Expected Annual Loss (EAL)</span>
                    <div className="text-3xl font-black text-[#042F2E] mt-0.5">
                      ${simulatedEal.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-[#164E63] font-medium">Simulated Financial Loss Reduction</span>
                    <div className="text-xl font-black text-emerald-700 mt-0.5">
                      -${Math.max(0, ealReduction).toLocaleString()} ({Math.round((ealReduction / baseEal) * 100)}% Drop)
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-[#164E63] font-medium">Projected 95% Tail Value at Risk (VaR)</span>
                    <div className="text-xl font-black text-[#083344] mt-0.5">
                      ${simulatedVar.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#71C9CE] text-xs text-[#083344] font-medium">
                  💡 <strong>CISO Insight:</strong> Increasing hardware MFA to 85%+ delivers the highest capital efficiency, reducing unauthenticated credential stuffing exposure by $780,000 annually.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEMO TAB 3: STRICT ROLE-BASED ISOLATION */}
        {activeDemoTab === "rbac" && (
          <div className="p-6 rounded-2xl bg-white border border-[#A6E3E9] space-y-6 shadow-sm">
            <div className="border-b border-[#A6E3E9] pb-3">
              <h3 className="text-base font-extrabold text-[#0C262D]">
                Strict Enterprise Role-Based Separation of Duties (No Demo Persona Switchers)
              </h3>
              <p className="text-xs text-[#164E63] mt-1">
                In a real production deployment, logged-in corporate users only see the interface tailored to their enterprise governance responsibilities. There are no arbitrary role switchers once inside.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#CBF1F5]/40 border border-[#71C9CE] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#71C9CE] flex items-center justify-center text-[#042F2E] font-bold">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0C262D]">CISO & Board of Directors</h4>
                    <span className="text-[10px] font-mono text-[#083344] font-bold">Role: ciso</span>
                  </div>
                </div>
                <p className="text-xs text-[#164E63] leading-relaxed">
                  Authorized exclusively for <strong>Executive Risk Cockpit</strong>, <strong>What-If ROSI Simulator</strong>, and <strong>Closed-Loop Model Assurance</strong>. The CISO never sees tactical queue clutter or raw telemetry schemas.
                </p>
                <div className="text-[11px] font-mono text-[#083344] bg-white p-2 rounded-lg border border-[#A6E3E9]">
                  Authorized Views: Cockpit • ROSI Simulator • Tail VaR • Blast Radius
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#CBF1F5]/40 border border-[#A6E3E9] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0C262D]">Lead Security Analyst</h4>
                    <span className="text-[10px] font-mono text-[#083344] font-bold">Role: analyst</span>
                  </div>
                </div>
                <p className="text-xs text-[#164E63] leading-relaxed">
                  Authorized for <strong>Vulnerability Triage Queue</strong> prioritized strictly by financial dollar impact ($) rather than raw CVSS scores, with 1-click remediation scripts and scanner ingestion.
                </p>
                <div className="text-[11px] font-mono text-[#083344] bg-white p-2 rounded-lg border border-[#A6E3E9]">
                  Authorized Views: Triage Queue • Telemetry Feeds • 1-Click Fix
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#CBF1F5]/40 border border-[#A6E3E9] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0C262D]">Independent Compliance Auditor</h4>
                    <span className="text-[10px] font-mono text-[#083344] font-bold">Role: auditor</span>
                  </div>
                </div>
                <p className="text-xs text-[#164E63] leading-relaxed">
                  Authorized strictly for <strong>SEC Form 8-K 4-Day Materiality Evaluation</strong>, <strong>DORA Article 16 Third-Party Concentration Risk</strong>, and immutable cryptographic SHA-256 audit logs. Read-only enforced.
                </p>
                <div className="text-[11px] font-mono text-[#083344] bg-white p-2 rounded-lg border border-[#A6E3E9]">
                  Authorized Views: SEC 8-K Evaluation • DORA SPoF • Audit Trail
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[#CBF1F5]/40 border border-[#A6E3E9] space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0C262D]">Organization Administrator</h4>
                    <span className="text-[10px] font-mono text-[#083344] font-bold">Role: admin</span>
                  </div>
                </div>
                <p className="text-xs text-[#164E63] leading-relaxed">
                  Authorized for <strong>Enterprise Tenant Provisioning</strong>, <strong>Security Tool Connectors (Wiz, Qualys, CrowdStrike, AWS, Splunk)</strong>, and <strong>RBAC Teammate Invitations</strong>.
                </p>
                <div className="text-[11px] font-mono text-[#083344] bg-white p-2 rounded-lg border border-[#A6E3E9]">
                  Authorized Views: Tenant Admin • Connectors Hub • Teammate RBAC
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Four Architectural Pillars */}
        <div className="mt-12">
          <div className="text-xs font-mono text-[#164E63] uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#71C9CE]"></span>
            <span>Architectural Guarantees & Compliance Support</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.label} className="p-6 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] hover:border-[#71C9CE] transition-all shadow-sm hover:shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-[#71C9CE] border border-[#A6E3E9] flex items-center justify-center text-[#042F2E] mb-3 shadow-sm">
                    <Icon className="w-5 h-5 text-[#042F2E]" />
                  </div>
                  <h3 className="text-base font-bold text-[#0C262D]">{p.label}</h3>
                  <p className="text-xs text-[#164E63] mt-2 leading-relaxed font-medium">{p.detail}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call-to-action Footer Card */}
        <div className="p-8 rounded-3xl bg-[#083344] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight">Ready to access your enterprise dashboard?</h3>
            <p className="text-xs text-cyan-200 font-medium max-w-xl leading-relaxed">
              Sign in with your corporate credentials to view your live telemetry pipelines, financial OpenFAIR exposure, and role-authorized executive cockpits.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-6 py-3.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-black text-sm transition-all shadow-lg flex items-center gap-2"
            >
              <span>Sign In with Work Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#A6E3E9] bg-[#CBF1F5] py-6 text-xs text-[#164E63] mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-[11px] text-[#083344] font-semibold">
            AegisRisk AI • SIH26105 Implementation • OpenFAIR (ISO/IEC 27005) & 10,000 Monte Carlo Trials
          </div>
          <div className="text-[11px] text-[#164E63]">
            Supports SEC Form 8-K Item 1.05 & DORA Art. 16 documentation (SOC2 Type II Certified)
          </div>
        </div>
      </footer>
    </div>
  );
}
