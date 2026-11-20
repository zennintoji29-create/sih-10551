import { Router, Response } from "express";
import { dbStore, type Role } from "../db/store";
import { authMiddleware, requireMinRole, type AuthenticatedRequest } from "./auth";

export const adminRouter = Router();

// Enforce Admin or higher (Tier 3: Admin, Tier 4: CISO)
adminRouter.use(authMiddleware);
adminRouter.use(requireMinRole("admin"));

// GET /api/admin/users — List teammates
adminRouter.get("/users", (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const users = dbStore.getUsersForOrg(orgId);
  res.json({ users, count: users.length });
});

// POST /api/admin/invite — Invite teammate with assigned role
adminRouter.post("/invite", (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const { email, name, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required" });
  }

  const user = dbStore.createUser(orgId, email, name || email.split("@")[0], role as Role);
  dbStore.addAuditLog(
    orgId,
    req.user?.userId || "admin",
    req.user?.role || "admin",
    "USER_INVITED",
    `Teammate ${email} invited with role '${role}'.`,
    ["RBAC_AUDIT"]
  );

  res.status(201).json({ success: true, user });
});

// PATCH /api/admin/users/:id/role — Change teammate role
adminRouter.patch("/users/:id/role", (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const { id } = req.params;
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: "Role is required" });

  const updated = dbStore.updateUserRole(orgId, id, role as Role, req.user?.userId || "admin");
  if (!updated) return res.status(404).json({ error: "User not found" });

  dbStore.addAuditLog(
    orgId,
    req.user?.userId || "admin",
    req.user?.role || "admin",
    "ROLE_MODIFIED",
    `User ${id} role modified to '${role}'.`,
    ["RBAC_AUDIT", "SOC2_CC6.3"]
  );

  res.json({ success: true, user: updated });
});

// GET /api/admin/tenant — Tenant governance settings & active plan
adminRouter.get("/tenant", (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const org = dbStore.getOrg(orgId);
  res.json({
    tenant: org,
    limits: {
      maxAssets: org?.plan === "enterprise" ? 5000 : 50,
      continuousIngestion: true,
      apiAccess: true,
      dataRetentionDays: 365,
    },
  });
});
