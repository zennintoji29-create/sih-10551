import crypto from "crypto";
import { calculateFair, aggregateEal, attributeChange, type FairResult } from "../engine/fair";
import { simulateVar } from "../engine/var";
import { calculateRosi, accumulationRisk } from "../engine/rosi";

export type Role = "admin" | "ciso" | "analyst" | "auditor";
export type PlanTier = "starter" | "pro" | "enterprise";
export type DataSourceCategory = "vulnerability" | "siem" | "asset_inventory" | "threat_intel" | "vendor" | "telemetry";
export type ConnectorMode = "live" | "manual" | "sample";
export type ConnectorStatus = "connected" | "error" | "not_connected";

export interface User {
  id: string;
  orgId: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: PlanTier;
  createdAt: string;
}

export interface AssetRecord {
  id: string;
  orgId: string;
  name: string;
  criticality: number; // 0–1
  owner: string;
  tef: number;
  vulnerability: number;
  controlEffectiveness: number;
  aiAmplificationFactor: number;
  directCosts: number;
  indirectCosts: number;
  regulatoryCosts: number;
  sourceConfidence: number; // 0–1
  createdAt: string;
}

export interface Finding {
  id: string;
  orgId: string;
  assetId: string;
  assetName: string;
  cve: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  cvssScore: number;
  exploitability: number;
  isPatched: boolean;
  inCisaKev: boolean;
  financialImpact: number; // calculated dollar exposure if unaddressed
  originalImpact?: number; // retained when remediated for rollback/audit
  sourceMode: ConnectorMode;
  confidence: number;
  discoveredAt: string;
  attackVector?: string;
  cvssVector?: string;
  description?: string;
  remediationSteps?: string[];
  primaryLoss?: number;
  secondaryLoss?: number;
  regulatoryExposure?: string;
}

export interface SiemEventSummary {
  id: string;
  orgId: string;
  month: string;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  probesPerDay: number;
  effectiveTef: number;
  sourceMode: ConnectorMode;
  confidence: number;
  updatedAt: string;
}

export interface ThreatIntelFeed {
  id: string;
  orgId: string;
  cve: string;
  activeInWild: boolean;
  aiAugmentedTooling: boolean;
  suggestedAmplification: number;
  reportedDate: string;
}

export interface VendorRecord {
  id: string;
  orgId: string;
  name: string;
  service: string;
  ealContribution: number;
  sharedDependencyGroup?: string; // e.g. "aws-us-east-1", "okta-iam", "cloudflare"
  sourceMode: ConnectorMode;
  createdAt: string;
}

export interface ControlRecord {
  id: string;
  orgId: string;
  name: string;
  cost: number;
  predictedMitigationPct: number; // 0–1
  confidencePct: number; // 0–1
  deployedAt?: string;
  observedEalReduction?: number; // closed-loop verification
  createdAt: string;
}

export interface ConnectorInfo {
  category: DataSourceCategory;
  name: string;
  status: ConnectorStatus;
  mode: ConnectorMode;
  lastSyncAt: string | null;
  recordCount: number;
  confidence: number;
  details: string;
}

export interface AuditLogEntry {
  id: string;
  orgId: string;
  actor: string;
  actorRole: Role;
  action: string;
  details: string;
  regulatoryFrameworks: string[]; // e.g. ["SEC Item 106", "DORA Art. 6", "HIPAA §164.308", "NIS2 Art. 21"]
  timestamp: string;
}

export interface RiskSnapshot {
  id: string;
  orgId: string;
  timestamp: string;
  portfolioEal: number;
  var90: number;
  var95: number;
  var99: number;
  dataConfidenceIndex: number;
  activeFindingsCount: number;
  changeAttribution?: {
    assetId: string;
    deltaEal: number;
    primaryDriver: string;
    summary: string;
  };
}

// In-Memory Multi-Tenant Store with isolated tenant storage
class DataStore {
  private orgs = new Map<string, Organization>();
  private users = new Map<string, User>();
  private assets = new Map<string, AssetRecord[]>();
  private findings = new Map<string, Finding[]>();
  private siem = new Map<string, SiemEventSummary>();
  private threatIntel = new Map<string, ThreatIntelFeed[]>();
  private vendors = new Map<string, VendorRecord[]>();
  private controls = new Map<string, ControlRecord[]>();
  private connectors = new Map<string, Map<DataSourceCategory, ConnectorInfo>>();
  private auditLogs = new Map<string, AuditLogEntry[]>();
  private snapshots = new Map<string, RiskSnapshot[]>();

  constructor() {
    this.seedInitialTenants();
  }

  public normalizeOrgId(orgId?: string): string {
    if (!orgId || orgId === "org-aegis-demo" || orgId === "org-aegis-prod") {
      return "org-aegis-prod";
    }
    return orgId;
  }

  // --- Seed Initial Organizations ---
  private seedInitialTenants() {
    const orgId = "org-aegis-prod";
    const org: Organization = {
      id: orgId,
      name: "Acme CyberFin Corp",
      domain: "acme-fin.com",
      plan: "enterprise",
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };
    this.orgs.set(orgId, org);
    this.orgs.set("org-aegis-demo", { ...org, id: "org-aegis-demo" });

    // Initial Users
    const users: User[] = [
      { id: "u-admin", orgId, email: "admin@acme-fin.com", name: "Sarah Vance (Admin)", role: "admin", createdAt: org.createdAt },
      { id: "u-ciso", orgId, email: "ciso@acme-fin.com", name: "David Chen (CISO)", role: "ciso", createdAt: org.createdAt },
      { id: "u-analyst", orgId, email: "analyst@acme-fin.com", name: "Marcus Brody (Analyst)", role: "analyst", createdAt: org.createdAt },
      { id: "u-auditor", orgId, email: "auditor@compliance.com", name: "Elena Rostova (Auditor)", role: "auditor", createdAt: org.createdAt },
    ];
    for (const u of users) {
      this.users.set(u.id, u);
    }

    // Initial Assets
    const initialAssets: AssetRecord[] = [
      {
        id: "ast-payment",
        orgId,
        name: "Core Payment Gateway (API)",
        criticality: 0.95,
        owner: "Payments Platform Team",
        tef: 14.5,
        vulnerability: 0.65,
        controlEffectiveness: 0.60,
        aiAmplificationFactor: 1.8,
        directCosts: 850000,
        indirectCosts: 1200000,
        regulatoryCosts: 500000,
        sourceConfidence: 0.95,
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: "ast-customer-db",
        orgId,
        name: "Customer Relational Database (PII)",
        criticality: 1.0,
        owner: "Data Engineering",
        tef: 8.0,
        vulnerability: 0.35,
        controlEffectiveness: 0.85,
        aiAmplificationFactor: 1.2,
        directCosts: 1500000,
        indirectCosts: 2500000,
        regulatoryCosts: 1800000,
        sourceConfidence: 0.90,
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: "ast-iam",
        orgId,
        name: "Enterprise Identity & Access (Okta IAM)",
        criticality: 0.90,
        owner: "SecOps & IT",
        tef: 22.0,
        vulnerability: 0.40,
        controlEffectiveness: 0.75,
        aiAmplificationFactor: 1.5,
        directCosts: 400000,
        indirectCosts: 900000,
        regulatoryCosts: 300000,
        sourceConfidence: 0.95,
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: "ast-portal",
        orgId,
        name: "Customer Self-Service Web Portal",
        criticality: 0.60,
        owner: "Frontend Engineering",
        tef: 35.0,
        vulnerability: 0.50,
        controlEffectiveness: 0.55,
        aiAmplificationFactor: 1.0,
        directCosts: 200000,
        indirectCosts: 350000,
        regulatoryCosts: 100000,
        sourceConfidence: 0.80,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: "ast-internal-erp",
        orgId,
        name: "Internal ERP & Financial Ledger",
        criticality: 0.80,
        owner: "Enterprise IT",
        tef: 5.0,
        vulnerability: 0.20,
        controlEffectiveness: 0.90,
        aiAmplificationFactor: 1.0,
        directCosts: 600000,
        indirectCosts: 800000,
        regulatoryCosts: 400000,
        sourceConfidence: 0.75,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
    ];
    this.assets.set(orgId, initialAssets);

    // Initial Vulnerability Findings
    const initialFindings: Finding[] = [
      {
        id: "fnd-1",
        orgId,
        assetId: "ast-payment",
        assetName: "Core Payment Gateway (API)",
        cve: "CVE-2025-24991",
        title: "Spring Framework Remote Code Execution via Path Traversal",
        severity: "Critical",
        cvssScore: 9.8,
        exploitability: 0.88,
        isPatched: false,
        inCisaKev: true,
        financialImpact: 480000,
        originalImpact: 480000,
        sourceMode: "live",
        confidence: 0.95,
        discoveredAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        attackVector: "Network (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)",
        cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        description: "Unauthenticated remote attackers can send crafted HTTP POST requests containing directory traversal sequences to bypass Spring RouterFunction path validation, resulting in arbitrary Java bytecode execution within the card processing cluster.",
        remediationSteps: [
          "Upgrade org.springframework:spring-webmvc to >= 6.2.2 or apply hotfix patch SP-2025-01.",
          "Enable AWS WAF Managed Rule Set 'AWSManagedRulesKnownBadInputsRuleSet' on ALB target group.",
          "Restrict container process capabilities via Kubernetes securityContext: drop ALL, readOnlyRootFilesystem: true."
        ],
        primaryLoss: 195000,
        secondaryLoss: 285000,
        regulatoryExposure: "PCI-DSS 4.0 Req 6.4.1 / SEC Item 1.05 Material Incident Threshold",
      },
      {
        id: "fnd-2",
        orgId,
        assetId: "ast-payment",
        assetName: "Core Payment Gateway (API)",
        cve: "CVE-2024-38077",
        title: "Windows Server Remote Desktop License Service Heap Overflow",
        severity: "High",
        cvssScore: 8.8,
        exploitability: 0.65,
        isPatched: false,
        inCisaKev: true,
        financialImpact: 260000,
        originalImpact: 260000,
        sourceMode: "live",
        confidence: 0.95,
        discoveredAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        attackVector: "Network (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)",
        cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        description: "Heap-based buffer overflow in the Windows Remote Desktop Licensing service (MadLicense). Threat actors leverage active RPC packets on port 135/3389 to achieve system-level compromise and lateral traversal.",
        remediationSteps: [
          "Apply Microsoft Security Update KB5040437 or July 2024 Patch Tuesday rollup.",
          "Disable RDC Licensing Service on internet-exposed bastion servers if not strictly required.",
          "Enforce Network Level Authentication (NLA) via Group Policy Object (GPO)."
        ],
        primaryLoss: 110000,
        secondaryLoss: 150000,
        regulatoryExposure: "NIST CSF PR.AC-5 / DORA Art. 16 Incident Reporting",
      },
      {
        id: "fnd-3",
        orgId,
        assetId: "ast-iam",
        assetName: "Enterprise Identity & Access (Okta IAM)",
        cve: "CVE-2024-55591",
        title: "Authentication Bypass in Session Management Proxy",
        severity: "Critical",
        cvssScore: 9.6,
        exploitability: 0.85,
        isPatched: false,
        inCisaKev: true,
        financialImpact: 390000,
        originalImpact: 390000,
        sourceMode: "live",
        confidence: 0.95,
        discoveredAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        attackVector: "Network (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)",
        cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
        description: "Flaw in reverse-proxy authentication cookie validation enables forging of administrative JWT claims, allowing complete tenant-wide identity takeover and SSO privilege escalation.",
        remediationSteps: [
          "Update Okta Access Gateway to build 2024.12.0 or deploy signed patch AGW-991.",
          "Force global session termination and invalidate all active bearer tokens across IAM clusters.",
          "Enforce FIDO2 / WebAuthn hardware keys on all Tier-0 administrative roles."
        ],
        primaryLoss: 160000,
        secondaryLoss: 230000,
        regulatoryExposure: "SEC Item 106 Cybersecurity Governance / GDPR Art. 32 Technical Safeguards",
      },
      {
        id: "fnd-4",
        orgId,
        assetId: "ast-customer-db",
        assetName: "Customer Relational Database (PII)",
        cve: "CVE-2024-4577",
        title: "CGI Argument Injection Resulting in Data Exfiltration",
        severity: "High",
        cvssScore: 7.8,
        exploitability: 0.45,
        isPatched: true,
        inCisaKev: false,
        financialImpact: 0,
        originalImpact: 310000,
        sourceMode: "live",
        confidence: 0.90,
        discoveredAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        attackVector: "Network (AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)",
        cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
        description: "Best-fit locale characters in PHP CGI module bypass parameter sanitization under Windows systems, allowing attackers to inject arbitrary command-line arguments to read database configuration files.",
        remediationSteps: [
          "Remediated: Upgraded PHP runtime to 8.2.20 and disabled legacy CGI wrappers.",
          "Verified: ModSecurity CRS rule 933150 activated on reverse proxy.",
          "Post-patch validation: Scanned with Tenable.io plugin #195143 with clean zero-exposure exit code."
        ],
        primaryLoss: 0,
        secondaryLoss: 0,
        regulatoryExposure: "HIPAA §164.312 / GDPR Fine Prevention",
      },
      {
        id: "fnd-5",
        orgId,
        assetId: "ast-portal",
        assetName: "Customer Self-Service Web Portal",
        cve: "CVE-2024-21413",
        title: "Microsoft Outlook Preview Pane Protocol Handler Flaw",
        severity: "Medium",
        cvssScore: 6.5,
        exploitability: 0.30,
        isPatched: false,
        inCisaKev: false,
        financialImpact: 75000,
        originalImpact: 75000,
        sourceMode: "sample",
        confidence: 0.70,
        discoveredAt: new Date(Date.now() - 8 * 86400000).toISOString(),
        attackVector: "Local Network (AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N)",
        cvssVector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N",
        description: "MonikerLink bug allowing NTLM credential relaying via file:// hyperlinks embedded in customer support ticketing emails without prompting user confirmation.",
        remediationSteps: [
          "Install Microsoft Office Security Update February 2024.",
          "Block outbound SMB (TCP port 445) at corporate perimeter firewall to prevent NTLM hash leaks.",
          "Deploy Protected View enforcement for all external customer message attachments."
        ],
        primaryLoss: 30000,
        secondaryLoss: 45000,
        regulatoryExposure: "NIST CSF PR.AC-1",
      },
    ];
    this.findings.set(orgId, initialFindings);

    // Initial SIEM Event Summary
    const initialSiem: SiemEventSummary = {
      id: "siem-1",
      orgId,
      month: "Current 30-Day Window",
      criticalAlerts: 14,
      highAlerts: 48,
      mediumAlerts: 192,
      probesPerDay: 4850,
      effectiveTef: 16.8,
      sourceMode: "live",
      confidence: 0.95,
      updatedAt: new Date().toISOString(),
    };
    this.siem.set(orgId, initialSiem);

    // Initial Threat Intel
    const initialTI: ThreatIntelFeed[] = [
      { id: "ti-1", orgId, cve: "CVE-2025-24991", activeInWild: true, aiAugmentedTooling: true, suggestedAmplification: 1.8, reportedDate: "2026-09-15" },
      { id: "ti-2", orgId, cve: "CVE-2024-38077", activeInWild: true, aiAugmentedTooling: false, suggestedAmplification: 1.2, reportedDate: "2026-09-10" },
      { id: "ti-3", orgId, cve: "CVE-2024-55591", activeInWild: true, aiAugmentedTooling: true, suggestedAmplification: 1.5, reportedDate: "2026-09-18" },
    ];
    this.threatIntel.set(orgId, initialTI);

    // Initial Vendors with SPoF Concentration Tags
    const initialVendors: VendorRecord[] = [
      { id: "vnd-1", orgId, name: "Amazon Web Services (Cloud Infra)", service: "IaaS Hosting", ealContribution: 2200000, sharedDependencyGroup: "aws-us-east-1", sourceMode: "live", createdAt: org.createdAt },
      { id: "vnd-2", orgId, name: "Datadog Telemetry SaaS", service: "Observability", ealContribution: 750000, sharedDependencyGroup: "aws-us-east-1", sourceMode: "live", createdAt: org.createdAt },
      { id: "vnd-3", orgId, name: "Stripe Payment Core", service: "Payment Processing", ealContribution: 1600000, sharedDependencyGroup: "aws-us-east-1", sourceMode: "live", createdAt: org.createdAt },
      { id: "vnd-4", orgId, name: "Okta Workforce IAM", service: "Identity Provider", ealContribution: 1100000, sharedDependencyGroup: "okta-cloud", sourceMode: "live", createdAt: org.createdAt },
      { id: "vnd-5", orgId, name: "CrowdStrike Falcon Sensor", service: "EDR / XDR", ealContribution: 800000, sharedDependencyGroup: "crowdstrike-cloud", sourceMode: "manual", createdAt: org.createdAt },
      { id: "vnd-6", orgId, name: "Zendesk Support Desk", service: "Customer Ticketing", ealContribution: 250000, sharedDependencyGroup: "aws-us-east-1", sourceMode: "sample", createdAt: org.createdAt },
    ];
    this.vendors.set(orgId, initialVendors);

    // Initial Controls & ROSI Scenarios
    const initialControls: ControlRecord[] = [
      {
        id: "ctrl-1",
        orgId,
        name: "Enterprise Hardware Token MFA Rollout",
        cost: 120000,
        predictedMitigationPct: 0.25,
        confidencePct: 0.90,
        deployedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        observedEalReduction: 310000, // Closed-loop tracking: predicted $300k, observed $310k
        createdAt: new Date(Date.now() - 50 * 86400000).toISOString(),
      },
      {
        id: "ctrl-2",
        orgId,
        name: "Runtime API Protection & WAF Micro-segmentation",
        cost: 180000,
        predictedMitigationPct: 0.35,
        confidencePct: 0.85,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        id: "ctrl-3",
        orgId,
        name: "Automated Ephemeral Secret Rotation (Vault)",
        cost: 95000,
        predictedMitigationPct: 0.18,
        confidencePct: 0.80,
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: "ctrl-4",
        orgId,
        name: "Zero-Trust Device Posture Verification for Analysts",
        cost: 60000,
        predictedMitigationPct: 0.12,
        confidencePct: 0.75,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ];
    this.controls.set(orgId, initialControls);

    // Initial Connector Statuses
    const connectorMap = new Map<DataSourceCategory, ConnectorInfo>();
    connectorMap.set("vulnerability", {
      category: "vulnerability",
      name: "Tenable.io / Qualys Scanner",
      status: "connected",
      mode: "live",
      lastSyncAt: new Date(Date.now() - 35 * 60000).toISOString(),
      recordCount: 142,
      confidence: 0.95,
      details: "Authenticated API polling active (every 4 hours)",
    });
    connectorMap.set("siem", {
      category: "siem",
      name: "Splunk / Elastic Cloud Security Logs",
      status: "connected",
      mode: "live",
      lastSyncAt: new Date(Date.now() - 12 * 60000).toISOString(),
      recordCount: 5120,
      confidence: 0.95,
      details: "Streaming metric queries on event frequencies",
    });
    connectorMap.set("asset_inventory", {
      category: "asset_inventory",
      name: "AWS CloudTrail & Resource Graph",
      status: "connected",
      mode: "live",
      lastSyncAt: new Date(Date.now() - 90 * 60000).toISOString(),
      recordCount: 5,
      confidence: 0.92,
      details: "Syncs EC2, RDS, and ECS business tags & owners",
    });
    connectorMap.set("threat_intel", {
      category: "threat_intel",
      name: "CISA KEV + FIRST EPSS Feed",
      status: "connected",
      mode: "live",
      lastSyncAt: new Date(Date.now() - 15 * 60000).toISOString(),
      recordCount: 1184,
      confidence: 0.98,
      details: "Public known exploited vulnerability feed active",
    });
    connectorMap.set("vendor", {
      category: "vendor",
      name: "Third-Party & Supplier Registry",
      status: "connected",
      mode: "manual",
      lastSyncAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      recordCount: 6,
      confidence: 0.85,
      details: "Manual vendor dependency mapping with SPoF clustering",
    });
    connectorMap.set("telemetry", {
      category: "telemetry",
      name: "GitHub / CI-CD Telemetry & Secrets",
      status: "connected",
      mode: "live",
      lastSyncAt: new Date(Date.now() - 10 * 60000).toISOString(),
      recordCount: 4,
      confidence: 0.90,
      details: "Software supply chain & SCA advisory scanner stream",
    });
    this.connectors.set(orgId, connectorMap);

    // Initial Audit Logs
    const auditEntries: AuditLogEntry[] = [
      {
        id: "aud-1",
        orgId,
        actor: "system-ingest",
        actorRole: "admin",
        action: "TELEMETRY_INGESTION_SYNC",
        details: "Live polling completed from Tenable.io: ingested 3 new CVEs (CVE-2025-24991 flagged as CISA KEV active)",
        regulatoryFrameworks: ["SEC Item 106(a)", "DORA Art. 6(1)", "NIS2 Art. 21(2)"],
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      },
      {
        id: "aud-2",
        orgId,
        actor: "Marcus Brody",
        actorRole: "analyst",
        action: "CONTROL_EVALUATION",
        details: "Initiated ROSI simulation for Runtime API Protection ($180k cost, projected 35% mitigation on Payment API)",
        regulatoryFrameworks: ["DORA Art. 16(2)", "HIPAA §164.308(a)(1)(ii)(B)"],
        timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      },
      {
        id: "aud-3",
        orgId,
        actor: "David Chen",
        actorRole: "ciso",
        action: "EXECUTIVE_RISK_REVIEW",
        details: "Reviewed 95% VaR tolerance against FY26 risk appetite threshold ($5.0M tolerance vs $4.1M current)",
        regulatoryFrameworks: ["SEC Item 106(b) Board Oversight", "DORA Art. 5(2)"],
        timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
      },
      {
        id: "aud-4",
        orgId,
        actor: "Sarah Vance",
        actorRole: "admin",
        action: "CONNECTOR_MODE_UPDATE",
        details: "Connected live AWS Cloud Resource Graph connector replacing manual asset inventory export",
        regulatoryFrameworks: ["SEC Item 106(a)", "HIPAA §164.312(b)"],
        timestamp: new Date(Date.now() - 25 * 3600000).toISOString(),
      },
    ];
    this.auditLogs.set(orgId, auditEntries);

    // Pre-seed Historical Snapshots (showing real trend line for CISO and Auditor)
    const now = Date.now();
    const dayMs = 86400000;
    const history: RiskSnapshot[] = [
      { id: "snp-1", orgId, timestamp: new Date(now - 14 * dayMs).toISOString(), portfolioEal: 1120000, var90: 2900000, var95: 3500000, var99: 5800000, dataConfidenceIndex: 0.88, activeFindingsCount: 3 },
      { id: "snp-2", orgId, timestamp: new Date(now - 10 * dayMs).toISOString(), portfolioEal: 1180000, var90: 3100000, var95: 3750000, var99: 6100000, dataConfidenceIndex: 0.89, activeFindingsCount: 4 },
      { id: "snp-3", orgId, timestamp: new Date(now - 7 * dayMs).toISOString(), portfolioEal: 1150000, var90: 3050000, var95: 3680000, var99: 5950000, dataConfidenceIndex: 0.91, activeFindingsCount: 4 },
      { id: "snp-4", orgId, timestamp: new Date(now - 3 * dayMs).toISOString(), portfolioEal: 1240000, var90: 3350000, var95: 3980000, var99: 6500000, dataConfidenceIndex: 0.93, activeFindingsCount: 5 },
      {
        id: "snp-5",
        orgId,
        timestamp: new Date(now - 1 * dayMs).toISOString(),
        portfolioEal: 1315000,
        var90: 3550000,
        var95: 4210000,
        var99: 6920000,
        dataConfidenceIndex: 0.94,
        activeFindingsCount: 5,
        changeAttribution: {
          assetId: "ast-payment",
          deltaEal: 75000,
          primaryDriver: "vulnerability",
          summary: "EAL increased by $75,000 on asset Core Payment Gateway (API) primarily because Vulnerability moved from 0.55 to 0.65 due to active CISA KEV exploitation.",
        },
      },
    ];
    this.snapshots.set(orgId, history);
  }

  // --- Multi-Tenant Accessors & Operations ---

  getOrg(orgId: string): Organization | undefined {
    return this.orgs.get(this.normalizeOrgId(orgId));
  }

  createOrg(name: string, domain: string, plan: PlanTier = "starter"): Organization {
    const id = "org-" + crypto.randomBytes(4).toString("hex");
    const org: Organization = {
      id,
      name,
      domain,
      plan,
      createdAt: new Date().toISOString(),
    };
    this.orgs.set(id, org);
    this.assets.set(id, []);
    this.findings.set(id, []);
    this.vendors.set(id, []);
    this.controls.set(id, []);
    this.auditLogs.set(id, []);
    this.snapshots.set(id, []);

    // Initialize default connectors
    const connectorMap = new Map<DataSourceCategory, ConnectorInfo>();
    const categories: DataSourceCategory[] = ["vulnerability", "siem", "asset_inventory", "threat_intel", "vendor"];
    for (const cat of categories) {
      connectorMap.set(cat, {
        category: cat,
        name: cat.toUpperCase() + " Connector",
        status: "not_connected",
        mode: "manual",
        lastSyncAt: null,
        recordCount: 0,
        confidence: 0.5,
        details: "Not yet configured",
      });
    }
    this.connectors.set(id, connectorMap);

    return org;
  }

  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getUserByEmail(email: string): User | undefined {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return undefined;
  }

  getUsersForOrg(orgId: string): User[] {
    const target = this.normalizeOrgId(orgId);
    return Array.from(this.users.values()).filter((u) => this.normalizeOrgId(u.orgId) === target);
  }

  createUser(orgId: string, email: string, name: string, role: Role): User {
    const targetOrgId = this.normalizeOrgId(orgId);
    const id = "u-" + crypto.randomBytes(4).toString("hex");
    const user: User = {
      id,
      orgId: targetOrgId,
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    this.addAuditLog(targetOrgId, "admin", "admin", "USER_INVITE", `Invited user ${email} with role ${role.toUpperCase()}`, ["SEC Item 106(b)", "DORA Art. 5"]);
    return user;
  }

  updateUserRole(orgId: string, userId: string, newRole: Role, actor: string): User | undefined {
    const targetOrgId = this.normalizeOrgId(orgId);
    const user = this.users.get(userId);
    if (!user || this.normalizeOrgId(user.orgId) !== targetOrgId) return undefined;
    const oldRole = user.role;
    user.role = newRole;
    this.addAuditLog(targetOrgId, actor, "admin", "USER_ROLE_UPDATE", `Changed role for ${user.email} from ${oldRole} to ${newRole}`, ["SEC Item 106(b)"]);
    return user;
  }

  // --- Assets ---
  getAssets(orgId: string): AssetRecord[] {
    return this.assets.get(this.normalizeOrgId(orgId)) ?? [];
  }

  saveAsset(orgId: string, asset: Omit<AssetRecord, "id" | "orgId" | "createdAt">, assetId?: string): AssetRecord {
    const targetOrgId = this.normalizeOrgId(orgId);
    const list = this.assets.get(targetOrgId) ?? [];
    if (assetId) {
      const idx = list.findIndex((a) => a.id === assetId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...asset };
        this.assets.set(targetOrgId, list);
        return list[idx];
      }
    }
    const newAsset: AssetRecord = {
      id: "ast-" + crypto.randomBytes(4).toString("hex"),
      orgId: targetOrgId,
      ...asset,
      createdAt: new Date().toISOString(),
    };
    list.push(newAsset);
    this.assets.set(targetOrgId, list);
    return newAsset;
  }

  // --- Findings ---
  getFindings(orgId: string): Finding[] {
    return this.findings.get(this.normalizeOrgId(orgId)) ?? [];
  }

  saveFindings(orgId: string, newFindings: Finding[]) {
    this.findings.set(this.normalizeOrgId(orgId), newFindings);
  }

  // --- SIEM ---
  getSiem(orgId: string): SiemEventSummary | undefined {
    return this.siem.get(this.normalizeOrgId(orgId));
  }

  saveSiem(orgId: string, summary: SiemEventSummary) {
    this.siem.set(this.normalizeOrgId(orgId), summary);
  }

  // --- Threat Intel ---
  getThreatIntel(orgId: string): ThreatIntelFeed[] {
    return this.threatIntel.get(this.normalizeOrgId(orgId)) ?? [];
  }

  // --- Vendors ---
  getVendors(orgId: string): VendorRecord[] {
    return this.vendors.get(this.normalizeOrgId(orgId)) ?? [];
  }

  saveVendors(orgId: string, vendors: VendorRecord[]) {
    this.vendors.set(this.normalizeOrgId(orgId), vendors);
  }

  // --- Controls ---
  getControls(orgId: string): ControlRecord[] {
    return this.controls.get(this.normalizeOrgId(orgId)) ?? [];
  }

  saveControl(orgId: string, control: Omit<ControlRecord, "id" | "orgId" | "createdAt">): ControlRecord {
    const targetOrgId = this.normalizeOrgId(orgId);
    const list = this.controls.get(targetOrgId) ?? [];
    const newControl: ControlRecord = {
      id: "ctrl-" + crypto.randomBytes(4).toString("hex"),
      orgId: targetOrgId,
      ...control,
      createdAt: new Date().toISOString(),
    };
    list.push(newControl);
    this.controls.set(targetOrgId, list);
    return newControl;
  }

  deployControl(orgId: string, controlId: string, observedReduction?: number): ControlRecord | undefined {
    const targetOrgId = this.normalizeOrgId(orgId);
    const list = this.controls.get(targetOrgId) ?? [];
    const ctrl = list.find((c) => c.id === controlId);
    if (!ctrl) return undefined;
    ctrl.deployedAt = new Date().toISOString();
    if (observedReduction !== undefined) {
      ctrl.observedEalReduction = observedReduction;
    }
    return ctrl;
  }

  // --- Connectors ---
  getConnectors(orgId: string): ConnectorInfo[] {
    const map = this.connectors.get(this.normalizeOrgId(orgId));
    return map ? Array.from(map.values()) : [];
  }

  updateConnector(orgId: string, category: DataSourceCategory, update: Partial<ConnectorInfo>): ConnectorInfo {
    const targetOrgId = this.normalizeOrgId(orgId);
    let map = this.connectors.get(targetOrgId);
    if (!map) {
      map = new Map();
      this.connectors.set(targetOrgId, map);
    }
    const current = map.get(category) ?? {
      category,
      name: category.toUpperCase(),
      status: "not_connected",
      mode: "manual",
      lastSyncAt: null,
      recordCount: 0,
      confidence: 0.5,
      details: "",
    };
    const updated = { ...current, ...update };
    map.set(category, updated);
    return updated;
  }

  // --- Audit Logs ---
  getAuditLogs(orgId: string): AuditLogEntry[] {
    return this.auditLogs.get(this.normalizeOrgId(orgId)) ?? [];
  }

  addAuditLog(
    orgId: string,
    actor: string,
    actorRole: Role,
    action: string,
    details: string,
    regulatoryFrameworks: string[] = ["SEC Item 106", "DORA Art. 6"]
  ): AuditLogEntry {
    const targetOrgId = this.normalizeOrgId(orgId);
    const list = this.auditLogs.get(targetOrgId) ?? [];
    const entry: AuditLogEntry = {
      id: "aud-" + crypto.randomBytes(4).toString("hex"),
      orgId: targetOrgId,
      actor,
      actorRole,
      action,
      details,
      regulatoryFrameworks,
      timestamp: new Date().toISOString(),
    };
    list.unshift(entry); // newest first
    this.auditLogs.set(targetOrgId, list);
    return entry;
  }

  // --- Snapshots & Recalculation ---
  getSnapshots(orgId: string): RiskSnapshot[] {
    return this.snapshots.get(this.normalizeOrgId(orgId)) ?? [];
  }

  addSnapshot(orgId: string, snapshot: Omit<RiskSnapshot, "id" | "orgId" | "timestamp">): RiskSnapshot {
    const targetOrgId = this.normalizeOrgId(orgId);
    const list = this.snapshots.get(targetOrgId) ?? [];
    const newSnapshot: RiskSnapshot = {
      id: "snp-" + crypto.randomBytes(4).toString("hex"),
      orgId: targetOrgId,
      timestamp: new Date().toISOString(),
      ...snapshot,
    };
    list.push(newSnapshot);
    this.snapshots.set(targetOrgId, list);
    return newSnapshot;
  }
}

export const dbStore = new DataStore();
