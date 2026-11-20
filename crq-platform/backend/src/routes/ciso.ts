import { Router, Response } from "express";
import { dbStore } from "../db/store";
import { calculateFair, aggregateEal } from "../engine/fair";
import { simulateVar } from "../engine/var";
import { calculateRosi } from "../engine/rosi";
import { authMiddleware, requireMinRole, type AuthenticatedRequest } from "./auth";

export const cisoRouter = Router();

// Enforce CISO-exclusive access at the router level (Tier 4 only)
cisoRouter.use(authMiddleware);
cisoRouter.use(requireMinRole("ciso"));

// GET /api/ciso/cockpit — Executive Cockpit portfolio stats & trend time series
cisoRouter.get("/cockpit", (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const org = dbStore.getOrg(orgId);
  const assets = dbStore.getAssets(orgId);
  const snapshots = dbStore.getSnapshots(orgId);
  const connectors = dbStore.getConnectors(orgId);
  const findings = dbStore.getFindings(orgId);

  // Compute live FAIR for assets
  const fairResults = assets.map((a) =>
    calculateFair(
      { assetId: a.id, criticality: a.criticality },
      {
        tef: a.tef,
        vulnerability: a.vulnerability,
        controlEffectiveness: a.controlEffectiveness,
        aiAmplificationFactor: a.aiAmplificationFactor,
      },
      { directCosts: a.directCosts, indirectCosts: a.indirectCosts, regulatoryCosts: a.regulatoryCosts }
    )
  );

  const portfolioEal = aggregateEal(fairResults);
  const var90 = simulateVar(fairResults, { simulations: 3000, confidence: 0.90 });
  const var95 = simulateVar(fairResults, { simulations: 3000, confidence: 0.95 });
  const var99 = simulateVar(fairResults, { simulations: 3000, confidence: 0.99 });

  const avgConfidence = connectors.length > 0 ? connectors.reduce((s, c) => s + c.confidence, 0) / connectors.length : 0.85;
  const latestSnapshot = snapshots[snapshots.length - 1];

  res.json({
    organization: org,
    role: req.user?.role,
    metrics: {
      portfolioEal,
      var90: var90.var,
      var95: var95.var,
      var99: var99.var,
      worstCaseLoss: var99.worst,
      dataConfidenceIndex: Number(avgConfidence.toFixed(2)),
      activeAssetsCount: assets.length,
      activeFindingsCount: findings.filter((f) => !f.isPatched).length,
    },
    changeAttribution: latestSnapshot?.changeAttribution || {
      assetId: "ast-payment",
      deltaEal: 75000,
      primaryDriver: "vulnerability",
      summary: "EAL increased by $75,000 primarily because Vulnerability moved from 0.55 to 0.65 due to active CISA KEV exploitation.",
    },
    history: snapshots,
  });
});

// GET /api/ciso/board-report — Executive Board Briefing & SEC 8-K Governance Summary
cisoRouter.get("/board-report", (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const org = dbStore.getOrg(orgId);
  const assets = dbStore.getAssets(orgId);
  const controls = dbStore.getControls(orgId);

  const fairResults = assets.map((a) =>
    calculateFair(
      { assetId: a.id, criticality: a.criticality },
      { tef: a.tef, vulnerability: a.vulnerability, controlEffectiveness: a.controlEffectiveness, aiAmplificationFactor: a.aiAmplificationFactor },
      { directCosts: a.directCosts, indirectCosts: a.indirectCosts, regulatoryCosts: a.regulatoryCosts }
    )
  );
  const portfolioEal = aggregateEal(fairResults);
  const var95 = simulateVar(fairResults, { simulations: 3000, confidence: 0.95 });

  const evaluatedControls = controls.map((c) =>
    calculateRosi({
      controlId: c.id,
      name: c.name,
      cost: c.cost,
      ealBefore: portfolioEal,
      predictedMitigationPct: c.predictedMitigationPct,
      confidencePct: c.confidencePct,
    })
  );

  const totalCapitalProposed = controls.reduce((s, c) => s + c.cost, 0);
  const totalPredictedRiskReduction = evaluatedControls.reduce((s, r) => s + r.predictedEalReduction, 0);
  const blendedRosi = totalCapitalProposed > 0 ? (totalPredictedRiskReduction - totalCapitalProposed) / totalCapitalProposed : 0;

  res.json({
    organization: org,
    generatedAt: new Date().toISOString(),
    executiveSummary: {
      annualRevenueExposurePct: 1.15,
      portfolioEal,
      var95: var95.var,
      totalCapitalProposed,
      totalPredictedRiskReduction,
      blendedRosiPercentage: Number((blendedRosi * 100).toFixed(1)),
      boardDecision: blendedRosi > 1.0 ? "STRONGLY_APPROVED" : "CONDITIONALLY_ACCEPTABLE",
    },
    regulatoryAttestation: {
      secItem106Status: "COMPLIANT_NO_MATERIAL_BREACH_PENDING",
      doraArticle16Compliance: "ACTIVE_SPOF_CONCENTRATION_MONITORED",
      rbiCsiteAlignment: "CONTINUOUS_MONETARY_DEFENSE_ACTIVE",
    },
    controlsPortfolio: evaluatedControls,
  });
});

// POST /api/ciso/capital-allocation — Board-Level Security Capital Allocation Sign-Off
cisoRouter.post("/capital-allocation", (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const { approvedBudgetCap = 5000000, selectedControlIds = [] } = req.body;

  dbStore.addAuditLog(
    orgId,
    req.user?.userId || "ciso",
    "ciso",
    "CAPITAL_ALLOCATION_SIGNED",
    `CISO formally approved ₹${(approvedBudgetCap / 100000).toFixed(1)} Lakh budget cap with ${(selectedControlIds as string[]).length} optimized controls.`,
    ["BOARD_DIRECTIVE", "RBI CSITE", "SEBI CSCRF"]
  );

  res.json({
    success: true,
    signOffId: `SIG-${Date.now()}`,
    approvedBudgetCap,
    selectedControlIds,
    status: "BOARD_COMMITTED",
    timestamp: new Date().toISOString(),
  });
});

// POST /api/ciso/what-if — Real-time What-If ROSI & Parameter Simulation
cisoRouter.post("/what-if", (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const { mfaRolloutPct = 70, edrCoveragePct = 75, aiThreatSurge = false } = req.body;

  const assets = dbStore.getAssets(orgId);
  const baselineResults = assets.map((a) =>
    calculateFair(
      { assetId: a.id, criticality: a.criticality },
      { tef: a.tef, vulnerability: a.vulnerability, controlEffectiveness: a.controlEffectiveness, aiAmplificationFactor: a.aiAmplificationFactor },
      { directCosts: a.directCosts, indirectCosts: a.indirectCosts, regulatoryCosts: a.regulatoryCosts }
    )
  );
  const baselineEal = aggregateEal(baselineResults);

  const simulatedResults = assets.map((a) => {
    const mfaBoost = (Number(mfaRolloutPct) - 50) * 0.003;
    const edrBoost = (Number(edrCoveragePct) - 50) * 0.002;
    const newControl = Math.min(0.98, Math.max(0.1, a.controlEffectiveness + mfaBoost + edrBoost));
    const aiMultiplier = aiThreatSurge ? a.aiAmplificationFactor * 1.5 : a.aiAmplificationFactor;

    return calculateFair(
      { assetId: a.id, criticality: a.criticality },
      { tef: a.tef, vulnerability: a.vulnerability, controlEffectiveness: newControl, aiAmplificationFactor: aiMultiplier },
      { directCosts: a.directCosts, indirectCosts: a.indirectCosts, regulatoryCosts: a.regulatoryCosts }
    );
  });

  const simulatedEal = aggregateEal(simulatedResults);
  const simulatedVar = simulateVar(simulatedResults, { simulations: 3000, confidence: 0.95 });

  res.json({
    baselineEal,
    simulatedEal,
    deltaEal: simulatedEal - baselineEal,
    deltaPercentage: Number((((simulatedEal - baselineEal) / baselineEal) * 100).toFixed(1)),
    simulatedVar95: simulatedVar.var,
  });
});
