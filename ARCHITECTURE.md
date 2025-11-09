# Application Architecture Guide

## 📋 Overview

This is a blog application built with the **MVC (Model-View-Controller)** pattern using Express.js, TypeScript, and Nunjucks templates.

---

## 🏗️ Architecture Flow

```
User Request → Routes → Middleware (Auth) → Controller → Model → Database (JSON)
                                                ↓
                                              View (Nunjucks Template)
                                                ↓
                                            HTML Response
```

---

## 📁 File Structure & Connections

### **Entry Point**

- **`src/app.ts`** - Main application file
  - Initializes Express server
  - Configures middleware (session, body parser, static files)
  - Sets up Nunjucks templating engine
  - Mounts all route modules
  - **Imports:** `postRoutes`, `adminRoutes`, `authRoutes`
  - **Uses:** `.env` file for configuration

---

## 🎯 Request Flow by Feature

### **1. PUBLIC BLOG (No Authentication)**

#### View All Posts: `/posts`

```
User → /posts
  → app.ts (router)
    → routes/postRoutes.ts
      → controllers/postController.ts (index function)
        → models/postModel.ts (getAllPosts)
          → data/posts.json (read)
        ← returns Post[]
      → renders views/posts/index.njk
    ← HTML response with post list
```

#### View Single Post: `/posts/my-first-post`

```
User → /posts/:slug
  → app.ts (router)
    → routes/postRoutes.ts
      → controllers/postController.ts (show function)
        → models/postModel.ts (getPostBySlug)
          → data/posts.json (read)
        ← returns Post or undefined
      → renders views/posts/show.njk
    ← HTML response with full post
```

---

### **2. AUTHENTICATION**

#### Login: `/login`

```
GET /login
  → routes/authRoutes.ts
    → controllers/authController.ts (showLogin)
      → checks if already logged in (session.isAuthenticated)
      → renders views/login.njk
    ← HTML login form

POST /login (form submission)
  → routes/authRoutes.ts
    → controllers/authController.ts (handleLogin)
      → checks password against process.env.ADMIN_PASSWORD
      → if correct: sets session.isAuthenticated = true
      → redirects to /admin/posts or returnTo URL
    ← Redirect response
```

#### Logout: `/logout`

```
GET /logout
  → routes/authRoutes.ts
    → controllers/authController.ts (handleLogout)
      → destroys session
      → redirects to /
    ← Redirect to homepage
```

---

### **3. ADMIN PANEL (Requires Authentication)**

#### Access Protection Flow

```
User → /admin/posts
  → app.ts (router)
    → routes/adminRoutes.ts
      → middleware/auth.ts (requireAuth)
        → checks session.isAuthenticated
        → if false:
          - saves returnTo URL
          - redirects to /login
        → if true: calls next()
      → controllers/adminController.ts
```

#### List Posts (Admin): `/admin/posts`

```
User (logged in) → /admin/posts
  → routes/adminRoutes.ts (requireAuth applied)
    → controllers/adminController.ts (index)
      → models/postModel.ts (getAllPosts or searchPosts)
        → data/posts.json (read)
      → renders views/admin/posts/index.njk
    ← HTML with post list + edit/delete buttons
```

#### Create Post: `/admin/posts/new`

```
GET /admin/posts/new
  → routes/adminRoutes.ts
    → controllers/adminController.ts (create)
      → renders views/admin/posts/edit.njk (empty form)
    ← HTML form

POST /admin/posts (form submission)
  → routes/adminRoutes.ts
    → controllers/adminController.ts (store)
      → validates input
      → models/postModel.ts (createPost)
        → generates slug from title
        → sanitizes HTML content
        → adds timestamps
        → writes to data/posts.json
      → redirects to /admin/posts
    ← Redirect response
```

#### Edit Post: `/admin/posts/5/edit`

```
GET /admin/posts/:id/edit
  → routes/adminRoutes.ts
    → controllers/adminController.ts (edit)
      → models/postModel.ts (getPostById)
        → data/posts.json (read)
      → renders views/admin/posts/edit.njk (populated form)
    ← HTML form with existing data

POST /admin/posts/:id (form submission)
  → routes/adminRoutes.ts
    → controllers/adminController.ts (update)
      → validates input
      → models/postModel.ts (updatePost)
        → updates post in memory
        → regenerates slug
        → sanitizes HTML
        → updates updatedAt timestamp
        → writes to data/posts.json
      → redirects to /admin/posts
    ← Redirect response
```

#### Delete Post: `/admin/posts/5/delete`

```
POST /admin/posts/:id/delete
  → routes/adminRoutes.ts
    → controllers/adminController.ts (destroy)
      → models/postModel.ts (deletePost)
        → removes post from array
        → writes to data/posts.json
      → redirects to /admin/posts
    ← Redirect response
```

---

## 📦 Module Responsibilities

### **Routes** (URL Mapping)

| File             | Base Path | Purpose             | Auth Required |
| ---------------- | --------- | ------------------- | ------------- |
| `authRoutes.ts`  | `/`       | Login/logout        | No            |
| `postRoutes.ts`  | `/posts`  | Public blog viewing | No            |
| `adminRoutes.ts` | `/admin`  | Post management     | Yes           |

### **Controllers** (Request Handlers)

| File                 | Used By       | Purpose             |
| -------------------- | ------------- | ------------------- |
| `authController.ts`  | `authRoutes`  | Handle login/logout |
| `postController.ts`  | `postRoutes`  | Display blog posts  |
| `adminController.ts` | `adminRoutes` | CRUD operations     |

### **Models** (Data Access)

| File           | Used By         | Purpose               |
| -------------- | --------------- | --------------------- |
| `postModel.ts` | All controllers | Read/write posts.json |

### **Middleware** (Request Interceptors)

| File      | Applied To          | Purpose                     |
| --------- | ------------------- | --------------------------- |
| `auth.ts` | `adminRoutes` (all) | Block unauthenticated users |

### **Types** (TypeScript Definitions)

| File             | Used By                       | Purpose              |
| ---------------- | ----------------------------- | -------------------- |
| `Post.ts`        | Models, controllers           | Post data structures |
| `Session.ts`     | All files using sessions      | Session properties   |
| `Environment.ts` | `app.ts`, `authController.ts` | Env variable types   |

### **Views** (Templates)

| Directory/File                | Rendered By       | Purpose             |
| ----------------------------- | ----------------- | ------------------- |
| `views/layout.njk`            | All views         | Base template       |
| `views/login.njk`             | `authController`  | Login form          |
| `views/posts/index.njk`       | `postController`  | Public post list    |
| `views/posts/show.njk`        | `postController`  | Single post view    |
| `views/admin/layout.njk`      | Admin views       | Admin base template |
| `views/admin/posts/index.njk` | `adminController` | Admin post list     |
| `views/admin/posts/edit.njk`  | `adminController` | Create/edit form    |

---

## 🔐 Authentication System

### Session Flow

1. **Login**: `authController.handleLogin()` sets `session.isAuthenticated = true`
2. **Protection**: `middleware/auth.ts` checks `session.isAuthenticated`
3. **Logout**: `authController.handleLogout()` destroys session

### Session Properties (defined in `types/Session.ts`)

- `isAuthenticated` - Boolean flag for login status
- `returnTo` - URL to redirect after login
- `username` - Reserved for future use

---

## 💾 Data Storage

### Database: `src/data/posts.json`

```json
{
  "posts": [
    {
      "id": 1,
      "title": "My First Post",
      "slug": "my-first-post",
      "excerpt": "Short summary...",
      "content": "<p>Full HTML content...</p>",
      "author": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "nextId": 2
}
```

### Data Operations (in `postModel.ts`)

- **Read**: `fs.readFile()` → parse JSON → return data
- **Write**: modify data → `JSON.stringify()` → `fs.writeFile()`
- **Sanitization**: HTML content sanitized with `sanitize-html` library

---

## 🔄 Key Concepts

### MVC Pattern

- **Model** (`postModel.ts`): Data logic, database operations
- **View** (`views/*.njk`): Presentation layer, HTML templates
- **Controller** (`*Controller.ts`): Business logic, connects Model & View

### Slug System

- **Purpose**: URL-friendly post identifiers
- **Generation**: `createSlug()` in `postModel.ts`
- **Example**: "Hello World!" → "hello-world"
- **Usage**: `/posts/hello-world` instead of `/posts/1`

### Pagination

- **Public Blog**: 6 posts per page (`postController.ts`)
- **Admin Panel**: 10 posts per page (`adminController.ts`)
- **Implementation**: Calculate offset based on page number, slice array

### Search

- **Location**: Admin panel only
- **Implementation**: `searchPosts()` in `postModel.ts`
- **Searches**: title, excerpt, and content fields

---

## 🌐 Environment Variables (`.env` file)

```env
SESSION_SECRET=your-secret-key-here
ADMIN_PASSWORD=your-admin-password
NODE_ENV=development
```

### Usage

- **SESSION_SECRET**: Encrypts session cookies (`app.ts`)
- **ADMIN_PASSWORD**: Login authentication (`authController.ts`)
- **NODE_ENV**: Environment mode (currently not actively used)

---

## 🚀 Startup Sequence

1. `npm run dev` or `npm start`
2. Load `.env` variables
3. Initialize Express app
4. Configure Nunjucks templates
5. Set up session middleware
6. Mount route modules
7. Start listening on port 3000
8. Ready to accept requests!

---

## 📝 Adding a New Feature - Example Workflow

### Example: Add Comment System

1. **Update Types** (`types/Comment.ts`)

   - Define Comment interface

2. **Update Model** (`models/commentModel.ts`)

   - Add CRUD functions for comments
   - Read/write comments.json

3. **Update Controller** (`controllers/commentController.ts`)

   - Add functions to handle comment creation, display

4. **Create Routes** (`routes/commentRoutes.ts`)

   - Define URL patterns for comments

5. **Update Views** (`views/posts/show.njk`)

   - Add comment form and display

6. **Mount Routes** (`app.ts`)
   - Add `app.use('/comments', commentRoutes)`

---

## 🔍 Debugging Tips

1. **Check route order** in `app.ts` - specific routes before generic ones
2. **Verify authentication** - is `requireAuth` applied correctly?
3. **Inspect session** - is `isAuthenticated` set properly?
4. **Check file paths** - are absolute paths used?
5. **Review console logs** - errors logged in terminal
6. **Validate JSON** - is `posts.json` properly formatted?

---

## 📚 Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Template Engine**: Nunjucks
- **Session Management**: express-session
- **HTML Sanitization**: sanitize-html
- **Data Storage**: JSON files
- **Development**: nodemon, ts-node

---

This architecture allows for:
✅ Clear separation of concerns (MVC)
✅ Protected admin routes
✅ Type-safe code (TypeScript)
✅ Secure HTML content (sanitization)
✅ Session-based authentication
✅ Easy to extend and maintain
