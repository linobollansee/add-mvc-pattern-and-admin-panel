import { Request, Response, NextFunction } from "express";

/**
 * Authentication middleware
 * Checks if user is logged in via session
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }

  // Store intended destination for redirect after login
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
}
