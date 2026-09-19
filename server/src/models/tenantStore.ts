import { v4 as uuidv4 } from 'uuid';

export type PlanTier = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type UserRole = 'ADMIN' | 'CISO' | 'SECURITY_ANALYST' | 'COMPLIANCE_AUDITOR';
export type AssetCriticality = 'MISSION_CRITICAL' | 'BUSINESS_OPERATIONAL' | 'INTERNAL_SUPPORT';
export type IngestionMode = 'LIVE_CONNECTOR' | 'MANUAL_UPLOAD' | 'SAMPLE_SIMULATION';
export type DataSourceCategory = 'VULNERABILITY' | 'SIEM' | 'ASSET' | 'THREAT_INTEL' | 'THIRD_PARTY';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  planTier: PlanTier;
  annualRevenueUsd: number;
  boardRiskAppetiteUsd: number;
  industrySector: string;
  createdAt: string;
}

export interface User {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: UserRole;
  mfaEnabled: boolean;
  lastLogin?: string;
}

export interface Asset {
  id: string;
  orgId: string;
  name: string;
  serviceType: string;
  ownerEmail: string;
  criticality: AssetCriticality;
  declaredValuationUsd: number; // Maximum financial loss ceiling for this asset
  cloudProvider?: string;
  ipOrHostname?: string;
  controlScore: number; // 0-100% current defensive strength
  vulnerabilitiesCount: number;
  calculatedEalUsd: number; // Computed Expected Annual Loss for this specific asset
}

export interface Vendor {
  id: string;
  orgId: string;
  name: string;
  serviceRole: string;
  criticality: AssetCriticality;
  annualSpendUsd: number;
  sharedInfrastructure: string; // e.g., "AWS_US_EAST_1", "OKTA_GLOBAL_IDP", "CLOUDFLARE_EDGE"
  singlePointOfFailure: boolean;
  standaloneRiskUsd: number;
  correlatedRiskMultiplier: number; // >1.0 if sharing dependency with other vendors
}

export interface DataConnectorConfig {
  id: string;
  orgId: string;
  category: DataSourceCategory;
  name: string;
  provider: string;
  mode: IngestionMode;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSyncTime: string;
  recordsPulledCount: number;
  confidenceRating: number; // Live API: 90-99%, Manual: 65-80%, Sample: 85%
  credentialsConfigured: boolean;
  notes?: string;
}

export interface HistoricalRiskSnapshot {
  id: string;
  orgId: string;
  timestamp: string;
  ealUsd: number;
  var95Usd: number;
  controlPostureScore: number;
  triggerEvent: string;
  actorRole: string;
}

export interface DeployedControlTracker {
  id: string;
  orgId: string;
  controlName: string;
  deployedAt: string;
  costUsd: number;
  predictedEalReductionUsd: number;
  observedEalReductionUsd: number; // Measured from subsequent telemetry
  predictionVarianceUsd: number; // observed - predicted
  accuracyPercentage: number;
  status: 'OBSERVING' | 'VALIDATED' | 'UNDERPERFORMING';
}

/**
 * Isolated In-Memory Tenant Store guaranteeing zero multi-tenant data leakage.
 */
class MultiTenantStore {
  private orgs: Map<string, Organization> = new Map();
  private users: Map<string, User[]> = new Map();
  private assets: Map<string, Asset[]> = new Map();
  private vendors: Map<string, Vendor[]> = new Map();
  private connectors: Map<string, DataConnectorConfig[]> = new Map();
  private history: Map<string, HistoricalRiskSnapshot[]> = new Map();
  private deployedControls: Map<string, DeployedControlTracker[]> = new Map();

  constructor() {
    this.seedDefaultOrganization('org-acme-fintech');
  }

  public seedDefaultOrganization(orgId: string) {
    const org: Organization = {
      id: orgId,
      name: 'Acme Financial Technologies SaaS',
      domain: 'acmefintech.io',
      planTier: 'ENTERPRISE',
      annualRevenueUsd: 120000000, // $120M ARR
      boardRiskAppetiteUsd: 5000000, // $5.0M board threshold
      industrySector: 'Financial Services / B2B SaaS',
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
    };
    this.orgs.set(orgId, org);

    // Initial Users
    const users: User[] = [
      {
        id: 'usr-admin-1',
        orgId,
        email: 'admin@acmefintech.io',
        name: 'Sarah Chen',
        role: 'ADMIN',
        mfaEnabled: true,
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr-ciso-1',
        orgId,
        email: 'ciso@acmefintech.io',
        name: 'Marcus Sterling',
        role: 'CISO',
        mfaEnabled: true,
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr-analyst-1',
        orgId,
        email: 'analyst@acmefintech.io',
        name: 'Elena Rostova',
        role: 'SECURITY_ANALYST',
        mfaEnabled: true,
        lastLogin: new Date().toISOString()
      },
      {
        id: 'usr-auditor-1',
        orgId,
        email: 'auditor@kpmg-audit.com',
        name: 'David Vance',
        role: 'COMPLIANCE_AUDITOR',
        mfaEnabled: true,
        lastLogin: new Date().toISOString()
      }
    ];
    this.users.set(orgId, users);

    // In-App Asset Register with declared business valuations
    const assets: Asset[] = [
      {
        id: 'ast-core-db',
        orgId,
        name: 'Customer PII & Transaction Postgres DB',
        serviceType: 'Relational Database / AWS RDS',
        ownerEmail: 'data-eng@acmefintech.io',
        criticality: 'MISSION_CRITICAL',
        declaredValuationUsd: 18000000,
        cloudProvider: 'AWS us-east-1',
        ipOrHostname: 'db-prod-cluster.acmefintech.internal',
        controlScore: 82,
        vulnerabilitiesCount: 3,
        calculatedEalUsd: 1850000
      },
      {
        id: 'ast-auth-cluster',
        orgId,
        name: 'Kubernetes Ingress & Auth Gateway',
        serviceType: 'Compute / EKS Cluster',
        ownerEmail: 'infra-sec@acmefintech.io',
        criticality: 'MISSION_CRITICAL',
        declaredValuationUsd: 12000000,
        cloudProvider: 'AWS us-east-1',
        ipOrHostname: 'k8s-ingress.acmefintech.io',
        controlScore: 78,
        vulnerabilitiesCount: 5,
        calculatedEalUsd: 1420000
      },
      {
        id: 'ast-s3-backup',
        orgId,
        name: 'Regulatory Financial Audit S3 Vault',
        serviceType: 'Object Storage / S3 Glacier',
        ownerEmail: 'compliance@acmefintech.io',
        criticality: 'BUSINESS_OPERATIONAL',
        declaredValuationUsd: 6500000,
        cloudProvider: 'AWS us-east-1',
        ipOrHostname: 's3://fin-audit-vault-prod',
        controlScore: 88,
        vulnerabilitiesCount: 1,
        calculatedEalUsd: 480000
      },
      {
        id: 'ast-k8s-ci',
        orgId,
        name: 'CI/CD Production Deployment Runner Fleet',
        serviceType: 'DevOps / GitHub Enterprise Runner',
        ownerEmail: 'devops@acmefintech.io',
        criticality: 'BUSINESS_OPERATIONAL',
        declaredValuationUsd: 4500000,
        cloudProvider: 'AWS us-east-1',
        ipOrHostname: 'runner-pool-01.internal',
        controlScore: 74,
        vulnerabilitiesCount: 2,
        calculatedEalUsd: 620000
      },
      {
        id: 'ast-internal-crm',
        orgId,
        name: 'Internal Employee Knowledge Hub & Wiki',
        serviceType: 'Internal Tooling / Retool + Notion',
        ownerEmail: 'it-ops@acmefintech.io',
        criticality: 'INTERNAL_SUPPORT',
        declaredValuationUsd: 850000,
        cloudProvider: 'Google Cloud Platform',
        ipOrHostname: 'wiki.internal.acmefintech.io',
        controlScore: 92,
        vulnerabilitiesCount: 0,
        calculatedEalUsd: 95000
      }
    ];
    this.assets.set(orgId, assets);

    // Third-Party Vendor Register with Shared Dependencies
    const vendors: Vendor[] = [
      {
        id: 'vnd-aws',
        orgId,
        name: 'Amazon Web Services (us-east-1)',
        serviceRole: 'Primary Cloud Infrastructure & Kubernetes',
        criticality: 'MISSION_CRITICAL',
        annualSpendUsd: 940000,
        sharedInfrastructure: 'AWS_US_EAST_1',
        singlePointOfFailure: true,
        standaloneRiskUsd: 1800000,
        correlatedRiskMultiplier: 1.45
      },
      {
        id: 'vnd-okta',
        orgId,
        name: 'Okta Identity Cloud',
        serviceRole: 'Workforce SSO & Customer Authentication',
        criticality: 'MISSION_CRITICAL',
        annualSpendUsd: 180000,
        sharedInfrastructure: 'AWS_US_EAST_1', // Shares underlying cloud region
        singlePointOfFailure: true,
        standaloneRiskUsd: 1100000,
        correlatedRiskMultiplier: 1.35
      },
      {
        id: 'vnd-stripe',
        orgId,
        name: 'Stripe Payments Gateway',
        serviceRole: 'Customer Payment Settlement & Subscriptions',
        criticality: 'MISSION_CRITICAL',
        annualSpendUsd: 320000,
        sharedInfrastructure: 'AWS_US_EAST_1', // Shared cloud region
        singlePointOfFailure: false,
        standaloneRiskUsd: 850000,
        correlatedRiskMultiplier: 1.25
      },
      {
        id: 'vnd-datadog',
        orgId,
        name: 'Datadog Cloud Observability',
        serviceRole: 'APM & Application Metrics',
        criticality: 'BUSINESS_OPERATIONAL',
        annualSpendUsd: 140000,
        sharedInfrastructure: 'AWS_US_EAST_1',
        singlePointOfFailure: false,
        standaloneRiskUsd: 220000,
        correlatedRiskMultiplier: 1.15
      },
      {
        id: 'vnd-snowflake',
        orgId,
        name: 'Snowflake Data Cloud',
        serviceRole: 'Business Intelligence & Ledger Analytics',
        criticality: 'BUSINESS_OPERATIONAL',
        annualSpendUsd: 260000,
        sharedInfrastructure: 'AZURE_EAST_US', // Independent cloud dependency
        singlePointOfFailure: false,
        standaloneRiskUsd: 410000,
        correlatedRiskMultiplier: 1.0 // Uncorrelated
      }
    ];
    this.vendors.set(orgId, vendors);

    // 5 Ingestion Connectors (Categories A - E)
    const connectors: DataConnectorConfig[] = [
      {
        id: 'conn-cat-a',
        orgId,
        category: 'VULNERABILITY',
        name: 'Tenable.io Vulnerability Scanner',
        provider: 'Tenable Cloud REST API',
        mode: 'SAMPLE_SIMULATION',
        status: 'CONNECTED',
        lastSyncTime: new Date(Date.now() - 4 * 60000).toISOString(),
        recordsPulledCount: 348,
        confidenceRating: 94,
        credentialsConfigured: true,
        notes: 'Pulls CVEs, CVSS v3.1, and EPSS scores across all cloud subnets'
      },
      {
        id: 'conn-cat-b',
        orgId,
        category: 'SIEM',
        name: 'Splunk HEC Enterprise SIEM Stream',
        provider: 'Splunk HTTP Event Collector',
        mode: 'SAMPLE_SIMULATION',
        status: 'CONNECTED',
        lastSyncTime: new Date(Date.now() - 2 * 60000).toISOString(),
        recordsPulledCount: 18450,
        confidenceRating: 91,
        credentialsConfigured: true,
        notes: 'Summarized threat event frequency (TEF) counts by attack category'
      },
      {
        id: 'conn-cat-c',
        orgId,
        category: 'ASSET',
        name: 'AWS Systems Manager & CloudTrail CMDB',
        provider: 'AWS STS IAM Role',
        mode: 'SAMPLE_SIMULATION',
        status: 'CONNECTED',
        lastSyncTime: new Date(Date.now() - 15 * 60000).toISOString(),
        recordsPulledCount: 124,
        confidenceRating: 96,
        credentialsConfigured: true,
        notes: 'Synchronizes EC2, RDS, and S3 inventory with financial criticality'
      },
      {
        id: 'conn-cat-d',
        orgId,
        category: 'THREAT_INTEL',
        name: 'CISA Known Exploited Vulnerabilities (KEV)',
        provider: 'CISA Official Public Cyber Feed',
        mode: 'LIVE_CONNECTOR',
        status: 'CONNECTED',
        lastSyncTime: new Date(Date.now() - 30 * 60000).toISOString(),
        recordsPulledCount: 1210,
        confidenceRating: 99,
        credentialsConfigured: true,
        notes: 'Live public cyber feed flagging weaponized in-the-wild zero-days'
      },
      {
        id: 'conn-cat-e',
        orgId,
        category: 'THIRD_PARTY',
        name: 'Third-Party Vendor Register & Dependency Map',
        provider: 'In-App Manual Supply Chain Catalog',
        mode: 'MANUAL_UPLOAD',
        status: 'CONNECTED',
        lastSyncTime: new Date(Date.now() - 120 * 60000).toISOString(),
        recordsPulledCount: 5,
        confidenceRating: 78,
        credentialsConfigured: false,
        notes: 'Maps shared infrastructure dependencies for correlated concentration risk'
      }
    ];
    this.connectors.set(orgId, connectors);

    // Historical Risk Time-Series (90-day trajectory)
    const history: HistoricalRiskSnapshot[] = [
      {
        id: 'snap-1',
        orgId,
        timestamp: new Date(Date.now() - 60 * 86400000).toISOString(),
        ealUsd: 7200000,
        var95Usd: 13400000,
        controlPostureScore: 68.0,
        triggerEvent: 'Quarterly Risk Baseline Assessment',
        actorRole: 'SYSTEM_CRON'
      },
      {
        id: 'snap-2',
        orgId,
        timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
        ealUsd: 6400000,
        var95Usd: 11800000,
        controlPostureScore: 72.5,
        triggerEvent: 'Enterprise FIDO2 MFA Phase 1 Rollout Completed',
        actorRole: 'CISO'
      },
      {
        id: 'snap-3',
        orgId,
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
        ealUsd: 5740000,
        var95Usd: 10450000,
        controlPostureScore: 76.2,
        triggerEvent: 'Automated Vulnerability Remediation on DB Tier',
        actorRole: 'SECURITY_ANALYST'
      },
      {
        id: 'snap-4',
        orgId,
        timestamp: new Date().toISOString(),
        ealUsd: 5550000,
        var95Usd: 10170000,
        controlPostureScore: 78.4,
        triggerEvent: 'Live Telemetry Ingestion & OpenFAIR Monte Carlo Re-calibration',
        actorRole: 'SYSTEM_CRON'
      }
    ];
    this.history.set(orgId, history);

    // Closed-Loop Deployed Control Tracker
    const deployedControls: DeployedControlTracker[] = [
      {
        id: 'dep-mfa',
        orgId,
        controlName: 'Enterprise FIDO2 Hardware Token MFA',
        deployedAt: new Date(Date.now() - 35 * 86400000).toISOString(),
        costUsd: 150000,
        predictedEalReductionUsd: 800000,
        observedEalReductionUsd: 740000, // 92.5% of prediction
        predictionVarianceUsd: -60000,
        accuracyPercentage: 92.5,
        status: 'VALIDATED'
      },
      {
        id: 'dep-edr',
        orgId,
        controlName: 'Core Cluster Managed EDR & 24/7 Threat Hunting',
        deployedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        costUsd: 220000,
        predictedEalReductionUsd: 650000,
        observedEalReductionUsd: 590000,
        predictionVarianceUsd: -60000,
        accuracyPercentage: 90.7,
        status: 'VALIDATED'
      }
    ];
    this.deployedControls.set(orgId, deployedControls);
  }

  // Getters and Mutators with strict Tenant Isolation
  public getOrganization(orgId: string): Organization | undefined {
    return this.orgs.get(orgId);
  }

  public updateOrganization(orgId: string, updates: Partial<Organization>): Organization | undefined {
    const org = this.orgs.get(orgId);
    if (!org) return undefined;
    Object.assign(org, updates);
    return org;
  }

  public getUsers(orgId: string): User[] {
    return this.users.get(orgId) || [];
  }

  public addUser(orgId: string, user: Omit<User, 'id'>): User {
    const list = this.users.get(orgId) || [];
    const created: User = { ...user, id: `usr-${uuidv4().substring(0, 8)}` };
    list.push(created);
    this.users.set(orgId, list);
    return created;
  }

  public getAssets(orgId: string): Asset[] {
    return this.assets.get(orgId) || [];
  }

  public addAsset(orgId: string, asset: Omit<Asset, 'id' | 'calculatedEalUsd' | 'vulnerabilitiesCount'>): Asset {
    const list = this.assets.get(orgId) || [];
    // Criticality multiplier on loss
    const critMultiplier = asset.criticality === 'MISSION_CRITICAL' ? 0.12 : asset.criticality === 'BUSINESS_OPERATIONAL' ? 0.07 : 0.02;
    const estimatedEal = Math.round(asset.declaredValuationUsd * critMultiplier * ((100 - asset.controlScore) / 100));

    const created: Asset = {
      ...asset,
      id: `ast-${uuidv4().substring(0, 8)}`,
      vulnerabilitiesCount: 0,
      calculatedEalUsd: estimatedEal
    };
    list.push(created);
    this.assets.set(orgId, list);
    return created;
  }

  public getVendors(orgId: string): Vendor[] {
    return this.vendors.get(orgId) || [];
  }

  public addVendor(orgId: string, vendor: Omit<Vendor, 'id' | 'standaloneRiskUsd' | 'correlatedRiskMultiplier'>): Vendor {
    const list = this.vendors.get(orgId) || [];
    // Check if other vendors share this infrastructure
    const sameInfraVendors = list.filter(v => v.sharedInfrastructure === vendor.sharedInfrastructure);
    const multiplier = sameInfraVendors.length > 0 ? 1.25 + sameInfraVendors.length * 0.1 : 1.0;
    const standalone = Math.round(vendor.annualSpendUsd * (vendor.criticality === 'MISSION_CRITICAL' ? 3.5 : 1.8));

    const created: Vendor = {
      ...vendor,
      id: `vnd-${uuidv4().substring(0, 8)}`,
      standaloneRiskUsd: standalone,
      correlatedRiskMultiplier: multiplier
    };
    list.push(created);
    this.vendors.set(orgId, list);
    return created;
  }

  public getConnectors(orgId: string): DataConnectorConfig[] {
    return this.connectors.get(orgId) || [];
  }

  public updateConnector(orgId: string, id: string, updates: Partial<DataConnectorConfig>): DataConnectorConfig | undefined {
    const list = this.connectors.get(orgId) || [];
    const conn = list.find(c => c.id === id);
    if (!conn) return undefined;
    Object.assign(conn, updates);
    return conn;
  }

  public getHistory(orgId: string): HistoricalRiskSnapshot[] {
    return this.history.get(orgId) || [];
  }

  public addSnapshot(orgId: string, snapshot: Omit<HistoricalRiskSnapshot, 'id' | 'timestamp'>): HistoricalRiskSnapshot {
    const list = this.history.get(orgId) || [];
    const created: HistoricalRiskSnapshot = {
      ...snapshot,
      id: `snap-${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toISOString()
    };
    list.push(created);
    this.history.set(orgId, list);
    return created;
  }

  public getDeployedControls(orgId: string): DeployedControlTracker[] {
    return this.deployedControls.get(orgId) || [];
  }

  public deployControl(orgId: string, controlName: string, costUsd: number, predictedEalReductionUsd: number): DeployedControlTracker {
    const list = this.deployedControls.get(orgId) || [];
    // Closed-loop simulation: after control deployment, observed is ~88-95% of predicted due to operational friction
    const observedEalReductionUsd = Math.round(predictedEalReductionUsd * (0.88 + Math.random() * 0.08));
    const predictionVarianceUsd = observedEalReductionUsd - predictedEalReductionUsd;
    const accuracyPercentage = Number(((observedEalReductionUsd / predictedEalReductionUsd) * 100).toFixed(1));

    const created: DeployedControlTracker = {
      id: `dep-${uuidv4().substring(0, 8)}`,
      orgId,
      controlName,
      deployedAt: new Date().toISOString(),
      costUsd,
      predictedEalReductionUsd,
      observedEalReductionUsd,
      predictionVarianceUsd,
      accuracyPercentage,
      status: accuracyPercentage >= 85 ? 'VALIDATED' : 'UNDERPERFORMING'
    };

    list.unshift(created);
    this.deployedControls.set(orgId, list);
    return created;
  }
}

export const tenantStore = new MultiTenantStore();
