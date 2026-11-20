import { describe, it, expect } from "vitest";
import express from "express";
import { cisoRouter } from "../routes/ciso";
import { adminRouter } from "../routes/admin";
import { riskRouter } from "../routes/risk";
import { connectorsRouter } from "../routes/connectors";
import { auditRouter } from "../routes/audit";
import { ROLE_HIERARCHY } from "../routes/auth";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/ciso", cisoRouter);
app.use("/api/admin", adminRouter);
app.use("/api/risk", riskRouter);
app.use("/api/connectors", connectorsRouter);
app.use("/api/audit", auditRouter);

// Simple mock request helper
async function makeRequest(path: string, role: string, method = "GET", body?: any) {
  return new Promise<{ status: number; body: any }>((resolve) => {
    const req: any = {
      url: path,
      method,
      headers: {
        "x-user-role": role,
        "x-org-id": "org-aegis-demo",
        "content-type": "application/json",
      },
      body: body || {},
    };

    const res: any = {
      statusCode: 200,
      headers: {},
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      setHeader(k: string, v: string) {
        this.headers[k] = v;
      },
      json(data: any) {
        resolve({ status: this.statusCode, body: data });
      },
      send(data: any) {
        resolve({ status: this.statusCode, body: data });
      },
    };

    (app as any).handle(req, res, () => {
      resolve({ status: 404, body: { error: "Not Found" } });
    });
  });
}

describe("Hierarchical RBAC & Modular Endpoint Security", () => {
  it("verifies hierarchical tier rankings: CISO (4) > Admin (3) > Analyst (2) > Auditor (1)", () => {
    expect(ROLE_HIERARCHY.ciso).toBe(4);
    expect(ROLE_HIERARCHY.admin).toBe(3);
    expect(ROLE_HIERARCHY.analyst).toBe(2);
    expect(ROLE_HIERARCHY.auditor).toBe(1);
    expect(ROLE_HIERARCHY.ciso).toBeGreaterThan(ROLE_HIERARCHY.admin);
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.analyst);
    expect(ROLE_HIERARCHY.analyst).toBeGreaterThan(ROLE_HIERARCHY.auditor);
  });

  describe("Auditor Role (Tier 1: Read-Only Compliance Only)", () => {
    it("BLOCKS Auditor from CISO Executive Cockpit (/api/ciso/cockpit) with 403", async () => {
      const res = await makeRequest("/api/ciso/cockpit", "auditor");
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("INSUFFICIENT_ROLE_PRIVILEGE");
    });

    it("BLOCKS Auditor from Admin User Management (/api/admin/users) with 403", async () => {
      const res = await makeRequest("/api/admin/users", "auditor");
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("INSUFFICIENT_ROLE_PRIVILEGE");
    });

    it("BLOCKS Auditor from Connectors Hub (/api/connectors) with 403", async () => {
      const res = await makeRequest("/api/connectors", "auditor");
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("INSUFFICIENT_ROLE_PRIVILEGE");
    });

    it("BLOCKS Auditor from Risk Findings Triage (/api/risk/findings) with 403", async () => {
      const res = await makeRequest("/api/risk/findings", "auditor");
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("INSUFFICIENT_ROLE_PRIVILEGE");
    });

    it("ALLOWS Auditor to access Audit Logs (/api/audit/logs) with 200", async () => {
      const res = await makeRequest("/api/audit/logs", "auditor");
      expect(res.status).toBe(200);
      expect(res.body.integrityVerified).toBe(true);
    });
  });

  describe("Risk Analyst Role (Tier 2: Risk + Connectors + Audit)", () => {
    it("BLOCKS Analyst from CISO Executive Cockpit (/api/ciso/cockpit) with 403", async () => {
      const res = await makeRequest("/api/ciso/cockpit", "analyst");
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("INSUFFICIENT_ROLE_PRIVILEGE");
    });

    it("BLOCKS Analyst from Admin User Management (/api/admin/users) with 403", async () => {
      const res = await makeRequest("/api/admin/users", "analyst");
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("INSUFFICIENT_ROLE_PRIVILEGE");
    });

    it("ALLOWS Analyst to access Risk Findings (/api/risk/findings) with 200", async () => {
      const res = await makeRequest("/api/risk/findings", "analyst");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.findings)).toBe(true);
    });

    it("ALLOWS Analyst to access Connectors (/api/connectors) with 200", async () => {
      const res = await makeRequest("/api/connectors", "analyst");
      expect(res.status).toBe(200);
    });

    it("ALLOWS Analyst to inspect Audit Logs (/api/audit/logs) with 200", async () => {
      const res = await makeRequest("/api/audit/logs", "analyst");
      expect(res.status).toBe(200);
    });
  });

  describe("Admin Role (Tier 3: Admin + Risk + Connectors + Audit, NO CISO)", () => {
    it("BLOCKS Admin from CISO Executive Cockpit (/api/ciso/cockpit) with 403", async () => {
      const res = await makeRequest("/api/ciso/cockpit", "admin");
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("INSUFFICIENT_ROLE_PRIVILEGE");
    });

    it("ALLOWS Admin to access Admin User Management (/api/admin/users) with 200", async () => {
      const res = await makeRequest("/api/admin/users", "admin");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it("ALLOWS Admin to access Risk Findings (/api/risk/findings) with 200", async () => {
      const res = await makeRequest("/api/risk/findings", "admin");
      expect(res.status).toBe(200);
    });

    it("ALLOWS Admin to access Connectors (/api/connectors) with 200", async () => {
      const res = await makeRequest("/api/connectors", "admin");
      expect(res.status).toBe(200);
    });

    it("ALLOWS Admin to inspect Audit Logs (/api/audit/logs) with 200", async () => {
      const res = await makeRequest("/api/audit/logs", "admin");
      expect(res.status).toBe(200);
    });
  });

  describe("CISO Role (Tier 4: Full System Access to Everything)", () => {
    it("ALLOWS CISO to access Executive Cockpit (/api/ciso/cockpit) with 200", async () => {
      const res = await makeRequest("/api/ciso/cockpit", "ciso");
      expect(res.status).toBe(200);
      expect(res.body.metrics.portfolioEal).toBeGreaterThan(0);
    });

    it("ALLOWS CISO to access Admin User Management (/api/admin/users) with 200", async () => {
      const res = await makeRequest("/api/admin/users", "ciso");
      expect(res.status).toBe(200);
    });

    it("ALLOWS CISO to access Risk Findings (/api/risk/findings) with 200", async () => {
      const res = await makeRequest("/api/risk/findings", "ciso");
      expect(res.status).toBe(200);
    });

    it("ALLOWS CISO to access Connectors (/api/connectors) with 200", async () => {
      const res = await makeRequest("/api/connectors", "ciso");
      expect(res.status).toBe(200);
    });

    it("ALLOWS CISO to inspect Audit Logs (/api/audit/logs) with 200", async () => {
      const res = await makeRequest("/api/audit/logs", "ciso");
      expect(res.status).toBe(200);
    });
  });
});
