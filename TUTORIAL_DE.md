# Blog mit MVC-Muster und Admin-Panel erstellen - Schritt-für-Schritt-Tutorial

Dieses Tutorial führt Sie durch den Aufbau einer vollständigen Blog-Anwendung mit MVC-Muster, Authentifizierung und Admin-Panel von Grund auf.

## Inhaltsverzeichnis

1. [Projekt-Setup](#1-projekt-setup)
2. [Projektstruktur](#2-projektstruktur)
3. [TypeScript-Konfiguration](#3-typescript-konfiguration)
4. [Abhängigkeiten installieren](#4-abhängigkeiten-installieren)
5. [Typ-Definitionen erstellen](#5-typ-definitionen-erstellen)
6. [Model-Layer aufbauen](#6-model-layer-aufbauen)
7. [Controller erstellen](#7-controller-erstellen)
8. [Routen einrichten](#8-routen-einrichten)
9. [Views erstellen](#9-views-erstellen)
10. [Hauptanwendung erstellen](#10-hauptanwendung-erstellen)
11. [Statische Assets hinzufügen](#11-statische-assets-hinzufügen)
12. [Umgebungskonfiguration](#12-umgebungskonfiguration)
13. [Anwendung ausführen](#13-anwendung-ausführen)
14. [Anwendung testen](#14-anwendung-testen)

---

## 1. Projekt-Setup

### 1.1 Projekt initialisieren

```powershell
mkdir blog-mvc-admin
cd blog-mvc-admin
npm init -y
```

### 1.2 Git initialisieren (Optional)

```powershell
git init
```

`.gitignore`-Datei erstellen:

```
node_modules/
dist/
.env
*.log
.DS_Store
```

---

## 2. Projektstruktur

Folgende Verzeichnisstruktur erstellen:

```powershell
New-Item -Path "src\controllers","src\models","src\views","src\routes","src\middleware","src\types","src\data" -ItemType Directory -Force
New-Item -Path "src\views\admin","src\views\posts" -ItemType Directory -Force
New-Item -Path "src\views\admin\posts" -ItemType Directory -Force
New-Item -Path "public\css","public\js" -ItemType Directory -Force
```

Ihre Struktur sollte so aussehen:

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

## 3. TypeScript-Konfiguration

`tsconfig.json` erstellen:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
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

## 4. Abhängigkeiten installieren

### 4.1 Produktions-Abhängigkeiten

```powershell
npm install express body-parser dotenv express-session nunjucks sanitize-html
```

### 4.2 Entwicklungs-Abhängigkeiten

```powershell
npm install -D @types/express @types/express-session @types/node @types/nunjucks @types/sanitize-html nodemon rimraf ts-node typescript
```

### 4.3 package.json-Skripte aktualisieren

Diese Skripte zu Ihrer `package.json` hinzufügen:

```json
{
  "scripts": {
    "build": "tsc",
    "postbuild": "xcopy /E /I /Y src\\views dist\\views && xcopy /E /I /Y src\\data dist\\data",
    "start": "node dist/app.js",
    "dev": "nodemon --exec ts-node src/app.ts",
    "watch": "tsc --watch",
    "clean": "rimraf dist",
    "prebuild": "npm run clean"
  }
}
```

---

## 5. Typ-Definitionen erstellen

### 5.1 Post-Typen (`src/types/Post.ts`)

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

### 5.2 Session-Typen (`src/types/Session.ts`)

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

### 5.3 Umgebungs-Typen (`src/types/Environment.ts`)

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

## 6. Model-Layer aufbauen

### 6.1 Post-Model (`src/models/postModel.ts`)

```typescript
import fs from "fs/promises";
import path from "path";
import sanitizeHtml from "sanitize-html";
import type {
  Post,
  PostData,
  CreatePostInput,
  UpdatePostInput,
} from "../types/Post";

const DATA_FILE = path.join(__dirname, "../data/posts.json");

// Bereinigungsoptionen für HTML-Inhalte
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title"],
    a: ["href", "target", "rel"],
  },
};

/**
 * Posts aus JSON-Datei lesen
 */
async function readData(): Promise<PostData> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data) as PostData;
  } catch (error) {
    console.error("Fehler beim Lesen der Posts-Daten:", error);
    return { posts: [], nextId: 1 };
  }
}

/**
 * Posts in JSON-Datei schreiben
 */
async function writeData(data: PostData): Promise<boolean> {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Fehler beim Schreiben der Posts-Daten:", error);
    return false;
  }
}

/**
 * Alle Posts abrufen
 */
export async function getAllPosts(): Promise<Post[]> {
  const data = await readData();
  return data.posts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Einzelnen Post nach ID abrufen
 */
export async function getPostById(
  id: number | string
): Promise<Post | undefined> {
  const data = await readData();
  return data.posts.find((post) => post.id === parseInt(id.toString()));
}

/**
 * Einzelnen Post nach Slug abrufen
 */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const data = await readData();
  return data.posts.find((post) => post.slug === slug);
}

/**
 * Neuen Post erstellen
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
 * Bestehenden Post aktualisieren
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
 * Post löschen
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
 * Posts nach Titel oder Inhalt durchsuchen
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
 * URL-freundlichen Slug aus Titel erstellen
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

### 6.2 Initiale Daten erstellen (`src/data/posts.json`)

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Erste Schritte mit Node.js",
      "slug": "erste-schritte-mit-nodejs",
      "excerpt": "Lernen Sie die Grundlagen von Node.js und wie Sie Ihre erste serverseitige Anwendung erstellen.",
      "content": "<p>Node.js ist eine leistungsstarke JavaScript-Laufzeitumgebung, die auf der V8-JavaScript-Engine von Chrome basiert.</p>",
      "author": "Max Mustermann",
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "nextId": 2
}
```

---

## 7. Controller erstellen

### 7.1 Post-Controller (`src/controllers/postController.ts`)

```typescript
import { Request, Response } from "express";
import * as postModel from "../models/postModel.js";

/**
 * Alle Posts anzeigen (öffentliche Ansicht) mit Paginierung
 */
export async function index(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 6; // Posts pro Seite
    const allPosts = await postModel.getAllPosts();

    // Paginierung berechnen
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
      title: "Blog-Beiträge",
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Posts:", error);
    res.status(500).render("error.njk", {
      message: "Fehler beim Laden der Blog-Beiträge",
      error,
    });
  }
}

/**
 * Einzelnen Post nach Slug anzeigen
 */
export async function show(req: Request, res: Response): Promise<void> {
  try {
    const post = await postModel.getPostBySlug(req.params.slug);

    if (!post) {
      res.status(404).render("error.njk", {
        message: "Beitrag nicht gefunden",
        error: { status: 404 },
      });
      return;
    }

    res.render("posts/show.njk", {
      post,
      title: post.title,
    });
  } catch (error) {
    console.error("Fehler beim Abrufen des Posts:", error);
    res.status(500).render("error.njk", {
      message: "Fehler beim Laden des Beitrags",
      error,
    });
  }
}
```

### 7.2 Admin-Controller (`src/controllers/adminController.ts`)

```typescript
import { Request, Response } from "express";
import * as postModel from "../models/postModel.js";

/**
 * Admin-Dashboard - alle Posts mit Suche auflisten
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
      title: "Beiträge verwalten",
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Posts:", error);
    res.status(500).render("error.njk", {
      message: "Fehler beim Laden der Beiträge",
      error,
    });
  }
}

/**
 * Formular zum Erstellen eines neuen Posts anzeigen
 */
export async function newPost(_req: Request, res: Response): Promise<void> {
  res.render("admin/posts/edit.njk", {
    post: null,
    title: "Neuen Beitrag erstellen",
  });
}

/**
 * Neuen Post erstellen
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { title, excerpt, content, author } = req.body;

    if (!title || !excerpt || !content) {
      res.status(400).render("admin/posts/edit.njk", {
        post: req.body,
        error: "Titel, Auszug und Inhalt sind erforderlich",
        title: "Neuen Beitrag erstellen",
      });
      return;
    }

    await postModel.createPost({ title, excerpt, content, author });
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("Fehler beim Erstellen des Posts:", error);
    res.status(500).render("error.njk", {
      message: "Fehler beim Erstellen des Beitrags",
      error,
    });
  }
}

/**
 * Formular zum Bearbeiten eines bestehenden Posts anzeigen
 */
export async function edit(req: Request, res: Response): Promise<void> {
  try {
    const post = await postModel.getPostById(req.params.id);

    if (!post) {
      res.status(404).render("error.njk", {
        message: "Beitrag nicht gefunden",
        error: { status: 404 },
      });
      return;
    }

    res.render("admin/posts/edit.njk", {
      post,
      title: `Bearbeiten: ${post.title}`,
    });
  } catch (error) {
    console.error("Fehler beim Abrufen des Posts:", error);
    res.status(500).render("error.njk", {
      message: "Fehler beim Laden des Beitrags",
      error,
    });
  }
}

/**
 * Bestehenden Post aktualisieren
 */
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { title, excerpt, content, author } = req.body;

    if (!title || !excerpt || !content) {
      const post = await postModel.getPostById(req.params.id);
      res.status(400).render("admin/posts/edit.njk", {
        post: { ...post, ...req.body },
        error: "Titel, Auszug und Inhalt sind erforderlich",
        title: `Bearbeiten: ${post?.title}`,
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
    console.error("Fehler beim Aktualisieren des Posts:", error);
    res.status(500).render("error.njk", {
      message: "Fehler beim Aktualisieren des Beitrags",
      error,
    });
  }
}

/**
 * Post löschen
 */
export async function deletePost(req: Request, res: Response): Promise<void> {
  try {
    await postModel.deletePost(req.params.id);
    res.redirect("/admin/posts");
  } catch (error) {
    console.error("Fehler beim Löschen des Posts:", error);
    res.status(500).render("error.njk", {
      message: "Fehler beim Löschen des Beitrags",
      error,
    });
  }
}
```

### 7.3 Auth-Controller (`src/controllers/authController.ts`)

```typescript
import { Request, Response } from "express";

/**
 * Login-Formular anzeigen
 */
export function loginForm(req: Request, res: Response): void {
  if (req.session.isAuthenticated) {
    res.redirect("/admin");
    return;
  }
  res.render("login.njk", { title: "Anmeldung" });
}

/**
 * Login verarbeiten
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
      error: "Ungültiger Benutzername oder Passwort",
      title: "Anmeldung",
    });
  }
}

/**
 * Logout verarbeiten
 */
export function logout(req: Request, res: Response): void {
  req.session.destroy((err) => {
    if (err) {
      console.error("Fehler beim Zerstören der Session:", err);
    }
    res.redirect("/login");
  });
}
```

---

## 8. Routen einrichten

### 8.1 Auth-Middleware (`src/middleware/auth.ts`)

```typescript
import { Request, Response, NextFunction } from "express";

/**
 * Authentifizierungs-Middleware
 * Überprüft, ob Benutzer über Session angemeldet ist
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }

  // Beabsichtigtes Ziel für Umleitung nach Login speichern
  req.session.returnTo = req.originalUrl;
  res.redirect("/login");
}
```

### 8.2 Post-Routen (`src/routes/postRoutes.ts`)

```typescript
import { Router } from "express";
import * as postController from "../controllers/postController.js";

const router = Router();

router.get("/", postController.index);
router.get("/:slug", postController.show);

export default router;
```

### 8.3 Auth-Routen (`src/routes/authRoutes.ts`)

```typescript
import { Router } from "express";
import * as authController from "../controllers/authController.js";

const router = Router();

router.get("/login", authController.loginForm);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

export default router;
```

### 8.4 Admin-Routen (`src/routes/adminRoutes.ts`)

```typescript
import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Authentifizierung auf alle Admin-Routen anwenden
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

## 9. Views erstellen

### 9.1 Haupt-Layout (`src/views/layout.njk`)

```html
<!DOCTYPE html>
<html lang="de">
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
          <a href="/posts">Startseite</a>
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

### 9.2 Posts-Index (`src/views/posts/index.njk`)

```html
{% extends "layout.njk" %} {% block content %}
<h2>Blog-Beiträge</h2>
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
      Von {{ post.author }} am {{ post.createdAt | date("j. F Y") }}
    </p>
    <p>{{ post.excerpt }}</p>
    <a
      href="/posts/{{ post.slug }}"
      style="color: #0066cc; text-decoration: none; font-weight: 500;"
      >Mehr lesen →</a
    >
  </article>
  {% else %}
  <p>Keine Beiträge gefunden.</p>
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
    >← Zurück</a
  >
  {% endif %}
  <span style="padding: 8px 16px;"
    >Seite {{ currentPage }} von {{ totalPages }}</span
  >
  {% if hasNext %}
  <a
    href="?page={{ currentPage + 1 }}"
    style="padding: 8px 16px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px;"
    >Weiter →</a
  >
  {% endif %}
</div>
{% endif %} {% endblock %}
```

### 9.3 Post anzeigen (`src/views/posts/show.njk`)

```html
{% extends "layout.njk" %} {% block content %}
<article>
  <h2>{{ post.title }}</h2>
  <p style="color: #666; font-size: 14px; margin: 10px 0 30px;">
    Von {{ post.author }} am {{ post.createdAt | date("j. F Y") }}
  </p>
  <div style="line-height: 1.8;">{{ post.content | safe }}</div>
</article>
<div style="margin-top: 30px;">
  <a href="/posts" style="color: #0066cc; text-decoration: none;"
    >← Zurück zu allen Beiträgen</a
  >
</div>
{% endblock %}
```

### 9.4 Login (`src/views/login.njk`)

```html
{% extends "layout.njk" %} {% block content %}
<div style="max-width: 400px; margin: 0 auto;">
  <h2>Admin-Anmeldung</h2>

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
        >Benutzername</label
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
        >Passwort</label
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
      Anmelden
    </button>
  </form>
</div>
{% endblock %}
```

### 9.5 Fehlerseite (`src/views/error.njk`)

```html
{% extends "layout.njk" %} {% block content %}
<h2>Fehler</h2>
<p>{{ message }}</p>
{% if error.status %}
<p><strong>Status:</strong> {{ error.status }}</p>
{% endif %} {% endblock %}
```

### 9.6 Admin-Layout (`src/views/admin/layout.njk`)

```html
<!DOCTYPE html>
<html lang="de">
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
        <h1>🔐 Admin-Panel</h1>
        <nav>
          <a href="/posts">Seite ansehen</a>
          <a href="/admin/posts">Beiträge verwalten</a>
          <a href="/logout">Abmelden</a>
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

### 9.7 Admin Posts-Index (`src/views/admin/posts/index.njk`)

```html
{% extends "admin/layout.njk" %} {% block content %}
<div
  style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;"
>
  <h2>Beiträge verwalten</h2>
  <a href="/admin/posts/new" class="btn">+ Neuer Beitrag</a>
</div>

<form method="GET" style="margin-bottom: 20px;">
  <input
    type="text"
    name="search"
    placeholder="Beiträge durchsuchen..."
    value="{{ search }}"
    style="width: 300px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
  />
  <button type="submit" class="btn">Suchen</button>
  {% if search %}
  <a href="/admin/posts" class="btn">Löschen</a>
  {% endif %}
</form>

<table>
  <thead>
    <tr>
      <th>Titel</th>
      <th>Autor</th>
      <th>Erstellt</th>
      <th>Aktionen</th>
    </tr>
  </thead>
  <tbody>
    {% for post in posts %}
    <tr>
      <td>
        <a href="/posts/{{ post.slug }}" target="_blank">{{ post.title }}</a>
      </td>
      <td>{{ post.author }}</td>
      <td>{{ post.createdAt | date("j. F Y") }}</td>
      <td>
        <a
          href="/admin/posts/{{ post.id }}/edit"
          class="btn"
          style="padding: 5px 10px; font-size: 14px;"
          >Bearbeiten</a
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
            onclick="return confirm('Sind Sie sicher?')"
          >
            Löschen
          </button>
        </form>
      </td>
    </tr>
    {% else %}
    <tr>
      <td colspan="4">Keine Beiträge gefunden.</td>
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
    >← Zurück</a
  >
  {% endif %}
  <span style="padding: 10px 20px;"
    >Seite {{ currentPage }} von {{ totalPages }}</span
  >
  {% if hasNext %}
  <a
    href="?page={{ currentPage + 1 }}{% if search %}&search={{ search }}{% endif %}"
    class="btn"
    >Weiter →</a
  >
  {% endif %}
</div>
{% endif %} {% endblock %}
```

### 9.8 Admin Post bearbeiten (`src/views/admin/posts/edit.njk`)

```html
{% extends "admin/layout.njk" %} {% block content %}
<h2>{{ "Beitrag bearbeiten" if post else "Neuen Beitrag erstellen" }}</h2>

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
    <label>Titel *</label>
    <input type="text" name="title" value="{{ post.title if post }}" required />
  </div>

  <div class="form-group">
    <label>Autor</label>
    <input
      type="text"
      name="author"
      value="{{ post.author if post else 'Anonymous' }}"
    />
  </div>

  <div class="form-group">
    <label>Auszug *</label>
    <textarea name="excerpt" rows="3" required>
{{ post.excerpt if post }}</textarea
    >
  </div>

  <div class="form-group">
    <label>Inhalt *</label>
    <div id="editor">{{ post.content | safe if post }}</div>
    <input type="hidden" name="content" id="content-input" />
  </div>

  <div style="display: flex; gap: 10px;">
    <button type="submit" class="btn">Beitrag speichern</button>
    <a href="/admin/posts" class="btn" style="background: #6c757d;"
      >Abbrechen</a
    >
  </div>
</form>
{% endblock %}
```

---

## 10. Hauptanwendung erstellen

### 10.1 Haupt-App-Datei (`src/app.ts`)

```typescript
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import dotenv from "dotenv";
import nunjucks from "nunjucks";
import path from "path";
import postRoutes from "./routes/postRoutes";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import "./types/Session";

// Umgebungsvariablen laden
dotenv.config();

const app = express();
const port = 3000;

// Nunjucks konfigurieren
const env = nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app,
  watch: true,
});

// Benutzerdefinierten Datumsfilter hinzufügen
env.addFilter("date", function (dateString: string, format: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: format.includes("h") ? "numeric" : undefined,
    minute: format.includes("m") ? "numeric" : undefined,
  };
  return date.toLocaleDateString("de-DE", options);
});

// Truncate-Filter hinzufügen
env.addFilter("truncate", function (str: string, length: number): string {
  if (str.length > length) {
    return str.substring(0, length) + "...";
  }
  return str;
});

app.set("view engine", "njk");

// Session-Middleware
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "ihr-geheimer-schlüssel-in-produktion-ändern",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 Stunden
      httpOnly: true,
      secure: false, // In Produktion mit HTTPS auf true setzen
    },
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Routen
app.get("/", (_req: Request, res: Response) => {
  res.redirect("/posts");
});

app.use("/", authRoutes);
app.use("/posts", postRoutes);
app.use("/admin", adminRoutes);

// 404-Handler
app.use((_req: Request, res: Response) => {
  res.status(404).render("error.njk", {
    message: "Seite nicht gefunden",
    error: { status: 404 },
    title: "404 - Nicht gefunden",
  });
});

// Fehler-Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).render("error.njk", {
    message: "Etwas ist schief gelaufen!",
    error: err,
    title: "Fehler",
  });
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
```

---

## 11. Statische Assets hinzufügen

### 11.1 WYSIWYG-Editor-JavaScript (`public/js/editor.js`)

```javascript
// Quill-Editor auf Bearbeitungs-/Neue-Beitrags-Seiten initialisieren
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
      placeholder: "Schreiben Sie hier Ihren Beitragsinhalt...",
    });

    // Formular-Übermittlung verarbeiten
    const form = editorElement.closest("form");
    const contentInput = document.getElementById("content-input");

    if (form && contentInput) {
      form.addEventListener("submit", function (e) {
        // HTML-Inhalt von Quill abrufen
        const html = quill.root.innerHTML;
        contentInput.value = html;
      });
    }
  }
});
```

---

## 12. Umgebungskonfiguration

### 12.1 `.env`-Datei erstellen

`.env`-Datei im Projektroot erstellen:

```env
SESSION_SECRET=ihr-super-geheimer-session-schlüssel-dies-ändern
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NODE_ENV=development
```

**Wichtig:** Committen Sie die `.env`-Datei niemals in die Versionskontrolle. Fügen Sie sie zu `.gitignore` hinzu.

---

## 13. Anwendung ausführen

### 13.1 Entwicklungsmodus

```powershell
npm run dev
```

Dies startet die Anwendung mit automatischem Neuladen über `nodemon`.

### 13.2 Produktions-Build

```powershell
npm run build
npm start
```

### 13.3 Anwendung aufrufen

- **Öffentlicher Blog**: http://localhost:3000/posts
- **Admin-Panel**: http://localhost:3000/admin
- **Login**: http://localhost:3000/login

Standard-Anmeldedaten (aus `.env`):

- Benutzername: `admin`
- Passwort: `admin123`

---

## 14. Anwendung testen

### 14.1 Öffentliche Routen testen

1. Zu http://localhost:3000/posts navigieren
2. Überprüfen, dass Posts mit Paginierung angezeigt werden
3. Auf einen Post klicken, um vollständigen Inhalt anzuzeigen
4. Paginierung testen, wenn mehr als 6 Posts vorhanden

### 14.2 Authentifizierung testen

1. Zu http://localhost:3000/admin gehen (sollte zu Login umleiten)
2. Mit falschen Anmeldedaten versuchen (sollte Fehler anzeigen)
3. Mit korrekten Anmeldedaten anmelden (sollte zu Admin-Panel umleiten)

### 14.3 Admin-Funktionen testen

1. **Posts anzeigen**: Posts-Liste im Admin-Panel prüfen
2. **Suchen**: Suchfunktion zum Finden von Posts verwenden
3. **Post erstellen**: "Neuer Beitrag" klicken und Post mit WYSIWYG-Editor erstellen
4. **Post bearbeiten**: Bestehenden Post bearbeiten
5. **Post löschen**: Post löschen (mit Bestätigung)
6. **Abmelden**: Abmelde-Funktionalität testen

### 14.4 WYSIWYG-Editor testen

1. Post erstellen oder bearbeiten
2. Verschiedene Formatierungsoptionen verwenden (fett, kursiv, Listen, Links, Bilder)
3. Speichern und überprüfen, dass HTML korrekt bereinigt wird
4. Post auf öffentlicher Seite ansehen

---

## Nächste Schritte & Erweiterungen

### Sicherheitsverbesserungen

- bcrypt für Passwort-Hashing verwenden
- CSRF-Schutz hinzufügen
- Rate Limiting implementieren
- Eingabevalidierungsbibliothek hinzufügen (z.B. Joi, express-validator)

### Funktionen

- Kategorien und Tags hinzufügen
- Kommentarsystem implementieren
- Bild-Upload-Funktionalität hinzufügen
- API-Endpunkt für Headless-Nutzung erstellen
- Benutzerverwaltung hinzufügen (mehrere Admins)

### Leistung

- Redis für Session-Speicherung hinzufügen
- Caching-Schicht implementieren
- Datenbank statt JSON-Datei hinzufügen (MongoDB, PostgreSQL)
- Volltextsuche hinzufügen (Elasticsearch)

### Entwicklung

- Unit- und Integrationstests hinzufügen (Jest, Supertest)
- ESLint und Prettier einrichten
- CI/CD-Pipeline hinzufügen
- Mit Docker containerisieren

---

## Fehlerbehebung

### Port bereits belegt

Falls Port 3000 bereits belegt ist, in `src/app.ts` ändern:

```typescript
const port = 3001; // oder irgendeinen verfügbaren Port
```

### Modul-Auflösungsfehler

Stellen Sie sicher, dass Ihre `tsconfig.json` `"module": "CommonJS"` verwendet und verwenden Sie KEINE `.js`-Erweiterungen in Importen.

### Views nicht gefunden

Prüfen, dass `postbuild`-Skript das `views`-Verzeichnis nach dem Build korrekt nach `dist/` kopiert.

### Session bleibt nicht bestehen

Stellen Sie sicher, dass Sie `SESSION_SECRET` in Ihrer `.env`-Datei haben und die Session-Middleware korrekt konfiguriert ist.

---

## Herzlichen Glückwunsch! 🎉

Sie haben erfolgreich eine vollständige Blog-Anwendung erstellt mit:

- ✅ MVC-Architekturmuster
- ✅ Authentifizierungssystem
- ✅ Admin-Panel für CRUD-Operationen
- ✅ WYSIWYG-Editor
- ✅ HTML-Bereinigung
- ✅ Paginierung
- ✅ Suchfunktionalität
- ✅ TypeScript für Typsicherheit

Viel Erfolg beim Programmieren!
