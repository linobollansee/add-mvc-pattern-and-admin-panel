/**
 * Authentication middleware
 * Checks if user is logged in via session
 */
export function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }

  // Store intended destination for redirect after login
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
}
