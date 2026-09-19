import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Scale,
  Hash,
  Clock,
  Download,
  AlertCircle,
  Building,
  History,
  ShieldAlert
} from 'lucide-react';
import {
  SecMaterialityAssessment,
  DoraStressTestResult,
  AuditLogEntry,
  HistoricalRiskSnapshot,
  VendorConcentrationResponse
} from '../../types/risk';
import {
  evaluateSecMateriality,
  fetchDoraStressTest,
  fetchAuditTrail,
  fetchRiskHistory,
  fetchVendors
} from '../../services/apiClient';

export const AuditorHub: React.FC = () => {
  const [secData, setSecData] = useState<SecMaterialityAssessment | null>(null);
  const [doraData, setDoraData] = useState<DoraStressTestResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [history, setHistory] = useState<HistoricalRiskSnapshot[]>([]);
  const [vendorData, setVendorData] = useState<VendorConcentrationResponse | null>(null);
  const [selectedSnapshot, setSelectedSnapshot] = useState<HistoricalRiskSnapshot | null>(null);

  // SEC Tool test inputs
  const [revenue, setRevenue] = useState(120000000);
  const [estimatedLoss, setEstimatedLoss] = useState(2800000);
  const [recordsExposed, setRecordsExposed] = useState(145000);
  const [downtimeHours, setDowntimeHours] = useState(36);

  useEffect(() => {
    runSecEvaluation();
    fetchDoraStressTest().then(setDoraData).catch(console.error);
    fetchAuditTrail().then(res => setAuditLogs(res.auditLogs)).catch(console.error);
    fetchRiskHistory().then(res => {
      setHistory(res.history);
      if (res.history.length > 0) setSelectedSnapshot(res.history[0]);
    }).catch(console.error);
    fetchVendors().then(setVendorData).catch(console.error);
  }, []);

  const runSecEvaluation = async () => {
    try {
      const res = await evaluateSecMateriality({
        annualRevenueUsd: revenue,
        estimatedFinancialLossUsd: estimatedLoss,
        customerRecordsExposed: recordsExposed,
        criticalOperationsInterruptedHours: downtimeHours
      });
      setSecData(res);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val: number) => `$${(val / 1000000).toFixed(2)}M`;

  return (
    <div className="space-y-6">
      {/* Header with Read-Only Assurance Notice */}
      <div className="bg-slate-900 border border-surface-border p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-purple-400">
            <Scale className="w-3.5 h-3.5" />
            <span>Auditor Assurance & Point-In-Time Verification</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            Compliance Verification Hub (Read-Only)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically signed audit logs, point-in-time historical reconstruction, and quantitative SEC/DORA assessments. All write actions blocked server-side.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>ROLE: AUDITOR (READ-ONLY)</span>
        </div>
      </div>

      {/* Point-In-Time Historical Risk Reconstruction (Section 4) */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Point-in-Time Historical Reconstruction (Section 4)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Select any past snapshot date to reconstruct the exact financial risk figures reported to the board.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {history.map((snap) => {
            const isSelected = selectedSnapshot?.id === snap.id;
            return (
              <div
                key={snap.id}
                onClick={() => setSelectedSnapshot(snap)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-950/20'
                    : 'bg-slate-900/60 border-surface-border opacity-70 hover:opacity-100'
                }`}
              >
                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(snap.timestamp).toLocaleDateString()}
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  EAL: <span className="font-mono text-cyan-300">{formatCurrency(snap.ealUsd)}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  95% VaR: <span className="font-mono text-amber-300">{formatCurrency(snap.var95Usd)}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1.5 truncate">
                  {snap.triggerEvent}
                </div>
              </div>
            );
          })}
        </div>

        {selectedSnapshot && (
          <div className="bg-slate-900/80 border border-surface-border p-4 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-white">Reconstructed Posture: {selectedSnapshot.triggerEvent}</span>
              <span className="font-mono text-slate-400 text-[11px]">{new Date(selectedSnapshot.timestamp).toUTCString()}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-surface-border font-mono text-xs">
              <div>
                <span className="text-slate-500 block font-sans text-[10px]">Expected Annual Loss</span>
                <span className="font-bold text-white text-sm">{formatCurrency(selectedSnapshot.ealUsd)}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-sans text-[10px]">95% Value at Risk</span>
                <span className="font-bold text-amber-300 text-sm">{formatCurrency(selectedSnapshot.var95Usd)}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-sans text-[10px]">Control Posture Score</span>
                <span className="font-bold text-emerald-400 text-sm">{selectedSnapshot.controlPostureScore}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Third-Party Correlated Concentration Risk (Section 3) */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-400" />
              <span>Third-Party Correlated Concentration Risk (Section 3, Category E)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Calculates correlated failure exposure for vendors sharing underlying infrastructure dependencies.
            </p>
          </div>
          {vendorData && (
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase block">Correlated Concentration Total</span>
              <span className="font-mono text-sm font-bold text-rose-400">
                {formatCurrency(vendorData.correlatedConcentrationRiskTotalUsd)}
              </span>
              <span className="text-[10px] font-mono text-amber-400 block">
                (+{formatCurrency(vendorData.correlationVarianceUsd)} Correlation Premium)
              </span>
            </div>
          )}
        </div>

        {/* Concentration Alerts */}
        {vendorData?.concentrationAlerts.map((alert, idx) => (
          <div key={idx} className="bg-amber-950/20 border border-amber-800/60 p-3 rounded-lg text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-amber-300 block">
                Shared Dependency Alert: {alert.infrastructure} ({alert.correlatedVendorCount} Vendors)
              </span>
              <p className="text-[11px] text-slate-300">{alert.description}</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-900 text-amber-100 font-mono text-[11px] font-bold">
              {alert.riskMultiplier}x Multiplier
            </span>
          </div>
        ))}

        {/* Vendors Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-400 font-semibold border-y border-surface-border">
              <tr>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Service Role</th>
                <th className="py-2.5 px-3">Shared Infrastructure Tag</th>
                <th className="py-2.5 px-3">Standalone Risk</th>
                <th className="py-2.5 px-3">Correlated Multiplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {vendorData?.vendors.map(v => (
                <tr key={v.id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-bold text-white">{v.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{v.serviceRole}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">{v.sharedInfrastructure}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-200">{formatCurrency(v.standaloneRiskUsd)}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{v.correlatedRiskMultiplier}x</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEC Rule 106 4-Day Materiality Evaluator */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="pb-3 border-b border-surface-border">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>SEC Rule 106 Material Incident Disclosure Evaluator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Assists with preparing SEC Form 8-K Item 1.05 documentation within 96 hours.
          </p>
        </div>

        {secData && (
          <div className="bg-slate-900 p-4 rounded-xl border border-surface-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Incident Materiality Determination</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${secData.isLikelyMaterial ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
                {secData.isLikelyMaterial ? 'LIKELY MATERIAL (FORM 8-K FILING RECOMMENDED)' : 'INTERNAL LOG ONLY'}
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">{secData.secDisclosureRecommendation.rationale}</p>
            <div className="pt-2 border-t border-surface-border flex justify-between text-[11px] text-slate-400">
              <span>Statutory Filing Deadline: <span className="font-mono text-cyan-300">96 Hours (4 Business Days)</span></span>
              <span>Score: <span className="font-mono text-white">{secData.materialityScore}/100</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Cryptographic Audit Trail */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-cyan-400" />
              <span>Verifiable Cryptographic Audit Trail (SHA-256)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Immutable ledger of all model parameter updates and ingestion runs.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-400 font-semibold border-y border-surface-border">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor Role</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-slate-300">{log.actorRole}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{log.eventType}</td>
                  <td className="py-2.5 px-3 text-slate-300">{log.description}</td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-cyan-400">
                    {log.sha256Hash.substring(0, 16)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
