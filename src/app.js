import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";
import postRoutes from "./routes/postRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Configure Nunjucks
const env = nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
  watch: true,
});

// Add custom date filter
env.addFilter("date", function (dateString, format) {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: format.includes("h") ? "numeric" : undefined,
    minute: format.includes("m") ? "numeric" : undefined,
  };
  return date.toLocaleDateString("en-US", options);
});

// Add truncate filter
env.addFilter("truncate", function (str, length) {
  if (str.length > length) {
    return str.substring(0, length) + "...";
  }
  return str;
});

app.set("view engine", "njk");

// Session middleware
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
    },
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.get("/", (req, res) => {
  res.redirect("/posts");
});

app.use("/", authRoutes);
app.use("/posts", postRoutes);
app.use("/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("error.njk", {
    message: "Page not found",
    error: { status: 404 },
    title: "404 - Not Found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error.njk", {
    message: "Something went wrong!",
    error: err,
    title: "Error",
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
