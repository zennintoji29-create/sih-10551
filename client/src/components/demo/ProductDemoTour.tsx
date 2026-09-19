import React, { useState, useEffect } from 'react';
import {
  Presentation,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles
} from 'lucide-react';
import { fetchDemoScenarios } from '../../services/apiClient';

interface ProductDemoTourProps {
  onSwitchToWorkspace: (role: 'CISO' | 'SECURITY_ANALYST' | 'COMPLIANCE_AUDITOR') => void;
}

export const ProductDemoTour: React.FC<ProductDemoTourProps> = ({ onSwitchToWorkspace }) => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [step, setStep] = useState<'INGESTION' | 'CALCULATION' | 'ROSI_SOLUTION'>('INGESTION');

  useEffect(() => {
    fetchDemoScenarios().then(res => setScenarios(res.scenarios)).catch(console.error);
  }, []);

  const active = scenarios[activeScenarioIdx];

  const formatCurrency = (val: number) => `$${(val / 1000000).toFixed(2)}M`;

  return (
    <div className="space-y-6">
      {/* Hero Showcase Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-surface to-slate-900 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
            <Presentation className="w-4 h-4" />
            <span>Interactive Evaluator & Jury Presentation Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1.5">
            End-to-End Continuous Cyber Risk Quantification Flow
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Follow a real-world cybersecurity event from telemetry ingestion through OpenFAIR Monte Carlo mathematical modeling to board-ready dollar loss mitigation and SEC compliance.
          </p>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((sc, i) => (
          <button
            key={sc.id}
            onClick={() => {
              setActiveScenarioIdx(i);
              setStep('INGESTION');
            }}
            className={`text-left p-4 rounded-xl border transition-all ${
              activeScenarioIdx === i
                ? 'bg-purple-950/30 border-purple-500/80 shadow-lg shadow-purple-500/10'
                : 'glass-panel hover:border-slate-600 opacity-70 hover:opacity-100'
            }`}
          >
            <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold block">Scenario 0{i + 1}</span>
            <h3 className="text-sm font-bold text-white mt-0.5">{sc.title}</h3>
            <span className="text-xs text-slate-400 font-mono mt-1 block">{sc.sector}</span>
          </button>
        ))}
      </div>

      {/* Active Walkthrough Card */}
      {active && (
        <div className="glass-panel rounded-2xl p-6 space-y-6 border border-purple-500/30">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Active Walkthrough</span>
            <h2 className="text-xl font-bold text-white mt-0.5">{active.title}</h2>
            <p className="text-xs text-slate-400 mt-1">{active.subtitle}</p>
          </div>

          {/* 3-Step Guided Lifecycle */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div
              onClick={() => setStep('INGESTION')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                step === 'INGESTION' ? 'bg-slate-900 border-cyan-400 shadow-md' : 'bg-slate-900/50 border-surface-border'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[10px] text-cyan-400 font-bold">STAGE 1</span>
                <span className="text-[10px] text-slate-500">Telemetry Ingest</span>
              </div>
              <h4 className="text-sm font-bold text-white">Vulnerability Exploited</h4>
              <p className="text-xs text-slate-400 mt-1">
                Tenable / CISA KEV feeds detect active in-the-wild exploitation of {active.cve}.
              </p>
              <div className="mt-3 font-mono text-xs font-bold text-rose-400">
                Baseline EAL: {formatCurrency(active.initialEal)}
              </div>
            </div>

            {/* Step 2 */}
            <div
              onClick={() => setStep('CALCULATION')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                step === 'CALCULATION' ? 'bg-slate-900 border-amber-400 shadow-md' : 'bg-slate-900/50 border-surface-border'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[10px] text-amber-400 font-bold">STAGE 2</span>
                <span className="text-[10px] text-slate-500">OpenFAIR Recalibration</span>
              </div>
              <h4 className="text-sm font-bold text-white">Risk Exposure Surges</h4>
              <p className="text-xs text-slate-400 mt-1">
                10,000 Monte Carlo runs execute; EAL jumps as threat event frequency increases.
              </p>
              <div className="mt-3 font-mono text-xs font-bold text-amber-400">
                Peak Exposure: {formatCurrency(active.peakEal)}
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={() => setStep('ROSI_SOLUTION')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                step === 'ROSI_SOLUTION' ? 'bg-slate-900 border-emerald-400 shadow-md' : 'bg-slate-900/50 border-surface-border'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[10px] text-emerald-400 font-bold">STAGE 3</span>
                <span className="text-[10px] text-slate-500">ROSI Optimization</span>
              </div>
              <h4 className="text-sm font-bold text-white">Targeted Remediation</h4>
              <p className="text-xs text-slate-400 mt-1">
                Knapsack solver selects optimal control: {active.recommendedControl}.
              </p>
              <div className="mt-3 font-mono text-xs font-bold text-emerald-400">
                Remediated EAL: {formatCurrency(active.remediatedEal)} (+{active.rosi}% ROSI)
              </div>
            </div>
          </div>

          {/* Action CTAs: Deep Dive into Roles */}
          <div className="pt-4 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Inspect how this scenario manifests in real-time within each stakeholder workspace:
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSwitchToWorkspace('SECURITY_ANALYST')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-surface-border text-xs text-blue-300 hover:text-white font-medium"
              >
                Inspect in Analyst Triage →
              </button>
              <button
                onClick={() => onSwitchToWorkspace('CISO')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold shadow-sm"
              >
                View in CISO Boardroom →
              </button>
              <button
                onClick={() => onSwitchToWorkspace('COMPLIANCE_AUDITOR')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs text-white font-semibold shadow-sm"
              >
                Verify SEC Materiality →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
