"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Zap,
  Lock,
  Server,
  LineChart,
  Sparkles,
  ChevronRight,
  Shield,
  Activity,
  CheckCircle2,
  Scale,
  Moon,
  Sun,
} from "lucide-react";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("aegis_token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("aegis_user") : null;
    const theme = typeof window !== "undefined" ? localStorage.getItem("aegis_theme") : null;

    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }

    if (token) {
      setIsLoggedIn(true);
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {}
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      localStorage.setItem("aegis_theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("aegis_theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };

  const capabilities = [
    {
      icon: Zap,
      label: "Continuous Quantification",
      detail:
        "Re-quantifies Expected Annual Loss (EAL) and Value at Risk whenever telemetry changes — replacing static annual assessments with real-time financial exposure.",
    },
    {
      icon: Lock,
      label: "OpenFAIR Explainability",
      detail:
        "Every dollar figure traces back to transparent mathematical drivers: Threat Event Frequency, Vulnerability, Control Effectiveness, and Primary Loss Magnitude.",
    },
    {
      icon: Server,
      label: "Nth-Party SPoF Aware",
      detail:
        "Models correlated concentration risks across shared cloud and identity infrastructure instead of falsely assuming supplier independence.",
    },
    {
      icon: LineChart,
      label: "Closed-Loop ROSI Optimizer",
      detail:
        "Calculates Return on Security Investment with honest confidence intervals, comparing pre-deployment projections against observed telemetry drops.",
    },
  ];

  const complianceBadges = [
    { name: "RBI CSF", role: "RBI Cyber Security Framework" },
    { name: "SEBI CCRF", role: "SEBI Cyber Resilience Framework" },
    { name: "NIST CSF 2.0", role: "National Institute of Standards" },
    { name: "ISO/IEC 27001", role: "Information Security Management" },
    { name: "SEC Form 8-K", role: "Item 1.05 4-Day Materiality" },
    { name: "EU DORA", role: "Article 16 SPoF Concentration" },
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 selection:bg-[#71C9CE] selection:text-[#042F2E] ${
      isDark ? "bg-[#0B131B] text-slate-100" : "bg-[#E3FDFD] text-[#0C262D]"
    }`}>
      {/* Navigation Header */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-50 shadow-sm transition-colors ${
        isDark ? "bg-[#111C26]/90 border-[#1F3347]" : "bg-[#CBF1F5]/90 border-[#A6E3E9]"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] font-black shadow-md shadow-[#71C9CE]/30 border border-[#A6E3E9]">
              <ShieldCheck className="w-5 h-5 text-[#042F2E]" />
            </div>
            <div>
              <span className={`font-extrabold text-xl tracking-tight ${isDark ? "text-white" : "text-[#0C262D]"}`}>
                AegisRisk AI
              </span>
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded bg-[#71C9CE]/25 text-[#71C9CE] border border-[#71C9CE] font-bold">
                SIH26105
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                isDark
                  ? "bg-[#162330] border-[#1F3347] text-amber-300 hover:bg-[#1F3347]"
                  : "bg-white border-[#A6E3E9] text-[#083344] hover:bg-[#CBF1F5]"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/demo"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                isDark
                  ? "text-slate-300 hover:bg-[#162330] border-transparent hover:border-[#1F3347]"
                  : "text-[#083344] hover:bg-[#A6E3E9]/50 border-transparent hover:border-[#A6E3E9]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#71C9CE]" />
              <span>Interactive Demo</span>
            </Link>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-[#083344] hover:bg-[#0C262D] text-white text-xs font-mono font-bold shadow-sm flex items-center gap-1.5 border border-[#71C9CE]/30"
              >
                <span>Dashboard ({currentUser?.role || "Active"})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] text-xs font-mono font-extrabold shadow-sm transition-all flex items-center gap-1.5 border border-[#71C9CE]"
              >
                <span>Corporate Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 max-w-7xl mx-auto flex flex-col justify-center">
        <div className="max-w-4xl">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-6 shadow-sm border ${
            isDark
              ? "bg-[#162330] border-[#1F3347] text-[#71C9CE]"
              : "bg-[#CBF1F5] border-[#A6E3E9] text-[#083344]"
          }`}>
            <Zap className="w-3.5 h-3.5 text-[#71C9CE]" />
            <span>Continuous Cyber Risk Quantification & ROSI Optimization</span>
          </div>

          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] ${
            isDark ? "text-white" : "text-[#0C262D]"
          }`}>
            Turn raw security telemetry into{" "}
            <span className="text-[#71C9CE] underline decoration-[#71C9CE] decoration-wavy decoration-4">
              board-ready financial risk
            </span>{" "}
            — continuously.
          </h1>

          <p className={`mt-6 text-base sm:text-lg leading-relaxed max-w-2xl font-medium ${
            isDark ? "text-slate-300" : "text-[#164E63]"
          }`}>
            AegisRisk AI replaces static annual spreadsheets with automated OpenFAIR quantification and
            10,000-trial Monte Carlo simulations. Measure your cyber exposure in actual currency ($ USD / ₹ INR)
            and optimize security capital allocation under explicit budget constraints.
          </p>

          {/* Primary Action CTAs */}
          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <Link
              href="/demo"
              className="px-6 py-3.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-sm transition-all shadow-lg shadow-[#71C9CE]/30 flex items-center gap-2 border border-[#71C9CE]"
            >
              <Sparkles className="w-4 h-4 text-[#042F2E]" />
              <span>Explore Interactive Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className={`px-6 py-3.5 rounded-xl border font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
                  isDark
                    ? "bg-[#162330] hover:bg-[#1F3347] text-white border-[#1F3347] hover:border-[#71C9CE]"
                    : "bg-[#CBF1F5] hover:bg-white text-[#0C262D] border-[#A6E3E9] hover:border-[#71C9CE]"
                }`}
              >
                <span>Enter Your Authenticated Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className={`px-6 py-3.5 rounded-xl border font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
                  isDark
                    ? "bg-[#162330] hover:bg-[#1F3347] text-white border-[#1F3347] hover:border-[#71C9CE]"
                    : "bg-white hover:bg-[#CBF1F5] text-[#0C262D] border-[#A6E3E9] hover:border-[#71C9CE]"
                }`}
              >
                <span>Sign In to Live Platform</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Executive Benchmark Stats Strip */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t ${
          isDark ? "border-[#1F3347]" : "border-[#A6E3E9]"
        }`}>
          <div className={`p-5 rounded-2xl border shadow-sm ${
            isDark ? "bg-[#111C26] border-[#1F3347]" : "bg-[#CBF1F5]/70 border-[#A6E3E9]"
          }`}>
            <div className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
              isDark ? "text-[#71C9CE]" : "text-[#164E63]"
            }`}>
              Baseline Quantified Loss
            </div>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${isDark ? "text-white" : "text-[#083344]"}`}>
              $27.3M EAL
            </div>
            <div className={`text-[11px] font-mono mt-1 ${isDark ? "text-slate-400" : "text-[#164E63]"}`}>
              OpenFAIR calibrated baseline
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm ${
            isDark ? "bg-[#111C26] border-[#1F3347]" : "bg-[#CBF1F5]/70 border-[#A6E3E9]"
          }`}>
            <div className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
              isDark ? "text-[#71C9CE]" : "text-[#164E63]"
            }`}>
              Monte Carlo Precision
            </div>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${isDark ? "text-white" : "text-[#083344]"}`}>
              10,000 Trials
            </div>
            <div className={`text-[11px] font-mono mt-1 ${isDark ? "text-slate-400" : "text-[#164E63]"}`}>
              Fat-tail EVT jump modeling
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm ${
            isDark ? "bg-[#111C26] border-[#1F3347]" : "bg-[#CBF1F5]/70 border-[#A6E3E9]"
          }`}>
            <div className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
              isDark ? "text-[#71C9CE]" : "text-[#164E63]"
            }`}>
              ROSI Optimization
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-500 mt-1">
              +420% Max
            </div>
            <div className={`text-[11px] font-mono mt-1 ${isDark ? "text-slate-400" : "text-[#164E63]"}`}>
              Knapsack budget solver
            </div>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm ${
            isDark ? "bg-[#111C26] border-[#1F3347]" : "bg-[#CBF1F5]/70 border-[#A6E3E9]"
          }`}>
            <div className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
              isDark ? "text-[#71C9CE]" : "text-[#164E63]"
            }`}>
              Audit Assurance
            </div>
            <div className={`text-2xl sm:text-3xl font-black mt-1 ${isDark ? "text-white" : "text-[#083344]"}`}>
              100% Verifiable
            </div>
            <div className={`text-[11px] font-mono mt-1 ${isDark ? "text-slate-400" : "text-[#164E63]"}`}>
              SEC 8-K & RBI compliant
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Guarantees */}
      <section className="px-6 py-12 max-w-7xl mx-auto w-full">
        <div className={`text-xs font-mono uppercase font-bold tracking-wider mb-6 flex items-center gap-2 ${
          isDark ? "text-[#71C9CE]" : "text-[#164E63]"
        }`}>
          <span className="w-2 h-2 rounded-full bg-[#71C9CE]"></span>
          <span>Core Capabilities & Mathematical Foundations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.label}
                className={`p-6 rounded-2xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                  isDark
                    ? "bg-[#111C26] border-[#1F3347] hover:border-[#71C9CE]"
                    : "bg-[#CBF1F5] border-[#A6E3E9] hover:border-[#71C9CE]"
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#71C9CE] border border-[#A6E3E9] flex items-center justify-center text-[#042F2E] mb-4 shadow-sm">
                    <Icon className="w-5 h-5 text-[#042F2E]" />
                  </div>
                  <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-[#0C262D]"}`}>{p.label}</h3>
                  <p className={`text-xs mt-2 leading-relaxed font-medium ${isDark ? "text-slate-300" : "text-[#164E63]"}`}>
                    {p.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Regulatory Compliance & Framework Alignment */}
      <section className="px-6 py-8 max-w-7xl mx-auto w-full">
        <div className={`p-6 rounded-2xl border shadow-sm ${
          isDark ? "bg-[#111C26] border-[#1F3347]" : "bg-white border-[#A6E3E9]"
        }`}>
          <div className={`text-xs font-mono uppercase font-bold tracking-wider mb-4 flex items-center gap-2 ${
            isDark ? "text-[#71C9CE]" : "text-[#164E63]"
          }`}>
            <Shield className="w-4 h-4 text-[#71C9CE]" />
            <span>Built-In Enterprise Framework & Regulatory Mapping</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {complianceBadges.map((b) => (
              <div
                key={b.name}
                className={`p-3 rounded-xl border text-center space-y-1 transition-colors ${
                  isDark
                    ? "bg-[#162330]/80 border-[#1F3347] hover:bg-[#162330]"
                    : "bg-[#CBF1F5]/40 border-[#A6E3E9] hover:bg-[#CBF1F5]"
                }`}
              >
                <div className={`text-xs font-mono font-black ${isDark ? "text-[#71C9CE]" : "text-[#083344]"}`}>
                  {b.name}
                </div>
                <div className={`text-[10px] font-medium truncate ${isDark ? "text-slate-400" : "text-[#164E63]"}`}>
                  {b.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Call-to-action Banner */}
      <section className="px-6 py-12 max-w-7xl mx-auto w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#083344] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-[#71C9CE]/20">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to explore continuous cyber risk quantification?
            </h3>
            <p className="text-xs sm:text-sm text-cyan-200 font-medium max-w-xl leading-relaxed">
              Launch our interactive sandbox to test What-If scenarios, explore the 4-pillar forensic incident timeline,
              or sign in with your enterprise credentials.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center justify-center">
            <Link
              href="/demo"
              className="px-6 py-3 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-black text-xs transition-all shadow-md flex items-center gap-2"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
            >
              <span>Create Tenant Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t py-8 px-6 mt-auto text-center text-xs font-mono transition-colors ${
        isDark ? "border-[#1F3347] bg-[#0A1016] text-slate-500" : "border-[#A6E3E9] bg-white text-[#164E63]"
      }`}>
        <p>AegisRisk AI — Continuous Cyber Risk Quantification & ROSI Investment Optimization</p>
        <p className="mt-1 text-[10px] opacity-75">
          Built for SIH26105 • OpenFAIR v2 Compliant • SEC Item 1.05 & DORA Art. 16 Ready
        </p>
      </footer>
    </div>
  );
}
