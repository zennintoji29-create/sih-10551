import crypto from 'crypto';

export interface SecMaterialityAssessment {
  incidentId: string;
  incidentTitle: string;
  annualRevenueUsd: number;
  estimatedFinancialLossUsd: number;
  lossAsPercentageOfRevenue: number;
  customerRecordsExposed: number;
  criticalOperationsInterruptedHours: number;
  qualitativeFactors: {
    reputationalDamageHigh: boolean;
    ipTheftInvolved: boolean;
    nationalSecurityImplications: boolean;
  };
  materialityScore: number; // 0 to 100
  isLikelyMaterial: boolean;
  secDisclosureRecommendation: {
    filingRequired: boolean;
    deadlineHours: number; // e.g. 96 hours (4 business days)
    formType: 'FORM_8K_ITEM_105' | 'NON_MATERIAL_INTERNAL_TRACKING';
    rationale: string;
  };
  disclaimer: string;
}

export interface DoraStressTestResult {
  cloudConcentrationRiskScore: number; // 0 - 100
  singlePointOfFailureVendors: Array<{
    vendorName: string;
    serviceRole: string;
    dependencyType: 'CLOUD_INFRASTRUCTURE' | 'IDENTITY_PROVIDER' | 'PAYMENT_CORE' | 'DNS_ROUTING';
    lossIfCompromisedUsd: number;
    substitutabilityRating: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  resilienceRating: 'RESILIENT' | 'MODERATE_EXPOSURE' | 'CRITICAL_VULNERABILITY';
  doraArticleComplianceSupport: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: 'SYSTEM_CRON' | 'CISO' | 'SECURITY_ANALYST' | 'ADMIN' | 'COMPLIANCE_AUDITOR';
  eventType: 'MODEL_RERUN' | 'TELEMETRY_INGESTION' | 'CONTROL_DEPLOYED' | 'MATERIALITY_ASSESSMENT' | 'REPORT_EXPORT';
  description: string;
  previousEalUsd: number;
  newEalUsd: number;
  sha256Hash: string;
}

class ComplianceAuditManager {
  private auditLogs: AuditLogEntry[] = [];
  private previousHash: string = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor() {
    this.seedAuditTrail();
  }

  private seedAuditTrail() {
    this.recordAuditEntry(
      'SYSTEM_CRON',
      'TELEMETRY_INGESTION',
      'Ingested 348 CVE findings from Tenable.io; triggered automated OpenFAIR recalibration.',
      2630000,
      2450000
    );
    this.recordAuditEntry(
      'CISO',
      'CONTROL_DEPLOYED',
      'Approved simulated FIDO2 MFA deployment; EAL reduced by $180,000.',
      2630000,
      2450000
    );
  }

  public recordAuditEntry(
    actorRole: AuditLogEntry['actorRole'],
    eventType: AuditLogEntry['eventType'],
    description: string,
    previousEalUsd: number,
    newEalUsd: number
  ): AuditLogEntry {
    const timestamp = new Date().toISOString();
    const payloadToHash = `${this.previousHash}|${timestamp}|${actorRole}|${eventType}|${description}|${previousEalUsd}|${newEalUsd}`;
    const sha256Hash = crypto.createHash('sha256').update(payloadToHash).digest('hex');

    const entry: AuditLogEntry = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      actorRole,
      eventType,
      description,
      previousEalUsd,
      newEalUsd,
      sha256Hash
    };

    this.previousHash = sha256Hash;
    this.auditLogs.unshift(entry);
    return entry;
  }

  public getAuditTrail(): AuditLogEntry[] {
    return this.auditLogs;
  }

  /**
   * Evaluates SEC Rule 106 4-Day Cyber Incident Materiality threshold.
   * Standard benchmarks: >2% of revenue or substantial operational disruption triggers Form 8-K.
   */
  public evaluateSecMateriality(
    annualRevenueUsd: number,
    estimatedFinancialLossUsd: number,
    customerRecordsExposed: number,
    criticalOperationsInterruptedHours: number,
    qualitativeFactors: SecMaterialityAssessment['qualitativeFactors']
  ): SecMaterialityAssessment {
    const lossPct = annualRevenueUsd > 0 ? (estimatedFinancialLossUsd / annualRevenueUsd) * 100 : 0;
    
    // Quantitative score (50% weight)
    let quantScore = 0;
    if (lossPct >= 2.0) quantScore += 40;
    else quantScore += (lossPct / 2.0) * 40;

    if (estimatedFinancialLossUsd > 1000000) quantScore += 10;

    // Operational & Qualitative score (50% weight)
    let qualScore = 0;
    if (criticalOperationsInterruptedHours > 24) qualScore += 20;
    else qualScore += (criticalOperationsInterruptedHours / 24) * 20;

    if (customerRecordsExposed > 50000) qualScore += 10;
    if (qualitativeFactors.reputationalDamageHigh) qualScore += 10;
    if (qualitativeFactors.ipTheftInvolved) qualScore += 10;

    const materialityScore = Math.min(100, Math.round(quantScore + qualScore));
    const isLikelyMaterial = materialityScore >= 60 || lossPct >= 2.5;

    return {
      incidentId: `inc-${Date.now().toString(36)}`,
      incidentTitle: 'Production Payment & Auth Microservices Zero-Day Intrusion',
      annualRevenueUsd,
      estimatedFinancialLossUsd,
      lossAsPercentageOfRevenue: Number(lossPct.toFixed(2)),
      customerRecordsExposed,
      criticalOperationsInterruptedHours,
      qualitativeFactors,
      materialityScore,
      isLikelyMaterial,
      secDisclosureRecommendation: {
        filingRequired: isLikelyMaterial,
        deadlineHours: 96,
        formType: isLikelyMaterial ? 'FORM_8K_ITEM_105' : 'NON_MATERIAL_INTERNAL_TRACKING',
        rationale: isLikelyMaterial
          ? 'Financial loss and operational downtime exceed SEC materiality threshold; Form 8-K disclosure recommended within 4 business days.'
          : 'Estimated impact remains below quantitative materiality benchmark; retain internal documentation in audit repository.'
      },
      disclaimer: 'Notice: This tool assists with preparing cyber disclosure workflows. It does not constitute formal legal counsel.'
    };
  }

  /**
   * DORA (Digital Operational Resilience Act) ICT Third-Party Concentration Stress Test
   */
  public evaluateDoraResilience(): DoraStressTestResult {
    const singlePointsOfFailure: DoraStressTestResult['singlePointOfFailureVendors'] = [
      {
        vendorName: 'Amazon Web Services (us-east-1)',
        serviceRole: 'Primary Kubernetes Ingress & Core Compute',
        dependencyType: 'CLOUD_INFRASTRUCTURE',
        lossIfCompromisedUsd: 3400000,
        substitutabilityRating: 'LOW'
      },
      {
        vendorName: 'Okta / Cloud Identity Provider',
        serviceRole: 'SSO & Workforce Authentication Gateway',
        dependencyType: 'IDENTITY_PROVIDER',
        lossIfCompromisedUsd: 2100000,
        substitutabilityRating: 'MEDIUM'
      },
      {
        vendorName: 'Stripe Global Financial Gateway',
        serviceRole: 'Customer Payment Settlement API',
        dependencyType: 'PAYMENT_CORE',
        lossIfCompromisedUsd: 1850000,
        substitutabilityRating: 'MEDIUM'
      }
    ];

    return {
      cloudConcentrationRiskScore: 78,
      singlePointOfFailureVendors: singlePointsOfFailure,
      resilienceRating: 'MODERATE_EXPOSURE',
      doraArticleComplianceSupport: [
        'Article 28: General principles on ICT third-party risk management',
        'Article 29: Preliminary assessment of ICT concentration risk',
        'Article 30: Contractual arrangements and exit strategy readiness'
      ]
    };
  }
}

export const complianceService = new ComplianceAuditManager();
