import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { dbStore, type Role, type PlanTier } from "../db/store";

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "aegisrisk-secret-jwt-key";

// Helper to issue tokens
function signToken(userId: string, orgId: string, role: Role) {
  return jwt.sign({ userId, orgId, role }, JWT_SECRET, { expiresIn: "7d" });
}

// Middleware to extract auth and enforce RBAC
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    orgId: string;
    role: Role;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const roleHeader = req.headers["x-user-role"] as Role | undefined;
  const orgHeader = (req.headers["x-org-id"] as string) || "org-aegis-demo";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        userId: decoded.userId,
        orgId: decoded.orgId,
        role: roleHeader || decoded.role,
      };
      return next();
    } catch {
      // fallback to headers if token verification fails in dev mode
    }
  }

  // Support direct persona switching via headers for development and evaluation
  req.user = {
    userId: "u-dev",
    orgId: orgHeader,
    role: roleHeader || "ciso",
  };
  next();
}

export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || "auditor";
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "FORBIDDEN_READ_ONLY_ROLE",
        message: `Role ${userRole.toUpperCase()} does not have write permissions for this resource. Action blocked server-side.`,
        role: userRole,
      });
    }
    next();
  };
}

// POST /api/auth/signup — Create Organization + Admin User
authRouter.post("/signup", (req: Request, res: Response) => {
  const { orgName, domain, plan, adminName, email, password } = req.body;
  if (!orgName || !email) {
    return res.status(400).json({ error: "Organization name and admin email are required" });
  }

  const cleanDomain = domain || email.split("@")[1] || "company.com";
  const org = dbStore.createOrg(orgName, cleanDomain, (plan as PlanTier) || "starter");
  const user = dbStore.createUser(org.id, email, adminName || "Admin User", "admin");
  const token = signToken(user.id, org.id, user.role);

  res.status(201).json({
    success: true,
    token,
    user,
    organization: org,
  });
});

// POST /api/auth/login — Login with email/password or 1-click persona
authRouter.post("/login", (req: Request, res: Response) => {
  const { email, personaRole, orgId = "org-aegis-demo" } = req.body;

  // 1-Click Demo Persona login
  if (personaRole) {
    const role = personaRole.toLowerCase() as Role;
    const users = dbStore.getUsersForOrg(orgId);
    let user = users.find((u) => u.role === role);
    if (!user) {
      user = dbStore.createUser(orgId, `${role}@acme-fin.com`, `${role.toUpperCase()} Persona`, role);
    }
    const token = signToken(user.id, orgId, user.role);
    const org = dbStore.getOrg(orgId);
    return res.json({ success: true, token, user, organization: org });
  }

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = dbStore.getUserByEmail(email);
  if (!user) {
    // If not found, automatically provision for smooth exploration
    const newUser = dbStore.createUser(orgId, email, email.split("@")[0], "ciso");
    const token = signToken(newUser.id, orgId, newUser.role);
    const org = dbStore.getOrg(orgId);
    return res.json({ success: true, token, user: newUser, organization: org });
  }

  const token = signToken(user.id, user.orgId, user.role);
  const org = dbStore.getOrg(user.orgId);
  res.json({ success: true, token, user, organization: org });
});

// GET /api/auth/me — Current user & org details
authRouter.get("/me", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "Unauthenticated" });
  const org = dbStore.getOrg(user.orgId);
  res.json({ user, organization: org });
});

// GET /api/auth/users — List team members for org
authRouter.get("/users", authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const users = dbStore.getUsersForOrg(orgId);
  res.json({ users });
});

// POST /api/auth/invite — Invite teammate with assigned role (Admin only)
authRouter.post("/invite", authMiddleware, requireRole(["admin"]), (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const { email, name, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required" });
  }

  const user = dbStore.createUser(orgId, email, name || email.split("@")[0], role as Role);
  res.status(201).json({ success: true, user });
});

// PATCH /api/auth/users/:id/role — Change user role (Admin only)
authRouter.patch("/users/:id/role", authMiddleware, requireRole(["admin"]), (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user?.orgId || "org-aegis-demo";
  const { id } = req.params;
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: "Role is required" });

  const updated = dbStore.updateUserRole(orgId, id, role as Role, req.user?.userId || "admin");
  if (!updated) return res.status(404).json({ error: "User not found" });
  res.json({ success: true, user: updated });
});
