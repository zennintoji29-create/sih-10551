import { Router, Request, Response } from "express";
import { z } from "zod";
import { calculateFair, aggregateEal, attributeChange, type FairResult } from "../engine/fair";
import { simulateVar } from "../engine/var";
import { calculateRosi, accumulationRisk } from "../engine/rosi";
import { dbStore, type AssetRecord } from "../db/store";
import { ingestionService } from "../engine/ingestion";
import { authMiddleware, requireRole, type AuthenticatedRequest } from "./auth";

export const riskRouter = Router();

// --- Existing Base Math API Endpoints (100% Backward Compatible) ---

const fairInputSchema = z.object({
  assetId: z.string(),
  criticality: z.number().min(0).max(1),
  tef: z.number().min(0),
  vulnerability: z.number().min(0).max(1),
  controlEffectiveness: z.number().min(0).max(1),
  aiAmplificationFactor: z.number().min(1).max(20).optional(),
  directCosts: z.number().min(0),
  indirectCosts: z.number().min(0),
  regulatoryCosts: z.number().min(0),
});

riskRouter.post("/eal", (req, res) => {
  const parsed = z.array(fairInputSchema).safeParse(req.body.assets);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const results: FairResult[] = parsed.data.map((a) =>
    calculateFair(
      { assetId: a.assetId, criticality: a.criticality },
      {
        tef: a.tef,
        vulnerability: a.vulnerability,
        controlEffectiveness: a.controlEffectiveness,
        aiAmplificationFactor: a.aiAmplificationFactor,
      },
      { directCosts: a.directCosts, indirectCosts: a.indirectCosts, regulatoryCosts: a.regulatoryCosts }
    )
  );

  res.json({ portfolioEal: aggregateEal(results), assets: results });
});

riskRouter.post("/var", (req, res) => {
  const schema = z.object({
    results: z.array(z.any()),
    confidence: z.number().min(0.5).max(0.999).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const output = simulateVar(parsed.data.results as FairResult[], {
    confidence: parsed.data.confidence,
  });
  res.json(output);
});

riskRouter.post("/rosi", (req, res) => {
  const schema = z.object({
    controlId: z.string(),
    name: z.string(),
    cost: z.number().positive(),
    ealBefore: z.number().min(0),
    predictedMitigationPct: z.number().min(0).max(1),
    confidencePct: z.number().min(0).max(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(calculateRosi(parsed.data));
});

riskRouter.post("/third-party", (req, res) => {
  const schema = z.object({
    vendors: z.array(
      z.object({
        vendorId: z.string(),
        name: z.string(),
        ealContribution: z.number().min(0),
        sharedDependencyGroup: z.string().optional(),
      })
    ),
    correlationPremium: z.number().min(0).max(1).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(accumulationRisk(parsed.data.vendors, parsed.data.correlationPremium));
});

riskRouter.post("/attribution", (req, res) => {
  const schema = z.object({ prev: z.any(), next: z.any() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  res.json(attributeChange(parsed.data.prev, parsed.data.next));
});

// --- Multi-Tenant Audience REST APIs ---

// GET /api/risk/overview — Executive Cockpit portfolio stats & trend time series
riskRouter.get("/overview", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const org = dbStore.getOrg(orgId);
  const assets = dbStore.getAssets(orgId);
  const snapshots = dbStore.getSnapshots(orgId);
  const connectors = dbStore.getConnectors(orgId);

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
    metrics: {
      portfolioEal,
      var90: var90.var,
      var95: var95.var,
      var99: var99.var,
      worstCaseLoss: var99.worst,
      dataConfidenceIndex: Number(avgConfidence.toFixed(2)),
      activeAssetsCount: assets.length,
      activeFindingsCount: dbStore.getFindings(orgId).filter((f) => !f.isPatched).length,
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

// GET /api/risk/findings — Analyst Queue sorted by Financial Exposure ($)
riskRouter.get("/findings", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const findings = dbStore.getFindings(orgId);
  const sortBy = (req.query.sort as string) || "financialImpact";

  const sorted = [...findings].sort((a, b) => {
    if (sortBy === "cvss") return b.cvssScore - a.cvssScore;
    return b.financialImpact - a.financialImpact;
  });

  res.json({ findings: sorted, count: sorted.length });
});

// POST /api/risk/findings/remediate — Mark finding remediated (Blocked for Auditor)
riskRouter.post("/findings/remediate", authMiddleware, requireRole(["admin", "analyst", "ciso"]), (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const { findingId } = req.body;
  if (!findingId) return res.status(400).json({ error: "findingId is required" });

  const findings = dbStore.getFindings(orgId);
  const target = findings.find((f) => f.id === findingId);
  if (!target) return res.status(404).json({ error: "Finding not found" });

  target.isPatched = true;
  target.financialImpact = 0;

  // Re-run risk calculation
  const result = ingestionService.recalculateOrganizationRisk(orgId, `remediation of ${target.cve} on ${target.assetName}`);

  dbStore.addAuditLog(
    orgId,
    req.user?.userId || "analyst",
    req.user?.role || "analyst",
    "FINDING_REMEDIATED",
    `Remediated vulnerability ${target.cve} on ${target.assetName}. EAL reduced.`,
    ["DORA Art. 16", "NIST CSF PR.IP-1"]
  );

  res.json({ success: true, finding: target, recalculation: result });
});

// GET /api/risk/assets — In-App Asset Register
riskRouter.get("/assets", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const assets = dbStore.getAssets(orgId);
  res.json({ assets, count: assets.length });
});

// POST /api/risk/assets — Register or update asset (Blocked for Auditor)
riskRouter.post("/assets", authMiddleware, requireRole(["admin", "analyst"]), (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const { name, criticality = 0.8, owner = "SecOps", directCosts = 500000, indirectCosts = 500000, regulatoryCosts = 250000 } = req.body;

  if (!name) return res.status(400).json({ error: "Asset name is required" });

  const created = dbStore.saveAsset(orgId, {
    name,
    criticality: Number(criticality),
    owner,
    tef: 12.0,
    vulnerability: 0.5,
    controlEffectiveness: 0.7,
    aiAmplificationFactor: 1.2,
    directCosts: Number(directCosts),
    indirectCosts: Number(indirectCosts),
    regulatoryCosts: Number(regulatoryCosts),
    sourceConfidence: 0.85,
  });

  ingestionService.recalculateOrganizationRisk(orgId, `new asset registered: ${name}`);

  res.status(201).json({ success: true, asset: created });
});

// GET /api/risk/controls — ROSI proposed & deployed controls
riskRouter.get("/controls", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const controls = dbStore.getControls(orgId);
  const assets = dbStore.getAssets(orgId);

  // Compute live ROSI scenarios
  const portfolioEal = assets.reduce((sum, a) => {
    const r = calculateFair(
      { assetId: a.id, criticality: a.criticality },
      { tef: a.tef, vulnerability: a.vulnerability, controlEffectiveness: a.controlEffectiveness, aiAmplificationFactor: a.aiAmplificationFactor },
      { directCosts: a.directCosts, indirectCosts: a.indirectCosts, regulatoryCosts: a.regulatoryCosts }
    );
    return sum + r.eal;
  }, 0);

  const evaluated = controls.map((c) => {
    const rosi = calculateRosi({
      controlId: c.id,
      name: c.name,
      cost: c.cost,
      ealBefore: portfolioEal,
      predictedMitigationPct: c.predictedMitigationPct,
      confidencePct: c.confidencePct,
    });
    return { ...c, rosiResult: rosi };
  });

  res.json({ controls: evaluated, portfolioEal });
});

// POST /api/risk/controls/deploy — Deploy control with closed-loop validation (Blocked for Auditor)
riskRouter.post("/controls/deploy", authMiddleware, requireRole(["admin", "ciso"]), (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const { controlId, observedEalReduction } = req.body;
  if (!controlId) return res.status(400).json({ error: "controlId is required" });

  const deployed = dbStore.deployControl(orgId, controlId, observedEalReduction ? Number(observedEalReduction) : undefined);
  if (!deployed) return res.status(404).json({ error: "Control not found" });

  ingestionService.recalculateOrganizationRisk(orgId, `deployment of control '${deployed.name}'`);

  res.json({ success: true, control: deployed });
});

// POST /api/risk/what-if — Real-time slider recalculation
riskRouter.post("/what-if", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
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

  // Simulated results with modified controls
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

// GET /api/risk/third-party-vendors — Vendor concentration with SPoF correlation surcharge
riskRouter.get("/third-party-vendors", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const vendors = dbStore.getVendors(orgId);

  const vendorRisks = vendors.map((v) => ({
    vendorId: v.id,
    name: v.name,
    ealContribution: v.ealContribution,
    sharedDependencyGroup: v.sharedDependencyGroup,
  }));

  const accumulation = accumulationRisk(vendorRisks, 0.15);

  res.json({
    vendors,
    accumulation,
    spofGroupsCount: Object.keys(accumulation.spofGroups).length,
  });
});

// GET /api/risk/audit-trail — Auditor immutable audit log
riskRouter.get("/audit-trail", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const auditLogs = dbStore.getAuditLogs(orgId);
  res.json({ auditLogs, count: auditLogs.length });
});

// POST /api/risk/sec-materiality — SEC Item 106 4-day materiality assessment
riskRouter.post("/sec-materiality", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { annualRevenueUsd = 120000000, estimatedLossUsd = 2800000, recordsExposed = 145000, downtimeHours = 36 } = req.body;

  // Materiality heuristic: loss > 1.5% of revenue OR records > 100k OR downtime > 24h
  const lossPct = (Number(estimatedLossUsd) / Number(annualRevenueUsd)) * 100;
  const isQuantitativelyMaterial = lossPct >= 1.5;
  const isQualitativelyMaterial = Number(recordsExposed) > 100000 || Number(downtimeHours) > 24;
  const isMaterial = isQuantitativelyMaterial || isQualitativelyMaterial;

  res.json({
    isMaterial,
    financialLossPercentage: Number(lossPct.toFixed(2)),
    recommendation: isMaterial
      ? "Form 8-K Item 1.05 disclosure recommended within 4 business days (96 hours) of materiality determination."
      : "Incident loss currently below public disclosure threshold; maintain internal incident response documentation.",
    regulatoryDisclaimers: "Assists with SEC cyber disclosure preparation. Does not constitute certified legal or compliance opinion.",
  });
});
