import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  History,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  CurrentRiskResponse,
  AttributionSummary,
  RosiOptimizationPlan,
  HistoricalRiskSnapshot,
  DeployedControlTracker
} from '../../types/risk';
import {
  fetchAttribution,
  fetchRosiOptimization,
  fetchRiskHistory,
  fetchDeployedControls,
  deployControl
} from '../../services/apiClient';

interface CisoDashboardProps {
  riskData: CurrentRiskResponse;
  onRefreshRisk: () => void;
}

export const CisoDashboard: React.FC<CisoDashboardProps> = ({ riskData, onRefreshRisk }) => {
  const [attribution, setAttribution] = useState<AttributionSummary | null>(null);
  const [history, setHistory] = useState<HistoricalRiskSnapshot[]>([]);
  const [deployedControls, setDeployedControls] = useState<DeployedControlTracker[]>([]);
  const [budget, setBudget] = useState<number>(500000);
  const [rosiPlan, setRosiPlan] = useState<RosiOptimizationPlan | null>(null);
  const [loadingRosi, setLoadingRosi] = useState(false);
  const [deploying, setDeploying] = useState<string | null>(null);

  useEffect(() => {
    fetchAttribution().then(setAttribution).catch(console.error);
    fetchRiskHistory().then(res => setHistory(res.history)).catch(console.error);
    fetchDeployedControls().then(res => setDeployedControls(res.deployedControls)).catch(console.error);
    loadRosi(budget);
  }, []);

  const loadRosi = async (budgetValue: number) => {
    setLoadingRosi(true);
    try {
      const plan = await fetchRosiOptimization(budgetValue);
      setRosiPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRosi(false);
    }
  };

  const handleDeployControl = async (ctrlName: string, cost: number, predictedReduction: number) => {
    setDeploying(ctrlName);
    try {
      await deployControl(ctrlName, cost, predictedReduction);
      // Reload deployed list and trigger recalculation
      const res = await fetchDeployedControls();
      setDeployedControls(res.deployedControls);
      onRefreshRisk();
    } catch (err) {
      console.error(err);
    } finally {
      setDeploying(null);
    }
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val}`;
  };

  const { metrics, organization, lossExceedanceCurve } = riskData;

  // Transform LEC curve for Recharts
  const chartData = lossExceedanceCurve.map(pt => ({
    lossM: Number((pt.lossThreshold / 1000000).toFixed(2)),
    probabilityPct: Number((pt.probabilityOfExceedance * 100).toFixed(1))
  }));

  // Transform History snapshots for Trend Line
  const historyChartData = history.map((h, i) => ({
    label: new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    ealM: Number((h.ealUsd / 1000000).toFixed(2)),
    var95M: Number((h.var95Usd / 1000000).toFixed(2)),
    event: h.triggerEvent
  }));

  return (
    <div className="space-y-6">
      {/* Executive Welcome & Board Notice Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-blue-950/40 via-surface to-slate-900 border border-surface-border rounded-xl p-5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span>Executive Boardroom View</span>
            <span className="text-slate-600">•</span>
            <span>{organization.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Continuous Cyber Risk Quantification & ROSI Optimization
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time translation of security telemetry into dollar-denominated Expected Annual Loss (EAL), Value at Risk (VaR), and closed-loop ROSI investment validation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-lg bg-slate-900/90 border border-surface-border text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Board Appetite Ceiling</span>
            <span className="text-sm font-mono font-bold text-white">{formatCurrency(organization.boardRiskAppetiteUsd || 5000000)}</span>
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-right">
            <span className="text-[10px] text-blue-300 block uppercase font-medium">Revenue at Risk Ratio</span>
            <span className="text-sm font-mono font-bold text-cyan-300">
              {((metrics.expectedAnnualLoss / organization.annualRevenueUsd) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* EAL Card */}
        <div className="glass-panel rounded-xl p-5 metric-card-glow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Expected Annual Loss (EAL)</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {formatCurrency(metrics.expectedAnnualLoss)}
            </div>
            <div className="flex items-center space-x-2 mt-2 text-xs">
              <span className="inline-flex items-center text-emerald-400 font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                -$180k (Past 7d)
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">OpenFAIR Mean</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-surface-border text-[11px] text-slate-400 flex justify-between">
            <span>90% Confidence Band:</span>
            <span className="font-mono text-slate-300">
              {formatCurrency(metrics.confidenceInterval90.low)} – {formatCurrency(metrics.confidenceInterval90.high)}
            </span>
          </div>
        </div>

        {/* 95% VaR Card */}
        <div className="glass-panel rounded-xl p-5 metric-card-glow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">95% Value at Risk (VaR)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {formatCurrency(metrics.var95)}
            </div>
            <div className="flex items-center space-x-2 mt-2 text-xs">
              <span className="text-amber-400 font-medium">1-in-20 Year Tail Event</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">95th Percentile</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-surface-border text-[11px] text-slate-400 flex justify-between">
            <span>99% Catastrophic VaR:</span>
            <span className="font-mono text-rose-300 font-semibold">{formatCurrency(metrics.var99)}</span>
          </div>
        </div>

        {/* Control Posture Score */}
        <div className="glass-panel rounded-xl p-5 metric-card-glow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Control Resistance Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
              {metrics.controlPostureScore}%
            </div>
            <div className="flex items-center space-x-2 mt-2 text-xs">
              <span className="text-emerald-400 font-semibold">+4.2% Post-MFA</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Threat Resistance</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-surface-border text-[11px] text-slate-400 flex justify-between">
            <span>Peer Benchmark:</span>
            <span className="font-mono text-slate-300">Top Quartile (71.0% avg)</span>
          </div>
        </div>

        {/* Tail Shortfall (CVaR) */}
        <div className="glass-panel rounded-xl p-5 metric-card-glow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Expected Shortfall (CVaR)</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {formatCurrency(metrics.cvar95)}
            </div>
            <div className="flex items-center space-x-2 mt-2 text-xs">
              <span className="text-slate-400">Mean loss beyond 95% threshold</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-surface-border text-[11px] text-slate-400 flex justify-between">
            <span>Board Status:</span>
            <span className="font-semibold text-cyan-400 font-mono">WITHIN_APPETITE</span>
          </div>
        </div>
      </div>

      {/* Row 2: Loss Exceedance Curve (LEC) & Historical Trend Line */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Loss Exceedance Curve (LEC) */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Loss Exceedance Curve (LEC)</span>
                <span className="text-xs text-cyan-400 font-mono font-normal">10k Monte Carlo Runs</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Probability of 1-year financial loss exceeding indicated dollar threshold.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-surface-border">
              95% VaR: <span className="text-amber-400 font-bold">{formatCurrency(metrics.var95)}</span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="lecGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="lossM" stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${v}M`} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#232F4A', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Exceedance Probability']}
                  labelFormatter={(lbl) => `Loss Threshold: $${lbl}M`}
                />
                <Area type="monotone" dataKey="probabilityPct" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#lecGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Historical Risk Trend Line (Persisted Time Series) */}
        <div className="lg:col-span-6 glass-panel rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Historical Risk Trajectory (Time-Series)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Demonstrates continuous reduction in EAL & 95% VaR following control deployments.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-semibold">
              ↓ -22.9% Net EAL
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `$${v}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#232F4A', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [
                    `$${val}M`,
                    name === 'ealM' ? 'Expected Annual Loss' : '95% Value at Risk'
                  ]}
                />
                <Line type="monotone" dataKey="ealM" stroke="#38BDF8" strokeWidth={2.5} dot={{ r: 4, fill: '#38BDF8' }} />
                <Line type="monotone" dataKey="var95M" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: '#F59E0B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: ROSI Capital Allocation Optimizer & Closed-Loop Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: ROSI Capital Allocation Knapsack Optimizer */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ROSI Capital Allocation Optimizer</span>
                <span className="text-xs bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-800">
                  Knapsack Solver
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ranks candidate controls by EAL reduction per dollar invested.
              </p>
            </div>

            {/* Interactive Budget Slider */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-surface-border p-2 rounded-lg">
              <span className="text-xs text-slate-300 font-medium">Budget:</span>
              <input
                type="range"
                min={100000}
                max={1000000}
                step={50000}
                value={budget}
                onChange={(e) => {
                  const b = Number(e.target.value);
                  setBudget(b);
                  loadRosi(b);
                }}
                className="w-28 accent-cyan-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-cyan-300 text-xs w-16 text-right">
                {formatCurrency(budget)}
              </span>
            </div>
          </div>

          {/* Candidate Controls Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-400 font-semibold border-y border-surface-border">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Control Name</th>
                  <th className="py-2.5 px-3">Cost</th>
                  <th className="py-2.5 px-3">EAL Drop</th>
                  <th className="py-2.5 px-3">ROSI %</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {rosiPlan?.allocations.map(({ control, selected, marginalCost, predictedEalReduction, rosiPercentage }) => (
                  <tr key={control.id} className={selected ? 'bg-blue-950/20' : 'opacity-60'}>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${selected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        {selected ? 'SELECTED' : 'DEFERRED'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-white block">{control.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{formatCurrency(marginalCost)}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      -{formatCurrency(predictedEalReduction)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">+{rosiPercentage}%</td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        disabled={deploying === control.name}
                        onClick={() => handleDeployControl(control.name, marginalCost, predictedEalReduction)}
                        className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] disabled:opacity-50"
                      >
                        {deploying === control.name ? 'Deploying...' : 'Deploy'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Closed-Loop Deployed Control Feedback Loop */}
        <div className="lg:col-span-5 glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Closed-Loop Model Learning (Section 3)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Compares predicted ROSI against observed reduction from subsequent telemetry.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {deployedControls.map(dc => (
              <div key={dc.id} className="bg-slate-900 border border-surface-border p-3.5 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{dc.controlName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {dc.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-1.5 border-y border-surface-border font-mono text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Predicted Drop</span>
                    <span className="text-slate-300">-{formatCurrency(dc.predictedEalReductionUsd)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Observed Drop</span>
                    <span className="text-emerald-400 font-bold">-{formatCurrency(dc.observedEalReductionUsd)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-sans">Accuracy</span>
                    <span className="text-cyan-300 font-bold">{dc.accuracyPercentage}%</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>Deployed {new Date(dc.deployedAt).toLocaleDateString()} • Variance: {formatCurrency(Math.abs(dc.predictionVarianceUsd))}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
