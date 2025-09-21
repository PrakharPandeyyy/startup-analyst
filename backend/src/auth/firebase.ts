import type { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

let appInited = false;
function initAdminIfNeeded() {
  if (appInited) return;
  try {
    if (admin.apps.length === 0) {
      admin.initializeApp();
    }
    appInited = true;
  } catch (_) {
    // ignore double-init
    appInited = true;
  }
}

export interface AuthedUser {
  uid: string;
  email?: string;
  roles: ("startup" | "investor")[];
  startupId?: string;
}

function getDevUser(req: Request): AuthedUser | null {
  const debugRole = req.header("x-debug-role") as
    | "startup"
    | "investor"
    | undefined;
  if (!debugRole) return null;
  return {
    uid: "debug-user",
    email: "debug@example.com",
    roles: [debugRole],
    startupId: req.header("x-debug-startup-id") || undefined,
  };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.path.startsWith("/v1/health")) return next();

  // Dev bypass via headers
  const devUser = getDevUser(req);
  if (devUser) {
    (req as any).user = devUser;
    return next();
  }

  initAdminIfNeeded();
  const authz = req.header("authorization") || "";
  const match = authz.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: "unauthorized" });
  const idToken = match[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const rolesClaim =
      (decoded.claims as any)?.roles || (decoded as any)?.roles;
    const roles: AuthedUser["roles"] = Array.isArray(rolesClaim)
      ? rolesClaim.filter((r: any) => r === "startup" || r === "investor")
      : [];
    const user: AuthedUser = {
      uid: decoded.uid,
      email: decoded.email,
      roles,
      startupId: (decoded as any).startupId,
    };
    (req as any).user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token" });
  }
}

export function requireRole(role: "startup" | "investor") {
  return (req: Request, res: Response, next: NextFunction) => {
    const user: AuthedUser | undefined = (req as any).user;
    if (!user) return res.status(401).json({ error: "unauthorized" });
    if (!user.roles.includes(role))
      return res.status(403).json({ error: "forbidden" });
    return next();
  };
}
