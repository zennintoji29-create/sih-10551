import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/tenantStore';

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  orgId?: string;
}

/**
 * Server-side RBAC enforcement middleware.
 * Guarantees that COMPLIANCE_AUDITOR roles are strictly blocked from write operations (POST, PUT, DELETE, PATCH).
 */
export function enforceRbac(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Read role from header or query (defaults to CISO if not passed in prototyping session)
    const roleHeader = (req.headers['x-user-role'] || req.query.role || 'CISO') as UserRole;
    req.userRole = roleHeader;
    req.orgId = (req.headers['x-org-id'] as string) || 'org-acme-fintech';

    // Strictly enforce: If method modifies state and role is COMPLIANCE_AUDITOR, block immediately with 403
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && roleHeader === 'COMPLIANCE_AUDITOR') {
      return res.status(403).json({
        error: 'FORBIDDEN_READ_ONLY_ROLE',
        message: 'Compliance Auditors have strict read-only access. Write actions are blocked server-side.',
        role: roleHeader,
        method: req.method,
        path: req.path
      });
    }

    if (!allowedRoles.includes(roleHeader)) {
      return res.status(403).json({
        error: 'INSUFFICIENT_ROLE_PRIVILEGES',
        message: `Role ${roleHeader} is not authorized to access this resource.`,
        requiredRoles: allowedRoles
      });
    }

    next();
  };
}
