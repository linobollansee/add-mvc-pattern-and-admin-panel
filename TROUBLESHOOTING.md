# Troubleshooting GuideCommon issues and solutions for the Blog MVC Admin application.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Runtime Errors](#runtime-errors)
- [Authentication Problems](#authentication-problems)
- [Data & Storage Issues](#data--storage-issues)
- [Performance Issues](#performance-issues)
- [Deployment Problems](#deployment-problems)
- [Development Issues](#development-issues)
- [Browser Issues](#browser-issues)

---

## Installation Issues

### npm install fails

**Symptoms:**

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**

   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use legacy peer deps:**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Update npm:**

   ```bash
   npm install -g npm@latest
   ```

4. **Check Node.js version:**
   ```bash
   node --version  # Should be v18.0.0 or higher
   ```

---

### TypeScript compilation errors

**Symptoms:**

```
error TS2307: Cannot find module './types/Post.js'
```

**Solutions:**

1. **Verify tsconfig.json:**

   ```json
   {
     "compilerOptions": {
       "module": "CommonJS",
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

2. **Do NOT use .js extension in imports:**

   ```typescript
   // ✅ Correct
   import { Post } from "./types/Post";

   // ❌ Wrong
   import { Post } from "./types/Post.js";
   ```

3. **Clean and rebuild:**
   ```bash
   npm run clean
   npm run build
   ```

---

### Cannot find module 'express'

**Symptoms:**

```
Error: Cannot find module 'express'
```

**Solutions:**

1. **Reinstall dependencies:**

   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Check package.json:**

   - Verify express is in dependencies (not devDependencies)

3. **Install explicitly:**
   ```bash
   npm install express @types/express
   ```

---

## Runtime Errors

### Port 3000 already in use

**Symptoms:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

**Windows (PowerShell):**

```powershell
# Find process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill process
Stop-Process -Id <PID> -Force

# Or kill all node processes
Get-Process node | Stop-Process -Force
```

**Mac/Linux:**

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or
sudo kill -9 $(lsof -t -i:3000)
```

**Alternative:** Change port in `src/app.ts`:

```typescript
const port = 3001; // Change from 3000
```

---

### Application crashes on startup

**Symptoms:**

```
Server running on http://localhost:3000
[crash with no error]
```

**Solutions:**

1. **Check for syntax errors:**

   ```bash
   npm run build
   # Look for TypeScript errors
   ```

2. **Verify .env file exists:**

   ```bash
   ls -la .env  # Unix
   dir .env     # Windows
   ```

3. **Check posts.json exists:**

   ```bash
   cat src/data/posts.json
   ```

   If missing, create with:

   ```json
   {
     "posts": [],
     "nextId": 1
   }
   ```

4. **Run with more logging:**
   ```bash
   NODE_ENV=development npm run dev
   ```

---

### Module not found after build

**Symptoms:**

```
Error: Cannot find module '/app/dist/app.js'
```

**Solutions:**

1. **Verify build output:**

   ```bash
   ls dist/
   # Should contain app.js and other compiled files
   ```

2. **Check package.json scripts:**

   ```json
   {
     "scripts": {
       "build": "tsc",
       "postbuild": "xcopy /E /I /Y src\\views dist\\views && xcopy /E /I /Y src\\data dist\\data"
     }
   }
   ```

3. **Manually copy required files:**

   ```bash
   # Copy views
   cp -r src/views dist/views

   # Copy data
   cp -r src/data dist/data
   ```

---

## Authentication Problems

### Cannot login - "Invalid password"

**Symptoms:**

- Correct password shows "Invalid password" error
- No login possible

**Solutions:**

1. **Check .env file:**

   ```bash
   cat .env
   ```

   Verify `ADMIN_PASSWORD` is set correctly

2. **Check for whitespace:**

   ```env
   # ❌ Wrong (has quotes)
   ADMIN_PASSWORD="mypassword"

   # ✅ Correct (no quotes)
   ADMIN_PASSWORD=mypassword
   ```

3. **Restart server after .env changes:**

   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Check password in authController:**
   ```typescript
   console.log("Expected:", process.env.ADMIN_PASSWORD);
   console.log("Received:", password);
   ```

---

### Session not persisting

**Symptoms:**

- Login succeeds but immediately redirects back to login
- Can't stay logged in
- "Access denied" after login

**Solutions:**

1. **Check SESSION_SECRET in .env:**

   ```env
   SESSION_SECRET=your-secret-key-minimum-32-characters-long
   ```

2. **Disable secure cookies in development:**

   ```typescript
   // In app.ts
   app.use(
     session({
       cookie: {
         secure: false, // false for HTTP, true for HTTPS
         httpOnly: true,
       },
     })
   );
   ```

3. **Clear browser cookies:**

   - Open DevTools (F12)
   - Application tab → Cookies
   - Delete all for localhost:3000

4. **Check cookie in browser:**

   - DevTools → Application → Cookies
   - Should see connect.sid cookie
   - If missing, session middleware not working

5. **Verify session middleware is before routes:**

   ```typescript
   // ✅ Correct order
   app.use(
     session({
       /* config */
     })
   );
   app.use("/admin", adminRoutes);

   // ❌ Wrong order
   app.use("/admin", adminRoutes);
   app.use(
     session({
       /* config */
     })
   );
   ```

---

### Logged out unexpectedly

**Symptoms:**

- Session expires too quickly
- Logged out after server restart

**Solutions:**

1. **Increase session timeout:**

   ```typescript
   app.use(
     session({
       cookie: {
         maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
       },
     })
   );
   ```

2. **Use persistent session store:**

   ```bash
   npm install connect-redis redis
   ```

   ```typescript
   import RedisStore from "connect-redis";
   import { createClient } from "redis";

   const redisClient = createClient();
   await redisClient.connect();

   app.use(
     session({
       store: new RedisStore({ client: redisClient }),
     })
   );
   ```

---

## Data & Storage Issues

### posts.json not found

**Symptoms:**

```
Error reading posts data: ENOENT: no such file or directory
```

**Solutions:**

1. **Create the file:**

   ```bash
   mkdir -p src/data
   echo '{"posts":[],"nextId":1}' > src/data/posts.json
   ```

2. **Verify path in postModel.ts:**

   ```typescript
   const DATA_FILE = path.join(__dirname, "../data/posts.json");
   console.log("Looking for posts at:", DATA_FILE);
   ```

3. **Check file permissions:**

   ```bash
   # Unix/Mac
   chmod 666 src/data/posts.json

   # Windows
   icacls src\data\posts.json /grant Users:F
   ```

---

### Cannot save posts - EACCES

**Symptoms:**

```
Error writing posts data: EACCES: permission denied
```

**Solutions:**

**Windows:**

```powershell
# Check permissions
icacls src\data\posts.json

# Grant write access
icacls src\data\posts.json /grant Users:F
```

**Mac/Linux:**

```bash
# Check permissions
ls -l src/data/posts.json

# Make writable
chmod 666 src/data/posts.json

# Or change owner
sudo chown $USER src/data/posts.json
```

---

### posts.json corrupted

**Symptoms:**

```
SyntaxError: Unexpected token in JSON
```

**Solutions:**

1. **Validate JSON:**

   ```bash
   cat src/data/posts.json | python -m json.tool
   # or
   node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/posts.json')))"
   ```

2. **Restore from backup:**

   ```bash
   cp backups/posts_YYYYMMDD.json src/data/posts.json
   ```

3. **Reset to empty:**

   ```bash
   echo '{"posts":[],"nextId":1}' > src/data/posts.json
   ```

4. **Manually fix JSON:**
   - Open in text editor
   - Look for:
     - Missing commas
     - Extra commas
     - Unmatched brackets
     - Invalid characters

---

### Lost all posts after restart

**Symptoms:**

- Posts disappear after server restart
- Only happens in production

**Cause:** File system is ephemeral (Heroku, some cloud platforms)

**Solutions:**

1. **Use persistent storage:**

   - Attach volume/disk to container
   - Use database instead of JSON

2. **For Heroku:**

   ```bash
   # Install PostgreSQL addon
   heroku addons:create heroku-postgresql:hobby-dev

   # Migrate to database (requires code changes)
   ```

3. **For Docker:**
   ```yaml
   # docker-compose.yml
   services:
     app:
       volumes:
         - ./src/data:/app/src/data
   ```

---

## Performance Issues

### Slow page load times

**Symptoms:**

- Pages take 3+ seconds to load
- High CPU usage

**Solutions:**

1. **Check posts.json size:**

   ```bash
   ls -lh src/data/posts.json
   ```

   If > 1MB, consider database migration

2. **Enable compression:**

   ```bash
   npm install compression
   ```

   ```typescript
   import compression from "compression";
   app.use(compression());
   ```

3. **Add caching:**

   ```typescript
   app.use(
     express.static("public", {
       maxAge: "1d",
       etag: true,
     })
   );
   ```

4. **Implement pagination everywhere:**
   - Already done for post lists
   - Verify it's working correctly

---

### High memory usage

**Symptoms:**

- Server crashes with "Out of memory"
- Memory usage grows over time

**Solutions:**

1. **Restart periodically (PM2):**

   ```bash
   pm2 start npm --name "blog" -- start --max-memory-restart 200M
   ```

2. **Check for memory leaks:**

   ```bash
   node --inspect dist/app.js
   # Use Chrome DevTools to profile
   ```

3. **Use persistent session store:**
   - Memory sessions grow indefinitely
   - Use Redis or database store

---

## Deployment Problems

### 502 Bad Gateway

**Symptoms:**

- Nginx shows 502 error
- App not accessible

**Solutions:**

1. **Check app is running:**

   ```bash
   pm2 list
   # or
   ps aux | grep node
   ```

2. **Check logs:**

   ```bash
   pm2 logs blog-app
   # or
   tail -f /var/log/nginx/error.log
   ```

3. **Verify port configuration:**

   ```nginx
   # /etc/nginx/sites-available/blog
   location / {
     proxy_pass http://localhost:3000;  # Match app port
   }
   ```

4. **Restart services:**
   ```bash
   pm2 restart blog-app
   sudo systemctl restart nginx
   ```

---

### Environment variables not working

**Symptoms:**

- `process.env.ADMIN_PASSWORD` is undefined
- "Invalid password" in production

**Solutions:**

1. **Check .env file exists:**

   ```bash
   ls -la .env
   ```

2. **Verify dotenv is loaded:**

   ```typescript
   // At top of app.ts
   import dotenv from "dotenv";
   dotenv.config();

   console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "✓" : "✗");
   ```

3. **Platform-specific environment:**

   **Heroku:**

   ```bash
   heroku config:set ADMIN_PASSWORD=yourpassword
   ```

   **Railway/Render:**

   - Set in dashboard Environment Variables section

   **Docker:**

   ```bash
   docker run -e ADMIN_PASSWORD=yourpassword ...
   ```

4. **Check .gitignore:**
   ```bash
   # Ensure .env is ignored
   cat .gitignore | grep .env
   ```

---

### SSL/HTTPS issues

**Symptoms:**

- "Your connection is not private"
- Mixed content warnings

**Solutions:**

1. **Verify SSL certificate:**

   ```bash
   sudo certbot certificates
   ```

2. **Renew certificate:**

   ```bash
   sudo certbot renew
   ```

3. **Force HTTPS:**

   ```typescript
   app.use((req, res, next) => {
     if (!req.secure && process.env.NODE_ENV === "production") {
       return res.redirect("https://" + req.get("host") + req.url);
     }
     next();
   });
   ```

4. **Enable secure cookies:**
   ```typescript
   app.use(
     session({
       cookie: {
         secure: true, // Only works with HTTPS
       },
     })
   );
   ```

---

## Development Issues

### Hot reload not working

**Symptoms:**

- Changes to code don't reflect
- Must restart server manually

**Solutions:**

1. **Use nodemon:**

   ```bash
   npm run dev  # Should use nodemon
   ```

2. **Check nodemon.json:**

   ```json
   {
     "watch": ["src"],
     "ext": "ts,njk",
     "exec": "ts-node --esm src/app.ts"
   }
   ```

3. **Clear cache:**
   ```bash
   rm -rf dist/
   npm run build
   npm run dev
   ```

---

### TypeScript types not recognized

**Symptoms:**

```
Property 'isAuthenticated' does not exist on type 'SessionData'
```

**Solutions:**

1. **Restart TypeScript server:**

   - VS Code: Ctrl+Shift+P → "TypeScript: Restart TS Server"

2. **Check types are imported:**

   ```typescript
   import "./types/Session.js";
   ```

3. **Verify declaration merging:**
   ```typescript
   // src/types/Session.ts
   declare module "express-session" {
     interface SessionData {
       isAuthenticated?: boolean;
     }
   }
   ```

---

## Browser Issues

### WYSIWYG editor not loading

**Symptoms:**

- Textarea shows instead of rich editor
- Console error about editor library

**Solutions:**

1. **Check editor script loaded:**

   ```html
   <!-- In views/admin/posts/edit.njk -->
   <script src="https://cdn.tiny.cloud/..."></script>
   ```

2. **Check console for errors:**

   - F12 → Console tab
   - Look for 404 or CORS errors

3. **Verify element ID:**

   ```html
   <textarea id="content"></textarea>
   ```

   ```javascript
   tinymce.init({ selector: "#content" });
   ```

---

### Static files 404

**Symptoms:**

- CSS not loading
- Images not displaying
- 404 errors for /css/style.css

**Solutions:**

1. **Check static middleware:**

   ```typescript
   app.use(express.static(path.join(__dirname, "../public")));
   ```

2. **Verify file paths:**

   ```bash
   ls public/css/
   ls dist/  # After build
   ```

3. **Check paths in templates:**

   ```html
   <!-- ✅ Correct (no 'public' in path) -->
   <link rel="stylesheet" href="/css/style.css" />

   <!-- ❌ Wrong -->
   <link rel="stylesheet" href="/public/css/style.css" />
   ```

---

## Getting More Help

If your issue isn't covered here:

### 1. Check Documentation

- [README.md](README.md) - Overview
- [SETUP.md](SETUP.md) - Installation
- [API.md](API.md) - API reference
- [SECURITY.md](SECURITY.md) - Security issues

### 2. Search GitHub Issues

- Existing issues: https://github.com/linobollansee/add-mvc-pattern-and-admin-panel/issues
- Maybe your issue is already solved!

### 3. Enable Debug Logging

```typescript
// In app.ts
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
```

### 4. Create an Issue

Include:

- Error messages (full stack trace)
- Steps to reproduce
- Environment (OS, Node version, etc.)
- What you've tried
- Relevant code snippets

---

## Common Error Messages

### Quick Reference

| Error               | Likely Cause        | Solution                    |
| ------------------- | ------------------- | --------------------------- |
| EADDRINUSE          | Port in use         | Kill process or change port |
| ENOENT              | File not found      | Check file path             |
| EACCES              | Permission denied   | Fix file permissions        |
| Cannot find module  | Dependency issue    | npm install                 |
| Invalid password    | Wrong .env password | Check ADMIN_PASSWORD        |
| 502 Bad Gateway     | App crashed         | Check logs, restart app     |
| Session not working | Cookie settings     | Check secure/httpOnly       |
| TypeScript error    | Type mismatch       | Check type definitions      |

---

**Still stuck? Open an issue with details and we'll help! 🚑**
