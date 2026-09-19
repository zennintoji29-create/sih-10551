import { describe, it, expect } from "vitest";
import { calculateFair, aggregateEal, attributeChange } from "./fair";
import { simulateVar } from "./var";
import { calculateRosi, trackRosiOutcome, accumulationRisk } from "./rosi";

describe("FAIR engine", () => {
  it("computes EAL = LEF × PLM correctly", () => {
    const r = calculateFair(
      { assetId: "payment-api", criticality: 1 },
      { tef: 5, vulnerability: 0.8, controlEffectiveness: 0.6 },
      { directCosts: 200000, indirectCosts: 300000, regulatoryCosts: 100000 }
    );
    // LEF = 5 * 0.8 * (1 - 0.6) = 1.6
    expect(r.lef).toBeCloseTo(1.6);
    expect(r.plm).toBeCloseTo(600000);
    expect(r.eal).toBeCloseTo(960000);
    expect(r.drivers.effectiveTef).toBe(5);
    expect(r.drivers.aiAmplificationFactor).toBe(1);
  });

  it("scales PLM and EAL by asset business criticality", () => {
    const fullCriticality = calculateFair(
      { assetId: "core-db", criticality: 1.0 },
      { tef: 4, vulnerability: 0.5, controlEffectiveness: 0.5 },
      { directCosts: 100000, indirectCosts: 50000, regulatoryCosts: 50000 }
    );
    const halfCriticality = calculateFair(
      { assetId: "staging-db", criticality: 0.5 },
      { tef: 4, vulnerability: 0.5, controlEffectiveness: 0.5 },
      { directCosts: 100000, indirectCosts: 50000, regulatoryCosts: 50000 }
    );
    expect(fullCriticality.plm).toBe(200000);
    expect(halfCriticality.plm).toBe(100000);
    expect(halfCriticality.eal).toBe(fullCriticality.eal * 0.5);
  });

  it("applies AI-amplification factor to TEF", () => {
    const base = calculateFair(
      { assetId: "a", criticality: 1 },
      { tef: 2, vulnerability: 0.5, controlEffectiveness: 0.5 },
      { directCosts: 10000, indirectCosts: 0, regulatoryCosts: 0 }
    );
    const amplified = calculateFair(
      { assetId: "a", criticality: 1 },
      { tef: 2, vulnerability: 0.5, controlEffectiveness: 0.5, aiAmplificationFactor: 8 },
      { directCosts: 10000, indirectCosts: 0, regulatoryCosts: 0 }
    );
    expect(amplified.drivers.effectiveTef).toBe(16);
    expect(amplified.eal).toBeCloseTo(base.eal * 8);
  });

  it("handles boundary conditions (100% control effectiveness yields 0 EAL)", () => {
    const result = calculateFair(
      { assetId: "isolated-asset", criticality: 1 },
      { tef: 100, vulnerability: 0.9, controlEffectiveness: 1.0 },
      { directCosts: 1000000, indirectCosts: 500000, regulatoryCosts: 250000 }
    );
    expect(result.lef).toBe(0);
    expect(result.eal).toBe(0);
  });
});

describe("Change attribution engine", () => {
  it("attributes an EAL delta to vulnerability driver with plain-language summary", () => {
    const prev = calculateFair(
      { assetId: "payment-api", criticality: 1 },
      { tef: 2, vulnerability: 0.4, controlEffectiveness: 0.7 },
      { directCosts: 100000, indirectCosts: 0, regulatoryCosts: 0 }
    );
    const next = calculateFair(
      { assetId: "payment-api", criticality: 1 },
      { tef: 2, vulnerability: 0.7, controlEffectiveness: 0.7 }, // new CVE raises vulnerability
      { directCosts: 100000, indirectCosts: 0, regulatoryCosts: 0 }
    );
    const attribution = attributeChange(prev, next);
    expect(attribution.assetId).toBe("payment-api");
    expect(attribution.deltaEal).toBeGreaterThan(0);
    expect(attribution.drivers.vulnerability).toBeCloseTo(0.3);
    expect(attribution.primaryDriver).toBe("vulnerability");
    expect(attribution.summary).toContain("payment-api");
    expect(attribution.summary).toContain("Vulnerability moved from 0.40 to 0.70");
  });

  it("identifies control effectiveness reduction as the primary risk driver", () => {
    const prev = calculateFair(
      { assetId: "auth-service", criticality: 1 },
      { tef: 10, vulnerability: 0.5, controlEffectiveness: 0.9 },
      { directCosts: 50000, indirectCosts: 0, regulatoryCosts: 0 }
    );
    const next = calculateFair(
      { assetId: "auth-service", criticality: 1 },
      { tef: 10, vulnerability: 0.5, controlEffectiveness: 0.2 }, // MFA bypass/disabled
      { directCosts: 50000, indirectCosts: 0, regulatoryCosts: 0 }
    );
    const attribution = attributeChange(prev, next);
    expect(attribution.primaryDriver).toBe("control_effectiveness");
    expect(attribution.deltaEal).toBeGreaterThan(0);
    expect(attribution.summary).toContain("Control Effectiveness moved from 90% to 20%");
  });

  it("returns zero delta and none as primary driver when inputs are unchanged", () => {
    const state = calculateFair(
      { assetId: "steady", criticality: 1 },
      { tef: 5, vulnerability: 0.3, controlEffectiveness: 0.8 },
      { directCosts: 20000, indirectCosts: 10000, regulatoryCosts: 5000 }
    );
    const attribution = attributeChange(state, state);
    expect(attribution.deltaEal).toBe(0);
    expect(attribution.primaryDriver).toBe("none");
    expect(attribution.summary).toContain("unchanged");
  });
});

describe("Monte Carlo VaR engine", () => {
  it("returns zero risk metrics for an empty portfolio", () => {
    const res = simulateVar([], { simulations: 100, confidence: 0.95 });
    expect(res.var).toBe(0);
    expect(res.mean).toBe(0);
    expect(res.worst).toBe(0);
  });

  it("computes monotonically increasing VaR across confidence percentiles (90% < 95% < 99%)", () => {
    const asset = calculateFair(
      { assetId: "asset-1", criticality: 1 },
      { tef: 10, vulnerability: 0.5, controlEffectiveness: 0.4 },
      { directCosts: 200000, indirectCosts: 100000, regulatoryCosts: 50000 }
    );
    const var90 = simulateVar([asset], { simulations: 10000, confidence: 0.90, seed: 12345 });
    const var95 = simulateVar([asset], { simulations: 10000, confidence: 0.95, seed: 12345 });
    const var99 = simulateVar([asset], { simulations: 10000, confidence: 0.99, seed: 12345 });

    expect(var90.var).toBeLessThanOrEqual(var95.var);
    expect(var95.var).toBeLessThanOrEqual(var99.var);
    expect(var99.worst).toBeGreaterThanOrEqual(var99.var);
  });

  it("exhibits fat-tail jump behavior where worst-case loss significantly exceeds 95% VaR", () => {
    const asset = calculateFair(
      { assetId: "core", criticality: 1 },
      { tef: 5, vulnerability: 0.6, controlEffectiveness: 0.5 },
      { directCosts: 500000, indirectCosts: 250000, regulatoryCosts: 100000 }
    );
    const res = simulateVar([asset], { simulations: 5000, confidence: 0.95, tailShape: 0.3, seed: 999 });
    expect(res.worst).toBeGreaterThan(res.var);
  });

  it("is fully deterministic when a seed is provided", () => {
    const asset = calculateFair(
      { assetId: "rep", criticality: 1 },
      { tef: 8, vulnerability: 0.4, controlEffectiveness: 0.5 },
      { directCosts: 150000, indirectCosts: 50000, regulatoryCosts: 25000 }
    );
    const run1 = simulateVar([asset], { simulations: 2000, confidence: 0.95, seed: 42 });
    const run2 = simulateVar([asset], { simulations: 2000, confidence: 0.95, seed: 42 });

    expect(run1.var).toBe(run2.var);
    expect(run1.mean).toBe(run2.mean);
    expect(run1.worst).toBe(run2.worst);
  });
});

describe("ROSI engine", () => {
  it("matches the dossier's worked example (150% ROSI)", () => {
    // Dossier worked example: 25% mitigation, $1.2M EAL, $120k cost -> $300k reduction -> 150% ROSI
    const result = calculateRosi({
      controlId: "c1",
      name: "MFA rollout",
      cost: 120000,
      ealBefore: 1200000,
      predictedMitigationPct: 0.25,
      confidencePct: 0.9,
    });
    expect(result.predictedEalReduction).toBeCloseTo(300000);
    expect(result.rosi).toBeCloseTo(1.5); // 150%
    // Spread with 90% confidence = 300,000 * (1 - 0.90) = 30,000
    // Confidence interval: [270,000, 330,000]
    expect(result.confidenceInterval[0]).toBeCloseTo(270000);
    expect(result.confidenceInterval[1]).toBeCloseTo(330000);
  });

  it("calculates post-deployment closed-loop tracking (predicted vs observed)", () => {
    const outcome = trackRosiOutcome(300000, 270000);
    expect(outcome.predicted).toBe(300000);
    expect(outcome.observed).toBe(270000);
    expect(outcome.variance).toBe(-30000); // observed reduction was $30k less than predicted
    expect(outcome.variancePct).toBeCloseTo(-0.1); // -10% variance
  });
});

describe("Third-party accumulation risk", () => {
  it("adds a correlation surcharge for shared-dependency vendors", () => {
    const out = accumulationRisk(
      [
        { vendorId: "v1", name: "CloudCo", ealContribution: 2000000, sharedDependencyGroup: "aws" },
        { vendorId: "v2", name: "IdentityCo", ealContribution: 3000000, sharedDependencyGroup: "aws" },
        { vendorId: "v3", name: "Standalone", ealContribution: 500000 },
      ],
      0.15
    );
    expect(out.independentTotal).toBe(5500000);
    expect(out.correlationSurcharge).toBeCloseTo(5000000 * 0.15); // $750,000 surcharge
    expect(out.combinedVar).toBe(6250000);
    expect(out.spofGroups["aws"]).toBe(5000000);
  });

  it("charges no surcharge if all vendors have independent infrastructure", () => {
    const out = accumulationRisk([
      { vendorId: "v1", name: "VendorA", ealContribution: 100000 },
      { vendorId: "v2", name: "VendorB", ealContribution: 200000 },
    ]);
    expect(out.independentTotal).toBe(300000);
    expect(out.correlationSurcharge).toBe(0);
    expect(out.combinedVar).toBe(300000);
  });
});

describe("Portfolio aggregation", () => {
  it("aggregateEal sums portfolio correctly across multiple assets", () => {
    const a = calculateFair(
      { assetId: "a", criticality: 1 },
      { tef: 1, vulnerability: 1, controlEffectiveness: 0 },
      { directCosts: 1000, indirectCosts: 0, regulatoryCosts: 0 }
    );
    const b = calculateFair(
      { assetId: "b", criticality: 1 },
      { tef: 1, vulnerability: 1, controlEffectiveness: 0 },
      { directCosts: 2000, indirectCosts: 0, regulatoryCosts: 0 }
    );
    expect(aggregateEal([a, b])).toBe(3000);
  });
});
