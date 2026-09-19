"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Building, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { api, setActiveRole, setActiveOrgId } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [domain, setDomain] = useState("");
  const [plan, setPlan] = useState<"starter" | "pro" | "enterprise">("enterprise");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans = [
    {
      id: "starter",
      name: "Starter",
      badge: "Up to 500 assets",
      price: "$1,500/mo",
      features: [
        "CSV bulk upload connectors",
        "OpenFAIR baseline engine",
        "Analyst alert queue",
        "Basic ROSI metrics",
      ],
    },
    {
      id: "pro",
      name: "Professional",
      badge: "Up to 5,000 assets",
      price: "$4,800/mo",
      features: [
        "Live REST Webhook connectors",
        "Monte Carlo VaR (10,000 trials)",
        "Nth-party vendor risk graph",
        "Cryptographic audit log trail",
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      badge: "Unlimited assets",
      price: "Custom",
      features: [
        "Continuous automated telemetry",
        "What-If budget & ROSI optimizer",
        "SEC Form 8-K & DORA quantitative hubs",
        "Custom fat-tail EVT jump distributions",
      ],
    },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.signup({
        orgName,
        domain: domain || orgName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com",
        plan,
        adminName: adminName || "Organization Admin",
        email,
        password,
      });

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
      setError(err.message || "Failed to create organization account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E3FDFD] text-[#0C262D] flex flex-col justify-center py-12 px-6 selection:bg-[#71C9CE] selection:text-[#042F2E]">
      <div className="max-w-3xl mx-auto w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-[#083344] font-extrabold text-2xl">
            <div className="w-9 h-9 rounded-xl bg-[#71C9CE] flex items-center justify-center text-[#042F2E] shadow-md shadow-[#71C9CE]/30 border border-[#A6E3E9]">
              <ShieldCheck className="w-5 h-5 text-[#042F2E]" />
            </div>
            <span className="text-[#0C262D]">AegisRisk AI</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-[#0C262D] mt-3">Step 1 — Create Your Tenant Organization</h1>
          <p className="text-sm text-[#164E63] mt-1 font-medium">
            Isolated tenant partition with role-based access control and plan-gated connectors.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Organization Info */}
          <div className="bg-[#CBF1F5] border border-[#A6E3E9] p-6 rounded-2xl space-y-4 shadow-sm">
            <h2 className="text-sm font-mono text-[#083344] font-bold uppercase tracking-wider">
              1. Organization Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0C262D] mb-1">Company / Organization Name</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-[#164E63] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Acme Financial Corp"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#A6E3E9] rounded-xl text-sm text-[#0C262D] focus:outline-none focus:border-[#71C9CE] placeholder:text-[#164E63]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C262D] mb-1">Company Domain</label>
                <input
                  type="text"
                  placeholder="acme-corp.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#A6E3E9] rounded-xl text-sm text-[#0C262D] focus:outline-none focus:border-[#71C9CE] placeholder:text-[#164E63]/40"
                />
              </div>
            </div>
          </div>

          {/* Plan Tier Selection */}
          <div className="bg-[#CBF1F5] border border-[#A6E3E9] p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono text-[#083344] font-bold uppercase tracking-wider">
                2. Select Subscription Tier
              </h2>
              <span className="text-xs text-[#164E63] font-semibold">Gates connector limits & retention</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    plan === p.id
                      ? "bg-white border-2 border-[#71C9CE] shadow-md ring-2 ring-[#71C9CE]/30"
                      : "bg-white/60 border-[#A6E3E9] hover:border-[#71C9CE]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0C262D]">{p.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#71C9CE]/20 text-[#083344] font-bold border border-[#71C9CE]/40">
                      {p.badge}
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-[#083344] mt-1">{p.price}</div>
                  <ul className="mt-3 space-y-1.5 text-[11px] text-[#164E63]">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-[#083344] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Admin User */}
          <div className="bg-[#CBF1F5] border border-[#A6E3E9] p-6 rounded-2xl space-y-4 shadow-sm">
            <h2 className="text-sm font-mono text-[#083344] font-bold uppercase tracking-wider">
              3. Organization Admin Account
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0C262D] mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#164E63] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Sarah Vance"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#A6E3E9] rounded-xl text-sm text-[#0C262D] focus:outline-none focus:border-[#71C9CE] placeholder:text-[#164E63]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C262D] mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#164E63] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="sarah@acme-corp.com"
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
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#A6E3E9] rounded-xl text-sm text-[#0C262D] focus:outline-none focus:border-[#71C9CE] placeholder:text-[#164E63]/40"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link href="/login" className="text-xs text-[#164E63] hover:text-[#0C262D]">
              Already have an account? <span className="text-[#083344] font-extrabold underline decoration-[#71C9CE]">Log in</span>
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#71C9CE] hover:bg-[#A6E3E9] text-[#042F2E] font-extrabold text-sm transition-all shadow-lg shadow-[#71C9CE]/25 flex items-center gap-2 disabled:opacity-50 border border-[#71C9CE]"
            >
              <span>{loading ? "Creating Tenant..." : "Launch Organization Cockpit"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
