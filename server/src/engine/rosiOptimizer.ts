export interface SecurityControlCandidate {
  id: string;
  name: string;
  category: 'IDENTITY' | 'ENDPOINT' | 'CLOUD_SECURITY' | 'INCIDENT_RESPONSE' | 'DATA_PROTECTION';
  implementationCost: number; // Cost in USD
  annualMaintenanceCost: number; // Recurring cost in USD
  targetScenarios: string[]; // IDs of threat scenarios this control addresses
  controlResistanceIncrease: number; // % increase in control strength (e.g. +25%)
  lossReductionPercent: number; // % reduction in loss magnitude (e.g. 15%)
  historicalConfidence: number; // 0-100% confidence rating
  description: string;
}

export interface ControlAllocationResult {
  control: SecurityControlCandidate;
  selected: boolean;
  marginalCost: number;
  predictedEalReduction: number;
  rosiPercentage: number; // ((Delta EAL - Cost) / Cost) * 100
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

/**
 * Standard Security Controls Catalog available for enterprise deployment
 */
export const DEFAULT_CONTROLS_CATALOG: SecurityControlCandidate[] = [
  {
    id: 'ctrl-mfa',
    name: 'Enterprise Phishing-Resistant FIDO2 MFA Rollout',
    category: 'IDENTITY',
    implementationCost: 150000,
    annualMaintenanceCost: 20000,
    targetScenarios: ['sc-phishing', 'sc-ransomware', 'sc-cloud-auth'],
    controlResistanceIncrease: 32,
    lossReductionPercent: 10,
    historicalConfidence: 94,
    description: 'Hardware key / WebAuthn mandatory enforcement across 100% of workforce and contractors.'
  },
  {
    id: 'ctrl-edr',
    name: 'Managed EDR / XDR with 24/7 Threat Hunting',
    category: 'ENDPOINT',
    implementationCost: 220000,
    annualMaintenanceCost: 45000,
    targetScenarios: ['sc-ransomware', 'sc-data-exfil'],
    controlResistanceIncrease: 28,
    lossReductionPercent: 35,
    historicalConfidence: 91,
    description: 'Autonomous endpoint isolation and 15-minute SLA threat eradication.'
  },
  {
    id: 'ctrl-cspm',
    name: 'Cloud Security Posture Management & Drift Remediation (CSPM)',
    category: 'CLOUD_SECURITY',
    implementationCost: 95000,
    annualMaintenanceCost: 15000,
    targetScenarios: ['sc-cloud-misconfig', 'sc-data-exfil'],
    controlResistanceIncrease: 22,
    lossReductionPercent: 20,
    historicalConfidence: 89,
    description: 'Automated policy enforcement against unencrypted S3 buckets, IAM privilege creep, and open security groups.'
  },
  {
    id: 'ctrl-soar',
    name: 'Incident Response Automation & Playbook Orchestration (SOAR)',
    category: 'INCIDENT_RESPONSE',
    implementationCost: 130000,
    annualMaintenanceCost: 25000,
    targetScenarios: ['sc-ransomware', 'sc-data-exfil', 'sc-supply-chain'],
    controlResistanceIncrease: 15,
    lossReductionPercent: 45, // Dramatic reduction in downtime and dwell time
    historicalConfidence: 87,
    description: 'Automated containment reducing mean time to remediate (MTTR) from 48 hours to 45 minutes.'
  },
  {
    id: 'ctrl-dlp',
    name: 'Data Loss Prevention & Cryptographic Enclave Tokenization',
    category: 'DATA_PROTECTION',
    implementationCost: 180000,
    annualMaintenanceCost: 30000,
    targetScenarios: ['sc-data-exfil', 'sc-phishing'],
    controlResistanceIncrease: 20,
    lossReductionPercent: 40,
    historicalConfidence: 85,
    description: 'Real-time classification and redaction of PII, PCI, and proprietary algorithms at rest and in transit.'
  },
  {
    id: 'ctrl-tprm',
    name: 'Continuous Third-Party Vendor Risk Monitoring',
    category: 'CLOUD_SECURITY',
    implementationCost: 75000,
    annualMaintenanceCost: 12000,
    targetScenarios: ['sc-supply-chain'],
    controlResistanceIncrease: 25,
    lossReductionPercent: 25,
    historicalConfidence: 82,
    description: 'Automated continuous assessment of 4th-party concentration risk and supplier CVE exposure.'
  }
];

/**
 * Optimizes security budget allocation using a greedy knapsack heuristic
 * sorted by Marginal ROSI (Loss Reduction / Cost Ratio).
 */
export function optimizeSecurityBudget(
  availableBudget: number,
  baselineEal: number,
  candidateControls: SecurityControlCandidate[] = DEFAULT_CONTROLS_CATALOG
): RosiOptimizationPlan {
  // 1. Calculate individual expected EAL reduction and ROSI for each control
  const evaluated = candidateControls.map(ctrl => {
    const totalFirstYearCost = ctrl.implementationCost + ctrl.annualMaintenanceCost;
    
    // Model reduction based on control resistance boost and direct loss reduction
    // OpenFAIR heuristic: EAL reduction is proportional to resistance boost * loss reduction factor
    const resistanceFactor = ctrl.controlResistanceIncrease / 100;
    const lossFactor = ctrl.lossReductionPercent / 100;
    const combinedEffectiveness = resistanceFactor * 0.6 + lossFactor * 0.4;
    
    // Theoretical EAL reduction capped to sensible bounds
    const predictedEalReduction = Math.round(baselineEal * combinedEffectiveness * 0.65);
    
    // ROSI = ((Reduction - Cost) / Cost) * 100
    const rosi = totalFirstYearCost > 0
      ? ((predictedEalReduction - totalFirstYearCost) / totalFirstYearCost) * 100
      : 0;

    // Confidence interval bands based on historical confidence
    const variance = (100 - ctrl.historicalConfidence) / 100;
    const lowRosi = Math.round(rosi * (1 - variance));
    const highRosi = Math.round(rosi * (1 + variance * 0.6));

    return {
      control: ctrl,
      marginalCost: totalFirstYearCost,
      predictedEalReduction,
      rosiPercentage: Math.round(rosi),
      confidenceInterval: { lowRosi, highRosi },
      efficiencyRatio: predictedEalReduction / Math.max(1, totalFirstYearCost)
    };
  });

  // 2. Sort by efficiency ratio (EAL reduction per dollar invested)
  evaluated.sort((a, b) => b.efficiencyRatio - a.efficiencyRatio);

  // 3. Knapsack allocation within availableBudget
  let remaining = availableBudget;
  let allocated = 0;
  let totalReduction = 0;

  const allocations: ControlAllocationResult[] = evaluated.map(item => {
    if (remaining >= item.marginalCost) {
      remaining -= item.marginalCost;
      allocated += item.marginalCost;
      // Diminishing returns factor for overlapping controls
      const overlapDampener = Math.max(0.75, 1 - (allocated / (baselineEal || 1)) * 0.2);
      const netReduction = Math.round(item.predictedEalReduction * overlapDampener);
      totalReduction += netReduction;

      return {
        control: item.control,
        selected: true,
        marginalCost: item.marginalCost,
        predictedEalReduction: netReduction,
        rosiPercentage: item.rosiPercentage,
        confidenceInterval: item.confidenceInterval
      };
    } else {
      return {
        control: item.control,
        selected: false,
        marginalCost: item.marginalCost,
        predictedEalReduction: item.predictedEalReduction,
        rosiPercentage: item.rosiPercentage,
        confidenceInterval: item.confidenceInterval
      };
    }
  });

  const projectedEal = Math.max(0, baselineEal - totalReduction);
  const portfolioRosi = allocated > 0
    ? Math.round(((totalReduction - allocated) / allocated) * 100)
    : 0;

  return {
    totalBudget: availableBudget,
    allocatedBudget: allocated,
    remainingBudget: remaining,
    baselineEal,
    projectedEal,
    totalEalReduction: totalReduction,
    portfolioRosi,
    allocations
  };
}
