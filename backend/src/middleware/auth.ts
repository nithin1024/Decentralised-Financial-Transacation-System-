import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { env } from "../env.js";
import type { UserRole } from "../models/User.js";

export type AuthClaims = {
  sub: string; // wallet
  role: UserRole;
};

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    // eslint-disable-next-line no-unused-vars
    interface Request {
      auth?: AuthClaims;
    }
  }
}

export function signJwt(claims: AuthClaims): string {
  return jwt.sign(claims, env.JWT_SECRET, { expiresIn: "12h" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) return res.status(401).json({ error: "missing_token" });
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthClaims;
    req.auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) return res.status(401).json({ error: "missing_token" });
    if (req.auth.role !== role) return res.status(403).json({ error: "forbidden" });
    return next();
  };
}

