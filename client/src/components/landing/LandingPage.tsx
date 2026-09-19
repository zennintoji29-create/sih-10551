import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Activity,
  CheckCircle2,
  Lock,
  Layers,
  BarChart3,
  Plug,
  Sparkles,
  Server,
  Scale,
  Cpu,
  UserCheck,
  Zap,
  Play
} from 'lucide-react';
import { UserRole } from '../../types/risk';

interface LandingPageProps {
  onOpenAuth: (mode: 'LOGIN' | 'SIGNUP', prefillRole?: UserRole) => void;
  onEnterDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onEnterDemo }) => {
  // 4 Core Architecture Pillars from Continuum CRQ (SIH26105)
  const pillars = [
    {
      label: "Continuous",
      title: "Real-Time Re-Quantification",
      detail: "Re-quantifies EAL and 95% VaR automatically as security telemetry changes — eliminating obsolete quarterly audit snapshots.",
      icon: Activity,
      accent: "border-cyan-500/40 text-cyan-400 bg-cyan-950/20"
    },
    {
      label: "Explainable",
      title: "FAIR-Transparent & Defensible",
      detail: "Every dollar traces back to open mathematical formulas (LEF × PLM) and isolated causal drivers, delivering board-level defensibility with zero black boxes.",
      icon: ShieldAlert,
      accent: "border-blue-500/40 text-blue-400 bg-blue-950/20"
    },
    {
      label: "Nth-Party Aware",
      title: "Correlated Supply-Chain Exposure",
      detail: "Vendor dependency graphs surface hidden Single Points of Failure (SPoF) across shared cloud regions and IdPs, calculating correlated fat-tail loss.",
      icon: Layers,
      accent: "border-purple-500/40 text-purple-400 bg-purple-950/20"
    },
    {
      label: "Investment-Linked",
      title: "Closed-Loop ROSI Optimization",
      detail: "Ranks defensive controls using Knapsack budget optimization, then empirically measures post-deployment loss reduction against prediction.",
      icon: TrendingDown,
      accent: "border-emerald-500/40 text-emerald-400 bg-emerald-950/20"
    }
  ];

  // 4 Role-Based Stakeholder Workspaces (Multi-Tenant RBAC)
  const roleProfiles: Array<{ role: UserRole; title: string; persona: string; desc: string; metrics: string }> = [
    {
      role: 'CISO',
      title: 'Executive Boardroom & CISO Cockpit',
      persona: 'Marcus Sterling · Chief Information Security Officer',
      desc: 'Portfolio EAL, 95% Value at Risk, loss exceedance curve percentiles, peer benchmarking, and board-ready capital allocation.',
      metrics: 'EAL: $5.55M · VaR (95%): $10.07M · Optimal ROSI: +648%'
    },
    {
      role: 'SECURITY_ANALYST',
      title: 'SecOps Analyst Triage Workbench',
      persona: 'Elena Rostova · Senior Security Analyst',
      desc: 'Operational vulnerability triage ordered by financial loss impact ($ EAL), asset valuations, CVE exploitability, and virtual patching.',
      metrics: '4 Active Exposures · CISA KEV Exploited · $150k Weekly Delta'
    },
    {
      role: 'COMPLIANCE_AUDITOR',
      title: 'Regulatory & Compliance Assurance Hub',
      persona: 'David Vance · Senior Compliance Auditor (Read-Only)',
      desc: 'Point-in-time historical replay, SEC Rule 106 4-day materiality determinations, DORA Art. 16 stress testing, and cryptographic SHA-256 logs.',
      metrics: 'SEC 4-Day Checklist · DORA Passed · 100% Tamper-Evident Hash Chain'
    },
    {
      role: 'ADMIN',
      title: 'Tenant Admin & 5-Feed Ingestion Hub',
      persona: 'Sarah Chen · SecOps Platform Administrator',
      desc: 'Organization tenant setup, RBAC provisioning, and 5-category data connectors (Tenable, CrowdStrike, AWS Security Hub, Splunk, CISA KEV).',
      metrics: '5 Feeds Active · 94% Data Confidence Index · Hourly Telemetry Sync'
    }
  ];

  const connectors = [
    { name: 'Tenable.io / Nessus', category: 'Vulnerability Scanner', metric: '614 active CVEs normalized', status: 'Connected' },
    { name: 'CrowdStrike Falcon', category: 'EDR Telemetry', metric: '94.2% sensor coverage', status: 'Connected' },
    { name: 'AWS Security Hub', category: 'Cloud CSPM / IAM', metric: '6 accounts · 2 critical misconfigs', status: 'Connected' },
    { name: 'Splunk Enterprise', category: 'SIEM Log Telemetry', metric: '14,820 events/sec · TEF baseline', status: 'Connected' },
    { name: 'CISA KEV Catalog', category: 'Threat Intelligence', metric: 'Live feed · 1,280 exploited CVEs', status: 'Active' },
  ];

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP BAR: logo and header (Left) + login/signup/demo (Right)
          Matches user's hand-drawn wireframe specification
      ────────────────────────────────────────────────────────────── */}
      <header className="border-b border-surface-border/70 bg-[#0A0E1A]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo and Header */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-cyan-400/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                  AegisRisk <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">AI</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline px-2 py-0.5 rounded-full bg-slate-900 border border-surface-border">
                  Continuum CRQ
                </span>
              </div>
              <span className="text-xs text-slate-400 block -mt-0.5 font-medium">
                Continuous Cyber Risk Quantification & Investment Optimization Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-slate-300">
            <a href="#company" className="hover:text-cyan-400 transition-colors">Platform</a>
            <a href="#pillars" className="hover:text-cyan-400 transition-colors">Architecture</a>
            <a href="#roles" className="hover:text-cyan-400 transition-colors">Role Workspaces</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Subscription Plans</a>
          </nav>

          {/* Right Action Button Group: login / signup / demo */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => onOpenAuth('LOGIN')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-transparent hover:border-surface-border"
              id="header-login-btn"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuth('SIGNUP')}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-lg shadow-sm transition-all"
              id="header-signup-btn"
            >
              Create Org
            </button>
            <button
              onClick={onEnterDemo}
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-lg shadow-lg shadow-blue-600/25 flex items-center space-x-1.5 transition-all"
              id="header-demo-btn"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Product</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
          Matches wireframe:
          - Distinct central container with "sass text about the company"
          - Below card: centered "a text and demo button"
      ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-surface-border/40">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          {/* Eyebrow Pill */}
          <div className="flex justify-center">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-600/50 text-cyan-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SIH26105 · AI-Powered Continuous Cyber Risk Quantification Platform</span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              CENTRAL HERO CARD: "sass text about the company"
              (Enclosed card layout strictly matching user's sketch)
          ────────────────────────────────────────────────────────── */}
          <div id="company" className="relative rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#0F172A]/90 via-[#0B1229]/95 to-[#090D1A]/95 p-8 sm:p-12 shadow-2xl shadow-blue-950/40 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-5">
              <div>
                <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold tracking-widest block">
                  Enterprise CRQ Architecture · Production Grade
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
                  Turn security telemetry into board-ready financial risk —{' '}
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300 bg-clip-text text-transparent">
                    continuously.
                  </span>
                </h1>
              </div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 text-xs font-mono font-semibold shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active 10k MC Engine</span>
              </div>
            </div>

            {/* Rich SaaS Text About the Company & Platform */}
            <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              <p>
                <strong className="text-white">AegisRisk AI (Continuum)</strong> is a continuous financial risk-calculation engine designed to eliminate the fatal shortcomings of static risk heatmaps, arbitrary 1–5 scoring matrices, and stale quarterly PDFs.
              </p>
              <p className="text-slate-400 text-xs sm:text-sm">
                Our platform continuously streams live telemetry across your vulnerability scanners (Tenable), endpoint detection (CrowdStrike), cloud infrastructure (AWS Security Hub), and SIEM logs (Splunk). Grounded in the <span className="text-slate-200 font-semibold">OpenFAIR™ mathematical framework (ISO/IEC 27005)</span> and a <span className="text-slate-200 font-semibold">10,000-iteration Monte Carlo simulation</span>, every metric on screen is directly traceable to defensible financial calculations: <strong className="text-cyan-300">Expected Annual Loss (EAL)</strong>, <strong className="text-amber-300">95% Value at Risk (VaR)</strong>, and <strong className="text-emerald-300">Return on Security Investment (ROSI)</strong>.
              </p>
            </div>

            {/* Enterprise Architectural Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-surface-border/80">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>OpenFAIR Standard Decomposition</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>10,000 Monte Carlo Iterations</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Knapsack Budget ROSI Optimizer</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Correlated Third-Party SPoF</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>SEC Rule 106 4-Day Materiality</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>SHA-256 Tamper-Evident Audit</span>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              CENTERED CTA CONTAINER: "a text and demo button"
              (Strictly matching user's sketch positioned below card)
          ────────────────────────────────────────────────────────── */}
          <div className="pt-2 text-center space-y-4">
            <p className="text-xs sm:text-sm font-medium text-slate-400">
              Ready to explore the live financial engine with 10,000 Monte Carlo iterations?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onEnterDemo}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2.5 transition-all transform hover:scale-[1.02]"
                id="hero-launch-live-product-btn"
              >
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                <span>Launch Real Model Product & Live Cockpit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onOpenAuth('LOGIN', 'CISO')}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-surface-border text-xs font-bold transition-all"
              >
                Sign In with Role (1-Click Persona)
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              LIVE FINANCIAL METRIC PREVIEW (Inspired by MetricCard.tsx)
          ────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-left">
            <div className="rounded-2xl border border-surface-border bg-slate-900/70 p-5 backdrop-blur-sm space-y-1">
              <span className="text-[10px] uppercase text-slate-400 font-mono font-bold tracking-wider block">
                Portfolio EAL
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-white block">
                $5.55M
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-medium block">
                ↓ -$180k Post-MFA
              </span>
              <span className="text-[10px] text-slate-500 block">Expected Annual Loss</span>
            </div>

            <div className="rounded-2xl border border-surface-border bg-slate-900/70 p-5 backdrop-blur-sm space-y-1">
              <span className="text-[10px] uppercase text-slate-400 font-mono font-bold tracking-wider block">
                95% Value at Risk
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-300 block">
                $10.07M
              </span>
              <span className="text-[11px] text-slate-400 font-mono font-medium block">
                1-in-20 Year Tail Event
              </span>
              <span className="text-[10px] text-slate-500 block">Fat-Tail Monte Carlo</span>
            </div>

            <div className="rounded-2xl border border-surface-border bg-slate-900/70 p-5 backdrop-blur-sm space-y-1">
              <span className="text-[10px] uppercase text-slate-400 font-mono font-bold tracking-wider block">
                Knapsack ROSI
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-300 block">
                +648%
              </span>
              <span className="text-[11px] text-cyan-400 font-mono font-medium block">
                $500k Budget Optimized
              </span>
              <span className="text-[10px] text-slate-500 block">Return on Investment</span>
            </div>

            <div className="rounded-2xl border border-surface-border bg-slate-900/70 p-5 backdrop-blur-sm space-y-1">
              <span className="text-[10px] uppercase text-slate-400 font-mono font-bold tracking-wider block">
                Attribution Delta
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-rose-400 block">
                +$150,000
              </span>
              <span className="text-[11px] text-slate-300 font-mono font-medium block truncate">
                CVE-2025-1234 on Payment API
              </span>
              <span className="text-[10px] text-slate-500 block">What changed today</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. 4 CORE ARCHITECTURAL PILLARS (From Continuum CRQ)
      ────────────────────────────────────────────────────────────── */}
      <section id="pillars" className="py-20 border-b border-surface-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
              System Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Built to Solve the Fundamental Gaps in Cyber Risk
            </h2>
            <p className="text-xs text-slate-400">
              Grounded in empirical risk research and the SIH26105 problem statement specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-surface-border bg-slate-900/60 p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${p.accent}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">
                        Pillar 0{idx + 1}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-cyan-400 uppercase tracking-wider block">
                      {p.label}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-200 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {p.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. 4 ROLE-BASED WORKSPACES (With Instant 1-Click Role Login)
      ────────────────────────────────────────────────────────────── */}
      <section id="roles" className="py-20 border-b border-surface-border/40 bg-[#0B0F1E]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-blue-400 tracking-wider">
              Multi-Tenant Role-Based Access Control (RBAC)
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Purpose-Built Workspaces for Every Stakeholder
            </h2>
            <p className="text-xs text-slate-400">
              Select any role below to instantly log in and experience the real calculation product from their perspective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roleProfiles.map((rp) => (
              <div
                key={rp.role}
                className="rounded-2xl border border-surface-border bg-slate-900/80 p-7 space-y-5 hover:border-blue-500/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                      ROLE: {rp.role}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {rp.persona}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {rp.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rp.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-surface-border/80 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-cyan-400 truncate">
                    {rp.metrics}
                  </span>
                  <button
                    onClick={() => onOpenAuth('LOGIN', rp.role)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-600/20 shrink-0"
                  >
                    <span>Sign In as {rp.role === 'SECURITY_ANALYST' ? 'Analyst' : rp.role === 'COMPLIANCE_AUDITOR' ? 'Auditor' : rp.role}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. DATA INGESTION CONNECTORS SHOWCASE
      ────────────────────────────────────────────────────────────── */}
      <section id="connectors" className="py-20 border-b border-surface-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
              Continuous Telemetry Pipeline
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Direct Streaming from Security & Cloud Stacks
            </h2>
            <p className="text-xs text-slate-400">
              Normalizes telemetry across 5 categories into standardized FAIR TEF and Vulnerability parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map((c, i) => (
              <div key={i} className="rounded-xl border border-surface-border bg-slate-900/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{c.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {c.status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block">{c.category}</span>
                <span className="text-xs font-mono text-slate-300 block">{c.metric}</span>
              </div>
            ))}
            <div className="rounded-xl border border-dashed border-surface-border bg-slate-950/40 p-4 flex flex-col justify-center items-center text-center space-y-1">
              <span className="text-xs font-semibold text-slate-300">+ Custom Webhook / API</span>
              <span className="text-[11px] text-slate-500">Supports Wazuh, Qualys, Sentinel, Snyk</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. SAAS PRICING TIERS
      ────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 border-b border-surface-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
              SaaS Subscription Plans
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Enterprise Scaling Tiers
            </h2>
            <p className="text-xs text-slate-400">
              Gated features, telemetry frequency, and Monte Carlo iteration capacity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-surface-border bg-slate-900/60 p-6 space-y-4">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Starter Plan</span>
              <h3 className="text-xl font-bold text-white">Periodic Assessment</h3>
              <p className="text-xs text-slate-400">For security teams starting quantitative OpenFAIR risk modeling.</p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-surface-border">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Manual CSV/JSON file uploads</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> OpenFAIR EAL calculation</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> 1,000 Monte Carlo runs</li>
              </ul>
              <button
                onClick={() => onOpenAuth('SIGNUP')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Choose Starter
              </button>
            </div>

            <div className="rounded-2xl border border-cyan-500/80 bg-slate-900/90 shadow-xl shadow-cyan-950/30 p-6 space-y-4 relative">
              <span className="absolute top-4 right-4 text-[10px] font-mono font-bold bg-cyan-400 text-black px-2 py-0.5 rounded">MOST POPULAR</span>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold">Pro Plan</span>
              <h3 className="text-xl font-bold text-white">Daily Continuous</h3>
              <p className="text-xs text-slate-400">Automated daily re-calibration on telemetry deltas and change attribution.</p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-surface-border">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> SIEM & Tenable Live Connectors</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> 10,000 Monte Carlo simulations</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Causal Risk Change Attribution</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> ROSI Budget Optimizer</li>
              </ul>
              <button
                onClick={() => onOpenAuth('SIGNUP')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Choose Pro
              </button>
            </div>

            <div className="rounded-2xl border border-surface-border bg-slate-900/60 p-6 space-y-4">
              <span className="text-xs font-mono text-purple-400 uppercase font-bold">Enterprise Plan</span>
              <h3 className="text-xl font-bold text-white">Real-Time + Correlated TPRM</h3>
              <p className="text-xs text-slate-400">Full third-party concentration modeling, closed-loop tracking, and SEC 4-day tools.</p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-surface-border">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Everything in Pro</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Correlated Third-Party SPoF Graph</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Closed-Loop Post-Deploy Validator</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> SEC 4-Day & DORA Stress Testing</li>
              </ul>
              <button
                onClick={() => onOpenAuth('SIGNUP')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Choose Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FOOTER
      ────────────────────────────────────────────────────────────── */}
      <footer className="py-8 bg-black/70 border-t border-surface-border/50 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-mono">
            <span className="text-slate-300 font-bold">AegisRisk AI (Continuum)</span>
            <span>•</span>
            <span>SIH26105 Research Implementation</span>
            <span>•</span>
            <span>OpenFAIR & ISO/IEC 27005 Grounded</span>
          </div>
          <p>© 2026 AegisRisk AI. Continuous Cyber Risk Quantification & ROSI Optimization.</p>
        </div>
      </footer>
    </div>
  );
};
