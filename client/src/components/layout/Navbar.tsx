import React from 'react';
import {
  ShieldAlert,
  SlidersHorizontal,
  Presentation,
  RefreshCw,
  Plug,
  Home,
  LogOut,
  User
} from 'lucide-react';
import { UserRole } from '../../types/risk';
import { setActiveRole } from '../../services/apiClient';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeView: 'LANDING' | 'WORKSPACE' | 'CONNECTORS' | 'SIMULATOR' | 'DEMO_TOUR';
  onSelectView: (view: 'LANDING' | 'WORKSPACE' | 'CONNECTORS' | 'SIMULATOR' | 'DEMO_TOUR') => void;
  onTriggerRecalculation: () => void;
  isRecalculating: boolean;
  currentUser?: { name: string; email: string; role: UserRole; orgName: string };
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  activeView,
  onSelectView,
  onTriggerRecalculation,
  isRecalculating,
  currentUser,
  onSignOut
}) => {
  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    onSelectRole(role);
  };

  return (
    <header className="border-b border-surface-border bg-[#0D1322]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Back to Landing */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onSelectView('LANDING')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-surface-border text-slate-300 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-1.5 transition-all"
              title="Return to Public Landing Page"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>

            <div
              onClick={() => onSelectView('WORKSPACE')}
              className="flex items-center space-x-2.5 cursor-pointer group pl-2 border-l border-surface-border"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  AegisRisk <span className="text-cyan-400 font-mono text-[10px] px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-800">CRQ</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">Continuous Financial Engine</span>
              </div>
            </div>

            {/* Ingestion status badge */}
            <div className="hidden xl:flex items-center space-x-2 pl-3 border-l border-surface-border text-[11px] text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-emerald-400 font-semibold">LIVE ENGINE</span>
              <span className="text-slate-600">•</span>
              <span>10,000 Runs</span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1.5 bg-slate-950/60 p-1 rounded-xl border border-surface-border/80">
            <button
              onClick={() => onSelectView('WORKSPACE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeView === 'WORKSPACE'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Role Workspace
            </button>
            <button
              onClick={() => onSelectView('CONNECTORS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeView === 'CONNECTORS'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Plug className="w-3.5 h-3.5" />
              <span>Connectors (A-E)</span>
            </button>
            <button
              onClick={() => onSelectView('SIMULATOR')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeView === 'SIMULATOR'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>What-If Sandbox</span>
            </button>
            <button
              onClick={() => onSelectView('DEMO_TOUR')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5 ${
                activeView === 'DEMO_TOUR'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Guided Tour</span>
            </button>
          </div>

          {/* Right Role Switcher, Recalculate & User Profile */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Role Switcher */}
            <div className="flex items-center bg-slate-900 border border-surface-border rounded-lg p-0.5">
              {(['CISO', 'SECURITY_ANALYST', 'COMPLIANCE_AUDITOR', 'ADMIN'] as UserRole[]).map((r) => {
                const label = r === 'CISO' ? 'CISO' : r === 'SECURITY_ANALYST' ? 'Analyst' : r === 'COMPLIANCE_AUDITOR' ? 'Auditor' : 'Admin';
                const isActive = currentRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={`px-2 py-1 text-[11px] font-medium rounded transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Recalculate CTA */}
            <button
              onClick={onTriggerRecalculation}
              disabled={isRecalculating}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-surface-light border border-surface-border text-slate-200 hover:bg-slate-800 hover:border-cyan-500/50 transition-all disabled:opacity-50"
              title="Runs 10,000 Monte Carlo iterations on live telemetry"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${isRecalculating ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline text-[11px]">Recalibrate</span>
            </button>

            {/* User Profile & Sign Out */}
            <div className="flex items-center pl-2 border-l border-surface-border space-x-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[11px] font-semibold text-white leading-tight">
                  {currentUser?.name || (currentRole === 'CISO' ? 'Marcus Sterling' : currentRole === 'SECURITY_ANALYST' ? 'Elena Rostova' : currentRole === 'COMPLIANCE_AUDITOR' ? 'David Vance' : 'Sarah Chen')}
                </span>
                <span className="text-[9px] font-mono text-cyan-400">
                  {currentRole}
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-surface-border transition-colors"
                title="Sign Out / Back to Landing Page"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

