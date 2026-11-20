import { Router, Response } from "express";
import { authMiddleware, type AuthenticatedRequest } from "./auth";
import { llmService } from "../services/llm";
import { dbStore } from "../db/store";

export const aiRouter = Router();

aiRouter.use(authMiddleware);

// GET /api/ai/executive-summary — Fetch current AI executive report with chart metrics
aiRouter.get("/executive-summary", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user?.orgId || "org-aegis-demo";
    const report = await llmService.generateExecutiveReport(orgId);
    res.json(report);
  } catch (err: any) {
    console.error("AI Executive Summary Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI executive report" });
  }
});

// POST /api/ai/executive-summary — Trigger fresh on-demand AI scan & board memo generation
aiRouter.post("/executive-summary", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user?.orgId || "org-aegis-demo";
    const report = await llmService.generateExecutiveReport(orgId);

    dbStore.addAuditLog(
      orgId,
      req.user?.userId || "ciso",
      req.user?.role || "ciso",
      "AI_BOARD_REPORT_GENERATED",
      `Generated Groq LLM Executive Cyber Risk & Board Memo (${report.organization.name}). EAL: $${report.metrics.portfolioEal.toLocaleString()}.`,
      ["SEC Item 106", "DORA Art. 16", "NIST CSF ID.RA-1"]
    );

    res.json(report);
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate AI executive synthesis" });
  }
});

// POST /api/ai/chat — Interactive role-aware, tenant-isolated AI Cyber Risk Copilot
aiRouter.post("/chat", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user?.orgId || "org-aegis-demo";
    const role = req.user?.role || "ciso";
    const userId = req.user?.userId || "user";
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const response = await llmService.chatWithCopilot(orgId, role, userId, message.trim(), history || []);

    // Record audit trace for security review if guardrail triggered
    if (response.guardrailTriggered) {
      dbStore.addAuditLog(
        orgId,
        userId,
        role,
        "AI_GUARDRAIL_INTERCEPTION",
        `Intercepted attempt to query credentials/secrets via AI Copilot: "${message.slice(0, 40)}..."`,
        ["SEC Item 106(a)", "SOC2 CC6.1", "Zero-Trust Enforcement"]
      );
    }

    res.json(response);
  } catch (err: any) {
    console.error("AI Copilot Chat Error:", err);
    res.status(500).json({ error: err.message || "Failed to process AI chat query" });
  }
});
