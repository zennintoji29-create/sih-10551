"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, UserCheck, Mail, Lock, Sparkles } from "lucide-react";
import { api, setActiveRole, setActiveOrgId } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ciso@acme-fin.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const personas = [
    {
      role: "admin",
      name: "Sarah Vance",
      title: "Organization Admin",
      email: "admin@acme-fin.com",
      desc: "Manages org settings, teammates, and live connectors",
      color: "border-[#A6E3E9] bg-white hover:border-[#71C9CE] hover:shadow-md",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
    {
      role: "ciso",
      name: "David Chen",
      title: "Chief Information Security Officer",
      email: "ciso@acme-fin.com",
      desc: "Executive Cockpit, What-If simulator, and ROSI approval",
      color: "border-[#71C9CE] bg-white ring-2 ring-[#71C9CE]/30 hover:shadow-md",
      badge: "bg-[#71C9CE]/20 text-[#083344] border-[#71C9CE]",
    },
    {
      role: "analyst",
      name: "Marcus Brody",
      title: "Lead Security Analyst",
      email: "analyst@acme-fin.com",
      desc: "Prioritizes vulnerability queue by financial $ impact",
      color: "border-[#A6E3E9] bg-white hover:border-[#71C9CE] hover:shadow-md",
      badge: "bg-[#CBF1F5] text-[#0C262D] border-[#A6E3E9]",
    },
    {
      role: "auditor",
      name: "Elena Rostova",
      title: "Regulatory Compliance Auditor",
      email: "auditor@compliance.com",
      desc: "Verifies OpenFAIR logs, cryptographic hashes, and SEC Form 8-K / DORA reports",
      color: "border-[#A6E3E9] bg-white hover:border-[#71C9CE] hover:shadow-md",
      badge: "bg-purple-100 text-purple-800 border-purple-300",
    },
  ];

  const handlePersonaLogin = async (role: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ personaRole: role });
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
      setError(err.message || "Failed to log in as persona");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
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
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E3FDFD] text-[#0C262D] flex flex-col justify-center py-12 px-6 selection:bg-[#71C9CE] selection:text-[#042F2E]">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#083344] font-extrabold text-2xl">
            <div className="w-9 h-9 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] shadow-md shadow-[#71C9CE]/30 border border-[#A6E3E9]">
              <ShieldCheck className="w-5 h-5 text-[#042F2E]" />
            </div>
            <span className="text-[#0C262D]">AegisRisk AI</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-[#0C262D] mt-3">Log In to Your Workspace</h1>
          <p className="text-sm text-[#164E63] mt-1 font-medium">
            Access your tenant's risk quantification models, telemetry feeds, and audit records.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* 1-Click Persona Quick Switcher */}
        <div className="bg-[#CBF1F5] border border-[#A6E3E9] p-6 rounded-2xl mb-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#A6E3E9]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#083344]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#083344]">
                1-Click Evaluator Personas (Step 2 Roles)
              </h2>
            </div>
            <span className="text-[11px] text-[#164E63] font-mono font-bold">Instant Test Access</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personas.map((p) => (
              <button
                key={p.role}
                onClick={() => handlePersonaLogin(p.role)}
                disabled={loading}
                className={`text-left p-4 rounded-xl border transition-all ${p.color} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0C262D]">{p.name}</span>
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${p.badge}`}>
                      {p.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#164E63] font-semibold block mt-0.5">{p.title}</span>
                  <p className="text-[11px] text-[#0C262D]/80 mt-2 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-3 flex items-center justify-end text-[11px] font-bold text-[#083344]">
                  <span>Enter as {p.name.split(" ")[0]}</span>
                  <ArrowRight className="w-3 h-3 ml-1 text-[#083344]" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleEmailLogin} className="bg-[#CBF1F5] border border-[#A6E3E9] p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#083344]">
              Or Sign In with Corporate Email & Password
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#71C9CE]/25 text-[#083344] font-bold border border-[#71C9CE]">
              Demo Pass: password123
            </span>
          </div>

          {/* Quick Demo Credentials Autofill Selector */}
          <div className="p-3 rounded-xl bg-white border border-[#A6E3E9] space-y-2">
            <span className="text-[11px] font-mono text-[#164E63] font-bold block">
              Quick Autofill Demo Accounts (Click to Fill):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("ciso@acme-fin.com");
                  setPassword("password123");
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#CBF1F5] hover:bg-[#71C9CE] hover:text-[#042F2E] text-[#083344] border border-[#A6E3E9] text-[10px] font-mono font-bold transition-all text-center"
              >
                CISO Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("analyst@acme-fin.com");
                  setPassword("password123");
                }}
                className="px-2.5 py-1.5 rounded-lg bg-[#CBF1F5] hover:bg-[#71C9CE] hover:text-[#042F2E] text-[#083344] border border-[#A6E3E9] text-[10px] font-mono font-bold transition-all text-center"
              >
                Analyst Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("auditor@compliance.com");
                  setPassword("password123");
                }}
                className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-200 text-purple-900 border border-purple-200 text-[10px] font-mono font-bold transition-all text-center"
              >
                Auditor Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@acme-fin.com");
                  setPassword("password123");
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-200 text-emerald-900 border border-emerald-200 text-[10px] font-mono font-bold transition-all text-center"
              >
                Admin Account
              </button>
            </div>
          </div>

          <div className="space-y-3">
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
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#A6E3E9] rounded-xl text-sm text-[#0C262D] focus:outline-none focus:border-[#71C9CE] placeholder:text-[#164E63]/40"
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
                  placeholder="password123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#A6E3E9] rounded-xl text-sm text-[#0C262D] focus:outline-none focus:border-[#71C9CE] placeholder:text-[#164E63]/40"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link href="/signup" className="text-xs text-[#164E63] hover:text-[#0C262D]">
              Need a new tenant? <span className="text-[#083344] font-extrabold underline decoration-[#71C9CE]">Sign up</span>
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs transition-all shadow-md shadow-[#71C9CE]/25 flex items-center gap-1.5 disabled:opacity-50 border border-[#71C9CE]"
            >
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
