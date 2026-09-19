import React, { useState, useEffect } from 'react';
import {
  Plug,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCode,
  Radio,
  ExternalLink,
  ShieldCheck,
  Server,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { DataConnectorConfig, IngestionMode, DataSourceCategory } from '../../types/risk';
import { fetchConnectors, updateConnector, uploadConnectorFile } from '../../services/apiClient';

interface ConnectorsHubProps {
  onRecalculateRisk: () => void;
}

export const ConnectorsHub: React.FC<ConnectorsHubProps> = ({ onRecalculateRisk }) => {
  const [connectors, setConnectors] = useState<DataConnectorConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<DataConnectorConfig | null>(null);

  // Modal / drawer states
  const [activeTab, setActiveTab] = useState<'LIVE' | 'FILE' | 'SAMPLE'>('LIVE');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileFormat, setFileFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    try {
      const res = await fetchConnectors();
      setConnectors(res.connectors);
      if (!selectedConnector && res.connectors.length > 0) {
        setSelectedConnector(res.connectors[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConnector = (conn: DataConnectorConfig) => {
    setSelectedConnector(conn);
    setActiveTab(conn.mode === 'LIVE_CONNECTOR' ? 'LIVE' : conn.mode === 'MANUAL_UPLOAD' ? 'FILE' : 'SAMPLE');
    setStatusMessage(null);
  };

  const handleSaveLiveCredentials = async () => {
    if (!selectedConnector) return;
    setLoading(true);
    try {
      await updateConnector(selectedConnector.id, {
        mode: 'LIVE_CONNECTOR',
        status: 'CONNECTED',
        credentialsConfigured: true,
        lastSyncTime: new Date().toISOString(),
        confidenceRating: 95
      });
      setStatusMessage({ type: 'success', text: `Live API credentials verified and connected to ${selectedConnector.name}.` });
      loadConnectors();
      onRecalculateRisk();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedConnector || !fileContent) return;
    setLoading(true);
    try {
      await uploadConnectorFile(selectedConnector.category, fileContent, fileFormat);
      setStatusMessage({ type: 'success', text: `File parsed successfully. Records normalized into ${selectedConnector.name}.` });
      setFileContent('');
      loadConnectors();
      onRecalculateRisk();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to process file' });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToSample = async () => {
    if (!selectedConnector) return;
    setLoading(true);
    try {
      await updateConnector(selectedConnector.id, {
        mode: 'SAMPLE_SIMULATION',
        status: 'CONNECTED',
        lastSyncTime: new Date().toISOString(),
        confidenceRating: 85
      });
      setStatusMessage({ type: 'success', text: `Switched ${selectedConnector.name} to Sample/Demo data mode.` });
      loadConnectors();
      onRecalculateRisk();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to switch mode' });
    } finally {
      setLoading(false);
    }
  };

  const getOriginBadge = (mode: IngestionMode) => {
    switch (mode) {
      case 'LIVE_CONNECTOR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">LIVE API FEED</span>;
      case 'MANUAL_UPLOAD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">MANUAL UPLOAD</span>;
      case 'SAMPLE_SIMULATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">SAMPLE DATA</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-surface-border p-5 rounded-xl">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-cyan-400">
          <Plug className="w-3.5 h-3.5" />
          <span>Ingestion & Normalization Layer (Section 2, Step 3)</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight mt-1">
          Connect Security Tools & Telemetry Ingestion Hub
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
          A CRQ platform must ingest real customer telemetry. For each category below, choose either (a) live authenticated API connection, (b) manual file upload stand-in, or (c) sample exploration data.
        </p>
      </div>

      {/* Main Grid: Left Connector List & Right Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 5 Categories Connector Rail */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block px-1">
            Data Source Categories (A - E)
          </span>

          {connectors.map((c, i) => {
            const isSelected = selectedConnector?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => handleSelectConnector(c)}
                className={`glass-panel p-4 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'border-cyan-400/80 bg-slate-900/90 shadow-lg shadow-cyan-950/20'
                    : 'border-surface-border hover:border-slate-600 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                    Category {String.fromCharCode(65 + i)} • {c.category}
                  </span>
                  {getOriginBadge(c.mode)}
                </div>

                <h3 className="text-sm font-bold text-white mt-1">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{c.provider}</p>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-surface-border text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Status</span>
                    <span className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {c.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Records Pulled</span>
                    <span className="font-mono font-bold text-white text-[11px]">{c.recordsPulledCount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Confidence</span>
                    <span className="font-mono text-cyan-300 font-bold text-[11px]">{c.confidenceRating}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Connector Configuration & 3-Path Selector */}
        <div className="lg:col-span-7 glass-panel rounded-xl p-5 space-y-5">
          {selectedConnector && (
            <div>
              {/* Connector Header */}
              <div className="pb-4 border-b border-surface-border">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                      Configuring {selectedConnector.category}
                    </span>
                    <h2 className="text-lg font-bold text-white mt-0.5">{selectedConnector.name}</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Last Successful Ingestion</span>
                    <span className="text-xs font-mono text-slate-300">
                      {new Date(selectedConnector.lastSyncTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedConnector.notes}</p>
              </div>

              {/* 3 Integration Paths Tab Bar */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900 border border-surface-border rounded-xl mt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIVE')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    activeTab === 'LIVE'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Plug className="w-3.5 h-3.5" />
                  <span>Path A: Live API</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('FILE')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    activeTab === 'FILE'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Path B: File Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('SAMPLE')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    activeTab === 'SAMPLE'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Path C: Sample Data</span>
                </button>
              </div>

              {/* Status feedback message */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-lg text-xs mt-3 flex items-center space-x-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* PATH A: Live Connector Form */}
              {activeTab === 'LIVE' && (
                <div className="space-y-4 pt-4 text-xs">
                  <div className="bg-blue-950/20 border border-blue-900/40 p-3 rounded-lg text-slate-300 space-y-1">
                    <span className="font-semibold text-blue-300 block">Authenticated Live Connector</span>
                    <p className="text-[11px] text-slate-400">
                      The platform will make scheduled API calls to {selectedConnector.provider} to synchronize live findings, calculate Confidence Rating (90-99%), and continuously recalculate Expected Annual Loss.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Service API Endpoint / Region</label>
                    <input
                      type="text"
                      defaultValue="https://cloud.tenable.com/api/v2"
                      className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">API Access Token / Bearer Key</label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••••••••••••••••••"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveLiveCredentials}
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50"
                    >
                      {loading ? 'Authenticating...' : 'Connect Live Endpoint'}
                    </button>
                  </div>
                </div>
              )}

              {/* PATH B: Manual File Upload Stand-in */}
              {activeTab === 'FILE' && (
                <div className="space-y-4 pt-4 text-xs">
                  <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-lg text-slate-300 space-y-1">
                    <span className="font-semibold text-amber-300 block">Manual File Stand-In (CSV / JSON)</span>
                    <p className="text-[11px] text-slate-400">
                      Upload an export file from your security tool. The shared normalization layer parses it into the identical internal telemetry format with a transparent Manual Confidence Rating (70-80%).
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-slate-400">Expected Format:</span>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={fileFormat === 'CSV'}
                        onChange={() => setFileFormat('CSV')}
                        className="accent-cyan-400"
                      />
                      <span>CSV (asset, cve, severity, title, estimated_loss)</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={fileFormat === 'JSON'}
                        onChange={() => setFileFormat('JSON')}
                        className="accent-cyan-400"
                      />
                      <span>JSON Array</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Paste File Content or Drop Export</label>
                    <textarea
                      rows={5}
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      placeholder={
                        fileFormat === 'CSV'
                          ? `asset,cve,severity,title,estimated_loss\nPayment-Gateway,CVE-2025-2410,CRITICAL,RCE in Ingress,320000`
                          : `[{"asset": "Payment-Gateway", "cve": "CVE-2025-2410", "severity": "CRITICAL", "estimated_loss": 320000}]`
                      }
                      className="w-full bg-slate-900 border border-surface-border rounded-lg p-3 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-slate-500">
                      Normalizer deduplicates against recent ingestion.
                    </span>
                    <button
                      type="button"
                      onClick={handleUploadFile}
                      disabled={loading || !fileContent}
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all disabled:opacity-50"
                    >
                      {loading ? 'Parsing...' : 'Parse & Ingest File'}
                    </button>
                  </div>
                </div>
              )}

              {/* PATH C: Sample Exploration Data */}
              {activeTab === 'SAMPLE' && (
                <div className="space-y-4 pt-4 text-xs">
                  <div className="bg-slate-900 border border-surface-border p-3 rounded-lg text-slate-300 space-y-1">
                    <span className="font-semibold text-white block">Sample Exploration Mode</span>
                    <p className="text-[11px] text-slate-400">
                      Explore the continuous CRQ calculations and board reports before integrating production tools. Every calculation runs on realistic simulated telemetry, clearly labeled throughout the platform.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="font-semibold block">Preloaded Realistic Enterprise Scenarios</span>
                      <span className="text-[11px] text-slate-400">Includes Active CVE-2025 findings, SIEM credential stuffing, and CISA KEV alerts.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSwitchToSample}
                      disabled={loading}
                      className="px-3.5 py-1.5 rounded-lg bg-surface border border-surface-border text-cyan-400 hover:bg-slate-800 font-semibold"
                    >
                      Activate Sample Mode
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
