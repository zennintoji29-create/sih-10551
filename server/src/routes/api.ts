import { Router, Request, Response } from 'express';
import { ThreatScenario } from '../engine/fairModel';
import { runMonteCarloSimulation, MonteCarloResult } from '../engine/monteCarlo';
import { generateChangeAttributions } from '../engine/attribution';
import { optimizeSecurityBudget, DEFAULT_CONTROLS_CATALOG } from '../engine/rosiOptimizer';
import { DEFAULT_SCENARIOS } from '../engine/defaultScenarios';
import { ingestionService } from '../services/dataIngestion';
import { complianceService } from '../services/complianceService';
import { tenantStore, IngestionMode } from '../models/tenantStore';
import { enforceRbac } from '../middleware/rbac';

const router = Router();

// In-memory simulation cache for high responsiveness
let cachedBaseline: MonteCarloResult | null = null;
function getBaselineSimulation(): MonteCarloResult {
  if (!cachedBaseline) {
    cachedBaseline = runMonteCarloSimulation(DEFAULT_SCENARIOS, 10000);
  }
  return cachedBaseline;
}

// 1. Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'HEALTHY', engine: 'OpenFAIR + Monte Carlo v2.4', timestamp: new Date().toISOString() });
});

// 2. Organization Details & Settings
router.get('/organization', (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const org = tenantStore.getOrganization(orgId);
  if (!org) return res.status(404).json({ error: 'Organization not found' });
  res.json({ organization: org });
});

router.put('/organization', enforceRbac(['ADMIN']), (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const updated = tenantStore.updateOrganization(orgId, req.body);
  res.json({ success: true, organization: updated });
});

// 3. User & RBAC Management
router.get('/users', (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const users = tenantStore.getUsers(orgId);
  res.json({ users });
});

router.post('/users/invite', enforceRbac(['ADMIN']), (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const { email, name, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'Email and role are required' });
  const user = tenantStore.addUser(orgId, {
    orgId,
    email,
    name: name || email.split('@')[0],
    role,
    mfaEnabled: false
  });
  res.status(201).json({ success: true, user });
});

// 4. In-App Asset Register
router.get('/assets', (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const assets = tenantStore.getAssets(orgId);
  const totalValuation = assets.reduce((acc, a) => acc + a.declaredValuationUsd, 0);
  const totalAssetEal = assets.reduce((acc, a) => acc + a.calculatedEalUsd, 0);
  res.json({ assets, totalValuationUsd: totalValuation, totalAssetEalUsd: totalAssetEal });
});

router.post('/assets', enforceRbac(['ADMIN', 'CISO', 'SECURITY_ANALYST']), (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const { name, serviceType, ownerEmail, criticality, declaredValuationUsd, cloudProvider, controlScore } = req.body;
  if (!name || !declaredValuationUsd) return res.status(400).json({ error: 'Name and valuation required' });

  const asset = tenantStore.addAsset(orgId, {
    orgId,
    name,
    serviceType: serviceType || 'Infrastructure Service',
    ownerEmail: ownerEmail || 'sec-ops@acmefintech.io',
    criticality: criticality || 'BUSINESS_OPERATIONAL',
    declaredValuationUsd: Number(declaredValuationUsd),
    cloudProvider: cloudProvider || 'AWS Cloud',
    controlScore: Number(controlScore) || 80
  });

  res.status(201).json({ success: true, asset });
});

// 5. Third-Party Vendor Register & Concentration Risk (Category E)
router.get('/vendors', (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const vendors = tenantStore.getVendors(orgId);
  
  // Calculate correlated concentration risk:
  // Vendors sharing the same infrastructure (e.g. AWS us-east-1) have correlated failure risk
  const infraGroups: Record<string, number> = {};
  vendors.forEach(v => {
    infraGroups[v.sharedInfrastructure] = (infraGroups[v.sharedInfrastructure] || 0) + 1;
  });

  const concentrationAlerts = Object.entries(infraGroups)
    .filter(([_, count]) => count > 1)
    .map(([infra, count]) => ({
      infrastructure: infra,
      correlatedVendorCount: count,
      riskMultiplier: Number((1.2 + count * 0.1).toFixed(2)),
      description: `${count} key vendors depend on shared dependency ${infra}. A single outage creates correlated portfolio exposure.`
    }));

  const standaloneSum = vendors.reduce((acc, v) => acc + v.standaloneRiskUsd, 0);
  // Correlated sum accounts for the dependency concentration
  const correlatedTotal = Math.round(
    vendors.reduce((acc, v) => acc + v.standaloneRiskUsd * v.correlatedRiskMultiplier, 0)
  );

  res.json({
    vendors,
    standaloneRiskTotalUsd: standaloneSum,
    correlatedConcentrationRiskTotalUsd: correlatedTotal,
    correlationVarianceUsd: correlatedTotal - standaloneSum,
    concentrationAlerts
  });
});

router.post('/vendors', enforceRbac(['ADMIN', 'CISO', 'SECURITY_ANALYST']), (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const { name, serviceRole, criticality, annualSpendUsd, sharedInfrastructure, singlePointOfFailure } = req.body;
  if (!name || !annualSpendUsd) return res.status(400).json({ error: 'Name and spend required' });

  const vendor = tenantStore.addVendor(orgId, {
    orgId,
    name,
    serviceRole: serviceRole || 'SaaS Service Provider',
    criticality: criticality || 'BUSINESS_OPERATIONAL',
    annualSpendUsd: Number(annualSpendUsd),
    sharedInfrastructure: sharedInfrastructure || 'AWS_US_EAST_1',
    singlePointOfFailure: Boolean(singlePointOfFailure)
  });

  res.status(201).json({ success: true, vendor });
});

// 6. Connectors (Categories A - E)
router.get('/connectors', (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const connectors = tenantStore.getConnectors(orgId);
  res.json({ connectors });
});

router.put('/connectors/:id', enforceRbac(['ADMIN']), (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const { id } = req.params;
  const updated = tenantStore.updateConnector(orgId, id, req.body);
  if (!updated) return res.status(404).json({ error: 'Connector not found' });
  res.json({ success: true, connector: updated });
});

// 7. File Upload Parser for Category A, B, C Manual Fallback
router.post('/connectors/upload', enforceRbac(['ADMIN', 'SECURITY_ANALYST']), (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const { category, content, format } = req.body;
  if (!content) return res.status(400).json({ error: 'File content is required' });

  let ingestedRecords: any[] = [];
  if (category === 'VULNERABILITY') {
    ingestedRecords = ingestionService.parseVulnerabilityFile(orgId, content, format === 'JSON' ? 'JSON' : 'CSV');
  } else {
    // Default manual record ingestion
    const rec = ingestionService.ingest(orgId, {
      orgId,
      category: category || 'VULNERABILITY',
      sourceOrigin: 'MANUAL_UPLOAD',
      sourceProvider: 'Manual Analyst File Upload',
      title: 'Imported Security File Findings',
      severity: 'HIGH',
      rawPayload: { raw: content.substring(0, 500) },
      confidenceScore: 75,
      financialImpactEstimated: 125000
    });
    ingestedRecords.push(rec);
  }

  // Update connector state
  const connectors = tenantStore.getConnectors(orgId);
  const conn = connectors.find(c => c.category === category);
  if (conn) {
    conn.mode = 'MANUAL_UPLOAD';
    conn.status = 'CONNECTED';
    conn.lastSyncTime = new Date().toISOString();
    conn.recordsPulledCount += ingestedRecords.length;
    conn.confidenceRating = 76;
  }

  res.json({ success: true, recordsIngested: ingestedRecords.length, records: ingestedRecords });
});

// 8. Current Portfolio Risk Quantified ($ EAL, VaR, LEC)
router.get('/risk/current', (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const org = tenantStore.getOrganization(orgId) || {
    name: 'Acme Financial Technologies SaaS',
    domain: 'acmefintech.io',
    annualRevenueUsd: 120000000,
    boardRiskAppetiteUsd: 5000000,
    industrySector: 'Financial Services / B2B SaaS'
  };

  const result = getBaselineSimulation();
  const connectors = tenantStore.getConnectors(orgId);
  const assets = tenantStore.getAssets(orgId);

  res.json({
    organization: org,
    metrics: {
      expectedAnnualLoss: result.expectedAnnualLoss,
      medianAnnualLoss: result.medianAnnualLoss,
      var90: result.var90,
      var95: result.var95,
      var99: result.var99,
      cvar95: result.cvar95,
      confidenceInterval90: result.confidenceInterval90,
      controlPostureScore: 78.4,
      materialityExposureStatus: result.var95 > org.boardRiskAppetiteUsd ? 'APPROACHING_CEILING' : 'WITHIN_APPETITE'
    },
    lossExceedanceCurve: result.lossExceedanceCurve,
    lossDistributionHistogram: result.lossDistributionHistogram,
    scenarioBreakdown: result.scenarioBreakdown,
    activeConnectorsCount: connectors.filter(c => c.status === 'CONNECTED').length,
    registeredAssetsCount: assets.length
  });
});

// 9. Historical Risk Time-Series (for CISO Trend & Auditor Point-in-Time Reconstruction)
router.get('/risk/history', (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const history = tenantStore.getHistory(orgId);
  res.json({ history });
});

// 10. Dynamic "What-If" Simulation Sandbox
router.post('/risk/what-if', (req: Request, res: Response) => {
  const {
    mfaAdoptionPercent,
    edrCoveragePercent,
    zeroTrustMaturity,
    aiThreatSurge
  } = req.body;

  const modifiedScenarios = DEFAULT_SCENARIOS.map(sc => {
    const clone = JSON.parse(JSON.stringify(sc)) as ThreatScenario;
    if (mfaAdoptionPercent !== undefined) {
      const mfaDelta = (mfaAdoptionPercent - 70) * 0.35;
      clone.controlStrength = Math.min(95, Math.max(10, clone.controlStrength + mfaDelta));
    }
    if (edrCoveragePercent !== undefined) {
      const edrDelta = (edrCoveragePercent - 75) * 0.30;
      clone.controlStrength = Math.min(95, Math.max(10, clone.controlStrength + edrDelta));
    }
    if (zeroTrustMaturity !== undefined) {
      const ztDelta = (zeroTrustMaturity - 3) * 4;
      clone.controlStrength = Math.min(95, Math.max(10, clone.controlStrength + ztDelta));
    }
    if (aiThreatSurge === true) {
      clone.aiThreatMultiplier *= 1.45;
    }
    return clone;
  });

  const simulatedResult = runMonteCarloSimulation(modifiedScenarios, 5000);
  const baseline = getBaselineSimulation();
  const deltaEal = simulatedResult.expectedAnnualLoss - baseline.expectedAnnualLoss;

  res.json({
    simulated: simulatedResult,
    baselineEal: baseline.expectedAnnualLoss,
    simulatedEal: simulatedResult.expectedAnnualLoss,
    deltaEal,
    deltaPercentage: baseline.expectedAnnualLoss > 0
      ? Number(((deltaEal / baseline.expectedAnnualLoss) * 100).toFixed(1))
      : 0,
    deltaVar95: simulatedResult.var95 - baseline.var95
  });
});

// 11. Change Attribution ("Why Risk Moved")
router.get('/risk/attribution', (_req: Request, res: Response) => {
  const baseline = getBaselineSimulation();
  const attribution = generateChangeAttributions(baseline.expectedAnnualLoss, baseline.expectedAnnualLoss + 180000, []);
  res.json(attribution);
});

// 12. ROSI Budget Optimization Solver
router.post('/rosi/optimize', (req: Request, res: Response) => {
  const budget = Number(req.body.budget) || 500000;
  const baseline = getBaselineSimulation();
  const plan = optimizeSecurityBudget(budget, baseline.expectedAnnualLoss, DEFAULT_CONTROLS_CATALOG);
  res.json(plan);
});

// 13. Closed-Loop Deployed Control Tracker (Predicted vs Observed EAL)
router.get('/controls/deployed', (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const deployed = tenantStore.getDeployedControls(orgId);
  res.json({ deployedControls: deployed });
});

router.post('/controls/deploy', enforceRbac(['ADMIN', 'CISO']), (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const { controlName, costUsd, predictedEalReductionUsd } = req.body;
  if (!controlName || !costUsd || !predictedEalReductionUsd) {
    return res.status(400).json({ error: 'controlName, costUsd, and predictedEalReductionUsd are required' });
  }

  const tracker = tenantStore.deployControl(orgId, controlName, Number(costUsd), Number(predictedEalReductionUsd));
  
  // Record in audit log
  complianceService.recordAuditEntry(
    'CISO',
    'CONTROL_DEPLOYED',
    `Deployed control '${controlName}' ($${costUsd.toLocaleString()}). Predicted EAL reduction: $${predictedEalReductionUsd.toLocaleString()}.`,
    5550000,
    5550000 - tracker.observedEalReductionUsd
  );

  res.status(201).json({ success: true, deployedControl: tracker });
});

// 14. Telemetry Stream & Manual Finding Ingestion
router.get('/telemetry', (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const records = ingestionService.getTelemetry(orgId);
  res.json({ records, count: records.length });
});

router.post('/telemetry/ingest', enforceRbac(['ADMIN', 'SECURITY_ANALYST']), (req: Request, res: Response) => {
  const orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';
  const { category, sourceProvider, assetName, cveId, severity, title, rawPayload, confidenceScore, financialImpactEstimated } = req.body;
  
  const created = ingestionService.ingest(orgId, {
    orgId,
    category: category || 'VULNERABILITY',
    sourceOrigin: req.body.sourceOrigin || 'MANUAL_UPLOAD',
    sourceProvider: sourceProvider || 'Analyst Manual Finding',
    assetName: assetName || 'Kubernetes Cluster Gateway',
    cveId,
    severity: severity || 'HIGH',
    title: title || 'Custom Vulnerability Report',
    rawPayload: rawPayload || {},
    confidenceScore: confidenceScore || 80,
    financialImpactEstimated: financialImpactEstimated || 140000
  });

  complianceService.recordAuditEntry(
    'SECURITY_ANALYST',
    'TELEMETRY_INGESTION',
    `Ingested finding: ${title} (${cveId || 'No CVE'})`,
    5550000,
    5550000 + (financialImpactEstimated || 140000) * 0.15
  );

  res.status(201).json({ success: true, record: created });
});

// 15. Compliance Services (SEC Rule 106 & DORA)
router.post('/compliance/sec-materiality', (req: Request, res: Response) => {
  const {
    annualRevenueUsd = 120000000,
    estimatedFinancialLossUsd = 2800000,
    customerRecordsExposed = 145000,
    criticalOperationsInterruptedHours = 36,
    qualitativeFactors = {
      reputationalDamageHigh: true,
      ipTheftInvolved: false,
      nationalSecurityImplications: false
    }
  } = req.body;

  const assessment = complianceService.evaluateSecMateriality(
    annualRevenueUsd,
    estimatedFinancialLossUsd,
    customerRecordsExposed,
    criticalOperationsInterruptedHours,
    qualitativeFactors
  );

  res.json(assessment);
});

router.get('/compliance/dora-stress-test', (_req: Request, res: Response) => {
  const result = complianceService.evaluateDoraResilience();
  res.json(result);
});

router.get('/compliance/audit-trail', (_req: Request, res: Response) => {
  const trail = complianceService.getAuditTrail();
  res.json({ auditLogs: trail });
});

// 16. Guided Tour Scenarios
router.get('/demo/scenarios', (_req: Request, res: Response) => {
  res.json({
    scenarios: [
      {
        id: 'demo-ransomware',
        title: 'FinTech Ransomware Attack & Swift Containment',
        subtitle: 'Watch how EAL spikes by +$450k upon CVE exploitation, then drops by -$620k with automated SOAR isolation.',
        initialEal: 2450000,
        peakEal: 2900000,
        remediatedEal: 1830000,
        recommendedControl: 'Managed EDR + Automated SOAR Playbook',
        rosi: 247,
        cve: 'CVE-2025-2410',
        sector: 'Banking & Financial SaaS'
      },
      {
        id: 'demo-sec-breach',
        title: 'Healthcare PII Breach & SEC 4-Day Disclosure Filing',
        subtitle: 'Evaluate 145,000 patient records exfiltration against SEC Rule 106 4-day materiality threshold.',
        initialEal: 3100000,
        peakEal: 4850000,
        remediatedEal: 2600000,
        recommendedControl: 'FIDO2 MFA + Data Enclave Tokenization',
        rosi: 185,
        cve: 'CVE-2025-1109',
        sector: 'Healthcare Cloud EHR'
      },
      {
        id: 'demo-supply-chain',
        title: 'Cloud Third-Party Concentration Outage (DORA Stress Test)',
        subtitle: 'Single Point of Failure (SPOF) stress-testing on shared cloud identity & payment providers.',
        initialEal: 2200000,
        peakEal: 3650000,
        remediatedEal: 1950000,
        recommendedControl: 'Multi-Region Ingress Redundancy & Vendor Continuous Auditing',
        rosi: 140,
        cve: 'N/A (Architecture SPOF)',
        sector: 'Critical Infrastructure & SaaS'
      }
    ]
  });
});

// 17. AI Copilot Chat Assistant (Local Ollama, Groq, Built-in Engine with Role Guardrails)
import { aiAssistantService } from '../services/aiAssistantService';

router.get('/chat/providers', async (_req: Request, res: Response) => {
  try {
    const status = await aiAssistantService.checkProviderStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to check AI providers', message: err.message });
  }
});

router.post('/chat/assistant', async (req: Request, res: Response) => {
  try {
    const { message, role, provider, ollamaModel, groqApiKey, groqModel, history, context } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const effectiveRole = role || (req.headers['x-user-role'] as any) || 'CISO';
    const result = await aiAssistantService.handleChat({
      message,
      role: effectiveRole,
      provider: provider || 'builtin',
      ollamaModel,
      groqApiKey,
      groqModel,
      history,
      context
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'AI Assistant processing failed', message: err.message });
  }
});

export default router;

