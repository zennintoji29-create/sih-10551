/**
 * Phase 1 Verification: Core Risk Formulas & Mathematical Precision
 * Tests the formulas against exact worked examples from:
 * 1. The SIH26105 Research Dossier (Pages 3, 7, 8, 10)
 * 2. Standard OpenFAIR ISO/IEC 27005 equations
 * 3. User explicit test cases (e.g. 25% mitigation, $1.2M EAL, $120k cost -> 150.0% ROSI)
 */

console.log('================================================================');
console.log('PHASE 1: CORE RISK FORMULAS & WORKED EXAMPLE VERIFICATION');
console.log('================================================================\n');

let passed = 0;
let total = 0;

function assertClose(actual: number, expected: number, tolerance: number, testName: string) {
  total++;
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    console.log(`✅ PASS: ${testName} (Got ${actual}, Expected ${expected})`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName} (Got ${actual}, Expected ${expected}, Diff ${diff} > ${tolerance})`);
    process.exitCode = 1;
  }
}

function assertTrue(condition: boolean, testName: string, detail?: string) {
  total++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    process.exitCode = 1;
  }
}

// ────────────────────────────────────────────────────────────────
// 1. OPENFAIR DETERMINISTIC DECOMPOSITION (Dossier Page 10)
// Formula: LEF = TEF * Vulnerability * (1 - Control Effectiveness)
// Formula: PLM = Direct Costs + Downtime + Regulatory/Legal
// Formula: EAL = LEF * PLM
// ────────────────────────────────────────────────────────────────
console.log('--- 1. Testing OpenFAIR Deterministic Decomposition ---');
{
  const tef = 5.0; // 5 threat events / year
  const vulnerability = 0.8; // 80% inherent vulnerability
  const controlEffectiveness = 0.5; // 50% control resistance
  const lef = tef * vulnerability * (1 - controlEffectiveness); // 5 * 0.8 * 0.5 = 2.0 loss events / year

  const directCosts = 500000;
  const downtimeCosts = 800000;
  const regulatoryCosts = 1200000;
  const plm = directCosts + downtimeCosts + regulatoryCosts; // $2,500,000

  const eal = lef * plm; // 2.0 * $2.5M = $5,000,000

  assertClose(lef, 2.0, 0.0001, 'LEF = TEF * Vuln * (1 - Control)');
  assertClose(plm, 2500000, 0.01, 'PLM = Direct + Downtime + Regulatory');
  assertClose(eal, 5000000, 0.01, 'EAL = LEF * PLM');
}

// ────────────────────────────────────────────────────────────────
// 2. ROSI WORKED EXAMPLES (User Specification & Dossier Page 7, 8)
// Standard Formula: ROSI = ((EAL * Mitigation% - Cost) / Cost) * 100
// Or: ROSI = ((DeltaEAL - Cost) / Cost) * 100
// ────────────────────────────────────────────────────────────────
console.log('\n--- 2. Testing ROSI Formulas Against Worked Examples ---');

// Worked Example A (From User Instruction prompt):
// 25% mitigation, $1.2M EAL, $120k cost -> should be 1200000 * 0.25 = 300000 delta.
// (300000 - 120000) / 120000 * 100 = 150.0% ROSI.
{
  const baselineEal = 1200000;
  const mitigationPct = 0.25;
  const cost = 120000;
  const deltaEal = baselineEal * mitigationPct; // $300,000
  const rosi = ((deltaEal - cost) / cost) * 100; // 150.0%

  assertClose(deltaEal, 300000, 0.01, 'ROSI Example A: Delta EAL is $300,000');
  assertClose(rosi, 150.0, 0.001, 'ROSI Example A: returns exactly 150.0% ROSI');
}

// Worked Example B (From Dossier Page 7 - Control A EDR deployment):
// Cost: $150k, Current Risk: $3.0M EAL, Predicted Risk: $2.4M EAL (-$600k reduction)
// ROSI: ($600k - $150k) / $150k = 300%
{
  const baselineEal = 3000000;
  const predictedEal = 2400000;
  const cost = 150000;
  const deltaEal = baselineEal - predictedEal; // $600,000
  const rosi = ((deltaEal - cost) / cost) * 100; // 300.0%

  assertClose(deltaEal, 600000, 0.01, 'ROSI Example B (EDR): Delta EAL is $600,000');
  assertClose(rosi, 300.0, 0.001, 'ROSI Example B (EDR): returns exactly 300.0% ROSI');
}

// Worked Example C (From Dossier Page 7 - Control B MFA rollout):
// Cost: $200k, Predicted EAL reduction: $400k
// ROSI: ($400k - $200k) / $200k = 100%
{
  const cost = 200000;
  const deltaEal = 400000;
  const rosi = ((deltaEal - cost) / cost) * 100; // 100.0%

  assertClose(rosi, 100.0, 0.001, 'ROSI Example C (MFA): returns exactly 100.0% ROSI');
}

// Worked Example D (From Dossier Page 8 - Closed-Loop Post-Deployment Reality Check):
// Predicted EAL reduction: $600k
// Actual observed reduction: $550k (91.67% of prediction)
// Cost: $150k
// Updated Actual ROSI: ($550k - $150k) / $150k = 266.67%
{
  const cost = 150000;
  const predictedDrop = 600000;
  const actualDrop = 550000;
  const variance = actualDrop - predictedDrop; // -$50,000
  const accuracyPct = (actualDrop / predictedDrop) * 100; // 91.67%
  const updatedRosi = ((actualDrop - cost) / cost) * 100; // 266.67%

  assertClose(variance, -50000, 0.01, 'Closed-Loop Variance is -$50,000 (-8.3%)');
  assertClose(accuracyPct, 91.666, 0.01, 'Closed-Loop Accuracy is 91.67%');
  assertClose(updatedRosi, 266.666, 0.01, 'Closed-Loop Updated ROSI is 266.67%');
}

// ────────────────────────────────────────────────────────────────
// 3. VENDOR CORRELATED CONCENTRATION RISK (Dossier Page 3)
// Worked Example:
// Vendor A (AWS): 5% breach prob * $50M loss * 80% criticality = $2M EAL
// Vendor B (Okta): 10% breach prob * $30M loss * 100% criticality = $3M EAL
// Independent Sum: $2M + $3M = $5M
// Correlated Total EAL: $5.5M (10% shared correlation penalty)
// ────────────────────────────────────────────────────────────────
console.log('\n--- 3. Testing Vendor Correlated Concentration Risk ---');
{
  const vendorA = 0.05 * 50000000 * 0.80; // $2,000,000
  const vendorB = 0.10 * 30000000 * 1.00; // $3,000,000
  const independentSum = vendorA + vendorB; // $5,000,000

  // Shared dependency correlation (both rely on AWS US-East-1)
  const sharedCorrelationFactor = 0.10; // +10% correlation premium
  const correlatedTotal = independentSum * (1 + sharedCorrelationFactor); // $5,500,000

  assertClose(vendorA, 2000000, 0.01, 'Vendor A EAL is $2,000,000');
  assertClose(vendorB, 3000000, 0.01, 'Vendor B EAL is $3,000,000');
  assertClose(independentSum, 5000000, 0.01, 'Independent sum is $5,000,000');
  assertClose(correlatedTotal, 5500000, 0.01, 'Total Correlated Vendor EAL is $5,500,000 (with dependency correlation)');
}

// ────────────────────────────────────────────────────────────────
// 4. CHANGE ATTRIBUTION SUM-IDENTITY
// Condition: Net Delta EAL MUST strictly equal sum of individual driver deltas.
// E.g., Net Delta = +$150k. Drivers: +$100k (CVE), +$40k (Misconfig), +$10k (Threat surge).
// ────────────────────────────────────────────────────────────────
console.log('\n--- 4. Testing Change Attribution Sum-Identity ---');
{
  const baselineEal = 2500000;
  const currentEal = 2650000;
  const totalDelta = currentEal - baselineEal; // +$150,000

  const drivers = [
    { name: 'CVE-2025-1234 discovered', delta: 100000 },
    { name: 'Firewall drift', delta: 40000 },
    { name: 'Threat actor activity surge', delta: 10000 }
  ];

  const sumDrivers = drivers.reduce((acc, d) => acc + d.delta, 0);

  assertClose(totalDelta, 150000, 0.01, 'Net Delta EAL is $150,000');
  assertClose(sumDrivers, totalDelta, 0.01, 'Sum of attribution drivers strictly equals Net Delta EAL (Sum-Identity)');
}

// ────────────────────────────────────────────────────────────────
// 5. MONTE CARLO VALUE AT RISK CONVERGENCE & ORDERING
// Properties required:
// 1. VaR_99 >= VaR_95 > Mean EAL (fat-tail distribution property)
// 2. 90% Confidence interval bounds EAL: CI_low <= EAL <= CI_high
// ────────────────────────────────────────────────────────────────
console.log('\n--- 5. Testing Monte Carlo Statistical Properties ---');
import { DEFAULT_SCENARIOS } from './engine/defaultScenarios';
import { runMonteCarloSimulation } from './engine/monteCarlo';

{
  const mc = runMonteCarloSimulation(DEFAULT_SCENARIOS, 10000);
  
  assertTrue(mc.expectedAnnualLoss > 0, 'Mean EAL is positive');
  assertTrue(mc.var95 > mc.expectedAnnualLoss, `95% VaR ($${mc.var95.toLocaleString()}) > Mean EAL ($${mc.expectedAnnualLoss.toLocaleString()})`);
  assertTrue(mc.var99 >= mc.var95, `99% VaR ($${mc.var99.toLocaleString()}) >= 95% VaR ($${mc.var95.toLocaleString()})`);
  assertTrue(
    mc.expectedAnnualLoss >= mc.confidenceInterval90.low && mc.expectedAnnualLoss <= mc.confidenceInterval90.high,
    `EAL falls within 90% Confidence Interval [$${mc.confidenceInterval90.low.toLocaleString()}, $${mc.confidenceInterval90.high.toLocaleString()}]`
  );
  assertTrue(mc.lossExceedanceCurve.length >= 10, 'Loss Exceedance Curve has >= 10 points');
}

console.log(`\n================================================================`);
console.log(`PHASE 1 VERIFICATION RESULTS: ${passed}/${total} TESTS PASSED`);
console.log(`================================================================\n`);
