import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Radio,
  Plus,
  Zap,
  Check,
  Building2,
  Server,
  Shield,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { TelemetryRecord, Asset, AssetCriticality } from '../../types/risk';
import { fetchTelemetry, ingestFinding, fetchAssets, createAsset } from '../../services/apiClient';

interface AnalystWorkbenchProps {
  onRefreshRisk: () => void;
}

export const AnalystWorkbench: React.FC<AnalystWorkbenchProps> = ({ onRefreshRisk }) => {
  const [telemetry, setTelemetry] = useState<TelemetryRecord[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'FINDINGS' | 'ASSETS'>('FINDINGS');

  // New Finding state
  const [newTitle, setNewTitle] = useState('');
  const [newCve, setNewCve] = useState('');
  const [newImpact, setNewImpact] = useState(150000);
  const [mitigatedIds, setMitigatedIds] = useState<Set<string>>(new Set());

  // New Asset state
  const [assetName, setAssetName] = useState('');
  const [assetService, setAssetService] = useState('');
  const [assetOwner, setAssetOwner] = useState('');
  const [assetCriticality, setAssetCriticality] = useState<AssetCriticality>('MISSION_CRITICAL');
  const [assetValuation, setAssetValuation] = useState<number>(5000000);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetchTelemetry().then(res => setTelemetry(res.records)).catch(console.error);
    fetchAssets().then(res => setAssets(res.assets)).catch(console.error);
  };

  const handleMitigate = (id: string) => {
    setMitigatedIds(prev => new Set(prev).add(id));
    onRefreshRisk();
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    await ingestFinding({
      title: newTitle,
      cveId: newCve || undefined,
      severity: 'HIGH',
      financialImpactEstimated: Number(newImpact),
      confidenceScore: 88,
      sourceOrigin: 'MANUAL_UPLOAD',
      sourceProvider: 'Analyst Manual Triage Queue'
    });

    setNewTitle('');
    setNewCve('');
    setShowIngestModal(false);
    loadData();
    onRefreshRisk();
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetValuation) return;

    await createAsset({
      name: assetName,
      serviceType: assetService || 'Cloud Microservice',
      ownerEmail: assetOwner || 'dev-lead@acmefintech.io',
      criticality: assetCriticality,
      declaredValuationUsd: Number(assetValuation),
      controlScore: 80
    });

    setAssetName('');
    setShowAssetModal(false);
    loadData();
    onRefreshRisk();
  };

  const filtered = telemetry.filter(r => {
    if (filterSeverity === 'ALL') return true;
    return r.severity === filterSeverity;
  });

  const formatCurrency = (val?: number) => {
    if (!val) return '$0';
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    return `$${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-surface-border p-5 rounded-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-blue-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>Operational Telemetry & Triage Queue</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-1">
            Security Analyst Financial Prioritization Workbench
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked findings ordered by direct financial impact on Expected Annual Loss (EAL), bridging technical severity and business dollar loss.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAssetModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-surface border border-surface-border text-slate-200 hover:text-white text-xs font-semibold"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add Asset</span>
          </button>
          <button
            onClick={() => setShowIngestModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Finding</span>
          </button>
        </div>
      </div>

      {/* Tabs: Findings Queue vs In-App Asset Register */}
      <div className="flex items-center space-x-2 border-b border-surface-border pb-3">
        <button
          onClick={() => setActiveTab('FINDINGS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'FINDINGS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Active Findings Queue ({telemetry.length})
        </button>
        <button
          onClick={() => setActiveTab('ASSETS')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'ASSETS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          In-App Asset Register & Valuations ({assets.length})
        </button>
      </div>

      {/* VIEW 1: Findings Queue */}
      {activeTab === 'FINDINGS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 bg-slate-900 border border-surface-border p-1 rounded-lg text-xs">
              <button
                onClick={() => setFilterSeverity('ALL')}
                className={`px-3 py-1 rounded font-medium ${filterSeverity === 'ALL' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
              >
                All Severities
              </button>
              <button
                onClick={() => setFilterSeverity('CRITICAL')}
                className={`px-3 py-1 rounded font-medium ${filterSeverity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilterSeverity('HIGH')}
                className={`px-3 py-1 rounded font-medium ${filterSeverity === 'HIGH' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
              >
                High
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono hidden md:block">
              Priority Metric: <span className="text-cyan-400 font-semibold">Financial Loss Contribution ($ EAL)</span>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map(record => {
              const isMitigated = mitigatedIds.has(record.id);

              return (
                <div
                  key={record.id}
                  className={`glass-panel rounded-xl p-4 transition-all border ${
                    isMitigated
                      ? 'border-emerald-500/30 bg-emerald-950/10 opacity-70'
                      : record.severity === 'CRITICAL'
                      ? 'border-rose-500/40 hover:border-rose-400/80'
                      : 'border-surface-border hover:border-blue-500/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            record.severity === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {record.severity}
                        </span>

                        {record.cveId && (
                          <span className="font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800 text-[11px] font-semibold">
                            {record.cveId}
                          </span>
                        )}

                        <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1">
                          <Radio className="w-3 h-3 text-emerald-400" />
                          {record.sourceProvider}
                        </span>

                        <span className="text-slate-500 text-[11px] font-mono">
                          Confidence: <span className="text-slate-300">{record.confidenceScore}%</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white tracking-tight">{record.title}</h3>

                      {record.assetName && (
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <span className="text-slate-500">Asset:</span>
                          <span className="text-slate-300 font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-surface-border">
                            {record.assetName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-5 pt-2 lg:pt-0 border-t lg:border-t-0 border-surface-border">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block">EAL Impact</span>
                        <span className="text-base font-mono font-bold text-rose-400">
                          +{formatCurrency(record.financialImpactEstimated)}
                        </span>
                      </div>

                      <div>
                        {isMitigated ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                            <Check className="w-3.5 h-3.5" />
                            <span>Mitigated</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMitigate(record.id)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-500 border border-blue-500 text-white text-xs font-semibold transition-all shadow-sm"
                          >
                            <Zap className="w-3.5 h-3.5 text-cyan-300" />
                            <span>Deploy Virtual Patch</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: In-App Asset Register (Section 2, Category C) */}
      {activeTab === 'ASSETS' && (
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>In-App Asset Register & Business Criticality (Category C)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Baseline in-app register mapping systems and declared valuations to per-asset EAL risk models.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-slate-900 px-2.5 py-1 rounded border border-surface-border">
              Total Asset Valuation: <span className="font-bold text-white">$41.85M</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[10px] uppercase text-slate-400 font-semibold border-y border-surface-border">
                <tr>
                  <th className="py-2.5 px-3">Asset Name & Host</th>
                  <th className="py-2.5 px-3">Criticality Tag</th>
                  <th className="py-2.5 px-3">Declared Valuation</th>
                  <th className="py-2.5 px-3">Defensive Posture</th>
                  <th className="py-2.5 px-3">Calculated Asset EAL</th>
                  <th className="py-2.5 px-3">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {assets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{asset.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{asset.ipOrHostname || asset.serviceType}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          asset.criticality === 'MISSION_CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : asset.criticality === 'BUSINESS_OPERATIONAL'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {asset.criticality}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-200">
                      {formatCurrency(asset.declaredValuationUsd)}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">
                      {asset.controlScore}%
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-rose-400">
                      {formatCurrency(asset.calculatedEalUsd)}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{asset.ownerEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="text-base font-bold text-white">Register In-App Asset</h3>
              <button onClick={() => setShowAssetModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">System / Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swift Wire Settlement Microservice"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Criticality</label>
                  <select
                    value={assetCriticality}
                    onChange={(e) => setAssetCriticality(e.target.value as any)}
                    className="w-full bg-slate-900 border border-surface-border rounded-lg px-2.5 py-2 text-white"
                  >
                    <option value="MISSION_CRITICAL">Mission Critical</option>
                    <option value="BUSINESS_OPERATIONAL">Business Operational</option>
                    <option value="INTERNAL_SUPPORT">Internal Support</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Declared Valuation ($)</label>
                  <input
                    type="number"
                    required
                    value={assetValuation}
                    onChange={(e) => setAssetValuation(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Service Role / Cloud Subnet</label>
                <input
                  type="text"
                  placeholder="e.g. AWS us-east-1 VPC Ingress"
                  value={assetService}
                  onChange={(e) => setAssetService(e.target.value)}
                  className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-surface-border text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Ingestion Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border">
              <h3 className="text-base font-bold text-white">Ingest Security Finding</h3>
              <button onClick={() => setShowIngestModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleIngest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken Object Level Auth in API"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">CVE ID (Optional)</label>
                <input
                  type="text"
                  placeholder="CVE-2025-9982"
                  value={newCve}
                  onChange={(e) => setNewCve(e.target.value)}
                  className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Estimated EAL Impact ($)</label>
                <input
                  type="number"
                  required
                  value={newImpact}
                  onChange={(e) => setNewImpact(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-surface-border text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Ingest & Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
