# Step-by-Step Guide: Building a Blog with MVC Pattern and Admin Panel

This guide walks through creating a blog application implementing the MVC (Model-View-Controller) pattern with an Admin Control Panel for managing posts.

## Table of Contents

1. [Project Initialization](#1-project-initialization)
2. [Project Structure Setup](#2-project-structure-setup)
3. [Installing Dependencies](#3-installing-dependencies)
4. [Setting Up the Express Application](#4-setting-up-the-express-application)
5. [Creating the Data Model](#5-creating-the-data-model)
6. [Building Controllers](#6-building-controllers)
7. [Setting Up Routes](#7-setting-up-routes)
8. [Creating Views (Templates)](#8-creating-views-templates)
9. [Implementing Authentication Middleware](#9-implementing-authentication-middleware)
10. [Adding the WYSIWYG Editor](#10-adding-the-wysiwyg-editor)
11. [Environment Configuration](#11-environment-configuration)
12. [Testing the Application](#12-testing-the-application)

---

## 1. Project Initialization

### 1.1 Create Project Directory

```bash
mkdir add-mvc-pattern-and-admin-panel
cd add-mvc-pattern-and-admin-panel
```

### 1.2 Initialize npm

```bash
npm init -y
```

### 1.3 Update package.json

Modify the generated `package.json`:

- Add `"type": "module"` to enable ES6 imports
- Set `"main": "src/app.js"`
- Add scripts for starting the application

```json
{
  "name": "blog-mvc-admin",
  "version": "1.0.0",
  "description": "Blog with MVC pattern and admin panel",
  "main": "src/app.js",
  "type": "module",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "keywords": ["blog", "mvc", "express", "nunjucks"],
  "author": "",
  "license": "ISC"
}
```

---

## 2. Project Structure Setup

### 2.1 Create Directory Structure

```bash
# Create main directories
mkdir src public

# Create src subdirectories
mkdir src\controllers src\models src\routes src\views src\middleware src\data

# Create public subdirectories
mkdir public\css public\js

# Create view subdirectories
mkdir src\views\posts src\views\admin src\views\admin\posts
```

### 2.2 Final Structure

```
├── public/
│   ├── css/
│   └── js/
│       └── editor.js
├── src/
│   ├── app.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── postController.js
│   ├── data/
│   │   └── posts.json
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── postModel.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   └── views/
│       ├── layout.njk
│       ├── login.njk
│       ├── error.njk
│       ├── admin/
│       │   ├── layout.njk
│       │   └── posts/
│       │       ├── index.njk
│       │       └── edit.njk
│       └── posts/
│           ├── index.njk
│           └── show.njk
└── package.json
```

---

## 3. Installing Dependencies

### 3.1 Install Production Dependencies

```bash
npm install express nunjucks sanitize-html body-parser express-session dotenv
```

**Package purposes:**

- `express` - Web framework
- `nunjucks` - Template engine
- `sanitize-html` - HTML sanitization for security
- `body-parser` - Parse request bodies (deprecated in newer Express, but included)
- `express-session` - Session management for authentication
- `dotenv` - Environment variable management

### 3.2 Install Development Dependencies

```bash
npm install --save-dev nodemon
```

**Package purposes:**

- `nodemon` - Auto-restart server during development

---

## 4. Setting Up the Express Application

### 4.1 Create `src/app.js`

```javascript
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
```

**Key points:**

- ES6 modules require `fileURLToPath` and `import.meta.url` to get `__dirname`
- Nunjucks configured with autoescape for security
- Custom filters added for date formatting and text truncation
- Session middleware configured before routes
- Static files served from `public/` directory
- Routes mounted at specific paths
- 404 and error handlers at the end

---

## 5. Creating the Data Model

### 5.1 Create `src/data/posts.json`

Initialize with sample data:

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Getting Started with Node.js",
      "slug": "getting-started-with-nodejs",
      "excerpt": "Learn the basics of Node.js and how to build your first server-side application.",
      "content": "<p>Node.js is a powerful JavaScript runtime built on Chrome's V8 JavaScript engine.</p>",
      "author": "John Doe",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "nextId": 2
}
```

### 5.2 Create `src/models/postModel.js`

```javascript
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sanitizeHtml from "sanitize-html";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "../data/posts.json");

// Sanitize options for HTML content
const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title"],
    a: ["href", "target", "rel"],
  },
};

/**
 * Read posts from JSON file
 */
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading posts data:", error);
    return { posts: [], nextId: 1 };
  }
}

/**
 * Write posts to JSON file
 */
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing posts data:", error);
    return false;
  }
}

/**
 * Get all posts
 */
export async function getAllPosts() {
  const data = await readData();
  return data.posts.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Get a single post by ID
 */
export async function getPostById(id) {
  const data = await readData();
  return data.posts.find((post) => post.id === parseInt(id));
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug) {
  const data = await readData();
  return data.posts.find((post) => post.slug === slug);
}

/**
 * Create a new post
 */
export async function createPost(postData) {
  const data = await readData();

  const newPost = {
    id: data.nextId,
    title: postData.title,
    slug: createSlug(postData.title),
    excerpt: postData.excerpt,
    content: sanitizeHtml(postData.content, sanitizeOptions),
    author: postData.author || "Anonymous",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.posts.push(newPost);
  data.nextId += 1;

  const success = await writeData(data);
  return success ? newPost : null;
}

/**
 * Update an existing post
 */
export async function updatePost(id, postData) {
  const data = await readData();
  const index = data.posts.findIndex((post) => post.id === parseInt(id));

  if (index === -1) {
    return null;
  }

  data.posts[index] = {
    ...data.posts[index],
    title: postData.title,
    slug: createSlug(postData.title),
    excerpt: postData.excerpt,
    content: sanitizeHtml(postData.content, sanitizeOptions),
    author: postData.author,
    updatedAt: new Date().toISOString(),
  };

  const success = await writeData(data);
  return success ? data.posts[index] : null;
}

/**
 * Delete a post
 */
export async function deletePost(id) {
  const data = await readData();
  const index = data.posts.findIndex((post) => post.id === parseInt(id));

  if (index === -1) {
    return false;
  }

  data.posts.splice(index, 1);
  return await writeData(data);
}

/**
 * Search posts by title or content
 */
export async function searchPosts(query) {
  const data = await readData();
  const lowerQuery = query.toLowerCase();

  return data.posts
    .filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Create a URL-friendly slug from a title
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
```

**Key points:**

- All HTML content is sanitized using `sanitize-html`
- Async file operations with `fs/promises`
- Auto-generated slugs from titles
- Timestamps automatically managed
- Search functionality across title, excerpt, and content

---

## 6. Building Controllers

### 6.1 Create `src/controllers/postController.js` (Public)

```javascript
import * as postModel from "../models/postModel.js";

/**
 * Display all posts (public view) with pagination
 */
export async function index(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // Posts per page
    const allPosts = await postModel.getAllPosts();

    // Calculate pagination
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const offset = (page - 1) * limit;
    const posts = allPosts.slice(offset, offset + limit);

    res.render("posts/index.njk", {
      posts,
      currentPage: page,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
      title: "Blog Posts",
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).render("error.njk", {
      message: "Error loading blog posts",
      error,
    });
  }
}

/**
 * Display a single post by slug
 */
export async function show(req, res) {
  try {
    const post = await postModel.getPostBySlug(req.params.slug);

    if (!post) {
      return res.status(404).render("error.njk", {
        message: "Post not found",
        error: { status: 404 },
      });
    }

    res.render("posts/show.njk", {
      post,
      title: post.title,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).render("error.njk", {
      message: "Error loading post",
      error,
    });
  }
}
```

### 6.2 Create `src/controllers/adminController.js` (Admin)

```javascript
import * as postModel from "../models/postModel.js";

/**
 * Display admin dashboard with all posts and pagination
 */
export async function index(req, res) {
  try {
    const searchQuery = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Posts per page in admin
    let allPosts;

    if (searchQuery) {
      allPosts = await postModel.searchPosts(searchQuery);
    } else {
      allPosts = await postModel.getAllPosts();
    }

    // Calculate pagination
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const offset = (page - 1) * limit;
    const posts = allPosts.slice(offset, offset + limit);

    res.render("admin/posts/index.njk", {
      posts,
      searchQuery,
      currentPage: page,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
      title: "Admin - Manage Posts",
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).render("error.njk", {
      message: "Error loading posts",
      error,
    });
  }
}

/**
 * Display form to create a new post
 */
export async function create(req, res) {
  res.render("admin/posts/edit.njk", {
    post: null,
    title: "Admin - Create Post",
  });
}

/**
 * Handle post creation
 */
export async function store(req, res) {
  try {
    const { title, excerpt, content, author } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).render("admin/posts/edit.njk", {
        post: req.body,
        error: "Title, excerpt, and content are required",
        title: "Admin - Create Post",
      });
    }

    const newPost = await postModel.createPost({
      title,
      excerpt,
      content,
      author,
    });

    if (newPost) {
      res.redirect("/admin/posts");
    } else {
      throw new Error("Failed to create post");
    }
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).render("admin/posts/edit.njk", {
      post: req.body,
      error: "Error creating post",
      title: "Admin - Create Post",
    });
  }
}

/**
 * Display form to edit an existing post
 */
export async function edit(req, res) {
  try {
    const post = await postModel.getPostById(req.params.id);

    if (!post) {
      return res.status(404).render("error.njk", {
        message: "Post not found",
        error: { status: 404 },
      });
    }

    res.render("admin/posts/edit.njk", {
      post,
      title: `Admin - Edit Post: ${post.title}`,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).render("error.njk", {
      message: "Error loading post",
      error,
    });
  }
}

/**
 * Handle post update
 */
export async function update(req, res) {
  try {
    const { title, excerpt, content, author } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).render("admin/posts/edit.njk", {
        post: { ...req.body, id: req.params.id },
        error: "Title, excerpt, and content are required",
        title: "Admin - Edit Post",
      });
    }

    const updatedPost = await postModel.updatePost(req.params.id, {
      title,
      excerpt,
      content,
      author,
    });

    if (updatedPost) {
      res.redirect("/admin/posts");
    } else {
      throw new Error("Post not found or failed to update");
    }
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).render("admin/posts/edit.njk", {
      post: { ...req.body, id: req.params.id },
      error: "Error updating post",
      title: "Admin - Edit Post",
    });
  }
}

/**
 * Handle post deletion
 */
export async function destroy(req, res) {
  try {
    const success = await postModel.deletePost(req.params.id);

    if (success) {
      res.redirect("/admin/posts");
    } else {
      throw new Error("Post not found or failed to delete");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).render("error.njk", {
      message: "Error deleting post",
      error,
    });
  }
}
```

### 6.3 Create `src/controllers/authController.js`

```javascript
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
```

---

## 7. Setting Up Routes

### 7.1 Create `src/routes/postRoutes.js`

```javascript
import express from "express";
import * as postController from "../controllers/postController.js";

const router = express.Router();

// Public routes for viewing blog posts
router.get("/", postController.index);
router.get("/:slug", postController.show);

export default router;
```

### 7.2 Create `src/routes/adminRoutes.js`

```javascript
import express from "express";
import * as adminController from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all admin routes
router.use(requireAuth);

// Admin routes for managing posts
router.get("/posts", adminController.index);
router.get("/posts/new", adminController.create);
router.post("/posts", adminController.store);
router.get("/posts/:id/edit", adminController.edit);
router.post("/posts/:id", adminController.update);
router.post("/posts/:id/delete", adminController.destroy);

export default router;
```

### 7.3 Create `src/routes/authRoutes.js`

```javascript
import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Login routes
router.get("/login", authController.showLogin);
router.post("/login", authController.handleLogin);

// Logout route
router.get("/logout", authController.handleLogout);

export default router;
```

---

## 8. Creating Views (Templates)

### 8.1 Create `src/views/layout.njk` (Public Layout)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{% block title %}{{ title }}{% endblock %}</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
    />
    {% block head %}{% endblock %}
  </head>
  <body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="/">My Blog</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
            <li class="nav-item">
              <a class="nav-link" href="/posts">Posts</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/admin/posts">Admin</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="container my-5">{% block content %}{% endblock %}</main>

    <footer class="bg-dark text-white text-center py-3 mt-5">
      <div class="container">
        <p class="mb-0">&copy; 2025 My Blog. All rights reserved.</p>
      </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    {% block scripts %}{% endblock %}
  </body>
</html>
```

### 8.2 Create `src/views/admin/layout.njk` (Admin Layout)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{% block title %}{{ title }}{% endblock %}</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css"
    />
    <style>
      .sidebar {
        min-height: calc(100vh - 56px);
        box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
      }
      main {
        padding-top: 2rem;
      }
    </style>
    {% block head %}{% endblock %}
  </head>
  <body>
    <nav class="navbar navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="/admin/posts">
          <i class="bi bi-shield-lock"></i> Admin Panel
        </a>
        <div class="d-flex">
          <a href="/logout" class="btn btn-outline-light btn-sm me-2">
            <i class="bi bi-box-arrow-right"></i> Logout
          </a>
          <a href="/" class="btn btn-outline-light btn-sm">
            <i class="bi bi-box-arrow-left"></i> View Site
          </a>
        </div>
      </div>
    </nav>

    <div class="container-fluid">
      <div class="row">
        <nav class="col-md-2 d-md-block bg-light sidebar">
          <div class="position-sticky pt-3">
            <ul class="nav flex-column">
              <li class="nav-item">
                <a class="nav-link active" href="/admin/posts">
                  <i class="bi bi-file-text"></i> Posts
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <main class="col-md-10 ms-sm-auto px-md-4">
          {% block content %}{% endblock %}
        </main>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    {% block scripts %}{% endblock %}
  </body>
</html>
```

### 8.3 Create `src/views/error.njk`

```html
{% extends "layout.njk" %} {% block content %}
<div class="container text-center">
  <h1 class="display-1">{{ error.status or 500 }}</h1>
  <p class="lead">{{ message }}</p>
  <a href="/" class="btn btn-primary">Go Home</a>
</div>
{% endblock %}
```

### 8.4 Create `src/views/login.njk`

```html
{% extends "layout.njk" %} {% block content %}
<div class="container">
  <div class="row justify-content-center mt-5">
    <div class="col-md-4">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title text-center mb-4">
            <i class="bi bi-shield-lock"></i> Admin Login
          </h3>

          {% if error %}
          <div class="alert alert-danger" role="alert">{{ error }}</div>
          {% endif %}

          <form action="/login" method="POST">
            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                name="password"
                placeholder="Enter admin password"
                required
                autofocus
              />
            </div>

            <div class="d-grid">
              <button type="submit" class="btn btn-primary">
                <i class="bi bi-box-arrow-in-right"></i> Login
              </button>
            </div>
          </form>

          <div class="text-center mt-3">
            <a href="/" class="text-muted small">
              <i class="bi bi-arrow-left"></i> Back to site
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{% endblock %}
```

### 8.5 Create `src/views/posts/index.njk` (Public Post List)

```html
{% extends "layout.njk" %} {% block content %}
<div class="container">
  <h1 class="mb-4">Blog Posts</h1>

  {% if posts.length === 0 %}
  <div class="alert alert-info">No blog posts available yet.</div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    {% for post in posts %}
    <div class="col">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">
            <a href="/posts/{{ post.slug }}" class="text-decoration-none">
              {{ post.title }}
            </a>
          </h5>
          <p class="card-text text-muted small">
            <i class="bi bi-person"></i> {{ post.author }} |
            <i class="bi bi-calendar"></i>
            {{ post.createdAt | date('MMMM D, YYYY') }}
          </p>
          <p class="card-text">{{ post.excerpt }}</p>
        </div>
        <div class="card-footer bg-transparent">
          <a href="/posts/{{ post.slug }}" class="btn btn-sm btn-primary">
            Read more →
          </a>
        </div>
      </div>
    </div>
    {% endfor %}
  </div>
  {% endif %}

  <!-- Pagination -->
  {% if totalPages > 1 %}
  <nav aria-label="Blog posts pagination" class="mt-4">
    <ul class="pagination justify-content-center">
      <li class="page-item {% if not hasPrevious %}disabled{% endif %}">
        <a class="page-link" href="/posts?page={{ currentPage - 1 }}">
          Previous
        </a>
      </li>

      {% for pageNum in range(1, totalPages + 1) %}
      <li class="page-item {% if pageNum === currentPage %}active{% endif %}">
        <a class="page-link" href="/posts?page={{ pageNum }}">{{ pageNum }}</a>
      </li>
      {% endfor %}

      <li class="page-item {% if not hasNext %}disabled{% endif %}">
        <a class="page-link" href="/posts?page={{ currentPage + 1 }}"> Next </a>
      </li>
    </ul>
  </nav>
  {% endif %}
</div>
{% endblock %}
```

### 8.6 Create `src/views/posts/show.njk` (Single Post View)

```html
{% extends "layout.njk" %} {% block content %}
<article class="container">
  <h1 class="mb-3">{{ post.title }}</h1>

  <div class="text-muted mb-4">
    <i class="bi bi-person"></i> {{ post.author }} |
    <i class="bi bi-calendar"></i> {{ post.createdAt | date('MMMM D, YYYY h:mm
    A') }}
  </div>

  <div class="post-content">{{ post.content | safe }}</div>

  <hr class="my-4" />

  <a href="/posts" class="btn btn-secondary">
    <i class="bi bi-arrow-left"></i> Back to Posts
  </a>
</article>
{% endblock %}
```

### 8.7 Create `src/views/admin/posts/index.njk` (Admin Post List)

```html
{% extends "admin/layout.njk" %} {% block content %}
<div
  class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"
>
  <h1 class="h2">Manage Blog Posts</h1>
  <div class="btn-toolbar mb-2 mb-md-0">
    <a href="/admin/posts/new" class="btn btn-primary">
      <i class="bi bi-plus-circle"></i> New Post
    </a>
  </div>
</div>

<div class="row mb-3">
  <div class="col-md-6">
    <form action="/admin/posts" method="GET" class="d-flex">
      <input
        type="search"
        name="search"
        class="form-control me-2"
        placeholder="Search posts..."
        value="{{ searchQuery }}"
      />
      <button type="submit" class="btn btn-outline-secondary">
        <i class="bi bi-search"></i> Search
      </button>
    </form>
  </div>
</div>

{% if posts.length === 0 %}
<div class="alert alert-info">
  {% if searchQuery %} No posts found matching "{{ searchQuery }}". {% else %}
  No posts available. Create your first post! {% endif %}
</div>
{% else %}
<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Author</th>
        <th>Created</th>
        <th>Updated</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {% for post in posts %}
      <tr>
        <td>{{ post.id }}</td>
        <td>
          <strong>{{ post.title }}</strong><br />
          <small class="text-muted">{{ post.excerpt | truncate(60) }}</small>
        </td>
        <td>{{ post.author }}</td>
        <td>{{ post.createdAt | date('MMM D, YYYY') }}</td>
        <td>{{ post.updatedAt | date('MMM D, YYYY') }}</td>
        <td>
          <div class="btn-group btn-group-sm" role="group">
            <a
              href="/posts/{{ post.slug }}"
              class="btn btn-outline-info"
              target="_blank"
              title="View"
            >
              <i class="bi bi-eye"></i>
            </a>
            <a
              href="/admin/posts/{{ post.id }}/edit"
              class="btn btn-outline-primary"
              title="Edit"
            >
              <i class="bi bi-pencil"></i>
            </a>
            <form
              action="/admin/posts/{{ post.id }}/delete"
              method="POST"
              style="display: inline"
              onsubmit="return confirm('Are you sure you want to delete this post?');"
            >
              <button
                type="submit"
                class="btn btn-outline-danger btn-sm"
                title="Delete"
              >
                <i class="bi bi-trash"></i>
              </button>
            </form>
          </div>
        </td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>

<!-- Pagination -->
{% if totalPages > 1 %}
<nav aria-label="Admin posts pagination" class="mt-4">
  <ul class="pagination">
    <li class="page-item {% if not hasPrevious %}disabled{% endif %}">
      <a
        class="page-link"
        href="/admin/posts?page={{ currentPage - 1 }}{% if searchQuery %}&search={{ searchQuery }}{% endif %}"
      >
        Previous
      </a>
    </li>

    {% for pageNum in range(1, totalPages + 1) %}
    <li class="page-item {% if pageNum === currentPage %}active{% endif %}">
      <a
        class="page-link"
        href="/admin/posts?page={{ pageNum }}{% if searchQuery %}&search={{ searchQuery }}{% endif %}"
      >
        {{ pageNum }}
      </a>
    </li>
    {% endfor %}

    <li class="page-item {% if not hasNext %}disabled{% endif %}">
      <a
        class="page-link"
        href="/admin/posts?page={{ currentPage + 1 }}{% if searchQuery %}&search={{ searchQuery }}{% endif %}"
      >
        Next
      </a>
    </li>
  </ul>
</nav>
{% endif %} {% endif %} {% endblock %}
```

### 8.8 Create `src/views/admin/posts/edit.njk` (Create/Edit Post Form)

```html
{% extends "admin/layout.njk" %} {% block head %}
<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
{% endblock %} {% block content %}
<div
  class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"
>
  <h1 class="h2">{% if post %}Edit Post{% else %}Create New Post{% endif %}</h1>
  <div class="btn-toolbar mb-2 mb-md-0">
    <a href="/admin/posts" class="btn btn-outline-secondary">
      <i class="bi bi-arrow-left"></i> Back to Posts
    </a>
  </div>
</div>

{% if error %}
<div class="alert alert-danger alert-dismissible fade show" role="alert">
  {{ error }}
  <button
    type="button"
    class="btn-close"
    data-bs-dismiss="alert"
    aria-label="Close"
  ></button>
</div>
{% endif %}

<form
  action="{% if post %}/admin/posts/{{ post.id }}{% else %}/admin/posts{% endif %}"
  method="POST"
  id="postForm"
>
  <div class="row">
    <div class="col-md-8">
      <div class="mb-3">
        <label for="title" class="form-label">Title *</label>
        <input
          type="text"
          class="form-control"
          id="title"
          name="title"
          value="{{ post.title if post else '' }}"
          required
        />
      </div>

      <div class="mb-3">
        <label for="excerpt" class="form-label">Excerpt *</label>
        <textarea
          class="form-control"
          id="excerpt"
          name="excerpt"
          rows="3"
          required
        >
{{ post.excerpt if post else '' }}</textarea
        >
        <div class="form-text">
          A short summary of the post (shown in listings)
        </div>
      </div>

      <div class="mb-3">
        <label for="content" class="form-label">Content *</label>
        <div id="editor" style="height: 400px">
          {{ post.content | safe if post else '' }}
        </div>
        <input type="hidden" name="content" id="content" />
        <div class="form-text">
          Use the rich text editor to format your content
        </div>
      </div>
    </div>

    <div class="col-md-4">
      <div class="card">
        <div class="card-header">Post Settings</div>
        <div class="card-body">
          <div class="mb-3">
            <label for="author" class="form-label">Author *</label>
            <input
              type="text"
              class="form-control"
              id="author"
              name="author"
              value="{{ post.author if post else 'Anonymous' }}"
              required
            />
          </div>

          {% if post %}
          <div class="mb-3">
            <label class="form-label">Created</label>
            <p class="form-text">
              {{ post.createdAt | date('MMMM D, YYYY h:mm A') }}
            </p>
          </div>

          <div class="mb-3">
            <label class="form-label">Last Updated</label>
            <p class="form-text">
              {{ post.updatedAt | date('MMMM D, YYYY h:mm A') }}
            </p>
          </div>
          {% endif %}

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-save"></i> {% if post %}Update Post{% else
              %}Create Post{% endif %}
            </button>
            <a href="/admin/posts" class="btn btn-secondary">Cancel</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</form>
{% endblock %} {% block scripts %}
<script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
<script src="/js/editor.js"></script>
{% endblock %}
```

---

## 9. Implementing Authentication Middleware

### 9.1 Create `src/middleware/auth.js`

```javascript
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
```

**How it works:**

- Checks for `isAuthenticated` flag in session
- If authenticated, allows request to continue
- If not authenticated, stores the requested URL and redirects to login
- After successful login, user is redirected to their originally requested page

---

## 10. Adding the WYSIWYG Editor

### 10.1 Create `public/js/editor.js`

```javascript
// Initialize Quill editor
const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  },
  placeholder: "Write your post content here...",
});

// Handle form submission
const form = document.getElementById("postForm");
form.addEventListener("submit", function (e) {
  // Get HTML content from Quill
  const content = quill.root.innerHTML;

  // Set it to hidden input
  document.getElementById("content").value = content;

  // Validate content is not empty
  if (quill.getText().trim().length === 0) {
    e.preventDefault();
    alert("Content cannot be empty");
    return false;
  }
});
```

**Key points:**

- Uses Quill.js for WYSIWYG editing
- Includes toolbar with formatting options (headers, lists, links, images, etc.)
- On form submit, extracts HTML from editor and puts it in hidden input field
- Validates that content is not empty before submission
- HTML is automatically sanitized in the model layer

---

## 11. Environment Configuration

### 11.1 Create `.env.example`

```bash
# Session configuration
SESSION_SECRET=your-random-secret-key-here

# Admin authentication
ADMIN_PASSWORD=your-admin-password-here
```

### 11.2 Create `.env` (Not committed to git)

```bash
SESSION_SECRET=my-super-secret-session-key-12345
ADMIN_PASSWORD=admin123
```

### 11.3 Create `.gitignore`

```
node_modules/
.env
```

**Security notes:**

- Never commit `.env` to version control
- Use strong, random values for `SESSION_SECRET`
- Change `ADMIN_PASSWORD` to something secure
- In production, use environment variables from hosting platform

---

## 12. Testing the Application

### 12.1 Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### 12.2 Access the Application

- **Public blog**: http://localhost:3000/
- **Blog posts list**: http://localhost:3000/posts
- **Admin login**: http://localhost:3000/login
- **Admin panel**: http://localhost:3000/admin/posts (requires login)

### 12.3 Test Features

#### Public Features:

1. Browse blog posts (paginated)
2. Click on a post to view full content
3. Navigate between pages

#### Admin Features:

1. Login with password from `.env`
2. View all posts in admin dashboard
3. Search posts by title/content
4. Create a new post using WYSIWYG editor
5. Edit an existing post
6. Delete a post (with confirmation)
7. View posts with pagination
8. Logout

### 12.4 Verify Security Features

1. Try accessing `/admin/posts` without logging in → Should redirect to login
2. After login attempt, verify redirect to originally requested page
3. Check that HTML in posts is sanitized (try adding `<script>` tags)
4. Verify session persists across page reloads
5. Test logout functionality

---

## Key Concepts Implemented

### MVC Pattern:

- **Models** (`src/models/postModel.js`): Handle all data operations and business logic
- **Views** (`src/views/`): Nunjucks templates for rendering HTML
- **Controllers** (`src/controllers/`): Handle HTTP requests, coordinate between models and views

### Security:

- HTML sanitization with `sanitize-html`
- Session-based authentication
- Environment variables for sensitive data
- CSRF protection through POST forms (not GET for destructive actions)

### Features:

- CRUD operations (Create, Read, Update, Delete)
- Pagination for both public and admin views
- Search functionality in admin panel
- WYSIWYG editor (Quill.js)
- URL slugs for SEO-friendly URLs
- Responsive design with Bootstrap

### Best Practices:

- ES6 modules
- Async/await for file operations
- Proper error handling
- Route organization
- Template inheritance
- Separation of concerns

---

## Troubleshooting

### Port Already in Use

If port 3000 is in use, change the `port` variable in `src/app.js`:

```javascript
const port = 3001; // or any available port
```

### Session Not Persisting

Ensure `express-session` is configured before routes and that cookies are enabled in your browser.

### Posts Not Saving

Check file permissions on `src/data/posts.json` and ensure the file exists with valid JSON.

### Editor Not Loading

Verify that the Quill.js CDN links are accessible and that `editor.js` is being loaded correctly.

---

This guide provides a complete walkthrough of building the blog application from scratch following the MVC pattern with all required features implemented.
