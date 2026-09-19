/**
 * Value-at-Risk via Monte Carlo simulation over per-asset FAIR results,
 * with a simple Generalized-Pareto tail adjustment so extreme
 * ("fat-tail") loss events are not underestimated by a normal
 * approximation alone (dossier §5.3 — ML+EVT hybrid rationale).
 *
 * This is a defensible, explainable approximation suitable for an
 * MVP — swap in a fitted GEV/GPD model once enough loss-history data
 * is available (see README "Phase 2/4" roadmap notes).
 */

import type { FairResult } from "./fair";

export interface VarOptions {
  simulations?: number;
  confidence?: number; // e.g. 0.95
  tailShape?: number; // GPD shape parameter (ξ); >0 = fat tail
  seed?: number; // optional seed for deterministic reproducibility in testing
}

function createRng(seed?: number): () => number {
  if (seed === undefined) return Math.random;
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomLognormalMultiplier(sigma: number, rng: () => number): number {
  // Box-Muller for a mean-1 lognormal multiplier, used to jitter each
  // simulated asset loss so aggregated scenarios aren't perfectly linear.
  const u1 = Math.max(1e-12, rng());
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.exp(sigma * z - (sigma * sigma) / 2);
}

export function simulateVar(results: FairResult[], opts: VarOptions = {}) {
  const simulations = opts.simulations ?? 10000;
  const confidence = opts.confidence ?? 0.95;
  const tailShape = opts.tailShape ?? 0.25;
  const rng = createRng(opts.seed);

  if (results.length === 0) {
    return {
      confidence,
      var: 0,
      mean: 0,
      worst: 0,
      simulations,
    };
  }

  const losses: number[] = [];
  for (let i = 0; i < simulations; i++) {
    let total = 0;
    for (const r of results) {
      const base = r.eal * randomLognormalMultiplier(0.6, rng);
      // occasionally inject a fat-tail excess event (GPD-style jump)
      const tailEvent = rng() < 0.02;
      const tail = tailEvent ? r.eal * (1 / Math.pow(Math.max(1e-6, 1 - rng()), tailShape)) : 0;
      total += base + tail;
    }
    losses.push(total);
  }
  losses.sort((a, b) => a - b);
  const idx = Math.min(losses.length - 1, Math.floor(confidence * losses.length));
  return {
    confidence,
    var: losses[idx],
    mean: losses.reduce((a, b) => a + b, 0) / losses.length,
    worst: losses[losses.length - 1],
    simulations,
  };
}
