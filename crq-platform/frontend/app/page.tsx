import Link from "next/link";
import { ShieldCheck, ArrowRight, Zap, Lock, Server, LineChart } from "lucide-react";

export default function LandingPage() {
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

  const roles = [
    {
      role: "Security Analyst",
      action: "Triage Alert Queue",
      desc: "Prioritize vulnerabilities by their financial dollar exposure ($) rather than arbitrary CVSS scores.",
      color: "border-[#71C9CE] bg-white/80 text-[#0C262D]",
      badgeColor: "bg-[#71C9CE]/20 text-[#083344] border-[#71C9CE]",
    },
    {
      role: "CISO & Board",
      action: "Executive Cockpit",
      desc: "Present Expected Annual Loss, 95% Value at Risk, and justified cybersecurity capital allocation plans.",
      color: "border-[#71C9CE] bg-[#CBF1F5] text-[#0C262D] ring-2 ring-[#71C9CE]/30",
      badgeColor: "bg-[#71C9CE] text-[#042F2E] border-[#71C9CE]",
    },
    {
      role: "Compliance Auditor",
      action: "Regulatory Assurance",
      desc: "Review cryptographically signed, timestamped audit trails and quantitative SEC Form 8-K / DORA evaluations.",
      color: "border-[#A6E3E9] bg-white/80 text-[#0C262D]",
      badgeColor: "bg-[#A6E3E9]/30 text-[#083344] border-[#A6E3E9]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#E3FDFD] text-[#0C262D] flex flex-col selection:bg-[#71C9CE] selection:text-[#042F2E]">
      {/* Navigation Header */}
      <header className="border-b border-[#A6E3E9] bg-[#CBF1F5]/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
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
            <span className="text-[10px] font-mono font-bold text-[#083344]">Aegis 4-Tone Theme</span>
          </div>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="text-[#164E63] hover:text-[#0C262D] px-3 py-1.5 transition-colors font-semibold">
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#CBF1F5] text-[#0C262D] border border-[#A6E3E9] text-xs font-bold transition-all hover:border-[#71C9CE] shadow-sm"
            >
              Sign Up Org
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs transition-all shadow-md shadow-[#71C9CE]/25 flex items-center gap-1.5 border border-[#71C9CE]"
            >
              <span>Launch Live Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
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
            AegisRisk AI connects directly to your existing security tools (SIEM, vulnerability scanners, asset CMDB, threat intel)
            and continuously quantifies Expected Annual Loss, Value at Risk, and ROSI — with every dollar figure traceable back to the
            exact telemetry that produced it.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <Link
              href="/signup"
              className="px-6 py-3.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-sm transition-all shadow-lg shadow-[#71C9CE]/30 flex items-center gap-2 border border-[#71C9CE]"
            >
              <span>Create Tenant Organization</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-[#CBF1F5] hover:bg-white text-[#0C262D] border border-[#A6E3E9] font-bold text-sm transition-all hover:border-[#71C9CE] flex items-center gap-2 shadow-sm"
            >
              <span>Enter Corporate Cockpit</span>
            </Link>
          </div>
        </div>

        {/* 3 Audience Workspaces */}
        <div className="mt-16">
          <div className="text-xs font-mono text-[#164E63] uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#71C9CE]"></span>
            Built for Three Audiences Simultaneously
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div key={r.role} className={`p-6 rounded-2xl border ${r.color} transition-all shadow-sm hover:shadow-md`}>
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${r.badgeColor}`}>
                  {r.action}
                </span>
                <h3 className="text-lg font-extrabold text-[#0C262D] mt-3">{r.role}</h3>
                <p className="text-sm text-[#164E63] mt-2 leading-relaxed">{r.desc}</p>
                <Link
                  href={`/login`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#083344] hover:text-[#042F2E] underline decoration-[#71C9CE]"
                >
                  <span>Launch this persona</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#083344]" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Four Architectural Pillars */}
        <div className="mt-16">
          <div className="text-xs font-mono text-[#164E63] uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#71C9CE]"></span>
            Architectural Guarantees
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
      </section>

      {/* Footer */}
      <footer className="border-t border-[#A6E3E9] bg-[#CBF1F5] py-6 text-xs text-[#164E63]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono text-[11px] text-[#083344] font-semibold">
            AegisRisk AI • SIH26105 Implementation • OpenFAIR (ISO/IEC 27005) & 10,000 Monte Carlo Trials
          </div>
          <div className="text-[11px] text-[#164E63]">
            Supports SEC Form 8-K Item 1.05 & DORA Art. 6 documentation (does not certify compliance)
          </div>
        </div>
      </footer>
    </div>
  );
}
