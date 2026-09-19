"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ArrowRight,
  Mail,
  Lock,
  Loader2,
  Settings,
  BarChart3,
  Terminal,
  Scale,
  CheckCircle2,
} from "lucide-react";
import { api, setActiveRole, setActiveOrgId } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticatingRole, setAuthenticatingRole] = useState<string | null>(null);

  const performLogin = async (credentials: { email?: string; password?: string; personaRole?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(credentials);
      if (res.token) {
        localStorage.setItem("aegis_token", res.token);
        localStorage.setItem("aegis_role", res.user.role);
        localStorage.setItem("aegis_user", JSON.stringify(res.user));
        localStorage.setItem("aegis_org", JSON.stringify(res.organization));
        setActiveRole(res.user.role);
        setActiveOrgId(res.organization.id);
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
      setAuthenticatingRole(null);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your work email.");
      return;
    }
    performLogin({ email: email.trim(), password });
  };

  const handleQuickRoleLogin = (role: "admin" | "ciso" | "analyst" | "auditor") => {
    setAuthenticatingRole(role);
    performLogin({ personaRole: role });
  };

  return (
    <div className="min-h-screen bg-[#E3FDFD] text-[#0C262D] flex flex-col justify-center py-12 px-6 selection:bg-[#71C9CE] selection:text-[#042F2E]">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 text-[#083344] font-extrabold text-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] shadow-md shadow-[#71C9CE]/30 border border-[#A6E3E9]">
              <ShieldCheck className="w-5 h-5 text-[#042F2E]" />
            </div>
            <span className="text-[#0C262D]">AegisRisk AI</span>
          </div>
          <h1 className="text-2xl font-black text-[#0C262D] tracking-tight">Enterprise Session Sign In</h1>
          <p className="text-xs text-[#164E63] font-medium max-w-md mx-auto">
            Choose your enterprise governance role below or enter your corporate credentials to access your isolated workspace.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold shadow-sm">
            {error}
          </div>
        )}

        {/* 1-Click Role Direct Sign-In Cards (Guaranteed Role Isolation) */}
        <div className="bg-white border border-[#A6E3E9] p-6 rounded-2xl space-y-3 shadow-lg shadow-[#083344]/5">
          <div className="text-[11px] font-mono uppercase font-bold text-[#164E63] tracking-wider mb-1 flex items-center justify-between">
            <span>Direct Enterprise Role Access</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Role Isolated
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Admin */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickRoleLogin("admin")}
              className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Administrator</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-200/60 text-emerald-900 font-bold">
                  admin
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 font-medium leading-tight">
                Tenant setup, security connectors, RBAC team management.
              </p>
              <div className="text-[10px] font-mono text-emerald-700 font-bold mt-2 flex items-center gap-1">
                <span>admin@acme-fin.com</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* CISO */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickRoleLogin("ciso")}
              className="p-3.5 rounded-xl border border-[#71C9CE] bg-[#CBF1F5]/40 hover:bg-[#CBF1F5] text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#042F2E] flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[#083344]" />
                  <span>CISO & Board</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#71C9CE]/40 text-[#042F2E] font-bold">
                  ciso
                </span>
              </div>
              <p className="text-[11px] text-[#164E63] mt-1 font-medium leading-tight">
                Executive risk cockpit, What-If ROSI simulator, tail VaR.
              </p>
              <div className="text-[10px] font-mono text-[#083344] font-bold mt-2 flex items-center gap-1">
                <span>ciso@acme-fin.com</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Analyst */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickRoleLogin("analyst")}
              className="p-3.5 rounded-xl border border-sky-300 bg-sky-50/50 hover:bg-sky-100/70 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-950 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-sky-700" />
                  <span>Security Analyst</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-200/60 text-sky-900 font-bold">
                  analyst
                </span>
              </div>
              <p className="text-[11px] text-sky-800 mt-1 font-medium leading-tight">
                Vulnerability triage by financial loss ($), 1-click remediation.
              </p>
              <div className="text-[10px] font-mono text-sky-700 font-bold mt-2 flex items-center gap-1">
                <span>analyst@acme-fin.com</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Auditor */}
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickRoleLogin("auditor")}
              className="p-3.5 rounded-xl border border-purple-300 bg-purple-50/50 hover:bg-purple-100/70 text-left transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-purple-700" />
                  <span>Compliance Auditor</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-200/60 text-purple-900 font-bold">
                  auditor
                </span>
              </div>
              <p className="text-[11px] text-purple-800 mt-1 font-medium leading-tight">
                SEC Form 8-K 4-day materiality, DORA, immutable SHA-256 log.
              </p>
              <div className="text-[10px] font-mono text-purple-700 font-bold mt-2 flex items-center gap-1">
                <span>auditor@acme-fin.com</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>

          <div className="relative py-2 flex items-center justify-center">
            <div className="border-t border-[#A6E3E9] w-full" />
            <span className="bg-white px-3 text-[10px] font-mono text-[#164E63] uppercase tracking-wider absolute">
              or enter custom credentials
            </span>
          </div>

          {/* Clean Corporate Credentials Form */}
          <form onSubmit={handleManualLogin} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-[#0C262D] mb-1.5 uppercase tracking-wider font-mono">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#164E63] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="admin@acme-fin.com or ciso@acme-fin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#CBF1F5]/20 border border-[#A6E3E9] rounded-xl text-xs font-sans text-[#0C262D] focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/25 placeholder:text-[#164E63]/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0C262D] mb-1.5 uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#164E63] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#CBF1F5]/20 border border-[#A6E3E9] rounded-xl text-xs font-sans text-[#0C262D] focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/25 placeholder:text-[#164E63]/40 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-xs transition-all shadow-md shadow-[#71C9CE]/30 flex items-center justify-center gap-2 disabled:opacity-50 border border-[#71C9CE]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#042F2E]" />
                  <span>
                    {authenticatingRole
                      ? `Signing in as ${authenticatingRole.toUpperCase()}...`
                      : "Authenticating Corporate Session..."}
                  </span>
                </>
              ) : (
                <>
                  <span>Sign In to Selected Corporate Role</span>
                  <ArrowRight className="w-4 h-4 text-[#042F2E]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="text-center text-xs text-[#164E63] space-y-1">
          <div>
            Want to explore the public demo first?{" "}
            <Link href="/" className="text-[#083344] font-extrabold underline decoration-[#71C9CE] hover:text-[#0C262D]">
              View Landing Page Demo
            </Link>
          </div>
          <div className="text-[11px] text-[#164E63]/70 font-mono pt-2">
            AegisRisk AI • Enterprise SOC2 Type II Certified
          </div>
        </div>
      </div>
    </div>
  );
}
