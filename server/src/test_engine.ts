import { DEFAULT_SCENARIOS } from './engine/defaultScenarios';
import { runMonteCarloSimulation } from './engine/monteCarlo';
import { optimizeSecurityBudget } from './engine/rosiOptimizer';
import { generateChangeAttributions } from './engine/attribution';
import { complianceService } from './services/complianceService';
import { ingestionService } from './services/dataIngestion';
import { tenantStore } from './models/tenantStore';

console.log('====================================================');
console.log('🧪 RUNNING AEGISRISK AI INDUSTRIAL VERIFICATION SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

// 1. Test OpenFAIR & 10,000-Run Monte Carlo Engine
console.log('--- 1. Testing OpenFAIR & Monte Carlo Simulation ---');
const startTime = Date.now();
const mcResult = runMonteCarloSimulation(DEFAULT_SCENARIOS, 10000);
const durationMs = Date.now() - startTime;

console.log(`Monte Carlo 10,000 trials completed in ${durationMs}ms`);
console.log(`Expected Annual Loss (EAL): $${(mcResult.expectedAnnualLoss).toLocaleString()}`);
console.log(`95% Value at Risk (VaR):    $${(mcResult.var95).toLocaleString()}`);
console.log(`99% Catastrophic VaR:       $${(mcResult.var99).toLocaleString()}`);

assert(mcResult.expectedAnnualLoss > 500000 && mcResult.expectedAnnualLoss < 15000000, 'EAL calibrated within bounds for $120M enterprise');
assert(mcResult.var95 > mcResult.expectedAnnualLoss, '95% VaR exceeds Mean EAL (fat-tail distribution)');
assert(mcResult.var99 >= mcResult.var95, '99% VaR >= 95% VaR');
assert(mcResult.lossExceedanceCurve.length >= 10, 'Loss Exceedance Curve quantiles generated');

// 2. Test ROSI Budget Optimization Solver
console.log('\n--- 2. Testing ROSI Budget Optimization Solver ---');
const budget = 500000;
const rosiPlan = optimizeSecurityBudget(budget, mcResult.expectedAnnualLoss);

console.log(`Allocated: $${rosiPlan.allocatedBudget.toLocaleString()} of $${budget.toLocaleString()}`);
console.log(`Total EAL Reduction: $${rosiPlan.totalEalReduction.toLocaleString()} | Portfolio ROSI: +${rosiPlan.portfolioRosi}%`);

assert(rosiPlan.allocatedBudget <= budget, 'Allocated budget does not exceed constraint');
assert(rosiPlan.totalEalReduction > 0, 'Security controls produce positive loss reduction');
assert(rosiPlan.portfolioRosi > 0, 'Portfolio ROSI positive');

// 3. Test In-App Asset Register & Business Criticality
console.log('\n--- 3. Testing In-App Asset Register & Criticality ---');
const assets = tenantStore.getAssets('org-acme-fintech');
assert(assets.length >= 4, 'Tenant has registered assets');
const missionCriticalAsset = assets.find(a => a.criticality === 'MISSION_CRITICAL');
assert(missionCriticalAsset !== undefined, 'Mission critical asset exists with declared valuation');
assert(missionCriticalAsset!.declaredValuationUsd > 10000000, 'Mission critical asset valuation verified');

// 4. Test Third-Party Vendor Correlated Concentration Risk
console.log('\n--- 4. Testing Third-Party Concentration Risk ---');
const vendors = tenantStore.getVendors('org-acme-fintech');
const correlatedVendors = vendors.filter(v => v.correlatedRiskMultiplier > 1.0);
console.log(`Vendors with correlated shared dependency: ${correlatedVendors.length}`);
assert(correlatedVendors.length >= 2, 'Correlated dependency detected across shared cloud infrastructure');

// 5. Test Closed-Loop Deployed Control Tracker (Predicted vs Observed EAL)
console.log('\n--- 5. Testing Closed-Loop ROSI Feedback Loop ---');
const deployed = tenantStore.deployControl('org-acme-fintech', 'Phishing-Resistant FIDO2 Rollout', 150000, 800000);
console.log(`Predicted Drop: $${deployed.predictedEalReductionUsd.toLocaleString()} | Observed: $${deployed.observedEalReductionUsd.toLocaleString()}`);
console.log(`Variance: $${deployed.predictionVarianceUsd.toLocaleString()} | Accuracy: ${deployed.accuracyPercentage}%`);
assert(deployed.observedEalReductionUsd > 0, 'Observed EAL reduction recorded from telemetry');
assert(deployed.accuracyPercentage >= 80, 'Model accuracy tracked for continuous closed-loop learning');

// 6. Test File Upload Parser (Category A Manual Fallback)
console.log('\n--- 6. Testing File Ingestion & Parser ---');
const sampleCsv = `asset,cve,severity,title,estimated_loss
Payment-API-Gateway,CVE-2025-8841,CRITICAL,SQL Injection in Token Endpoint,250000
Customer-Portal,CVE-2025-4412,HIGH,Session Hijacking via Cookie Drift,110000`;

const parsed = ingestionService.parseVulnerabilityFile('org-acme-fintech', sampleCsv, 'CSV');
assert(parsed.length === 2, 'CSV vulnerability scanner export successfully parsed');
assert(parsed[0].cveId === 'CVE-2025-8841', 'CVE extracted from CSV upload');
assert(parsed[0].sourceOrigin === 'MANUAL_UPLOAD', 'Provenance correctly tagged as MANUAL_UPLOAD');

// 7. Test SEC 4-Day Materiality & DORA Compliance
console.log('\n--- 7. Testing Regulatory Assurance & Audit Trail ---');
const secTest = complianceService.evaluateSecMateriality(120000000, 3200000, 150000, 48, {
  reputationalDamageHigh: true,
  ipTheftInvolved: false,
  nationalSecurityImplications: false
});
assert(secTest.isLikelyMaterial === true, 'Loss exceeding threshold triggers SEC Form 8-K recommendation');
assert(secTest.secDisclosureRecommendation.deadlineHours === 96, 'SEC 4-business-day (96-hour) deadline enforced');

console.log(`\n====================================================`);
console.log(`🎉 TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
console.log(`====================================================\n`);
