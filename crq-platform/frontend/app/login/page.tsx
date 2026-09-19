"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Mail, Lock, CheckCircle2, UserCheck } from "lucide-react";
import { api, setActiveRole, setActiveOrgId } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ciso@acme-fin.com");
  const [password, setPassword] = useState("password123");
  const [selectedRole, setSelectedRole] = useState<string>("ciso");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const corporateProfiles = [
    {
      role: "ciso",
      name: "David Chen",
      title: "Chief Information Security Officer",
      email: "ciso@acme-fin.com",
      desc: "Executive Cockpit, What-If simulator, and ROSI approval",
      badge: "bg-[#71C9CE]/25 text-[#083344] border border-[#71C9CE]",
    },
    {
      role: "analyst",
      name: "Marcus Brody",
      title: "Lead Security Analyst",
      email: "analyst@acme-fin.com",
      desc: "Vulnerability triage queue prioritized by financial $ exposure",
      badge: "bg-[#CBF1F5] text-[#0C262D] border border-[#A6E3E9]",
    },
    {
      role: "auditor",
      name: "Elena Rostova",
      title: "Compliance & Regulatory Auditor",
      email: "auditor@compliance.com",
      desc: "OpenFAIR logs, cryptographic hashes, SEC 8-K & DORA evidence",
      badge: "bg-purple-100 text-purple-900 border border-purple-300",
    },
    {
      role: "admin",
      name: "Sarah Vance",
      title: "Organization Administrator",
      email: "admin@acme-fin.com",
      desc: "Tenant configuration, team roles, and connector telemetry",
      badge: "bg-emerald-100 text-emerald-900 border border-emerald-300",
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      if (res.token) {
        localStorage.setItem("aegis_token", res.token);
        localStorage.setItem("aegis_role", res.user.role);
        localStorage.setItem("aegis_user", JSON.stringify(res.user));
        localStorage.setItem("aegis_org", JSON.stringify(res.organization));
        setActiveRole(res.user.role);
        setActiveOrgId(res.organization.id);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid corporate credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E3FDFD] text-[#0C262D] flex flex-col justify-center py-12 px-6 selection:bg-[#71C9CE] selection:text-[#042F2E]">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#083344] font-extrabold text-2xl">
            <div className="w-9 h-9 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] shadow-md shadow-[#71C9CE]/30 border border-[#A6E3E9]">
              <ShieldCheck className="w-5 h-5 text-[#042F2E]" />
            </div>
            <span className="text-[#0C262D]">AegisRisk AI</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0C262D]">Sign In to Corporate Workspace</h1>
          <p className="text-xs text-[#164E63] font-medium">
            Enter your credentials to access the production risk quantification platform.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold shadow-sm">
            {error}
          </div>
        )}

        {/* Corporate Profile Quick Selector */}
        <div className="bg-[#CBF1F5] border border-[#A6E3E9] p-5 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#083344] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#083344]" />
              <span>Select Corporate Role Profile:</span>
            </span>
            <span className="text-[10px] font-mono text-[#164E63] font-bold">
              Active: {selectedRole.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {corporateProfiles.map((p) => (
              <button
                key={p.role}
                type="button"
                onClick={() => {
                  setSelectedRole(p.role);
                  setEmail(p.email);
                  setPassword("password123");
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedRole === p.role
                    ? "bg-white border-[#71C9CE] ring-2 ring-[#71C9CE]/35 shadow-sm"
                    : "bg-white/80 border-[#A6E3E9] hover:bg-white hover:border-[#71C9CE]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[#0C262D]">{p.name}</span>
                  <span className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${p.badge}`}>
                    {p.role}
                  </span>
                </div>
                <div className="text-[10px] text-[#164E63] font-mono font-semibold">{p.email}</div>
                <div className="text-[10px] text-[#0C262D]/75 mt-1 leading-snug">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Corporate Credentials Form */}
        <form onSubmit={handleLogin} className="bg-white border border-[#A6E3E9] p-6 rounded-2xl space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-[#A6E3E9]/50 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0C262D]">
              Corporate Credentials (Email & Password)
            </span>
            <span className="text-[10px] font-mono text-emerald-800 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Verified Role: {selectedRole.toUpperCase()}</span>
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#0C262D] mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#164E63] absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#E3FDFD]/30 border border-[#A6E3E9] rounded-xl text-xs font-mono text-[#0C262D] focus:outline-none focus:border-[#71C9CE] placeholder:text-[#164E63]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0C262D] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#164E63] absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#E3FDFD]/30 border border-[#A6E3E9] rounded-xl text-xs font-mono text-[#0C262D] focus:outline-none focus:border-[#71C9CE] placeholder:text-[#164E63]/40"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-[#164E63]">
              Organization: <strong className="text-[#083344]">Acme CyberFin Corp</strong>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-black text-xs transition-all shadow-md shadow-[#71C9CE]/25 flex items-center justify-center gap-1.5 disabled:opacity-50 border border-[#71C9CE]"
            >
              <span>{loading ? "Authenticating Session..." : "Sign In to Corporate Dashboard"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <div className="text-center text-[11px] text-[#164E63]">
          Need a separate enterprise organization?{" "}
          <Link href="/signup" className="text-[#083344] font-extrabold underline decoration-[#71C9CE]">
            Provision New Tenant
          </Link>
        </div>
      </div>
    </div>
  );
}
