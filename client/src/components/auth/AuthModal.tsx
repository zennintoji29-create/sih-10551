import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Mail,
  Building,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles
} from 'lucide-react';
import { UserRole, PlanTier } from '../../types/risk';
import { setActiveRole } from '../../services/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'LOGIN' | 'SIGNUP';
  initialRole?: UserRole;
  onAuthenticated: (user: { email: string; name: string; role: UserRole; orgName: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  initialRole,
  onAuthenticated
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole || 'CISO');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••••••');
  const [mfaCode, setMfaCode] = useState('842-109');
  const [orgName, setOrgName] = useState('Acme Financial Technologies SaaS');
  const [domain, setDomain] = useState('acmefintech.io');
  const [plan, setPlan] = useState<PlanTier>('ENTERPRISE');
  const [mfaStep, setMfaStep] = useState(false);

  if (!isOpen) return null;

  const quickPersonas: Array<{ role: UserRole; name: string; email: string; desc: string }> = [
    {
      role: 'CISO',
      name: 'Marcus Sterling',
      email: 'ciso@acmefintech.io',
      desc: 'Executive Cockpit, VaR 95%, Loss Exceedance Curve & ROSI allocator.'
    },
    {
      role: 'SECURITY_ANALYST',
      name: 'Elena Rostova',
      email: 'analyst@acmefintech.io',
      desc: 'Live telemetry queue, asset criticality register, CVE dollar prioritization.'
    },
    {
      role: 'COMPLIANCE_AUDITOR',
      name: 'David Vance',
      email: 'auditor@kpmg-audit.com',
      desc: 'Read-only assurance, point-in-time replay, SEC Form 8-K & SHA-256 logs.'
    },
    {
      role: 'ADMIN',
      name: 'Sarah Chen',
      email: 'admin@acmefintech.io',
      desc: 'Tenant provisioning, 5-category data connectors (Tenable, Splunk, AWS).'
    }
  ];

  const handleQuickLogin = (p: typeof quickPersonas[0]) => {
    setActiveRole(p.role);
    onAuthenticated({
      email: p.email,
      name: p.name,
      role: p.role,
      orgName
    });
    onClose();
  };

  const handleStandardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'LOGIN' && !mfaStep) {
      // Prompt MFA verification step
      setMfaStep(true);
      return;
    }

    const name = email ? email.split('@')[0] : 'Enterprise User';
    setActiveRole(selectedRole);
    onAuthenticated({
      email: email || 'ciso@acmefintech.io',
      name,
      role: selectedRole,
      orgName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0D1322] border border-surface-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-xs text-slate-300 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white text-base"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2.5 pb-3 border-b border-surface-border">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {mode === 'LOGIN' ? 'Sign In to AegisRisk AI' : 'Create Organization Tenant'}
            </h3>
            <span className="text-[11px] text-slate-400">Multi-Tenant Cyber Risk Quantification Platform</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-surface-border">
          <button
            type="button"
            onClick={() => { setMode('LOGIN'); setMfaStep(false); }}
            className={`py-2 rounded-lg font-semibold transition-all ${
              mode === 'LOGIN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Existing User Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('SIGNUP'); setMfaStep(false); }}
            className={`py-2 rounded-lg font-semibold transition-all ${
              mode === 'SIGNUP' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            New Org Onboarding
          </button>
        </div>

        {/* Quick Role Personas (Instant 1-Click Login for Presentation & Evaluation) */}
        {mode === 'LOGIN' && !mfaStep && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider block">
              Instant Persona Switcher (Jury & Evaluator Mode)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {quickPersonas.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleQuickLogin(p)}
                  className="text-left p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-surface-border hover:border-cyan-500/50 transition-all space-y-0.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white group-hover:text-cyan-300">{p.name}</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                      {p.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight truncate">{p.desc}</p>
                </button>
              ))}
            </div>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-border"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase text-slate-500 bg-[#0D1322] px-2 font-mono">
                or sign in with credentials
              </div>
            </div>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleStandardSubmit} className="space-y-3.5">
          {mode === 'SIGNUP' && (
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Company / Organization Name</label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-slate-900 border border-surface-border rounded-lg pl-8 pr-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Corporate Domain</label>
                  <input
                    type="text"
                    required
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Plan Tier</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as any)}
                    className="w-full bg-slate-900 border border-surface-border rounded-lg px-2.5 py-2 text-white"
                  >
                    <option value="STARTER">Starter</option>
                    <option value="PRO">Pro (Continuous)</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Corporate Email Address</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-surface-border rounded-lg pl-8 pr-3 py-2 text-white"
              />
            </div>
          </div>

          {!mfaStep ? (
            <div>
              <label className="block text-slate-300 font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-surface-border rounded-lg pl-8 pr-3 py-2 text-white"
                />
              </div>
            </div>
          ) : (
            <div className="bg-blue-950/30 border border-blue-900/60 p-3 rounded-xl space-y-2">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Multi-Factor Verification (TOTP / Authenticator)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enter the 6-digit verification code generated by your Authenticator app or hardware token.
              </p>
              <input
                type="text"
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white font-mono text-center tracking-widest text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">Assign User Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white font-medium"
            >
              <option value="CISO">CISO & Executive Boardroom</option>
              <option value="SECURITY_ANALYST">Security Analyst (Triage Queue)</option>
              <option value="COMPLIANCE_AUDITOR">Compliance Auditor (Read-Only)</option>
              <option value="ADMIN">SaaS Admin (Connectors & Settings)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-1.5 transition-all"
            >
              <span>{mfaStep ? 'Verify & Launch Workspace' : mode === 'LOGIN' ? 'Continue with MFA' : 'Create Organization Tenant'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
