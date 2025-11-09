# Building a Blog with MVC Pattern and Admin Panel - Step by Step Tutorial

This tutorial will guide you through building a complete blog application with the MVC pattern, authentication, and an admin panel from scratch.

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Project Structure](#2-project-structure)
3. [TypeScript Configuration](#3-typescript-configuration)
4. [Installing Dependencies](#4-installing-dependencies)
5. [Creating Type Definitions](#5-creating-type-definitions)
6. [Building the Model Layer](#6-building-the-model-layer)
7. [Creating the Controllers](#7-creating-the-controllers)
8. [Setting Up Routes](#8-setting-up-routes)
9. [Building the Views](#9-building-the-views)
10. [Creating the Main Application](#10-creating-the-main-application)
11. [Adding Static Assets](#11-adding-static-assets)
12. [Environment Configuration](#12-environment-configuration)
13. [Running the Application](#13-running-the-application)
14. [Testing Your Application](#14-testing-your-application)

---

## 1. Project Setup

### 1.1 Initialize the Project

```bash
mkdir blog-mvc-admin
cd blog-mvc-admin
npm init -y
```

### 1.2 Initialize Git (Optional)

```bash
git init
```

Create a `.gitignore` file:

```
node_modules/
dist/
.env
*.log
.DS_Store
```

---

## 2. Project Structure

Create the following directory structure:

```bash
mkdir -p src/{controllers,models,views,routes,middleware,types,data}
mkdir -p src/views/{admin,posts}
mkdir -p src/views/admin/posts
mkdir -p public/{css,js}
```

Your structure should look like this:

```
blog-mvc-admin/
├── src/
│   ├── app.ts
│   ├── controllers/
│   ├── models/
│   ├── views/
│   │   ├── admin/
│   │   │   ├── layout.njk
│   │   │   └── posts/
│   │   │       ├── index.njk
│   │   │       └── edit.njk
│   │   ├── posts/
│   │   │   ├── index.njk
│   │   │   └── show.njk
│   │   ├── layout.njk
│   │   ├── login.njk
│   │   └── error.njk
│   ├── routes/
│   ├── middleware/
│   ├── types/
│   └── data/
├── public/
│   ├── css/
│   └── js/
├── package.json
└── tsconfig.json
```

---

## 3. TypeScript Configuration

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "rootDir": "./src",
    "outDir": "./dist",
    "sourceMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

---

## 4. Installing Dependencies

### 4.1 Production Dependencies

```bash
npm install express body-parser dotenv express-session nunjucks sanitize-html
```

### 4.2 Development Dependencies

```bash
npm install -D @types/express @types/express-session @types/node @types/nunjucks @types/sanitize-html nodemon rimraf ts-node typescript
```

### 4.3 Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "postbuild": "xcopy /E /I /Y src\\views dist\\views && xcopy /E /I /Y src\\data dist\\data",
    "start": "node dist/app.js",
    "dev": "nodemon --exec ts-node --esm src/app.ts",
    "watch": "tsc --watch",
    "clean": "rimraf dist",
    "prebuild": "npm run clean"
  }
}
```

**Note:** On macOS/Linux, replace the `postbuild` script with:

```json
"postbuild": "cp -r src/views dist/ && cp -r src/data dist/"
```

---

## 5. Creating Type Definitions

### 5.1 Post Types (`src/types/Post.ts`)

```typescript
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostData {
  posts: Post[];
  nextId: number;
}

export interface CreatePostInput {
  title: string;
  excerpt: string;
  content: string;
  author?: string;
}

export interface UpdatePostInput {
  title: string;
  excerpt: string;
  content: string;
  author: string;
}
```

### 5.2 Session Types (`src/types/Session.ts`)

```typescript
import "express-session";

declare module "express-session" {
  interface SessionData {
    isAuthenticated?: boolean;
    username?: string;
    returnTo?: string;
  }
}

export {};
```

### 5.3 Environment Types (`src/types/Environment.ts`)

```typescript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_SECRET?: string;
      ADMIN_USERNAME?: string;
      ADMIN_PASSWORD?: string;
      NODE_ENV?: "development" | "production";
    }
  }
}

export {};
```

---

## 6. Building the Model Layer

### 6.1 Post Model (`src/models/postModel.ts`)

```typescript
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sanitizeHtml from "sanitize-html";
import type {
  Post,
  PostData,
  CreatePostInput,
  UpdatePostInput,
} from "../types/Post.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "../data/posts.json");

// Sanitize options for HTML content
const sanitizeOptions: sanitizeHtml.IOptions = {
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
async function readData(): Promise<PostData> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data) as PostData;
  } catch (error) {
    console.error("Error reading posts data:", error);
    return { posts: [], nextId: 1 };
  }
}

/**
 * Write posts to JSON file
 */
async function writeData(data: PostData): Promise<boolean> {
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
export async function getAllPosts(): Promise<Post[]> {
  const data = await readData();
  return data.posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Get a single post by ID
 */
export async function getPostById(
  id: number | string
): Promise<Post | undefined> {
  const data = await readData();
  return data.posts.find((post) => post.id === parseInt(id.toString()));
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const data = await readData();
  return data.posts.find((post) => post.slug === slug);
}

/**
 * Create a new post
 */
export async function createPost(
  postData: CreatePostInput
): Promise<Post | null> {
  const data = await readData();

  const newPost: Post = {
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
export async function updatePost(
  id: number | string,
  postData: UpdatePostInput
): Promise<Post | null> {
  const data = await readData();
  const index = data.posts.findIndex(
    (post) => post.id === parseInt(id.toString())
  );

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
export async function deletePost(id: number | string): Promise<boolean> {
  const data = await readData();
  const index = data.posts.findIndex(
    (post) => post.id === parseInt(id.toString())
  );

  if (index === -1) {
    return false;
  }

  data.posts.splice(index, 1);
  return await writeData(data);
}

/**
 * Search posts by title or content
 */
export async function searchPosts(query: string): Promise<Post[]> {
  const data = await readData();
  const lowerQuery = query.toLowerCase();

  return data.posts
    .filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery)
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/**
 * Create a URL-friendly slug from a title
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
```

### 6.2 Create Initial Data (`src/data/posts.json`)

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

---

## 7. Creating the Controllers

### 7.1 Post Controller (`src/controllers/postController.ts`)

```typescript
import { Request, Response } from "express";
import * as postModel from "../models/postModel.js";

/**
 * Display all posts (public view) with pagination
 */
export async function index(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
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
export async function show(req: Request, res: Response): Promise<void> {
  try {
    const post = await postModel.getPostBySlug(req.params.slug);

    if (!post) {
      res.status(404).render("error.njk", {
        message: "Post not found",
        error: { status: 404 },
      });
      return;
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

### 7.2 Admin Controller (`src/controllers/adminController.ts`)

```typescript
import { Request, Response } from "express";
import * as postModel from "../models/postModel.js";

/**
 * Admin dashboard - list all posts with search
 */
export async function index(req: Request, res: Response): Promise<void> {
  try {
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;

    let allPosts = search
      ? await postModel.searchPosts(search)
      : await postModel.getAllPosts();

    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const offset = (page - 1) * limit;
    const posts = allPosts.slice(offset, offset + limit);

    res.render("admin/posts/index.njk", {
      posts,
      search,
      currentPage: page,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
      title: "Manage Posts",
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
 * Show form to create new post
 */
export async function newPost(_req: Request, res: Response): Promise<void> {
  res.render("admin/posts/edit.njk", {
    post: null,
    title: "Create New Post",
  });
}

/**
 * Create a new post
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { title, excerpt, content, author } = req.body;

    if (!title || !excerpt || !content) {
      res.status(400).render("admin/posts/edit.njk", {
        post: req.body,
        error: "Title, excerpt, and content are required",
        title: "Create New Post",
      });
      return;
    }

    await postModel.createPost({ title, excerpt, content, author });
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).render("error.njk", {
      message: "Error creating post",
      error,
    });
  }
}

/**
 * Show form to edit existing post
 */
export async function edit(req: Request, res: Response): Promise<void> {
  try {
    const post = await postModel.getPostById(req.params.id);

    if (!post) {
      res.status(404).render("error.njk", {
        message: "Post not found",
        error: { status: 404 },
      });
      return;
    }

    res.render("admin/posts/edit.njk", {
      post,
      title: `Edit: ${post.title}`,
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
 * Update an existing post
 */
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { title, excerpt, content, author } = req.body;

    if (!title || !excerpt || !content) {
      const post = await postModel.getPostById(req.params.id);
      res.status(400).render("admin/posts/edit.njk", {
        post: { ...post, ...req.body },
        error: "Title, excerpt, and content are required",
        title: `Edit: ${post?.title}`,
      });
      return;
    }

    await postModel.updatePost(req.params.id, {
      title,
      excerpt,
      content,
      author,
    });
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).render("error.njk", {
      message: "Error updating post",
      error,
    });
  }
}

/**
 * Delete a post
 */
export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    await postModel.deletePost(req.params.id);
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).render("error.njk", {
      message: "Error deleting post",
      error,
    });
  }
}
```

### 7.3 Auth Controller (`src/controllers/authController.ts`)

```typescript
import { Request, Response } from "express";

/**
 * Show login form
 */
export function loginForm(req: Request, res: Response): void {
  if (req.session.isAuthenticated) {
    res.redirect("/admin");
    return;
  }
  res.render("login.njk", { title: "Login" });
}

/**
 * Process login
 */
export function login(req: Request, res: Response): void {
  const { username, password } = req.body;

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "password";

  if (username === adminUsername && password === adminPassword) {
    req.session.isAuthenticated = true;
    req.session.username = username;

    const returnTo = req.session.returnTo || "/admin";
    delete req.session.returnTo;

    res.redirect(returnTo);
  } else {
    res.render("login.njk", {
      error: "Invalid username or password",
      title: "Login",
    });
  }
}

/**
 * Process logout
 */
export function logout(req: Request, res: Response): void {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/login");
  });
}
```

---

## 8. Setting Up Routes

### 8.1 Auth Middleware (`src/middleware/auth.ts`)

```typescript
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
```

### 8.2 Post Routes (`src/routes/postRoutes.ts`)

```typescript
import { Router } from "express";
import * as postController from "../controllers/postController.js";

const router = Router();

router.get("/", postController.index);
router.get("/:slug", postController.show);

export default router;
```

### 8.3 Auth Routes (`src/routes/authRoutes.ts`)

```typescript
import { Router } from "express";
import * as authController from "../controllers/authController.js";

const router = Router();

router.get("/login", authController.loginForm);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

export default router;
```

### 8.4 Admin Routes (`src/routes/adminRoutes.ts`)

```typescript
import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Apply authentication to all admin routes
router.use(requireAuth);

router.get("/", (_req, res) => res.redirect("/admin/posts"));
router.get("/posts", adminController.index);
router.get("/posts/new", adminController.newPost);
router.post("/posts", adminController.create);
router.get("/posts/:id/edit", adminController.edit);
router.post("/posts/:id", adminController.update);
router.post("/posts/:id/delete", adminController.deletePost);

export default router;
```

---

## 9. Building the Views

### 9.1 Main Layout (`src/views/layout.njk`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ title | default("Blog") }}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      header {
        background: #fff;
        border-bottom: 2px solid #e0e0e0;
        margin-bottom: 30px;
      }
      header .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      h1 {
        font-size: 24px;
      }
      nav a {
        margin-left: 20px;
        color: #0066cc;
        text-decoration: none;
      }
      nav a:hover {
        text-decoration: underline;
      }
      main {
        background: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      footer {
        text-align: center;
        padding: 20px;
        color: #666;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <header>
      <div class="container">
        <h1>📝 Blog</h1>
        <nav>
          <a href="/posts">Home</a>
          <a href="/admin">Admin</a>
        </nav>
      </div>
    </header>
    <div class="container">
      <main>{% block content %}{% endblock %}</main>
    </div>
    <footer>
      <p>&copy; 2025 Blog MVC Admin</p>
    </footer>
  </body>
</html>
```

### 9.2 Posts Index (`src/views/posts/index.njk`)

```html
{% extends "layout.njk" %} {% block content %}
<h2>Blog Posts</h2>
<div style="margin-top: 30px;">
  {% for post in posts %}
  <article
    style="margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #e0e0e0;"
  >
    <h3>
      <a
        href="/posts/{{ post.slug }}"
        style="color: #0066cc; text-decoration: none;"
        >{{ post.title }}</a
      >
    </h3>
    <p style="color: #666; font-size: 14px; margin: 10px 0;">
      By {{ post.author }} on {{ post.createdAt | date("F j, Y") }}
    </p>
    <p>{{ post.excerpt }}</p>
    <a
      href="/posts/{{ post.slug }}"
      style="color: #0066cc; text-decoration: none; font-weight: 500;"
      >Read more →</a
    >
  </article>
  {% else %}
  <p>No posts found.</p>
  {% endfor %}
</div>

{% if totalPages > 1 %}
<div
  style="display: flex; justify-content: center; gap: 10px; margin-top: 30px;"
>
  {% if hasPrevious %}
  <a
    href="?page={{ currentPage - 1 }}"
    style="padding: 8px 16px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px;"
    >← Previous</a
  >
  {% endif %}
  <span style="padding: 8px 16px;"
    >Page {{ currentPage }} of {{ totalPages }}</span
  >
  {% if hasNext %}
  <a
    href="?page={{ currentPage + 1 }}"
    style="padding: 8px 16px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px;"
    >Next →</a
  >
  {% endif %}
</div>
{% endif %} {% endblock %}
```

### 9.3 Post Show (`src/views/posts/show.njk`)

```html
{% extends "layout.njk" %} {% block content %}
<article>
  <h2>{{ post.title }}</h2>
  <p style="color: #666; font-size: 14px; margin: 10px 0 30px;">
    By {{ post.author }} on {{ post.createdAt | date("F j, Y") }}
  </p>
  <div style="line-height: 1.8;">{{ post.content | safe }}</div>
</article>
<div style="margin-top: 30px;">
  <a href="/posts" style="color: #0066cc; text-decoration: none;"
    >← Back to all posts</a
  >
</div>
{% endblock %}
```

### 9.4 Login (`src/views/login.njk`)

```html
{% extends "layout.njk" %} {% block content %}
<div style="max-width: 400px; margin: 0 auto;">
  <h2>Admin Login</h2>

  {% if error %}
  <div
    style="background: #fee; color: #c33; padding: 10px; border-radius: 4px; margin: 20px 0;"
  >
    {{ error }}
  </div>
  {% endif %}

  <form method="POST" action="/login" style="margin-top: 20px;">
    <div style="margin-bottom: 15px;">
      <label style="display: block; margin-bottom: 5px; font-weight: 500;"
        >Username</label
      >
      <input
        type="text"
        name="username"
        required
        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
      />
    </div>
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; font-weight: 500;"
        >Password</label
      >
      <input
        type="password"
        name="password"
        required
        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
      />
    </div>
    <button
      type="submit"
      style="width: 100%; padding: 10px; background: #0066cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
    >
      Login
    </button>
  </form>
</div>
{% endblock %}
```

### 9.5 Error Page (`src/views/error.njk`)

```html
{% extends "layout.njk" %} {% block content %}
<h2>Error</h2>
<p>{{ message }}</p>
{% if error.status %}
<p><strong>Status:</strong> {{ error.status }}</p>
{% endif %} {% endblock %}
```

### 9.6 Admin Layout (`src/views/admin/layout.njk`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ title | default("Admin") }}</title>
    <link
      href="https://cdn.quilljs.com/1.3.6/quill.snow.css"
      rel="stylesheet"
    />
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: system-ui, -apple-system, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
      }
      .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
      }
      header {
        background: #2c3e50;
        color: white;
        margin-bottom: 30px;
      }
      header .container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
      }
      h1 {
        font-size: 24px;
      }
      nav a {
        margin-left: 20px;
        color: white;
        text-decoration: none;
      }
      nav a:hover {
        text-decoration: underline;
      }
      main {
        background: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .btn {
        display: inline-block;
        padding: 10px 20px;
        background: #0066cc;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        border: none;
        cursor: pointer;
      }
      .btn:hover {
        background: #0052a3;
      }
      .btn-danger {
        background: #dc3545;
      }
      .btn-danger:hover {
        background: #bd2130;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th,
      td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        background: #f8f9fa;
        font-weight: 600;
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
      }
      input[type="text"],
      textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      #editor {
        height: 300px;
        background: white;
      }
    </style>
  </head>
  <body>
    <header>
      <div class="container">
        <h1>🔐 Admin Panel</h1>
        <nav>
          <a href="/posts">View Site</a>
          <a href="/admin/posts">Manage Posts</a>
          <a href="/logout">Logout</a>
        </nav>
      </div>
    </header>
    <div class="container">
      <main>{% block content %}{% endblock %}</main>
    </div>
    <script src="https://cdn.quilljs.com/1.3.6/quill.js"></script>
    <script src="/js/editor.js"></script>
  </body>
</html>
```

### 9.7 Admin Posts Index (`src/views/admin/posts/index.njk`)

```html
{% extends "admin/layout.njk" %} {% block content %}
<div
  style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;"
>
  <h2>Manage Posts</h2>
  <a href="/admin/posts/new" class="btn">+ New Post</a>
</div>

<form method="GET" style="margin-bottom: 20px;">
  <input
    type="text"
    name="search"
    placeholder="Search posts..."
    value="{{ search }}"
    style="width: 300px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
  />
  <button type="submit" class="btn">Search</button>
  {% if search %}
  <a href="/admin/posts" class="btn">Clear</a>
  {% endif %}
</form>

<table>
  <thead>
    <tr>
      <th>Title</th>
      <th>Author</th>
      <th>Created</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {% for post in posts %}
    <tr>
      <td>
        <a href="/posts/{{ post.slug }}" target="_blank">{{ post.title }}</a>
      </td>
      <td>{{ post.author }}</td>
      <td>{{ post.createdAt | date("F j, Y") }}</td>
      <td>
        <a
          href="/admin/posts/{{ post.id }}/edit"
          class="btn"
          style="padding: 5px 10px; font-size: 14px;"
          >Edit</a
        >
        <form
          method="POST"
          action="/admin/posts/{{ post.id }}/delete"
          style="display: inline;"
        >
          <button
            type="submit"
            class="btn btn-danger"
            style="padding: 5px 10px; font-size: 14px;"
            onclick="return confirm('Are you sure?')"
          >
            Delete
          </button>
        </form>
      </td>
    </tr>
    {% else %}
    <tr>
      <td colspan="4">No posts found.</td>
    </tr>
    {% endfor %}
  </tbody>
</table>

{% if totalPages > 1 %}
<div
  style="display: flex; justify-content: center; gap: 10px; margin-top: 30px;"
>
  {% if hasPrevious %}
  <a
    href="?page={{ currentPage - 1 }}{% if search %}&search={{ search }}{% endif %}"
    class="btn"
    >← Previous</a
  >
  {% endif %}
  <span style="padding: 10px 20px;"
    >Page {{ currentPage }} of {{ totalPages }}</span
  >
  {% if hasNext %}
  <a
    href="?page={{ currentPage + 1 }}{% if search %}&search={{ search }}{% endif %}"
    class="btn"
    >Next →</a
  >
  {% endif %}
</div>
{% endif %} {% endblock %}
```

### 9.8 Admin Edit Post (`src/views/admin/posts/edit.njk`)

```html
{% extends "admin/layout.njk" %} {% block content %}
<h2>{{ "Edit Post" if post else "Create New Post" }}</h2>

{% if error %}
<div
  style="background: #fee; color: #c33; padding: 10px; border-radius: 4px; margin: 20px 0;"
>
  {{ error }}
</div>
{% endif %}

<form
  method="POST"
  action="{{ '/admin/posts/' + post.id if post else '/admin/posts' }}"
  style="margin-top: 30px;"
>
  <div class="form-group">
    <label>Title *</label>
    <input type="text" name="title" value="{{ post.title if post }}" required />
  </div>

  <div class="form-group">
    <label>Author</label>
    <input
      type="text"
      name="author"
      value="{{ post.author if post else 'Anonymous' }}"
    />
  </div>

  <div class="form-group">
    <label>Excerpt *</label>
    <textarea name="excerpt" rows="3" required>
{{ post.excerpt if post }}</textarea
    >
  </div>

  <div class="form-group">
    <label>Content *</label>
    <div id="editor">{{ post.content | safe if post }}</div>
    <input type="hidden" name="content" id="content-input" />
  </div>

  <div style="display: flex; gap: 10px;">
    <button type="submit" class="btn">Save Post</button>
    <a href="/admin/posts" class="btn" style="background: #6c757d;">Cancel</a>
  </div>
</form>
{% endblock %}
```

---

## 10. Creating the Main Application

### 10.1 Main App File (`src/app.ts`)

```typescript
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import dotenv from "dotenv";
import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";
import postRoutes from "./routes/postRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import "./types/Session.js";

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
env.addFilter("date", function (dateString: string, format: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: format.includes("h") ? "numeric" : undefined,
    minute: format.includes("m") ? "numeric" : undefined,
  };
  return date.toLocaleDateString("en-US", options);
});

// Add truncate filter
env.addFilter("truncate", function (str: string, length: number): string {
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
app.get("/", (_req: Request, res: Response) => {
  res.redirect("/posts");
});

app.use("/", authRoutes);
app.use("/posts", postRoutes);
app.use("/admin", adminRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).render("error.njk", {
    message: "Page not found",
    error: { status: 404 },
    title: "404 - Not Found",
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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

---

## 11. Adding Static Assets

### 11.1 WYSIWYG Editor JavaScript (`public/js/editor.js`)

```javascript
// Initialize Quill editor on edit/new post pages
document.addEventListener("DOMContentLoaded", function () {
  const editorElement = document.getElementById("editor");

  if (editorElement) {
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
          ["clean"],
        ],
      },
      placeholder: "Write your post content here...",
    });

    // Handle form submission
    const form = editorElement.closest("form");
    const contentInput = document.getElementById("content-input");

    if (form && contentInput) {
      form.addEventListener("submit", function (e) {
        // Get HTML content from Quill
        const html = quill.root.innerHTML;
        contentInput.value = html;
      });
    }
  }
});
```

### 11.2 Optional: Add CSS (`public/css/style.css`)

You can create additional styling if needed. The tutorial uses inline styles for simplicity.

---

## 12. Environment Configuration

### 12.1 Create `.env` File

Create a `.env` file in the project root:

```env
SESSION_SECRET=your-super-secret-session-key-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NODE_ENV=development
```

**Important:** Never commit the `.env` file to version control. Add it to `.gitignore`.

### 12.2 Environment Variables Explained

- `SESSION_SECRET`: Secret key for session encryption (use a random string in production)
- `ADMIN_USERNAME`: Admin login username
- `ADMIN_PASSWORD`: Admin login password (use a hashed password in production)
- `NODE_ENV`: Development or production mode

---

## 13. Running the Application

### 13.1 Development Mode

```bash
npm run dev
```

This starts the application with auto-reload using `nodemon`.

### 13.2 Production Build

```bash
npm run build
npm start
```

### 13.3 Access the Application

- **Public Blog**: http://localhost:3000/posts
- **Admin Panel**: http://localhost:3000/admin
- **Login**: http://localhost:3000/login

Default credentials (from `.env`):

- Username: `admin`
- Password: `admin123`

---

## 14. Testing Your Application

### 14.1 Test Public Routes

1. Navigate to http://localhost:3000/posts
2. Verify posts are displayed with pagination
3. Click on a post to view the full content
4. Test pagination if you have more than 6 posts

### 14.2 Test Authentication

1. Go to http://localhost:3000/admin (should redirect to login)
2. Try logging in with incorrect credentials (should show error)
3. Log in with correct credentials (should redirect to admin panel)

### 14.3 Test Admin Features

1. **View posts**: Check the posts list in admin panel
2. **Search**: Use the search feature to find posts
3. **Create post**: Click "New Post" and create a post with WYSIWYG editor
4. **Edit post**: Edit an existing post
5. **Delete post**: Delete a post (with confirmation)
6. **Logout**: Test logout functionality

### 14.4 Test WYSIWYG Editor

1. Create or edit a post
2. Use various formatting options (bold, italic, lists, links, images)
3. Save and verify HTML is properly sanitized
4. View the post on the public site

---

## Next Steps & Enhancements

### Security Improvements

- Use bcrypt for password hashing
- Add CSRF protection
- Implement rate limiting
- Add input validation library (e.g., Joi, express-validator)

### Features

- Add categories and tags
- Implement comment system
- Add image upload functionality
- Create an API endpoint for headless usage
- Add user management (multiple admins)

### Performance

- Add Redis for session storage
- Implement caching layer
- Add database instead of JSON file (MongoDB, PostgreSQL)
- Add full-text search (Elasticsearch)

### Development

- Add unit and integration tests (Jest, Supertest)
- Set up ESLint and Prettier
- Add CI/CD pipeline
- Containerize with Docker

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, change it in `src/app.ts`:

```typescript
const port = 3001; // or any available port
```

### Module Resolution Errors

Make sure `"type": "module"` is in your `package.json` and all imports use `.js` extensions.

### Views Not Found

Check that `postbuild` script correctly copies the `views` directory to `dist/` after building.

### Session Not Persisting

Ensure you have `SESSION_SECRET` in your `.env` file and the session middleware is properly configured.

---

## Congratulations! 🎉

You've successfully built a complete blog application with:

- ✅ MVC architecture pattern
- ✅ Authentication system
- ✅ Admin panel for CRUD operations
- ✅ WYSIWYG editor
- ✅ HTML sanitization
- ✅ Pagination
- ✅ Search functionality
- ✅ TypeScript for type safety

Happy coding!
