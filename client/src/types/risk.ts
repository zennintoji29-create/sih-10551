export type UserRole = 'ADMIN' | 'CISO' | 'SECURITY_ANALYST' | 'COMPLIANCE_AUDITOR';
export type PlanTier = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type IngestionMode = 'LIVE_CONNECTOR' | 'MANUAL_UPLOAD' | 'SAMPLE_SIMULATION';
export type DataSourceCategory = 'VULNERABILITY' | 'SIEM' | 'ASSET' | 'THREAT_INTEL' | 'THIRD_PARTY';
export type AssetCriticality = 'MISSION_CRITICAL' | 'BUSINESS_OPERATIONAL' | 'INTERNAL_SUPPORT';

export interface CurrentRiskResponse {
  organization: {
    id: string;
    name: string;
    domain: string;
    annualRevenueUsd: number;
    boardRiskAppetiteUsd: number;
    industrySector: string;
    planTier?: PlanTier;
  };
  metrics: {
    expectedAnnualLoss: number;
    medianAnnualLoss: number;
    var90: number;
    var95: number;
    var99: number;
    cvar95: number;
    confidenceInterval90: {
      low: number;
      high: number;
    };
    controlPostureScore: number;
    materialityExposureStatus: 'WITHIN_APPETITE' | 'APPROACHING_CEILING' | 'BREACHED';
  };
  lossExceedanceCurve: Array<{
    lossThreshold: number;
    probabilityOfExceedance: number;
  }>;
  lossDistributionHistogram: Array<{
    rangeLabel: string;
    rangeStart: number;
    rangeEnd: number;
    frequency: number;
  }>;
  scenarioBreakdown: Array<{
    scenarioId: string;
    scenarioName: string;
    category: string;
    meanEal: number;
    percentageOfTotal: number;
    lef: number;
    meanLossPerEvent: number;
  }>;
  activeConnectorsCount: number;
  registeredAssetsCount: number;
}

export interface Asset {
  id: string;
  name: string;
  serviceType: string;
  ownerEmail: string;
  criticality: AssetCriticality;
  declaredValuationUsd: number;
  cloudProvider?: string;
  ipOrHostname?: string;
  controlScore: number;
  vulnerabilitiesCount: number;
  calculatedEalUsd: number;
}

export interface Vendor {
  id: string;
  name: string;
  serviceRole: string;
  criticality: AssetCriticality;
  annualSpendUsd: number;
  sharedInfrastructure: string;
  singlePointOfFailure: boolean;
  standaloneRiskUsd: number;
  correlatedRiskMultiplier: number;
}

export interface VendorConcentrationResponse {
  vendors: Vendor[];
  standaloneRiskTotalUsd: number;
  correlatedConcentrationRiskTotalUsd: number;
  correlationVarianceUsd: number;
  concentrationAlerts: Array<{
    infrastructure: string;
    correlatedVendorCount: number;
    riskMultiplier: number;
    description: string;
  }>;
}

export interface DataConnectorConfig {
  id: string;
  category: DataSourceCategory;
  name: string;
  provider: string;
  mode: IngestionMode;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSyncTime: string;
  recordsPulledCount: number;
  confidenceRating: number;
  credentialsConfigured: boolean;
  notes?: string;
}

export interface HistoricalRiskSnapshot {
  id: string;
  timestamp: string;
  ealUsd: number;
  var95Usd: number;
  controlPostureScore: number;
  triggerEvent: string;
  actorRole: string;
}

export interface DeployedControlTracker {
  id: string;
  controlName: string;
  deployedAt: string;
  costUsd: number;
  predictedEalReductionUsd: number;
  observedEalReductionUsd: number;
  predictionVarianceUsd: number;
  accuracyPercentage: number;
  status: 'OBSERVING' | 'VALIDATED' | 'UNDERPERFORMING';
}

export interface AttributionItem {
  id: string;
  source: string;
  title: string;
  description: string;
  deltaEal: number;
  deltaDirection: 'INCREASE' | 'DECREASE';
  cveId?: string;
  affectedAsset?: string;
  confidence: number;
  timestamp: string;
}

export interface AttributionSummary {
  period: string;
  totalDeltaEal: number;
  deltaPercentage: number;
  items: AttributionItem[];
}

export interface ControlAllocationResult {
  control: {
    id: string;
    name: string;
    category: string;
    implementationCost: number;
    annualMaintenanceCost: number;
    controlResistanceIncrease: number;
    lossReductionPercent: number;
    historicalConfidence: number;
    description: string;
  };
  selected: boolean;
  marginalCost: number;
  predictedEalReduction: number;
  rosiPercentage: number;
  confidenceInterval: {
    lowRosi: number;
    highRosi: number;
  };
}

export interface RosiOptimizationPlan {
  totalBudget: number;
  allocatedBudget: number;
  remainingBudget: number;
  baselineEal: number;
  projectedEal: number;
  totalEalReduction: number;
  portfolioRosi: number;
  allocations: ControlAllocationResult[];
}

export interface TelemetryRecord {
  id: string;
  category: DataSourceCategory;
  sourceOrigin: IngestionMode;
  sourceProvider: string;
  assetName?: string;
  cveId?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  rawPayload: Record<string, any>;
  confidenceScore: number;
  financialImpactEstimated?: number;
  timestamp: string;
  status: 'PROCESSED' | 'PENDING' | 'MITIGATED';
}

export interface SecMaterialityAssessment {
  incidentId: string;
  incidentTitle: string;
  annualRevenueUsd: number;
  estimatedFinancialLossUsd: number;
  lossAsPercentageOfRevenue: number;
  customerRecordsExposed: number;
  criticalOperationsInterruptedHours: number;
  materialityScore: number;
  isLikelyMaterial: boolean;
  secDisclosureRecommendation: {
    filingRequired: boolean;
    deadlineHours: number;
    formType: string;
    rationale: string;
  };
  disclaimer: string;
}

export interface DoraStressTestResult {
  cloudConcentrationRiskScore: number;
  singlePointOfFailureVendors: Array<{
    vendorName: string;
    serviceRole: string;
    dependencyType: string;
    lossIfCompromisedUsd: number;
    substitutabilityRating: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  resilienceRating: string;
  doraArticleComplianceSupport: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorRole: string;
  eventType: string;
  description: string;
  previousEalUsd: number;
  newEalUsd: number;
  sha256Hash: string;
}
