import { ThreatScenario } from '../engine/fairModel';

/**
 * Standard enterprise threat scenarios calibrated against the SIH26105 Research Dossier
 * Targets: Baseline EAL ~$2.45M, 95% VaR ~$4.8M, mirroring a mid-market $120M enterprise.
 */
export const DEFAULT_SCENARIOS: ThreatScenario[] = [
  {
    id: 'sc-ransomware',
    name: 'Multi-Stage Ransomware & Double Extortion',
    category: 'RANSOMWARE',
    tef: { min: 1, mode: 3, max: 8 },
    threatCapability: 75,
    controlStrength: 82, // Strong endpoint & backup controls (V ~ 0.12)
    primaryLoss: { min: 250000, mode: 550000, max: 1500000 },
    secondaryLoss: { min: 150000, mode: 400000, max: 1200000 },
    secondaryLossProbability: 0.60,
    aiThreatMultiplier: 1.25,
    cveRefs: ['CVE-2025-2410'],
    affectedAssetIds: ['ast-core-db', 'ast-auth-cluster']
  },
  {
    id: 'sc-data-exfil',
    name: 'Cloud Data Warehouse PII / Secret Exfiltration',
    category: 'DATA_EXFILTRATION',
    tef: { min: 1, mode: 4, max: 10 },
    threatCapability: 70,
    controlStrength: 80, // V ~ 0.14
    primaryLoss: { min: 150000, mode: 350000, max: 1000000 },
    secondaryLoss: { min: 250000, mode: 650000, max: 2000000 },
    secondaryLossProbability: 0.70,
    aiThreatMultiplier: 1.15,
    cveRefs: ['CVE-2025-1109'],
    affectedAssetIds: ['ast-s3-backup', 'ast-core-db']
  },
  {
    id: 'sc-supply-chain',
    name: 'Third-Party SaaS / CI-CD Supply Chain Poisoning',
    category: 'SUPPLY_CHAIN',
    tef: { min: 0.5, mode: 2, max: 5 },
    threatCapability: 80,
    controlStrength: 76, // V ~ 0.20
    primaryLoss: { min: 200000, mode: 450000, max: 1200000 },
    secondaryLoss: { min: 150000, mode: 400000, max: 1000000 },
    secondaryLossProbability: 0.50,
    aiThreatMultiplier: 1.30,
    affectedAssetIds: ['ast-k8s-ci', 'ast-auth-cluster']
  },
  {
    id: 'sc-cloud-misconfig',
    name: 'Cloud IAM Privilege Escalation & Unrestricted S3 Drift',
    category: 'CLOUD_MISCONFIG',
    tef: { min: 2, mode: 6, max: 15 },
    threatCapability: 55,
    controlStrength: 85, // V ~ 0.05
    primaryLoss: { min: 50000, mode: 120000, max: 400000 },
    secondaryLoss: { min: 60000, mode: 150000, max: 500000 },
    secondaryLossProbability: 0.30,
    aiThreatMultiplier: 1.10,
    affectedAssetIds: ['ast-s3-backup']
  },
  {
    id: 'sc-phishing',
    name: 'AI-Synthesized Voice & Executive Spear-Phishing',
    category: 'AI_SPEAR_PHISHING',
    tef: { min: 2, mode: 8, max: 20 },
    threatCapability: 68,
    controlStrength: 84, // V ~ 0.08
    primaryLoss: { min: 40000, mode: 90000, max: 300000 },
    secondaryLoss: { min: 50000, mode: 110000, max: 350000 },
    secondaryLossProbability: 0.40,
    aiThreatMultiplier: 1.45,
    affectedAssetIds: ['ast-auth-cluster']
  }
];
