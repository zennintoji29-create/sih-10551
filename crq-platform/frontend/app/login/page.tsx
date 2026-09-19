"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import { api, setActiveRole, setActiveOrgId } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both your work email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email: email.trim(), password });
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
    }
  };

  return (
    <div className="min-h-screen bg-[#E3FDFD] text-[#0C262D] flex flex-col justify-center py-12 px-6 selection:bg-[#71C9CE] selection:text-[#042F2E]">
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#083344] font-extrabold text-2xl">
            <div className="w-10 h-10 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] shadow-md shadow-[#71C9CE]/30 border border-[#A6E3E9]">
              <ShieldCheck className="w-5 h-5 text-[#042F2E]" />
            </div>
            <span className="text-[#0C262D]">AegisRisk AI</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#0C262D] tracking-tight">Sign In to Workspace</h1>
          <p className="text-xs text-[#164E63] font-medium">
            Enter your enterprise credentials to access your continuous cyber risk cockpit.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold shadow-sm">
            {error}
          </div>
        )}

        {/* Clean Corporate Credentials Form */}
        <form onSubmit={handleLogin} className="bg-white border border-[#A6E3E9] p-7 rounded-2xl space-y-5 shadow-lg shadow-[#083344]/5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0C262D] mb-1.5 uppercase tracking-wider font-mono">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#164E63] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-[#CBF1F5]/20 border border-[#A6E3E9] rounded-xl text-sm font-sans text-[#0C262D] focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/25 placeholder:text-[#164E63]/40 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#0C262D] uppercase tracking-wider font-mono">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#164E63] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-[#CBF1F5]/20 border border-[#A6E3E9] rounded-xl text-sm font-sans text-[#0C262D] focus:outline-none focus:border-[#71C9CE] focus:ring-2 focus:ring-[#71C9CE]/25 placeholder:text-[#164E63]/40 transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-sm transition-all shadow-md shadow-[#71C9CE]/30 flex items-center justify-center gap-2 disabled:opacity-50 border border-[#71C9CE]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#042F2E]" />
                <span>Authenticating Session...</span>
              </>
            ) : (
              <>
                <span>Sign In to Corporate Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#042F2E]" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center text-xs text-[#164E63] space-y-1">
          <div>
            Need a new tenant instance?{" "}
            <Link href="/signup" className="text-[#083344] font-extrabold underline decoration-[#71C9CE] hover:text-[#0C262D]">
              Provision Organization
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
