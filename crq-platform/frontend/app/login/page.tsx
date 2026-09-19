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

  React.useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("aegis_token") : null;
    if (token) {
      router.replace("/dashboard");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your corporate email.");
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
    <div className="min-h-screen bg-[#E3FDFD] text-[#0C262D] flex flex-col selection:bg-[#71C9CE] selection:text-[#042F2E]">
      {/* Top Navigation Header */}
      <header className="border-b border-[#A6E3E9] bg-[#CBF1F5]/90 backdrop-blur-md sticky top-0 z-50 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-[#083344] font-extrabold text-lg">
            <div className="w-8 h-8 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] border border-[#A6E3E9] shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#042F2E]" />
            </div>
            <span className="text-[#0C262D]">AegisRisk AI</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#71C9CE]/25 text-[#083344] border border-[#71C9CE] font-bold">
              PORTAL
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="text-xs font-bold text-[#164E63] hover:text-[#0C262D] px-3 py-1.5 transition-colors"
            >
              Interactive Demo
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#CBF1F5] text-[#0C262D] border border-[#A6E3E9] text-xs font-bold transition-all shadow-sm"
            >
              Provision Org
            </Link>
          </div>
        </div>
      </header>

      {/* Centered Login Card */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 text-[#083344] font-extrabold text-2xl">
              <div className="w-10 h-10 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] shadow-md shadow-[#71C9CE]/30 border border-[#A6E3E9]">
                <ShieldCheck className="w-5 h-5 text-[#042F2E]" />
              </div>
              <span className="text-[#0C262D]">AegisRisk AI</span>
            </div>
            <h1 className="text-2xl font-black text-[#0C262D] tracking-tight">Enterprise Session Sign In</h1>
            <p className="text-xs text-[#164E63] font-medium max-w-sm mx-auto">
              Enter your corporate credentials to access your isolated workspace.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold shadow-sm">
              {error}
            </div>
          )}

          <div className="bg-white border-2 border-[#A6E3E9] p-7 rounded-3xl shadow-xl shadow-[#083344]/5">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0C262D] mb-1.5">
                  Corporate Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#164E63] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ciso@acme-fin.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D] placeholder:text-gray-400 focus:outline-none focus:border-[#71C9CE] transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C262D] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#164E63] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#A6E3E9] rounded-xl text-xs text-[#0C262D] placeholder:text-gray-400 focus:outline-none focus:border-[#71C9CE] transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#042F2E]" />
                    <span>Authenticating Corporate Session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Corporate Workspace</span>
                    <ArrowRight className="w-4 h-4 text-[#042F2E]" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-[#164E63] space-y-1">
            <div>
              Looking for the interactive demo sandbox?{" "}
              <Link href="/demo" className="text-[#083344] font-extrabold underline decoration-[#71C9CE] hover:text-[#0C262D]">
                Explore Demo & Explainer
              </Link>
            </div>
            <div className="text-[11px] text-[#164E63]/70 font-mono pt-2">
              AegisRisk AI • Enterprise SOC2 Type II Certified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
