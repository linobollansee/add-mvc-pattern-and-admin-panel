import { Request, Response } from "express";

/**
 * Display login form
 */
export function showLogin(req: Request, res: Response): void {
  // If already authenticated, redirect to admin
  if (req.session && req.session.isAuthenticated) {
    res.redirect("/admin/posts");
    return;
  }

  res.render("login.njk", {
    title: "Admin Login",
    error: null,
  });
}

/**
 * Handle login submission
 */
export function handleLogin(req: Request, res: Response): void {
  const { password } = req.body;

  // Simple password check against environment variable
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAuthenticated = true;

    // Redirect to intended destination or admin home
    const returnTo = req.session.returnTo || "/admin/posts";
    delete req.session.returnTo;

    res.redirect(returnTo);
    return;
  }

  // Login failed
  res.render("login.njk", {
    title: "Admin Login",
    error: "Invalid password. Please try again.",
  });
}

/**
 * Handle logout
 */
export function handleLogout(req: Request, res: Response): void {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/");
  });
}
