"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Sliders,
  Activity,
  Lock,
  Server,
  Database,
  GitBranch,
  Network,
} from "lucide-react";

export default function DemoPage() {
  const [activeDemoTab, setActiveDemoTab] = useState<"engine" | "simulation" | "roles" | "topology">("engine");
  const [selectedPillar, setSelectedPillar] = useState<"failure" | "alert" | "forensic" | "solution">("failure");

  // What-If Simulator state
  const [mfaRollout, setMfaRollout] = useState(85);
  const [edrCoverage, setEdrCoverage] = useState(90);
  const [threatSurge, setThreatSurge] = useState(false);

  // Dynamic OpenFAIR calculation
  const baseEal = 27.3;
  const baseVar = 49.3;
  const mfaBenefit = (mfaRollout / 100) * 0.42;
  const edrBenefit = (edrCoverage / 100) * 0.38;
  const surgePenalty = threatSurge ? 1.35 : 1.0;
  const simulatedEal = Math.max(0.15, +(baseEal * (1 - (mfaBenefit + edrBenefit) * 0.6) * surgePenalty).toFixed(2));
  const simulatedVar = Math.max(0.4, +(baseVar * (1 - (mfaBenefit + edrBenefit) * 0.55) * surgePenalty).toFixed(2));
  const ealReductionPct = Math.round(((baseEal - simulatedEal) / baseEal) * 100);

  return (
    <div className="min-h-screen bg-[#E3FDFD] text-[#0C262D] flex flex-col selection:bg-[#71C9CE] selection:text-[#042F2E]">
      {/* Top Navigation Header */}
      <header className="border-b border-[#A6E3E9] bg-[#CBF1F5]/90 backdrop-blur-md sticky top-0 z-50 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-[#083344] font-extrabold text-lg">
            <div className="w-8 h-8 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] border border-[#A6E3E9] shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#042F2E]" />
            </div>
            <span className="text-[#0C262D]">AegisRisk AI</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#71C9CE]/30 text-[#083344] border border-[#71C9CE] font-black">
              INTERACTIVE DEMO
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-[#164E63] hover:text-[#0C262D] px-3 py-1.5 transition-colors"
            >
              ← Back to Overview
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] text-xs font-black transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Corporate Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Demo Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#CBF1F5] via-white to-[#CBF1F5] border-2 border-[#A6E3E9] rounded-3xl p-8 shadow-md">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#71C9CE]/25 border border-[#71C9CE] text-[#083344] text-xs font-mono font-black uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Spectrum Quantitative Risk Engine Explainer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0C262D] tracking-tight">
              Interactive AegisRisk AI Simulation Platform
            </h1>
            <p className="text-sm text-[#164E63] font-medium leading-relaxed">
              Explore how continuous OpenFAIR telemetry, Monte Carlo loss distributions, and strict role isolation replace arbitrary qualitative heatmaps with exact financial dollar-loss forecasting.
            </p>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[#A6E3E9]">
            <button
              onClick={() => setActiveDemoTab("engine")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeDemoTab === "engine"
                  ? "bg-[#083344] text-white shadow-md"
                  : "bg-white text-[#164E63] hover:bg-[#A6E3E9]/40 border border-[#A6E3E9]"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>1. 4-Pillar Incident Scenarios</span>
            </button>
            <button
              onClick={() => setActiveDemoTab("simulation")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeDemoTab === "simulation"
                  ? "bg-[#083344] text-white shadow-md"
                  : "bg-white text-[#164E63] hover:bg-[#A6E3E9]/40 border border-[#A6E3E9]"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>2. Live What-If ROSI Simulator</span>
            </button>
            <button
              onClick={() => setActiveDemoTab("topology")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeDemoTab === "topology"
                  ? "bg-[#083344] text-white shadow-md"
                  : "bg-white text-[#164E63] hover:bg-[#A6E3E9]/40 border border-[#A6E3E9]"
              }`}
            >
              <Network className="w-4 h-4" />
              <span>3. System Telemetry & Data Sheets</span>
            </button>
            <button
              onClick={() => setActiveDemoTab("roles")}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeDemoTab === "roles"
                  ? "bg-[#083344] text-white shadow-md"
                  : "bg-white text-[#164E63] hover:bg-[#A6E3E9]/40 border border-[#A6E3E9]"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>4. Enterprise Role Isolation (RBAC)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: 4-PILLAR INCIDENT SCENARIOS */}
        {activeDemoTab === "engine" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "failure", label: "💥 System Failure", sub: "Blast Radius & DB Crash", color: "#E11D48" },
                { id: "alert", label: "🚨 Security Threat Alert", sub: "Brute-Force & Vector Map", color: "#D97706" },
                { id: "forensic", label: "🔍 Forensic SIEM Log", sub: "Anomalous Lateral Query", color: "#2563EB" },
                { id: "solution", label: "✨ Optimal Solution Fix", sub: "Automated -99.4% Mitigation", color: "#0D9488" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPillar(p.id as any)}
                  className={`p-4 rounded-2xl text-left border-2 transition-all ${
                    selectedPillar === p.id
                      ? "bg-white shadow-md"
                      : "bg-[#CBF1F5]/60 hover:bg-white border-[#A6E3E9]"
                  }`}
                  style={{ borderColor: selectedPillar === p.id ? p.color : undefined }}
                >
                  <span className="text-xs font-black text-[#0C262D] block">{p.label}</span>
                  <span className="text-[11px] text-[#164E63] font-mono mt-0.5 block">{p.sub}</span>
                </button>
              ))}
            </div>

            {/* Pillar Content Showcase */}
            <div className="bg-white border-2 border-[#A6E3E9] rounded-3xl p-6 shadow-md space-y-6">
              {selectedPillar === "failure" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-1">
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-rose-700">
                      System Failure Detected • Blast Radius & Root Cause Map
                    </span>
                    <p className="text-xs text-rose-800 font-medium">
                      System failure detected. The blast radius map visualizes the impact; initial assessment points towards a database connection issue, potentially cascading to dependent services. Further investigation confirms the root cause within the failure map below (pool depletion, SPoF lock, and lateral access causing $2.55M cascading loss).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="p-4 rounded-2xl bg-[#CBF1F5]/40 border border-[#A6E3E9] space-y-2">
                      <span className="font-extrabold text-[#083344] uppercase">Tier 1: Perimeter Ingress</span>
                      <p className="text-[#164E63] font-sans text-xs">Bastion gateway buffer overflow. Ingress firewall saturated under heavy API bursts.</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">$2.55M Primary Loss</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#CBF1F5]/40 border border-[#A6E3E9] space-y-2">
                      <span className="font-extrabold text-[#083344] uppercase">Tier 2: Core Workload</span>
                      <p className="text-[#164E63] font-sans text-xs">Kubernetes payment pods failed health probes. Connection pool exhaust cascading across pods.</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">14 Microservices Stalled</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#CBF1F5]/40 border border-[#A6E3E9] space-y-2">
                      <span className="font-extrabold text-[#083344] uppercase">Tier 3: Database & Vault</span>
                      <p className="text-[#164E63] font-sans text-xs">Postgres master locked on concurrent queries. Cold vault replicas intact under immutable lock.</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">Data Zero-Wipe Confirmed</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedPillar === "alert" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-1">
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-700">
                      Security Threat Alert Triggered • Attack Vector & Ingress Map
                    </span>
                    <p className="text-xs text-amber-800 font-medium">
                      Security threat alert triggered. The vector map highlights a suspicious login attempt originating from an unknown geographical location. Analyzing the network traffic and security logs to determine the specific attack vector. A potential brute-force attack is suspected.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-4 rounded-2xl bg-[#CBF1F5]/40 border border-[#A6E3E9] space-y-2">
                      <span className="font-extrabold text-[#083344]">Vector 1: Distributed Credential Stuffing</span>
                      <p className="text-[#164E63] font-sans">4,812 authentication attempts across 340 exit nodes within 90 seconds targeting corporate VPN.</p>
                      <div className="text-[11px] text-amber-800 bg-amber-100 px-2 py-1 rounded font-bold">Origin: AS49231 (Anonymized Proxy)</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#CBF1F5]/40 border border-[#A6E3E9] space-y-2">
                      <span className="font-extrabold text-[#083344]">Mitigation State: Active</span>
                      <p className="text-[#164E63] font-sans">Hardware token challenge (WebAuthn/FIDO2) tripped. No sessions successfully created.</p>
                      <div className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-1 rounded font-bold">Blast Contained at Ingress</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedPillar === "forensic" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-300 text-blue-900 space-y-1">
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-blue-700">
                      Forensic SIEM Log Activity • Anomalous Infiltration Trace
                    </span>
                    <p className="text-xs text-blue-800 font-medium">
                      Forensic SIEM log activity reveals a series of failed authentication attempts followed by a successful login from an unusual IP, pointing towards possible credential compromise. Analyzing the subsequent actions to identify compromised accounts and data access patterns.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0C262D] text-[#A6E3E9] font-mono text-[11px] space-y-1 overflow-x-auto shadow-inner">
                    <div className="text-[#71C9CE] font-bold pb-1 border-b border-[#71C9CE]/30">Live SIEM Ingestion Event Stream</div>
                    <div>[02:14:08.104] AUTH_FAIL user="svc-batch-export" src="198.51.100.41" reason="BAD_PASSWORD"</div>
                    <div>[02:14:09.612] AUTH_FAIL user="svc-batch-export" src="198.51.100.41" reason="BAD_PASSWORD"</div>
                    <div className="text-rose-400 font-bold">[02:14:12.891] AUTH_SUCCESS user="svc-batch-export" src="198.51.100.41" mfa="BYPASSED_LEGACY_HEADER"</div>
                    <div className="text-amber-300">[02:14:15.220] QUERY "SELECT c.pan, c.ssn FROM customers c LIMIT 100000;" rows=100000 duration=480ms</div>
                    <div className="text-[#71C9CE] font-bold">[02:14:16.001] SIEM_ALERT: Automated quarantine triggered by AegisRisk sensor agent. Session killed.</div>
                  </div>
                </div>
              )}

              {selectedPillar === "solution" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 text-teal-900 space-y-1">
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-teal-800">
                      Closed-Loop Mitigation Solution • Complete Model Resolution (-99.4%)
                    </span>
                    <p className="text-xs text-teal-800 font-medium">
                      Simulated fix resolves root cause: Patch applied to Bastion ingress buffer overflow (CVE-2024-55591), hardware MFA enforced for all batch service accounts, connection pool autoscale activated, and live OpenFAIR risk recalculated to $0.15M (-99.4%).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
                    <div className="p-4 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9]">
                      <span className="text-[11px] text-[#164E63] font-bold">Initial Loss Exposure</span>
                      <div className="text-2xl font-black text-rose-700 mt-1">$27.3M</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#CBF1F5] border-2 border-[#71C9CE]">
                      <span className="text-[11px] text-[#083344] font-bold">Remediated Loss</span>
                      <div className="text-2xl font-black text-teal-800 mt-1">$0.15M</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9]">
                      <span className="text-[11px] text-[#164E63] font-bold">Net Risk Reduction</span>
                      <div className="text-2xl font-black text-emerald-700 mt-1">-99.4%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WHAT-IF ROSI SIMULATOR */}
        {activeDemoTab === "simulation" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border-2 border-[#A6E3E9] p-6 rounded-3xl space-y-6 shadow-md">
              <div>
                <h3 className="text-base font-extrabold text-[#0C262D] flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#083344]" />
                  <span>Interactive Control Levers</span>
                </h3>
                <p className="text-xs text-[#164E63] mt-1 font-medium">
                  Adjust enterprise security posture controls to observe real-time OpenFAIR loss recalculations.
                </p>
              </div>

              {/* Slider 1 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-[#083344]">Hardware MFA Rollout:</span>
                  <span className="text-[#71C9CE] font-black">{mfaRollout}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mfaRollout}
                  onChange={(e) => setMfaRollout(Number(e.target.value))}
                  className="w-full accent-[#71C9CE] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#164E63] font-mono">
                  <span>0% (Passwords only)</span>
                  <span>100% (FIDO2 Keys)</span>
                </div>
              </div>

              {/* Slider 2 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold">
                  <span className="text-[#083344]">EDR Fleet Coverage:</span>
                  <span className="text-[#71C9CE] font-black">{edrCoverage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={edrCoverage}
                  onChange={(e) => setEdrCoverage(Number(e.target.value))}
                  className="w-full accent-[#71C9CE] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#164E63] font-mono">
                  <span>0% (No telemetry)</span>
                  <span>100% (Real-time EDR)</span>
                </div>
              </div>

              {/* Threat Surge Toggle */}
              <div className="pt-3 border-t border-[#A6E3E9]">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#0C262D] block">Simulate Threat Surge</span>
                    <span className="text-[10px] text-[#164E63] block font-mono">Simulate active campaign targeting sector</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={threatSurge}
                    onChange={(e) => setThreatSurge(e.target.checked)}
                    className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Simulation Results Display */}
            <div className="lg:col-span-2 bg-white border-2 border-[#A6E3E9] p-6 rounded-3xl space-y-6 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase font-bold text-[#164E63] tracking-wider">
                  OpenFAIR Quantitative Monte Carlo Engine
                </span>
                <h3 className="text-xl font-black text-[#0C262D] mt-1">Real-Time Financial Loss Forecast</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#CBF1F5] border border-[#A6E3E9] space-y-1">
                  <span className="text-xs font-mono text-[#164E63] font-bold uppercase">Expected Annual Loss (EAL)</span>
                  <div className="text-3xl font-black text-[#083344] font-mono">${simulatedEal}M</div>
                  <span className="text-[11px] text-emerald-700 font-bold font-mono block">
                    ↓ {ealReductionPct}% vs unmitigated baseline ($27.3M)
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#CBF1F5] border-2 border-[#71C9CE] space-y-1">
                  <span className="text-xs font-mono text-[#083344] font-bold uppercase">95% Value-at-Risk (VaR)</span>
                  <div className="text-3xl font-black text-teal-800 font-mono">${simulatedVar}M</div>
                  <span className="text-[11px] text-[#164E63] font-medium font-sans block">
                    Maximum credible loss with 95% statistical confidence
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#083344] text-white text-xs font-mono flex items-center justify-between">
                <span>Monte Carlo Iterations: 10,000 trials</span>
                <span className="text-[#71C9CE] font-bold">Calculation latency: 12ms</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TOPOLOGY & DATA SHEETS */}
        {activeDemoTab === "topology" && (
          <div className="bg-white border-2 border-[#A6E3E9] p-8 rounded-3xl space-y-6 shadow-md">
            <div>
              <h3 className="text-xl font-black text-[#0C262D]">System Telemetry & Live Data Sheet Pipeline</h3>
              <p className="text-xs text-[#164E63] font-medium mt-1">
                How AegisRisk AI maps software repositories, network perimeter, identity, and workloads into quantifiable dollar risk.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-[#CBF1F5]/50 border border-[#A6E3E9] space-y-2">
                <div className="flex items-center gap-2 text-[#083344] font-extrabold">
                  <GitBranch className="w-4 h-4 text-[#71C9CE]" />
                  <span>GitHub Repositories</span>
                </div>
                <p className="text-[#164E63] font-sans text-xs">Ingests Dependabot alerts, Secret Scanning leaks, and CodeQL SAST data sheets via REST API v3.</p>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#A6E3E9] text-[#083344] font-bold block">Feed: Supply Chain SCA</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#CBF1F5]/50 border border-[#A6E3E9] space-y-2">
                <div className="flex items-center gap-2 text-[#083344] font-extrabold">
                  <Server className="w-4 h-4 text-rose-600" />
                  <span>Bastion Edge Ingress</span>
                </div>
                <p className="text-[#164E63] font-sans text-xs">Monitors firewall buffer thresholds and rate limiting on API perimeter to assess Threat Event Frequency (TEF).</p>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#A6E3E9] text-rose-700 font-bold block">Exposure: $2.55M Primary Loss</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#CBF1F5]/50 border border-[#A6E3E9] space-y-2">
                <div className="flex items-center gap-2 text-[#083344] font-extrabold">
                  <Database className="w-4 h-4 text-teal-700" />
                  <span>PostgreSQL Customer DB</span>
                </div>
                <p className="text-[#164E63] font-sans text-xs">Quantifies sensitive records at risk (PII/PAN) and calibrates secondary response cost per breached record.</p>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#A6E3E9] text-teal-800 font-bold block">Asset Value: $27.3M Critical</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ENTERPRISE ROLE ISOLATION */}
        {activeDemoTab === "roles" && (
          <div className="bg-white border-2 border-[#A6E3E9] p-8 rounded-3xl space-y-6 shadow-md">
            <div>
              <h3 className="text-xl font-black text-[#0C262D]">Cryptographic 1-to-1 Role Separation of Duties</h3>
              <p className="text-xs text-[#164E63] font-medium mt-1">
                Each corporate persona accesses strictly isolated views. Zero crossover between administration, operational triage, and executive oversight.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#CBF1F5]/60 border-2 border-[#71C9CE] space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#083344] text-white font-bold uppercase">CISO Workspace</span>
                <h4 className="text-sm font-extrabold text-[#0C262D]">Executive Risk Cockpit</h4>
                <p className="text-xs text-[#164E63]">VaR curve, capital loss projections, What-If ROSI simulator, and closed-loop model assurance.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#CBF1F5]/60 border border-[#A6E3E9] space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-800 text-white font-bold uppercase">Analyst Workspace</span>
                <h4 className="text-sm font-extrabold text-[#0C262D]">Vulnerability Triage</h4>
                <p className="text-xs text-[#164E63]">Ranked CVE triage queue prioritized by dollar business loss rather than generic CVSS scores.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#CBF1F5]/60 border border-[#A6E3E9] space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-800 text-white font-bold uppercase">Auditor Workspace</span>
                <h4 className="text-sm font-extrabold text-[#0C262D]">Regulatory Assurance</h4>
                <p className="text-xs text-[#164E63]">Read-only cryptographically signed SEC Form 8-K & DORA compliance export trails.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#CBF1F5]/60 border border-[#A6E3E9] space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-white font-bold uppercase">Admin Workspace</span>
                <h4 className="text-sm font-extrabold text-[#0C262D]">Tenant & RBAC Control</h4>
                <p className="text-xs text-[#164E63]">Tenant user lifecycle, SIEM & GitHub connector credentials, and platform provisioning.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#A6E3E9] flex justify-between items-center">
              <span className="text-xs text-[#164E63] font-medium">Ready to log in to your designated corporate role?</span>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-black text-xs transition-all shadow-sm flex items-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#A6E3E9] bg-[#CBF1F5]/60 py-6 text-center text-xs text-[#164E63] font-mono">
        AegisRisk AI • Enterprise Quantitative Cyber Risk Quantification Platform • SOC2 Type II Certified
      </footer>
    </div>
  );
}
