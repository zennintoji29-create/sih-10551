import React, { useState } from 'react';
import {
  Settings,
  Database,
  Users,
  KeyRound,
  Shield,
  CheckCircle2,
  RefreshCw,
  Plus
} from 'lucide-react';

export const AdminConsole: React.FC = () => {
  const [syncing, setSyncing] = useState<string | null>(null);

  const connectors = [
    {
      id: 'conn-tenable',
      name: 'Tenable.io Cloud Connector',
      category: 'Vulnerability Scanner',
      provider: 'Tenable REST API',
      status: 'CONNECTED',
      lastSync: '2 minutes ago',
      recordsIngested: 348,
      confidence: 92
    },
    {
      id: 'conn-splunk',
      name: 'Splunk HEC Enterprise Feed',
      category: 'SIEM Log Stream',
      provider: 'Splunk HEC v2',
      status: 'CONNECTED',
      lastSync: '1 minute ago',
      recordsIngested: 18450,
      confidence: 89
    },
    {
      id: 'conn-aws',
      name: 'AWS GuardDuty & IAM Ingestion',
      category: 'Cloud CMDB / Assets',
      provider: 'AWS STS Cross-Account',
      status: 'CONNECTED',
      lastSync: '12 minutes ago',
      recordsIngested: 124,
      confidence: 95
    },
    {
      id: 'conn-cisa-kev',
      name: 'CISA Known Exploited Vulnerabilities (KEV)',
      category: 'Threat Intelligence',
      provider: 'CISA Government Feed',
      status: 'CONNECTED',
      lastSync: '24 minutes ago',
      recordsIngested: 1210,
      confidence: 98
    }
  ];

  const handleSync = (id: string) => {
    setSyncing(id);
    setTimeout(() => {
      setSyncing(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-surface-border p-5 rounded-xl">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-cyan-400">
          <Settings className="w-3.5 h-3.5" />
          <span>Tenant Administration & Telemetry Connectors</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight mt-1">
          SaaS Admin & Pipeline Control Center
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure multi-tenant isolated schemas, security connector integrations, and RBAC user provisioning.
        </p>
      </div>

      {/* Organization Details & Plan Tier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">Active Tenant</span>
          <h3 className="text-base font-bold text-white mt-1">Acme Financial Technologies</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Domain: acmefintech.io</p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">Subscription Plan</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-base font-bold text-cyan-400">Enterprise Continuous</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 font-mono px-2 py-0.5 rounded border border-cyan-800">
              ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry • 10k Monte Carlo runs</p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <span className="text-xs text-slate-400 uppercase font-semibold">Data Retention</span>
          <h3 className="text-base font-bold text-white mt-1">7 Years (SEC Compliant)</h3>
          <p className="text-xs text-slate-400 mt-0.5">SHA-256 tamper-proof ledger enabled</p>
        </div>
      </div>

      {/* Ingestion Pipeline Connectors */}
      <div className="glass-panel rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span>Active Telemetry Ingestion Connectors</span>
            </h2>
            <p className="text-xs text-slate-400">
              Continuous connectors pulling vulnerability, event, and threat data into the normalization layer.
            </p>
          </div>
          <button className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Connector</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectors.map(c => (
            <div key={c.id} className="bg-slate-900 border border-surface-border p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{c.name}</h3>
                  <span className="text-[11px] text-slate-400">{c.category}</span>
                </div>
                <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {c.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-surface-border text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Records (24h)</span>
                  <span className="font-mono font-bold text-white">{c.recordsIngested.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Confidence</span>
                  <span className="font-mono font-bold text-cyan-300">{c.confidence}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Last Sync</span>
                  <span className="font-mono text-slate-400 text-[11px]">{c.lastSync}</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleSync(c.id)}
                  disabled={syncing === c.id}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-surface border border-surface-border text-slate-300 text-xs hover:text-white transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 text-cyan-400 ${syncing === c.id ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
