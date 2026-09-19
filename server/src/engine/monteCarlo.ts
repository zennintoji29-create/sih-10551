import { ThreatScenario, samplePert, calculateVulnerability } from './fairModel';

export interface MonteCarloResult {
  simulationRuns: number;
  expectedAnnualLoss: number; // Mean EAL
  medianAnnualLoss: number; // P50
  var90: number; // 90th percentile 1-year loss
  var95: number; // 95th percentile 1-year loss (Industry benchmark)
  var99: number; // 99th percentile catastrophic loss
  cvar95: number; // Conditional VaR (Expected Shortfall beyond 95th percentile)
  confidenceInterval90: {
    low: number; // P5
    high: number; // P95
  };
  lossExceedanceCurve: Array<{
    lossThreshold: number;
    probabilityOfExceedance: number; // e.g., 0.05 for 95% VaR
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
    lef: number; // Loss event frequency
    meanLossPerEvent: number;
  }>;
}

/**
 * Runs 10,000 Monte Carlo simulation trials across the provided threat scenarios.
 */
export function runMonteCarloSimulation(
  scenarios: ThreatScenario[],
  trials: number = 10000
): MonteCarloResult {
  const annualTotalLosses: number[] = new Float64Array(trials) as unknown as number[];
  const scenarioLossSums = new Map<string, { totalLoss: number; eventCount: number }>();

  scenarios.forEach(sc => {
    scenarioLossSums.set(sc.id, { totalLoss: 0, eventCount: 0 });
  });

  for (let t = 0; t < trials; t++) {
    let yearLoss = 0;

    for (const sc of scenarios) {
      // 1. Sample TEF (Threat Event Frequency) with AI multiplier
      const baseTef = samplePert(sc.tef);
      const adjustedTef = baseTef * (sc.aiThreatMultiplier || 1.0);
      
      // Discrete number of threat events this year via Poisson approximation
      const eventCount = samplePoisson(adjustedTef);

      if (eventCount <= 0) continue;

      // 2. Determine Vulnerability for this scenario
      const vuln = calculateVulnerability(sc.threatCapability, sc.controlStrength);

      // 3. For each threat event, test if it overcomes controls to become a Loss Event
      let scLossThisYear = 0;
      for (let e = 0; e < eventCount; e++) {
        if (Math.random() < vuln) {
          // Loss event occurred!
          const primaryLoss = samplePert(sc.primaryLoss);
          let secondaryLoss = 0;
          if (Math.random() < sc.secondaryLossProbability) {
            secondaryLoss = samplePert(sc.secondaryLoss);
          }

          const eventLoss = primaryLoss + secondaryLoss;
          scLossThisYear += eventLoss;
          
          const stats = scenarioLossSums.get(sc.id)!;
          stats.totalLoss += eventLoss;
          stats.eventCount += 1;
        }
      }

      yearLoss += scLossThisYear;
    }

    annualTotalLosses[t] = yearLoss;
  }

  // Sort annual losses ascending for percentile calculation
  annualTotalLosses.sort((a, b) => a - b);

  const meanEal = annualTotalLosses.reduce((acc, v) => acc + v, 0) / trials;
  const p5Index = Math.floor(trials * 0.05);
  const p50Index = Math.floor(trials * 0.50);
  const p90Index = Math.floor(trials * 0.90);
  const p95Index = Math.floor(trials * 0.95);
  const p99Index = Math.floor(trials * 0.99);

  const var90 = annualTotalLosses[p90Index];
  const var95 = annualTotalLosses[p95Index];
  const var99 = annualTotalLosses[p99Index];

  // Conditional VaR (mean of losses in top 5%)
  const top5Tail = annualTotalLosses.slice(p95Index);
  const cvar95 = top5Tail.reduce((a, b) => a + b, 0) / top5Tail.length;

  // Build Loss Exceedance Curve (LEC) with 20 stepped points
  const lossExceedanceCurve: MonteCarloResult['lossExceedanceCurve'] = [];
  const percentiles = [0.01, 0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.85, 0.90, 0.95, 0.98, 0.99, 0.999];
  
  percentiles.forEach(pct => {
    const idx = Math.min(trials - 1, Math.floor(trials * pct));
    lossExceedanceCurve.push({
      lossThreshold: Math.round(annualTotalLosses[idx]),
      probabilityOfExceedance: Number((1 - pct).toFixed(3))
    });
  });

  // Build Loss Distribution Histogram (15 bins)
  const maxLoss = annualTotalLosses[trials - 1];
  const binCount = 12;
  const binWidth = maxLoss > 0 ? maxLoss / binCount : 100000;
  const bins: MonteCarloResult['lossDistributionHistogram'] = [];

  for (let i = 0; i < binCount; i++) {
    const start = i * binWidth;
    const end = (i + 1) * binWidth;
    const freq = annualTotalLosses.filter(l => l >= start && (i === binCount - 1 ? l <= end : l < end)).length;
    bins.push({
      rangeLabel: `$${(start / 1000000).toFixed(1)}M - $${(end / 1000000).toFixed(1)}M`,
      rangeStart: Math.round(start),
      rangeEnd: Math.round(end),
      frequency: freq
    });
  }

  // Breakdown by scenario
  const scenarioBreakdown = scenarios.map(sc => {
    const stats = scenarioLossSums.get(sc.id) || { totalLoss: 0, eventCount: 0 };
    const meanLoss = stats.totalLoss / trials;
    return {
      scenarioId: sc.id,
      scenarioName: sc.name,
      category: sc.category,
      meanEal: Math.round(meanLoss),
      percentageOfTotal: meanEal > 0 ? Number(((meanLoss / meanEal) * 100).toFixed(1)) : 0,
      lef: Number((stats.eventCount / trials).toFixed(2)),
      meanLossPerEvent: stats.eventCount > 0 ? Math.round(stats.totalLoss / stats.eventCount) : 0
    };
  });

  return {
    simulationRuns: trials,
    expectedAnnualLoss: Math.round(meanEal),
    medianAnnualLoss: Math.round(annualTotalLosses[p50Index]),
    var90: Math.round(var90),
    var95: Math.round(var95),
    var99: Math.round(var99),
    cvar95: Math.round(cvar95),
    confidenceInterval90: {
      low: Math.round(annualTotalLosses[p5Index]),
      high: Math.round(annualTotalLosses[p90Index])
    },
    lossExceedanceCurve,
    lossDistributionHistogram: bins,
    scenarioBreakdown
  };
}

/**
 * Poisson random variate generator for discrete event counts (Knuth algorithm)
 */
function samplePoisson(lambda: number): number {
  if (lambda <= 0) return 0;
  if (lambda > 30) {
    // Gaussian approximation for large lambda
    const z = (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 1.732;
    return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * z));
  }
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}
