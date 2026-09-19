/**
 * OpenFAIR (Factor Analysis of Information Risk) Mathematical Model
 * Standardized financial decomposition of Cyber Risk:
 * Loss Event Frequency (LEF) = Threat Event Frequency (TEF) * Vulnerability (V)
 * Total Loss Magnitude (LM) = Primary Loss (PL) + Secondary Loss (SL)
 * Expected Annual Loss (EAL) = Integral / Monte Carlo of (LEF * LM)
 */

export interface PertDistribution {
  min: number;
  mode: number;
  max: number;
}

export interface ThreatScenario {
  id: string;
  name: string;
  category: 'RANSOMWARE' | 'DATA_EXFILTRATION' | 'SUPPLY_CHAIN' | 'CLOUD_MISCONFIG' | 'AI_SPEAR_PHISHING';
  tef: PertDistribution; // Threat Event Frequency (events / year)
  threatCapability: number; // 0 to 100 percentile
  controlStrength: number; // 0 to 100 percentile (effectiveness of deployed controls)
  primaryLoss: PertDistribution; // Direct financial cost (forensics, downtime, notification)
  secondaryLoss: PertDistribution; // Secondary costs (fines, lawsuits, churn)
  secondaryLossProbability: number; // 0 to 1 (probability secondary loss triggers)
  aiThreatMultiplier: number; // 1.0 (baseline) up to 2.5x (AI-accelerated automation)
  cveRefs?: string[];
  affectedAssetIds?: string[];
}

/**
 * Samples from a Beta-PERT distribution commonly utilized in FAIR quantitative modeling.
 * PERT provides smooth interpolation with realistic skew toward the mode.
 */
export function samplePert(pert: PertDistribution): number {
  const { min, mode, max } = pert;
  if (min === max) return min;

  // PERT distribution alpha and beta parameters with lambda = 4
  const lambda = 4;
  const mu = (min + lambda * mode + max) / (lambda + 2);
  
  // Standard deviation approximation
  const sigma = (max - min) / (lambda + 2);
  
  // Approximation of Beta distribution via random generator
  // Using two uniform random variables transformed via rejection sampling or gamma ratio
  const alpha = 1 + lambda * (mode - min) / (max - min);
  const beta = 1 + lambda * (max - mode) / (max - min);
  
  // Generate Beta sample using standard approximation
  const sample = sampleBeta(alpha, beta);
  return min + sample * (max - min);
}

/**
 * Standard Beta sample generator via Gamma random variates
 */
function sampleBeta(alpha: number, beta: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  
  // High accuracy numerical approximation for bounded risk variables
  const z1 = sampleGamma(alpha);
  const z2 = sampleGamma(beta);
  if (z1 + z2 === 0) return 0.5;
  return z1 / (z1 + z2);
}

function sampleGamma(k: number): number {
  // Marsaglia and Tsang method for k >= 1
  if (k < 1) {
    return sampleGamma(k + 1) * Math.pow(Math.random(), 1 / k);
  }
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let z = normalRandom();
    let v = 1 + c * z;
    if (v <= 0) continue;
    v = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * z * z * z * z) return d * v;
    if (Math.log(u) < 0.5 * z * z + d * (1 - v + Math.log(v))) return d * v;
  }
}

function normalRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Calculates FAIR vulnerability (probability of control failure given threat event).
 * Vulnerability V = P(Threat Capability > Control Resistance)
 */
export function calculateVulnerability(threatCap: number, controlStrength: number): number {
  if (threatCap <= 0) return 0.01;
  if (controlStrength >= 100) return 0.02;
  
  // Sigmoid / Log-logistic mapping standard in OpenFAIR
  const delta = threatCap - controlStrength;
  const vuln = 1 / (1 + Math.exp(-0.06 * delta));
  return Math.max(0.01, Math.min(0.99, vuln));
}
