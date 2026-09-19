import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { CisoDashboard } from './components/ciso/CisoDashboard';
import { AnalystWorkbench } from './components/analyst/AnalystWorkbench';
import { AuditorHub } from './components/auditor/AuditorHub';
import { AdminConsole } from './components/admin/AdminConsole';
import { ConnectorsHub } from './components/connectors/ConnectorsHub';
import { WhatIfSimulator } from './components/simulation/WhatIfSimulator';
import { ProductDemoTour } from './components/demo/ProductDemoTour';
import { AiCopilotWidget } from './components/chat/AiCopilotWidget';
import { UserRole, CurrentRiskResponse } from './types/risk';
import { fetchCurrentRisk, setActiveRole } from './services/apiClient';

interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  orgName: string;
}

export const App: React.FC = () => {
  // Default entry view: LANDING PAGE (matching user wireframe and product flow)
  const [activeView, setActiveView] = useState<'LANDING' | 'WORKSPACE' | 'CONNECTORS' | 'SIMULATOR' | 'DEMO_TOUR'>('LANDING');
  const [currentRole, setCurrentRole] = useState<UserRole>('CISO');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Auth modal state
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'LOGIN' | 'SIGNUP';
    prefillRole?: UserRole;
  }>({
    isOpen: false,
    mode: 'LOGIN'
  });

  const [riskData, setRiskData] = useState<CurrentRiskResponse | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  useEffect(() => {
    setActiveRole(currentRole);
    loadRisk();
  }, []);

  const loadRisk = async () => {
    setIsRecalculating(true);
    try {
      const data = await fetchCurrentRisk();
      setRiskData(data);
    } catch (err) {
      console.error('Failed to load risk quantification data from engine:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setActiveRole(role);
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    }
  };

  const handleOpenAuth = (mode: 'LOGIN' | 'SIGNUP', prefillRole?: UserRole) => {
    setAuthModal({
      isOpen: true,
      mode,
      prefillRole
    });
  };

  const handleCloseAuth = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleAuthenticated = (user: UserProfile) => {
    setCurrentUser(user);
    handleRoleChange(user.role);
    setActiveView('WORKSPACE');
  };

  const handleEnterDemo = () => {
    // Default demo user entry: Marcus Sterling (CISO)
    if (!currentUser) {
      setCurrentUser({
        name: 'Marcus Sterling',
        email: 'ciso@acmefintech.io',
        role: 'CISO',
        orgName: 'Acme Financial Technologies SaaS'
      });
    }
    handleRoleChange('CISO');
    setActiveView('WORKSPACE');
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setActiveView('LANDING');
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/25 selection:text-cyan-200">
      {/* ─────────────────────────────────────────────────────────────
          1. PUBLIC LANDING PAGE (Matches user's wireframe layout)
      ────────────────────────────────────────────────────────────── */}
      {activeView === 'LANDING' ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onEnterDemo={handleEnterDemo}
        />
      ) : (
        /* ─────────────────────────────────────────────────────────────
            2. REAL MODEL PRODUCT INTERFACE
        ────────────────────────────────────────────────────────────── */
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Persistent Navigation for Real Product */}
          <Navbar
            currentRole={currentRole}
            onSelectRole={handleRoleChange}
            activeView={activeView}
            onSelectView={setActiveView}
            onTriggerRecalculation={loadRisk}
            isRecalculating={isRecalculating}
            currentUser={currentUser || undefined}
            onSignOut={handleSignOut}
          />

          {/* Main Product Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeView === 'CONNECTORS' ? (
              <ConnectorsHub onRecalculateRisk={loadRisk} />
            ) : activeView === 'SIMULATOR' ? (
              <WhatIfSimulator baselineEal={riskData?.metrics.expectedAnnualLoss || 5550000} />
            ) : activeView === 'DEMO_TOUR' ? (
              <ProductDemoTour
                onSwitchToWorkspace={(role) => {
                  handleRoleChange(role);
                  setActiveView('WORKSPACE');
                }}
              />
            ) : (
              /* Role Workspaces */
              <div className="space-y-6">
                {currentRole === 'CISO' && riskData && (
                  <CisoDashboard riskData={riskData} onRefreshRisk={loadRisk} />
                )}
                {currentRole === 'SECURITY_ANALYST' && (
                  <AnalystWorkbench onRefreshRisk={loadRisk} />
                )}
                {currentRole === 'COMPLIANCE_AUDITOR' && (
                  <AuditorHub />
                )}
                {currentRole === 'ADMIN' && (
                  <AdminConsole />
                )}
                {!riskData && currentRole === 'CISO' && (
                  <div className="flex flex-col items-center justify-center h-80 space-y-3 text-slate-400">
                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-mono text-xs text-cyan-400">
                      Executing 10,000 Monte Carlo Iterations on OpenFAIR Engine...
                    </span>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Enterprise Industrial Footer */}
          <footer className="border-t border-surface-border/70 bg-slate-950/80 py-4 text-xs text-slate-500 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-2 font-mono text-[11px]">
                <span className="text-slate-300 font-bold">AegisRisk AI v2.4 (Continuum)</span>
                <span>•</span>
                <span>SIH26105 Research Implementation</span>
                <span>•</span>
                <span>OpenFAIR & ISO/IEC 27005 Grounded</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Multi-Tenant SaaS • Continuous Telemetry Normalization • SEC Rule 106 & DORA Aligned
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Global Role-Based Auth Modal (Login / Signup) */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleCloseAuth}
        initialMode={authModal.mode}
        initialRole={authModal.prefillRole}
        onAuthenticated={handleAuthenticated}
      />

      {/* Global Role-Guardrailed AI Copilot (Ollama, Groq, Built-in) */}
      <AiCopilotWidget
        currentRole={currentRole}
        currentScreen={activeView}
        orgName={currentUser?.orgName}
      />
    </div>
  );
};

export default App;

