import { dbStore, type DataSourceCategory, type ConnectorMode, type Finding, type AssetRecord } from "../db/store";
import { calculateFair, aggregateEal, attributeChange, type FairResult } from "./fair";
import { simulateVar } from "./var";

export interface IngestionResult {
  category: DataSourceCategory;
  mode: ConnectorMode;
  recordsIngested: number;
  confidence: number;
  newPortfolioEal: number;
  changeAttribution?: {
    assetId: string;
    deltaEal: number;
    primaryDriver: string;
    summary: string;
  };
}

export class IngestionService {
  /**
   * Parse CSV content for Category A (Vulnerabilities)
   * Expected columns: assetId, cve, severity, cvss, exploitability, isPatched
   */
  parseVulnerabilityCsv(orgId: string, csvText: string, mode: ConnectorMode = "manual"): Finding[] {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const assetIdx = headers.findIndex((h) => h.includes("asset"));
    const cveIdx = headers.findIndex((h) => h.includes("cve"));
    const sevIdx = headers.findIndex((h) => h.includes("sev"));
    const cvssIdx = headers.findIndex((h) => h.includes("cvss"));
    const expIdx = headers.findIndex((h) => h.includes("exploit") || h.includes("loss"));
    const patchIdx = headers.findIndex((h) => h.includes("patch"));

    const assets = dbStore.getAssets(orgId);
    const findings: Finding[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (cols.length < 2 || !cols[0]) continue;

      const rawAsset = cols[assetIdx >= 0 ? assetIdx : 0];
      const cve = cols[cveIdx >= 0 ? cveIdx : 1] || `CVE-2026-${1000 + i}`;
      const sev = (cols[sevIdx >= 0 ? sevIdx : 2] || "High") as Finding["severity"];
      const cvss = cvssIdx >= 0 ? parseFloat(cols[cvssIdx]) || 7.5 : 8.0;
      const exploitability = expIdx >= 0 ? parseFloat(cols[expIdx]) || 0.6 : 0.6;
      const isPatched = patchIdx >= 0 ? cols[patchIdx].toLowerCase() === "true" : false;

      // Match asset or default to first
      const matchedAsset = assets.find((a) => a.id === rawAsset || a.name.toLowerCase().includes(rawAsset.toLowerCase())) || assets[0];
      const assetId = matchedAsset ? matchedAsset.id : "ast-payment";
      const assetName = matchedAsset ? matchedAsset.name : "Core Payment Gateway (API)";

      // Financial impact scaled by CVSS and asset criticality
      const financialImpact = isPatched ? 0 : Math.round(cvss * 35000 * (matchedAsset ? matchedAsset.criticality : 0.8));

      findings.push({
        id: `fnd-csv-${Date.now()}-${i}`,
        orgId,
        assetId,
        assetName,
        cve,
        title: `Vulnerability Finding in ${assetName} (${cve})`,
        severity: ["Critical", "High", "Medium", "Low"].includes(sev) ? sev : "High",
        cvssScore: cvss,
        exploitability,
        isPatched,
        inCisaKev: cvss >= 8.5,
        financialImpact,
        sourceMode: mode,
        confidence: mode === "live" ? 0.95 : mode === "manual" ? 0.75 : 0.5,
        discoveredAt: new Date().toISOString(),
      });
    }

    return findings;
  }

  /**
   * Run automated re-calculation for the organization across assets,
   * produce a new snapshot, and generate explainable change attribution.
   */
  recalculateOrganizationRisk(orgId: string, reason: string): IngestionResult {
    const assets = dbStore.getAssets(orgId);
    const existingSnapshots = dbStore.getSnapshots(orgId);
    const prevSnapshot = existingSnapshots[existingSnapshots.length - 1];

    // Compute FAIR for each asset
    const fairResults: FairResult[] = assets.map((a) =>
      calculateFair(
        { assetId: a.id, criticality: a.criticality },
        {
          tef: a.tef,
          vulnerability: a.vulnerability,
          controlEffectiveness: a.controlEffectiveness,
          aiAmplificationFactor: a.aiAmplificationFactor,
        },
        {
          directCosts: a.directCosts,
          indirectCosts: a.indirectCosts,
          regulatoryCosts: a.regulatoryCosts,
        }
      )
    );

    const portfolioEal = aggregateEal(fairResults);
    const varSim = simulateVar(fairResults, { simulations: 5000, confidence: 0.95 });
    const var90Sim = simulateVar(fairResults, { simulations: 2000, confidence: 0.90 });
    const var99Sim = simulateVar(fairResults, { simulations: 2000, confidence: 0.99 });

    // Calculate data confidence index across connectors
    const connectors = dbStore.getConnectors(orgId);
    const avgConfidence = connectors.length > 0 ? connectors.reduce((sum, c) => sum + c.confidence, 0) / connectors.length : 0.85;

    // Change attribution
    let changeAttribution: IngestionResult["changeAttribution"];
    if (prevSnapshot) {
      const delta = portfolioEal - prevSnapshot.portfolioEal;
      const direction = delta >= 0 ? "increased" : "decreased";
      changeAttribution = {
        assetId: assets[0]?.id || "portfolio",
        deltaEal: delta,
        primaryDriver: delta !== 0 ? "telemetry_update" : "none",
        summary: `Portfolio EAL ${direction} by $${Math.abs(Math.round(delta)).toLocaleString()} following ${reason}.`,
      };
    } else {
      changeAttribution = {
        assetId: assets[0]?.id || "portfolio",
        deltaEal: 0,
        primaryDriver: "none",
        summary: `Initial baseline quantification established at $${Math.round(portfolioEal).toLocaleString()} EAL.`,
      };
    }

    // Save snapshot
    const activeFindings = dbStore.getFindings(orgId).filter((f) => !f.isPatched);
    dbStore.addSnapshot(orgId, {
      portfolioEal,
      var90: var90Sim.var,
      var95: varSim.var,
      var99: var99Sim.var,
      dataConfidenceIndex: Number(avgConfidence.toFixed(2)),
      activeFindingsCount: activeFindings.length,
      changeAttribution,
    });

    // Record in audit log
    dbStore.addAuditLog(
      orgId,
      "system-quant",
      "admin",
      "RISK_RECALCULATION",
      `Continuous risk recalculated: EAL $${Math.round(portfolioEal).toLocaleString()} (95% VaR: $${Math.round(varSim.var).toLocaleString()}). Trigger: ${reason}`,
      ["SEC Item 106", "DORA Art. 6"]
    );

    return {
      category: "vulnerability",
      mode: "manual",
      recordsIngested: activeFindings.length,
      confidence: avgConfidence,
      newPortfolioEal: portfolioEal,
      changeAttribution,
    };
  }
}

export const ingestionService = new IngestionService();
