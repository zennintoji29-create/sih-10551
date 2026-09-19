/**
 * ROSI (Return on Security Investment) with confidence interval, and
 * third-party accumulation-risk modeling per the dossier's Fix #2 and
 * Fix #5: correlated vendor failures raise combined VaR rather than
 * simply summing independent EALs.
 */

export interface ControlScenario {
  controlId: string;
  name: string;
  cost: number;
  ealBefore: number;
  predictedMitigationPct: number; // 0–1
  confidencePct: number; // 0–1, historical validation confidence
}

export interface RosiResult {
  controlId: string;
  name: string;
  predictedEalReduction: number;
  rosi: number; // as a fraction, e.g. 1.5 = 150%
  confidenceInterval: [number, number];
}

export function calculateRosi(scenario: ControlScenario): RosiResult {
  const predictedEalReduction = scenario.ealBefore * scenario.predictedMitigationPct;
  const rosi = (predictedEalReduction - scenario.cost) / scenario.cost;
  const spread = predictedEalReduction * (1 - scenario.confidencePct);
  return {
    controlId: scenario.controlId,
    name: scenario.name,
    predictedEalReduction,
    rosi,
    confidenceInterval: [predictedEalReduction - spread, predictedEalReduction + spread],
  };
}

/** Post-deployment closed-loop tracking: compare prediction vs. observed. */
export function trackRosiOutcome(predicted: number, observed: number) {
  const variance = observed - predicted;
  const variancePct = predicted === 0 ? 0 : variance / predicted;
  return { predicted, observed, variance, variancePct };
}

export interface VendorRisk {
  vendorId: string;
  name: string;
  ealContribution: number;
  sharedDependencyGroup?: string; // e.g. shared cloud/IAM provider
}

/**
 * Accumulation VaR: vendors sharing a dependency group are treated as
 * correlated, so their combined exposure is inflated by a correlation
 * premium rather than simply summed — matching the dossier's SPoF
 * modeling requirement.
 */
export function accumulationRisk(vendors: VendorRisk[], correlationPremium = 0.15) {
  const groups = new Map<string, number>();
  let independentTotal = 0;

  for (const v of vendors) {
    independentTotal += v.ealContribution;
    if (v.sharedDependencyGroup) {
      groups.set(
        v.sharedDependencyGroup,
        (groups.get(v.sharedDependencyGroup) ?? 0) + v.ealContribution
      );
    }
  }

  let correlationSurcharge = 0;
  for (const groupTotal of groups.values()) {
    correlationSurcharge += groupTotal * correlationPremium;
  }

  return {
    independentTotal,
    correlationSurcharge,
    combinedVar: independentTotal + correlationSurcharge,
    spofGroups: Object.fromEntries(groups),
  };
}
