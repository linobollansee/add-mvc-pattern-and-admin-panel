# API DocumentationComplete API documentation for the Blog MVC Admin application.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Public Routes](#public-routes)
- [Authentication Routes](#authentication-routes)
- [Admin Routes](#admin-routes)
- [Error Responses](#error-responses)
- [Request Examples](#request-examples)

## Overview

**Base URL:** `http://localhost:3000`

**Response Format:** HTML (server-rendered via Nunjucks templates)

**Authentication:** Session-based (cookie)

**Session Duration:** 24 hours

## Authentication

### How Authentication Works

1. User submits password via `/login` form
2. Server validates against `ADMIN_PASSWORD` environment variable
3. On success, sets `session.isAuthenticated = true`
4. Session stored in cookie (HTTP-only)
5. Protected routes check session before allowing access

### Protected Routes

All routes under `/admin/*` require authentication. Unauthenticated requests are redirected to `/login`.

---

## Public Routes

These routes are accessible without authentication.

### GET /

**Description:** Root endpoint, redirects to blog post listing

**Response:** `302 Redirect`

**Redirect To:** `/posts`

**Example:**

```bash
curl -L http://localhost:3000/
# Redirects to http://localhost:3000/posts
```

---

### GET /posts

**Description:** Display paginated list of all blog posts

**Query Parameters:**

| Parameter | Type    | Required | Default | Description                |
| --------- | ------- | -------- | ------- | -------------------------- |
| `page`    | integer | No       | 1       | Page number for pagination |

**Response:** `200 OK` - HTML page with post list

**Posts Per Page:** 6

**Pagination:** Previous/Next buttons displayed when applicable

**Example:**

```bash
# First page
curl http://localhost:3000/posts

# Second page
curl http://localhost:3000/posts?page=2
```

**Rendered Data:**

- Array of posts (latest first)
- Each post shows: title, excerpt, author, date, read more link
- Pagination controls

---

### GET /posts/:slug

**Description:** Display a single blog post by its URL slug

**URL Parameters:**

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| `slug`    | string | Yes      | URL-friendly version of post title |

**Response:**

- `200 OK` - HTML page with full post
- `404 Not Found` - Post doesn't exist

**Example:**

```bash
curl http://localhost:3000/posts/my-first-post
```

**Slug Format:**

- Lowercase
- Spaces replaced with hyphens
- Special characters removed
- Example: "Hello World!" → "hello-world"

**Rendered Data:**

- Full post title
- Complete HTML content
- Author name
- Created/updated dates
- Back to blog link

---

## Authentication Routes

### GET /login

**Description:** Display admin login form

**Response:** `200 OK` - HTML login page

**Behavior:**

- If already authenticated → Redirect to `/admin/posts`
- If not authenticated → Show login form

**Example:**

```bash
curl http://localhost:3000/login
```

**Form Fields:**

- `password` (text input, required)

---

### POST /login

**Description:** Process admin login

**Content-Type:** `application/x-www-form-urlencoded`

**Body Parameters:**

| Parameter  | Type   | Required | Description    |
| ---------- | ------ | -------- | -------------- |
| `password` | string | Yes      | Admin password |

**Response:**

- `302 Redirect` - Login successful → Redirect to admin or `returnTo` URL
- `200 OK` - Login failed → Redisplay form with error

**Example:**

```bash
curl -X POST http://localhost:3000/login \
  -d "password=your-admin-password" \
  -c cookies.txt
```

**Success Behavior:**

- Sets session cookie
- Redirects to `/admin/posts` or saved `returnTo` URL

**Error Response:**

- Re-renders login form
- Displays error: "Invalid password. Please try again."

---

### GET /logout

**Description:** End admin session

**Response:** `302 Redirect` to homepage

**Behavior:**

- Destroys session
- Clears authentication cookie
- Redirects to `/`

**Example:**

```bash
curl -X GET http://localhost:3000/logout \
  -b cookies.txt
```

---

## Admin Routes

All admin routes require authentication. Unauthenticated requests redirect to `/login`.

### GET /admin/posts

**Description:** Admin dashboard - list all posts with management options

**Query Parameters:**

| Parameter | Type    | Required | Default | Description |
| --------- | ------- | -------- | ------- | ----------- |
| `page`    | integer | No       | 1       | Page number |
| `search`  | string  | No       | -       | Search term |

**Response:** `200 OK` - Admin posts list page

**Posts Per Page:** 10

**Features:**

- Search functionality (searches title, excerpt, content)
- Edit button for each post
- Delete button for each post
- Create new post button
- Pagination

**Example:**

```bash
# View all posts (page 1)
curl http://localhost:3000/admin/posts \
  -b cookies.txt

# Search posts
curl "http://localhost:3000/admin/posts?search=typescript" \
  -b cookies.txt

# Second page
curl "http://localhost:3000/admin/posts?page=2" \
  -b cookies.txt
```

---

### GET /admin/posts/new

**Description:** Display form to create a new blog post

**Response:** `200 OK` - Create post form

**Form Fields:**

- `title` (text, required)
- `excerpt` (textarea, required)
- `content` (WYSIWYG editor, required)
- `author` (text, optional - defaults to "Anonymous")

**Example:**

```bash
curl http://localhost:3000/admin/posts/new \
  -b cookies.txt
```

---

### POST /admin/posts

**Description:** Create a new blog post

**Content-Type:** `application/x-www-form-urlencoded`

**Body Parameters:**

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| `title`   | string | Yes      | Post title                         |
| `excerpt` | string | Yes      | Short summary                      |
| `content` | string | Yes      | Full HTML content                  |
| `author`  | string | No       | Author name (default: "Anonymous") |

**Response:**

- `302 Redirect` - Success → Redirect to `/admin/posts`
- `400 Bad Request` - Validation error → Redisplay form with error
- `500 Server Error` - Database error → Redisplay form with error

**Automatic Processing:**

- Generates unique ID
- Creates URL slug from title
- Sanitizes HTML content (XSS prevention)
- Adds timestamps (createdAt, updatedAt)

**Example:**

```bash
curl -X POST http://localhost:3000/admin/posts \
  -b cookies.txt \
  -d "title=My New Post" \
  -d "excerpt=This is a summary" \
  -d "content=<p>Full content here</p>" \
  -d "author=John Doe"
```

**Validation Rules:**

- Title: Required, any length
- Excerpt: Required, any length
- Content: Required, HTML allowed (sanitized)
- Author: Optional

---

### GET /admin/posts/:id/edit

**Description:** Display form to edit an existing post

**URL Parameters:**

| Parameter | Type    | Required | Description |
| --------- | ------- | -------- | ----------- |
| `id`      | integer | Yes      | Post ID     |

**Response:**

- `200 OK` - Edit post form with populated data
- `404 Not Found` - Post doesn't exist

**Example:**

```bash
curl http://localhost:3000/admin/posts/1/edit \
  -b cookies.txt
```

**Form Fields:** Same as create, pre-filled with existing data

---

### POST /admin/posts/:id

**Description:** Update an existing blog post

**URL Parameters:**

| Parameter | Type    | Required | Description       |
| --------- | ------- | -------- | ----------------- |
| `id`      | integer | Yes      | Post ID to update |

**Content-Type:** `application/x-www-form-urlencoded`

**Body Parameters:**

| Parameter | Type   | Required | Description       |
| --------- | ------ | -------- | ----------------- |
| `title`   | string | Yes      | Post title        |
| `excerpt` | string | Yes      | Short summary     |
| `content` | string | Yes      | Full HTML content |
| `author`  | string | Yes      | Author name       |

**Response:**

- `302 Redirect` - Success → Redirect to `/admin/posts`
- `400 Bad Request` - Validation error → Redisplay form
- `404 Not Found` - Post doesn't exist
- `500 Server Error` - Database error → Redisplay form

**Automatic Processing:**

- Regenerates slug from new title
- Sanitizes HTML content
- Updates `updatedAt` timestamp
- Preserves `createdAt` and `id`

**Example:**

```bash
curl -X POST http://localhost:3000/admin/posts/1 \
  -b cookies.txt \
  -d "title=Updated Title" \
  -d "excerpt=Updated summary" \
  -d "content=<p>Updated content</p>" \
  -d "author=Jane Doe"
```

---

### POST /admin/posts/:id/delete

**Description:** Delete a blog post

**URL Parameters:**

| Parameter | Type    | Required | Description       |
| --------- | ------- | -------- | ----------------- |
| `id`      | integer | Yes      | Post ID to delete |

**Response:**

- `302 Redirect` - Success → Redirect to `/admin/posts`
- `404 Not Found` - Post doesn't exist
- `500 Server Error` - Database error → Show error page

**Example:**

```bash
curl -X POST http://localhost:3000/admin/posts/1/delete \
  -b cookies.txt
```

**Warning:** This action is permanent and cannot be undone.

---

## Error Responses

### 404 Not Found

**Rendered Page:** `views/error.njk`

**Triggers:**

- Invalid URL
- Post not found (by slug or ID)
- Route doesn't exist

**Example Response:**

```html
<h1>404 - Not Found</h1>
<p>Page not found</p>
```

---

### 500 Server Error

**Rendered Page:** `views/error.njk`

**Triggers:**

- Database read/write failure
- Unexpected application error
- Template rendering error

**Example Response:**

```html
<h1>Error</h1>
<p>Something went wrong!</p>
```

**Note:** Full error details logged to console in development mode.

---

### 302 Redirect (Authentication Required)

**Triggers:**

- Accessing `/admin/*` routes without authentication

**Behavior:**

- Saves attempted URL in `session.returnTo`
- Redirects to `/login`
- After successful login, redirects back to original URL

---

## Request Examples

### Complete Workflow: Create and View a Post

#### 1. Login

```bash
# Login and save session cookie
curl -X POST http://localhost:3000/login \
  -d "password=your-admin-password" \
  -c cookies.txt \
  -L
```

#### 2. Create Post

```bash
# Create a new post
curl -X POST http://localhost:3000/admin/posts \
  -b cookies.txt \
  -d "title=Getting Started with TypeScript" \
  -d "excerpt=Learn the basics of TypeScript in this guide" \
  -d "content=<h2>Introduction</h2><p>TypeScript is amazing!</p>" \
  -d "author=Developer" \
  -L
```

#### 3. View Post (Public)

```bash
# View the post publicly (no auth needed)
curl http://localhost:3000/posts/getting-started-with-typescript
```

#### 4. Edit Post

```bash
# Update the post
curl -X POST http://localhost:3000/admin/posts/1 \
  -b cookies.txt \
  -d "title=Getting Started with TypeScript - Updated" \
  -d "excerpt=Learn TypeScript basics with examples" \
  -d "content=<h2>Introduction</h2><p>TypeScript is awesome!</p>" \
  -d "author=Senior Developer" \
  -L
```

#### 5. Delete Post

```bash
# Delete the post
curl -X POST http://localhost:3000/admin/posts/1/delete \
  -b cookies.txt \
  -L
```

#### 6. Logout

```bash
# End session
curl http://localhost:3000/logout \
  -b cookies.txt \
  -L
```

---

### Testing with Postman

#### Import Collection

Create a Postman collection with these requests:

**1. Login**

- Method: POST
- URL: `http://localhost:3000/login`
- Body (form-data):
  - `password`: `your-admin-password`

**2. Get Admin Posts**

- Method: GET
- URL: `http://localhost:3000/admin/posts`

**3. Create Post**

- Method: POST
- URL: `http://localhost:3000/admin/posts`
- Body (form-data):
  - `title`: `Test Post`
  - `excerpt`: `Test excerpt`
  - `content`: `<p>Test content</p>`
  - `author`: `Tester`

**4. Search Posts**

- Method: GET
- URL: `http://localhost:3000/admin/posts?search=test`

**5. Logout**

- Method: GET
- URL: `http://localhost:3000/logout`

---

## Data Models

### Post Object

```typescript
interface Post {
  id: number; // Unique identifier
  title: string; // Post title
  slug: string; // URL-friendly slug
  excerpt: string; // Short summary
  content: string; // Full HTML content (sanitized)
  author: string; // Author name
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}
```

**Example:**

```json
{
  "id": 1,
  "title": "Welcome to My Blog",
  "slug": "welcome-to-my-blog",
  "excerpt": "This is my first blog post.",
  "content": "<p>Welcome to my blog!</p>",
  "author": "Admin",
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider adding rate limiting middleware:

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

---

## CORS

This application doesn't implement CORS as it serves HTML pages directly. If you need API access from different origins, add CORS middleware:

```javascript
import cors from "cors";
app.use(cors());
```

---

## Content Security Policy

Currently not implemented. For production, consider adding CSP headers via `helmet`:

```javascript
import helmet from "helmet";
app.use(helmet());
```

---

## API Versioning

This application doesn't use API versioning. If needed in the future, consider prefixing routes:

```
/api/v1/posts
/api/v2/posts
```

---

## Further Reading

- [ARCHITECTURE.md](ARCHITECTURE.md) - Understand the codebase structure
- [SECURITY.md](SECURITY.md) - Security best practices
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to production
- [SETUP.md](SETUP.md) - Installation guide

---

**Note:** This API serves HTML responses via Nunjucks templates. For a JSON REST API, see the section on converting to REST API in ARCHITECTURE.md.
