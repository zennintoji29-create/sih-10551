import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Cpu,
  Shield,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { runWhatIfSimulation } from '../../services/apiClient';

interface WhatIfSimulatorProps {
  baselineEal: number;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ baselineEal }) => {
  const [mfa, setMfa] = useState(70);
  const [edr, setEdr] = useState(75);
  const [zeroTrust, setZeroTrust] = useState(3);
  const [aiSurge, setAiSurge] = useState(false);

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    runSim();
  }, [mfa, edr, zeroTrust, aiSurge]);

  const runSim = async () => {
    setLoading(true);
    try {
      const res = await runWhatIfSimulation({
        mfaAdoptionPercent: mfa,
        edrCoveragePercent: edr,
        zeroTrustMaturity: zeroTrust,
        aiThreatSurge: aiSurge
      });
      setSimResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMfa(70);
    setEdr(75);
    setZeroTrust(3);
    setAiSurge(false);
  };

  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  const chartData = simResult?.simulated?.lossExceedanceCurve?.map((pt: any) => ({
    lossM: Number((pt.lossThreshold / 1000000).toFixed(2)),
    probabilityPct: Number((pt.probabilityOfExceedance * 100).toFixed(1))
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-surface-border p-5 rounded-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-cyan-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Monte Carlo Sandbox</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            Interactive "What-If" Scenario & Threat Modeler
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Test security control investments and AI-accelerated adversary capabilities to forecast financial loss changes before deploying budget.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-surface border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Main Grid: Control Dials & Live Simulation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Dials */}
        <div className="lg:col-span-5 glass-panel rounded-xl p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Defensive Control Dials</h2>
            <span className="text-[11px] font-mono text-cyan-400">Dynamic OpenFAIR Inputs</span>
          </div>

          {/* MFA Dial */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-white">MFA Deployment Coverage</span>
              <span className="font-mono text-cyan-300 font-bold">{mfa}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={mfa}
              onChange={(e) => setMfa(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Reduces credential stuffing & phishing vulnerability factor.</p>
          </div>

          {/* EDR Dial */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-white">Endpoint Detection (EDR) Fleet Coverage</span>
              <span className="font-mono text-blue-300 font-bold">{edr}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={edr}
              onChange={(e) => setEdr(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Lowers ransomware lateral movement & dwell time loss magnitude.</p>
          </div>

          {/* Zero Trust Maturity */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-white">Zero Trust Architecture Maturity</span>
              <span className="font-mono text-purple-300 font-bold">Level {zeroTrust} of 5</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setZeroTrust(lvl)}
                  className={`py-1.5 rounded text-xs font-mono font-bold transition-all ${
                    zeroTrust === lvl
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-900 border border-surface-border text-slate-400 hover:text-white'
                  }`}
                >
                  L{lvl}
                </button>
              ))}
            </div>
          </div>

          {/* AI Threat Multiplier Toggle */}
          <div className="pt-4 border-t border-surface-border">
            <div className="flex items-center justify-between bg-slate-900/90 border border-rose-500/30 p-3 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>AI-Augmented Threat Multiplier (+45% TEF)</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Simulate offensive generative AI: automated zero-day recon & voice deepfake phishing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiSurge(!aiSurge)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  aiSurge ? 'bg-rose-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    aiSurge ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Simulated Impact */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-5 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Simulated Financial Impact</h2>
              <span className={`text-xs font-mono ${loading ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`}>
                {loading ? 'Re-running 5,000 Monte Carlo Trials...' : 'Simulated Converged'}
              </span>
            </div>

            {/* Side-by-side Delta Cards */}
            {simResult && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className="bg-slate-900/90 border border-surface-border p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Baseline EAL</span>
                  <span className="text-xl font-mono font-bold text-white mt-1 block">
                    {formatCurrency(simResult.baselineEal)}
                  </span>
                  <span className="text-[10px] text-slate-500">Current Production Posture</span>
                </div>

                <div className="bg-slate-900/90 border border-surface-border p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase block font-medium">Simulated EAL</span>
                  <span className="text-xl font-mono font-bold text-cyan-300 mt-1 block">
                    {formatCurrency(simResult.simulatedEal)}
                  </span>
                  <span className="text-[10px] text-slate-500">Post-Modification Risk</span>
                </div>

                <div
                  className={`border p-3.5 rounded-xl ${
                    simResult.deltaEal <= 0
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <span className="text-[10px] uppercase block font-medium">Net Delta</span>
                  <span className="text-xl font-mono font-bold mt-1 flex items-center gap-1">
                    {simResult.deltaEal <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    {formatCurrency(simResult.deltaEal)}
                  </span>
                  <span className="text-[10px] font-mono font-bold">
                    {simResult.deltaPercentage > 0 ? '+' : ''}{simResult.deltaPercentage}%
                  </span>
                </div>
              </div>
            )}

            {/* Simulated LEC Area Chart */}
            <div className="h-52 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="lossM" stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${v}M`} />
                  <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#232F4A', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${val}%`, 'Exceedance Probability']}
                    labelFormatter={(label) => `Loss Threshold: $${label}M`}
                  />
                  <Area
                    type="monotone"
                    dataKey="probabilityPct"
                    stroke={simResult?.deltaEal <= 0 ? '#10B981' : '#F43F5E'}
                    strokeWidth={2}
                    fillOpacity={0.4}
                    fill={simResult?.deltaEal <= 0 ? '#10B981' : '#F43F5E'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/40 text-xs text-slate-300 flex items-center justify-between">
            <span>Ready to convert this scenario into an approved capital expenditure?</span>
            <button
              onClick={() => alert('Simulated budget plan exported to CISO Boardroom portfolio.')}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1"
            >
              <span>Promote to Board</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
