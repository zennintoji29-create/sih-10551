/**
 * FAIR (Factor Analysis of Information Risk) decomposition engine.
 *
 * EAL = LEF × PLM
 * LEF = TEF × Vulnerability × (1 − ControlEffectiveness)
 * PLM = DirectCosts + IndirectCosts + RegulatoryCosts
 *
 * Every sub-factor is carried through as a named driver so the output
 * can be traced back to "why did the number change" — this is the
 * explainability requirement from the SIH26105 dossier (Section 12).
 */

export interface AssetContext {
  assetId: string;
  criticality: number; // 0–1, business criticality weight
}

export interface ThreatInputs {
  /** Threat Event Frequency: expected attempts/year against this asset class */
  tef: number;
  /** Vulnerability / susceptibility, 0–1 */
  vulnerability: number;
  /** Control effectiveness, 0–1 (1 = fully mitigates) */
  controlEffectiveness: number;
  /** Optional AI-amplification multiplier applied to TEF (dossier §10) */
  aiAmplificationFactor?: number;
}

export interface LossInputs {
  directCosts: number; // forensics, response, notification
  indirectCosts: number; // downtime, reputational
  regulatoryCosts: number; // fines, legal
}

export interface FairResult {
  assetId: string;
  lef: number;
  plm: number;
  eal: number;
  drivers: {
    tef: number;
    effectiveTef: number;
    vulnerability: number;
    controlEffectiveness: number;
    directCosts: number;
    indirectCosts: number;
    regulatoryCosts: number;
    aiAmplificationFactor: number;
  };
}

export function calculateFair(
  asset: AssetContext,
  threat: ThreatInputs,
  loss: LossInputs
): FairResult {
  const aiFactor = threat.aiAmplificationFactor ?? 1;
  const effectiveTef = threat.tef * aiFactor;

  const lef = effectiveTef * threat.vulnerability * (1 - threat.controlEffectiveness);
  const plm =
    (loss.directCosts + loss.indirectCosts + loss.regulatoryCosts) * asset.criticality;
  const eal = lef * plm;

  return {
    assetId: asset.assetId,
    lef,
    plm,
    eal,
    drivers: {
      tef: threat.tef,
      effectiveTef,
      vulnerability: threat.vulnerability,
      controlEffectiveness: threat.controlEffectiveness,
      directCosts: loss.directCosts,
      indirectCosts: loss.indirectCosts,
      regulatoryCosts: loss.regulatoryCosts,
      aiAmplificationFactor: aiFactor,
    },
  };
}

export function aggregateEal(results: FairResult[]): number {
  return results.reduce((sum, r) => sum + r.eal, 0);
}

export interface ChangeAttribution {
  assetId: string;
  deltaEal: number;
  primaryDriver: "vulnerability" | "threat_frequency" | "control_effectiveness" | "loss_magnitude" | "none";
  summary: string;
  drivers: {
    tef: number;
    vulnerability: number;
    controlEffectiveness: number;
    lossMagnitude: number;
  };
}

/**
 * Change attribution: given a previous and current FairResult for the
 * same asset, decompose the EAL delta into driver-level contributions
 * so the UI can render "EAL +$60k because of CVE-2025-XXXX exposure".
 */
export function attributeChange(prev: FairResult, next: FairResult): ChangeAttribution {
  const delta = next.eal - prev.eal;
  const driverDeltas = {
    tef: next.drivers.effectiveTef - prev.drivers.effectiveTef,
    vulnerability: next.drivers.vulnerability - prev.drivers.vulnerability,
    controlEffectiveness:
      prev.drivers.controlEffectiveness - next.drivers.controlEffectiveness, // positive means risk increased (control worsened)
    lossMagnitude: next.plm - prev.plm,
  };

  // Determine primary driver based on which factor shifted most significantly
  let primaryDriver: ChangeAttribution["primaryDriver"] = "none";
  let summary = `EAL unchanged for asset ${next.assetId}.`;

  if (Math.abs(delta) > 0.001) {
    const direction = delta > 0 ? "increased" : "decreased";
    const absDeltaFormatted = `$${Math.abs(Math.round(delta)).toLocaleString()}`;

    // Rank candidate drivers by relative shift
    const candidates: { driver: ChangeAttribution["primaryDriver"]; shift: number; desc: string }[] = [];

    if (Math.abs(driverDeltas.vulnerability) > 0.001) {
      candidates.push({
        driver: "vulnerability",
        shift: Math.abs(driverDeltas.vulnerability),
        desc: `Vulnerability moved from ${prev.drivers.vulnerability.toFixed(2)} to ${next.drivers.vulnerability.toFixed(2)}`,
      });
    }
    if (Math.abs(driverDeltas.tef) > 0.001) {
      candidates.push({
        driver: "threat_frequency",
        shift: Math.abs(driverDeltas.tef) / Math.max(1, prev.drivers.effectiveTef),
        desc: `Threat Event Frequency moved from ${prev.drivers.effectiveTef.toFixed(1)} to ${next.drivers.effectiveTef.toFixed(1)}/yr`,
      });
    }
    if (Math.abs(driverDeltas.controlEffectiveness) > 0.001) {
      candidates.push({
        driver: "control_effectiveness",
        shift: Math.abs(driverDeltas.controlEffectiveness),
        desc: `Control Effectiveness moved from ${(prev.drivers.controlEffectiveness * 100).toFixed(0)}% to ${(next.drivers.controlEffectiveness * 100).toFixed(0)}%`,
      });
    }
    if (Math.abs(driverDeltas.lossMagnitude) > 0.001) {
      candidates.push({
        driver: "loss_magnitude",
        shift: Math.abs(driverDeltas.lossMagnitude) / Math.max(1, prev.plm),
        desc: `Loss magnitude moved from $${Math.round(prev.plm).toLocaleString()} to $${Math.round(next.plm).toLocaleString()}`,
      });
    }

    candidates.sort((a, b) => b.shift - a.shift);
    const top = candidates[0];

    if (top) {
      primaryDriver = top.driver;
      summary = `EAL ${direction} by ${absDeltaFormatted} on asset ${next.assetId} primarily because ${top.desc}.`;
    } else {
      summary = `EAL ${direction} by ${absDeltaFormatted} on asset ${next.assetId}.`;
    }
  }

  return {
    assetId: next.assetId,
    deltaEal: delta,
    primaryDriver,
    summary,
    drivers: driverDeltas,
  };
}
