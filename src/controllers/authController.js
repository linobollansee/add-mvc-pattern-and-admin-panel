/**
 * Display login form
 */
export function showLogin(req, res) {
  // If already authenticated, redirect to admin
  if (req.session && req.session.isAuthenticated) {
    return res.redirect("/admin/posts");
  }

  res.render("login.njk", {
    title: "Admin Login",
    error: null,
  });
}

/**
 * Handle login submission
 */
export function handleLogin(req, res) {
  const { password } = req.body;

  // Simple password check against environment variable
  if (password === process.env.ADMIN_PASSWORD) {
    req.session.isAuthenticated = true;

    // Redirect to intended destination or admin home
    const returnTo = req.session.returnTo || "/admin/posts";
    delete req.session.returnTo;

    return res.redirect(returnTo);
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
export function handleLogout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/");
  });
}
