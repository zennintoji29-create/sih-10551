import { v4 as uuidv4 } from 'uuid';
import { tenantStore, IngestionMode, DataSourceCategory } from '../models/tenantStore';

export interface TelemetryRecord {
  id: string;
  orgId: string;
  category: DataSourceCategory;
  sourceOrigin: IngestionMode;
  sourceProvider: string; // e.g. "Qualys Cloud API", "Tenable.io", "Splunk HEC", "Manual CSV"
  assetId?: string;
  assetName?: string;
  cveId?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  title: string;
  rawPayload: Record<string, any>;
  confidenceScore: number;
  financialImpactEstimated?: number;
  timestamp: string;
  status: 'PROCESSED' | 'PENDING' | 'MITIGATED';
}

class IngestionPipelineManager {
  private records: Map<string, TelemetryRecord[]> = new Map();

  constructor() {
    this.seedTelemetry('org-acme-fintech');
  }

  private seedTelemetry(orgId: string) {
    const initialRecords: TelemetryRecord[] = [
      {
        id: 'rec-1',
        orgId,
        category: 'VULNERABILITY',
        sourceOrigin: 'SAMPLE_SIMULATION',
        sourceProvider: 'Tenable.io REST API',
        assetId: 'ast-core-db',
        assetName: 'Customer PII & Transaction Postgres DB',
        cveId: 'CVE-2025-2410',
        severity: 'CRITICAL',
        title: 'Unauthenticated RCE in Postgres Connection Pool Gateway',
        rawPayload: { cvss: 9.8, epss: 0.91, cisaKev: true, patched: false },
        confidenceScore: 94,
        financialImpactEstimated: 320000,
        timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
        status: 'PROCESSED'
      },
      {
        id: 'rec-2',
        orgId,
        category: 'SIEM',
        sourceOrigin: 'SAMPLE_SIMULATION',
        sourceProvider: 'Splunk HEC Stream',
        assetId: 'ast-auth-cluster',
        assetName: 'Kubernetes Ingress & Auth Gateway',
        severity: 'HIGH',
        title: 'Distributed Credential Stuffing Surge (>4,500 auth failures/min)',
        rawPayload: { failedLogins: 4520, uniqueIps: 184, botHeuristic: 'GenAI Script' },
        confidenceScore: 91,
        financialImpactEstimated: 140000,
        timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
        status: 'PROCESSED'
      },
      {
        id: 'rec-3',
        orgId,
        category: 'ASSET',
        sourceOrigin: 'SAMPLE_SIMULATION',
        sourceProvider: 'AWS Systems Manager',
        assetId: 'ast-s3-backup',
        assetName: 'Regulatory Financial Audit S3 Vault',
        severity: 'MEDIUM',
        title: 'Cloud Storage Policy Drift: Public Read ACL Activated',
        rawPayload: { bucket: 'fin-audit-vault-prod', driftDetected: true },
        confidenceScore: 96,
        financialImpactEstimated: 75000,
        timestamp: new Date(Date.now() - 65 * 60000).toISOString(),
        status: 'PROCESSED'
      },
      {
        id: 'rec-4',
        orgId,
        category: 'THREAT_INTEL',
        sourceOrigin: 'LIVE_CONNECTOR',
        sourceProvider: 'CISA Known Exploited Vulnerabilities Feed',
        cveId: 'CVE-2025-1109',
        severity: 'HIGH',
        title: 'Zero-Day Weaponization Against Spring Cloud Gateway Middleware',
        rawPayload: { epss: 0.94, ransomwareActor: 'FIN7 Automation', inCisaKev: true },
        confidenceScore: 99,
        financialImpactEstimated: 210000,
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        status: 'PROCESSED'
      }
    ];

    this.records.set(orgId, initialRecords);
  }

  public getTelemetry(orgId: string): TelemetryRecord[] {
    return this.records.get(orgId) || [];
  }

  /**
   * Unified Ingestion: Normalizes raw records from any path (Live API, Manual Upload, Sample),
   * checks duplicates, calculates confidence, and appends to the tenant stream.
   */
  public ingest(orgId: string, record: Omit<TelemetryRecord, 'id' | 'timestamp' | 'status'>): TelemetryRecord {
    const orgRecords = this.records.get(orgId) || [];

    // Deduplication check
    const isDuplicate = orgRecords.some(r =>
      r.cveId === record.cveId &&
      r.assetId === record.assetId &&
      r.category === record.category &&
      (Date.now() - new Date(r.timestamp).getTime()) < 3600000 // within 1 hour
    );

    if (isDuplicate) {
      const existing = orgRecords.find(r => r.cveId === record.cveId && r.assetId === record.assetId)!;
      existing.timestamp = new Date().toISOString();
      return existing;
    }

    // Assign confidence score by provenance
    let confidence = record.confidenceScore;
    if (record.sourceOrigin === 'LIVE_CONNECTOR') {
      confidence = Math.max(92, confidence);
    } else if (record.sourceOrigin === 'MANUAL_UPLOAD') {
      confidence = Math.min(78, confidence);
    } else {
      confidence = 85;
    }

    const created: TelemetryRecord = {
      ...record,
      id: `rec-${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toISOString(),
      status: 'PROCESSED',
      confidenceScore: confidence
    };

    orgRecords.unshift(created);
    this.records.set(orgId, orgRecords);

    // Update connector statistics in tenantStore
    const connectors = tenantStore.getConnectors(orgId);
    const matchedConnector = connectors.find(c => c.category === record.category);
    if (matchedConnector) {
      matchedConnector.lastSyncTime = created.timestamp;
      matchedConnector.recordsPulledCount += 1;
      matchedConnector.status = 'CONNECTED';
    }

    return created;
  }

  /**
   * Parses uploaded CSV or JSON content for Category A (Vulnerability data)
   */
  public parseVulnerabilityFile(orgId: string, content: string, fileType: 'CSV' | 'JSON'): TelemetryRecord[] {
    const results: TelemetryRecord[] = [];

    if (fileType === 'JSON') {
      try {
        const parsed = JSON.parse(content);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          const rec = this.ingest(orgId, {
            orgId,
            category: 'VULNERABILITY',
            sourceOrigin: 'MANUAL_UPLOAD',
            sourceProvider: 'Uploaded Vulnerability Scanner Export',
            assetName: item.assetName || item.host || 'Unknown Target Host',
            cveId: item.cveId || item.cve || 'CVE-2025-MANUAL',
            severity: (item.severity?.toUpperCase() as any) || 'HIGH',
            title: item.title || item.vulnerabilityName || 'Imported Vulnerability Finding',
            rawPayload: item,
            confidenceScore: 75,
            financialImpactEstimated: item.financialImpactEstimated || 180000
          });
          results.push(rec);
        }
      } catch (e) {
        console.error('Failed to parse JSON vulnerability file:', e);
      }
    } else {
      // CSV parser (columns: asset, cve, severity, title, estimated_loss)
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });

        const rec = this.ingest(orgId, {
          orgId,
          category: 'VULNERABILITY',
          sourceOrigin: 'MANUAL_UPLOAD',
          sourceProvider: 'CSV Vulnerability Scanner Upload',
          assetName: row['asset'] || row['host'] || 'Imported Asset',
          cveId: row['cve'] || row['cveid'] || 'CVE-2025-CSV',
          severity: (row['severity']?.toUpperCase() as any) || 'HIGH',
          title: row['title'] || 'Uploaded Vulnerability Finding',
          rawPayload: row,
          confidenceScore: 72,
          financialImpactEstimated: Number(row['estimated_loss'] || row['loss']) || 150000
        });
        results.push(rec);
      }
    }

    return results;
  }
}

export const ingestionService = new IngestionPipelineManager();
