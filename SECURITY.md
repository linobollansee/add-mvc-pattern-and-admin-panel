<!--
  Security Documentation / Sicherheits-Dokumentation

  Purpose / Zweck:
  - Document security features and vulnerabilities / Sicherheitsfunktionen und Schwachstellen dokumentieren
  - Provide security best practices / Sicherheits-Best-Practices bereitstellen
  - Explain vulnerability reporting process / Schwachstellen-Meldeprozess erklären

  Key Topics / Hauptthemen:
  - Authentication & Authorization / Authentifizierung & Autorisierung
  - Session Management / Session-Verwaltung
  - XSS Prevention / XSS-Prävention
  - CSRF Protection / CSRF-Schutz
  - Production Security Checklist / Produktions-Sicherheits-Checkliste
-->

# Security Policy

Security best practices and vulnerability reporting for the Blog MVC Admin application.

## Table of Contents

- [Reporting Security Vulnerabilities](#reporting-security-vulnerabilities)
- [Security Features](#security-features)
- [Authentication & Authorization](#authentication--authorization)
- [Session Management](#session-management)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [XSS Prevention](#xss-prevention)
- [CSRF Protection](#csrf-protection)
- [Environment Variables](#environment-variables)
- [Production Security Checklist](#production-security-checklist)
- [Known Limitations](#known-limitations)
- [Security Updates](#security-updates)

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please follow responsible disclosure:

### DO NOT:

- ❌ Open a public GitHub issue
- ❌ Disclose vulnerability details publicly
- ❌ Exploit the vulnerability

### DO:

- ✅ Email security concerns privately to: [your-email@example.com]
- ✅ Provide detailed description and reproduction steps
- ✅ Allow reasonable time for patches (typically 90 days)
- ✅ Work with maintainers on coordinated disclosure

### What to Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)
- Your contact information

**Response Time:** We aim to acknowledge reports within 48 hours.

---

## Security Features

### Current Implementations

✅ **Session-based Authentication**

- HTTP-only cookies
- Secure cookie flag in production
- 24-hour session expiration

✅ **HTML Sanitization**

- All user-generated content sanitized
- Uses `sanitize-html` library
- Prevents XSS attacks

✅ **Protected Routes**

- Middleware-based authentication
- Automatic redirect to login
- Return-to URL preservation

✅ **Environment Variable Configuration**

- Sensitive data not in code
- `.env` file excluded from version control
- Separate configs for dev/prod

✅ **Input Validation**

- Required field validation
- Server-side validation for all inputs

---

## Authentication & Authorization

### How It Works

```
User → Login Form → POST /login → Validate Password
                                        ↓
                              Check against ADMIN_PASSWORD env var
                                        ↓
                           Set session.isAuthenticated = true
                                        ↓
                              Redirect to Admin Panel
```

### Password Security

**Current Implementation:**

- Single admin password stored in environment variable
- Plaintext comparison (not hashed)

**⚠️ Security Limitation:**
This is suitable for single-user blogs but NOT for multi-user systems.

**Recommended for Production:**

1. **Use bcrypt for password hashing:**

```javascript
import bcrypt from "bcrypt";

// Hash password (do this once, store in .env)
const hashedPassword = await bcrypt.hash("your-password", 10);

// Compare during login
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

2. **Implement password requirements:**

   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - No common passwords (use a dictionary check)

3. **Add rate limiting to prevent brute force:**

```javascript
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: "Too many login attempts, please try again later",
});

app.post("/login", loginLimiter, authController.handleLogin);
```

### Authorization Levels

**Current:** Single admin role (all-or-nothing access)

**Future Enhancement:** Implement role-based access control (RBAC):

```typescript
enum Role {
  ADMIN = "admin", // Full access
  EDITOR = "editor", // Create/edit/delete posts
  VIEWER = "viewer", // Read-only access
}

interface User {
  id: number;
  username: string;
  passwordHash: string;
  role: Role;
}
```

---

## Session Management

### Configuration

```javascript
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true, // Prevents JavaScript access
      secure: false, // Set true in production (HTTPS only)
      sameSite: "strict", // CSRF protection
    },
  })
);
```

### Security Best Practices

#### 1. Session Secret

**❌ Bad:**

```env
SESSION_SECRET=mysecret
```

**✅ Good:**

```env
SESSION_SECRET=a1f8d9c7e5b3a2f1d8c6b4e9a7f5d3c1b9e7a5d3f1c9b7e5a3d1f9c7b5e3a1d9
```

**Generate Strong Secret:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2. Session Store

**Current:** Memory store (not suitable for production)

**⚠️ Problem:** Sessions lost on server restart

**✅ Production Solution:** Use persistent session store

**Option A: Redis**

```javascript
import RedisStore from "connect-redis";
import { createClient } from "redis";

const redisClient = createClient();
redisClient.connect();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    // ... other options
  })
);
```

**Option B: MongoDB**

```javascript
import MongoStore from "connect-mongo";

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
    secret: process.env.SESSION_SECRET,
    // ... other options
  })
);
```

#### 3. Session Timeout

Implement automatic logout after inactivity:

```javascript
app.use((req, res, next) => {
  if (req.session.isAuthenticated) {
    req.session.touch(); // Reset expiration
  }
  next();
});
```

---

## Input Validation & Sanitization

### Server-Side Validation

**All form inputs are validated before processing:**

```typescript
// Example from adminController.ts
if (!title || !excerpt || !content) {
  return res.status(400).render("admin/posts/edit.njk", {
    error: "Title, excerpt, and content are required",
  });
}
```

### Recommended Enhancements

**1. Use validation library (e.g., Joi, Yup, Zod):**

```javascript
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(50),
  author: z.string().max(100).optional(),
});

// In controller
try {
  const validatedData = postSchema.parse(req.body);
} catch (error) {
  // Handle validation error
}
```

**2. Validate data types:**

```javascript
const id = parseInt(req.params.id, 10);
if (isNaN(id)) {
  return res.status(400).send("Invalid ID");
}
```

**3. Check content length:**

```javascript
if (content.length > 50000) {
  return res.status(400).send("Content too long");
}
```

---

## XSS Prevention

### Current Protection

**HTML Sanitization via `sanitize-html`:**

```typescript
import sanitizeHtml from "sanitize-html";

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
  allowedAttributes: {
    img: ["src", "alt", "title"],
    a: ["href", "target", "rel"],
  },
};

// Applied in postModel.ts
content: sanitizeHtml(postData.content, sanitizeOptions);
```

### What's Protected

✅ Post content (HTML sanitized)
✅ Template auto-escaping (Nunjucks)

### What to Watch

⚠️ Post titles (not sanitized - only text expected)
⚠️ Author names (not sanitized - only text expected)

### Additional XSS Protection

**1. Content Security Policy (CSP):**

```javascript
import helmet from "helmet";

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Needed for inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  })
);
```

**2. Nunjucks Auto-Escaping:**

Already enabled in `app.ts`:

```javascript
nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true, // ✅ Escapes variables by default
});
```

**In templates, variables are auto-escaped:**

```html
<!-- Safe - auto-escaped -->
<h1>{{ post.title }}</h1>

<!-- Unsafe - renders raw HTML (only use for sanitized content) -->
<div>{{ post.content | safe }}</div>
```

---

## CSRF Protection

### Current Status

❌ **Not Implemented**

### Risk

Cross-Site Request Forgery attacks could:

- Create posts from malicious sites
- Delete posts via forged requests
- Logout users unexpectedly

### Recommended Implementation

**1. Install CSRF middleware:**

```bash
npm install csurf
```

**2. Add to app.ts:**

```javascript
import csrf from "csurf";

const csrfProtection = csrf({ cookie: true });

// Apply to routes that modify data
app.use("/admin", csrfProtection);
```

**3. Add token to forms:**

```html
<!-- In admin/posts/edit.njk -->
<form method="POST">
  <input type="hidden" name="_csrf" value="{{ csrfToken }}" />
  <!-- other fields -->
</form>
```

**4. Pass token from controller:**

```javascript
export function create(req, res) {
  res.render("admin/posts/edit.njk", {
    csrfToken: req.csrfToken(),
    post: null,
  });
}
```

### SameSite Cookie Alternative

Less robust but simpler:

```javascript
app.use(
  session({
    cookie: {
      sameSite: "strict", // Prevents CSRF attacks
    },
  })
);
```

---

## Environment Variables

### Required Variables

```env
SESSION_SECRET=<random-64-char-string>
ADMIN_PASSWORD=<strong-password>
NODE_ENV=production
```

### Security Best Practices

#### 1. Never Commit .env

**Ensure `.gitignore` includes:**

```
.env
.env.local
.env.production
.env.*
```

#### 2. Use Different Secrets Per Environment

```env
# .env.development
SESSION_SECRET=dev-secret-not-for-production

# .env.production
SESSION_SECRET=prod-b8f4e2a9d7c5b3e1f9d7c5b3a1f8e6d4c2b9e7a5f3d1c9b7e5a3d1f9c7b5e3a1
```

#### 3. Rotate Secrets Regularly

- Change SESSION_SECRET every 90 days
- Change ADMIN_PASSWORD every 90 days
- Log out all users after rotation

#### 4. Use Secret Management in Production

**Options:**

- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault
- Doppler
- dotenv-vault

**Example with AWS:**

```javascript
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });
const secret = await client.send(
  new GetSecretValueCommand({ SecretId: "prod/blog-app" })
);
```

---

## Production Security Checklist

Before deploying to production:

### Environment

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong SESSION_SECRET (64+ characters)
- [ ] Use strong ADMIN_PASSWORD (12+ characters, mixed case, symbols)
- [ ] Store secrets in secure secret manager

### HTTPS

- [ ] Enable SSL/TLS certificate
- [ ] Set `cookie.secure = true` in session config
- [ ] Redirect HTTP to HTTPS
- [ ] Enable HSTS header

### Headers

- [ ] Add security headers via Helmet.js
- [ ] Implement Content Security Policy
- [ ] Set X-Frame-Options to DENY
- [ ] Set X-Content-Type-Options to nosniff

### Authentication

- [ ] Implement rate limiting on /login
- [ ] Add account lockout after failed attempts
- [ ] Hash passwords with bcrypt (for multi-user)
- [ ] Consider 2FA for admin access

### Session

- [ ] Use persistent session store (Redis/MongoDB)
- [ ] Set short session timeout (consider 1 hour)
- [ ] Implement session regeneration after login
- [ ] Add CSRF protection

### Input

- [ ] Validate all user inputs
- [ ] Sanitize all HTML content
- [ ] Check file upload size limits
- [ ] Validate content-type headers

### Logging & Monitoring

- [ ] Log all authentication attempts
- [ ] Monitor for suspicious activity
- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Log security events (login, logout, failed attempts)

### Dependencies

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Keep dependencies updated
- [ ] Remove unused packages
- [ ] Use `npm audit fix` regularly

### Database

- [ ] Regular backups of posts.json
- [ ] Implement backup retention policy
- [ ] Test restore procedures
- [ ] Consider migrating to real database

### Access Control

- [ ] Restrict admin panel to specific IPs (if applicable)
- [ ] Use VPN for admin access (if applicable)
- [ ] Implement role-based access control

---

## Known Limitations

### 1. Single User Authentication

**Issue:** Only one admin password, no user management

**Risk:** All admins share same password

**Mitigation:** Use unique password, rotate regularly

**Future:** Implement multi-user system with individual accounts

### 2. No Password Hashing

**Issue:** Password compared in plaintext

**Risk:** If environment variables exposed, password is compromised

**Mitigation:** Protect .env file, use strong password

**Future:** Implement bcrypt hashing

### 3. Memory-Based Sessions

**Issue:** Sessions lost on server restart

**Risk:** All users logged out after deployment

**Mitigation:** Use persistent session store (Redis, MongoDB)

### 4. No Rate Limiting

**Issue:** Unlimited login attempts possible

**Risk:** Brute force attacks on admin password

**Mitigation:** Implement rate limiting middleware

### 5. No CSRF Protection

**Issue:** Vulnerable to cross-site request forgery

**Risk:** Malicious sites can forge admin requests

**Mitigation:** Implement CSRF tokens or SameSite cookies

### 6. JSON File Storage

**Issue:** Not suitable for high-traffic or multi-instance deployments

**Risk:** File corruption, race conditions, no transactions

**Mitigation:** Migrate to proper database for production

---

## Security Updates

### Current Version Security Status

**Last Security Review:** November 9, 2025

**Known Vulnerabilities:** None reported

**Dependency Status:** Check with `npm audit`

### Staying Updated

```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable issues
npm audit fix

# Check for outdated packages
npm outdated

# Update packages
npm update
```

### Security Patch Policy

- **Critical vulnerabilities:** Patched within 24 hours
- **High severity:** Patched within 1 week
- **Medium severity:** Patched in next release
- **Low severity:** Evaluated on case-by-case basis

---

## Additional Resources

### Security Tools

- **npm audit** - Check for vulnerable dependencies
- **Snyk** - Continuous security monitoring
- **OWASP ZAP** - Web application security scanner
- **Helmet.js** - Security headers middleware
- **express-rate-limit** - Rate limiting
- **csurf** - CSRF protection

### Learning Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- Express Security Tips: https://expressjs.com/en/advanced/best-practice-security.html

### Related Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment security
- [CONTRIBUTING.md](CONTRIBUTING.md) - Secure development practices
- [API.md](API.md) - API security considerations

---

**Remember:** Security is an ongoing process, not a one-time setup. Regularly review and update security measures.
