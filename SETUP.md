<!--
  Setup and Installation Guide / Einrichtungs- und Installationsanleitung

  Purpose / Zweck:
  - Provide step-by-step installation instructions / Schritt-für-Schritt-Installationsanweisungen bereitstellen
  - Explain environment configuration / Umgebungskonfiguration erklären
  - Troubleshoot common setup issues / Häufige Einrichtungsprobleme beheben

  Sections / Abschnitte:
  - Prerequisites / Voraussetzungen
  - Installation Steps / Installationsschritte
  - Environment Configuration / Umgebungskonfiguration
  - IDE Setup / IDE-Einrichtung
-->

# Setup Guide

Complete installation and configuration guide for the Blog MVC Admin application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step-by-Step Installation](#step-by-step-installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [IDE Setup](#ide-setup)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)

   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Should output: `v18.0.0` or higher

2. **npm** (comes with Node.js) or **yarn**

   - Verify npm: `npm --version`
   - Should output: `9.0.0` or higher

3. **Git** (optional, for cloning)
   - Download from: https://git-scm.com/
   - Verify: `git --version`

### Recommended Software

- **VS Code** - Best IDE for TypeScript development
- **Postman** - For testing API endpoints
- **Chrome/Firefox** - Modern browser with DevTools

## Step-by-Step Installation

### 1. Get the Project

**Option A: Clone from Git**

```bash
git clone https://github.com/linobollansee/add-mvc-pattern-and-admin-panel.git
cd add-mvc-pattern-and-admin-panel
```

**Option B: Download ZIP**

- Download and extract the ZIP file
- Open terminal in the extracted folder

### 2. Install Dependencies

```bash
npm install
```

**What this installs:**

- Express.js - Web framework
- TypeScript - Type-safe JavaScript
- Nunjucks - Template engine
- express-session - Session management
- sanitize-html - XSS protection
- dotenv - Environment variables
- And development dependencies (nodemon, @types/\*, etc.)

**Expected Output:**

```
added 150 packages, and audited 151 packages in 15s
```

### 3. Create Environment File

Create a `.env` file in the project root:

**Windows (PowerShell):**

```powershell
New-Item .env -ItemType File
```

**Windows (Command Prompt):**

```cmd
type nul > .env
```

**Mac/Linux:**

```bash
touch .env
```

Edit `.env` with your preferred text editor and add:

```env
# Session secret - use a random string (minimum 32 characters)
SESSION_SECRET=your-super-secret-key-change-this-in-production-min-32-chars

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SecurePassword123!

# Environment (development, production, or test)
NODE_ENV=development
```

### 4. Verify Data Directory

Ensure `src/data/posts.json` exists. If not, create it:

**Create the file with initial data:**

```json
{
  "posts": [],
  "nextId": 1
}
```

### 5. Build the Project

Compile TypeScript to JavaScript:

```bash
npm run build
```

This creates a `dist/` folder with compiled code.

### 6. Start the Application

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

### 7. Access the Application

Open your browser and navigate to:

- **Public Blog**: http://localhost:3000/posts
- **Admin Panel**: http://localhost:3000/admin (requires login)
- **Login Page**: http://localhost:3000/login

## Environment Configuration

### Environment Variables Explained

| Variable         | Required | Default     | Description                                                            |
| ---------------- | -------- | ----------- | ---------------------------------------------------------------------- |
| `SESSION_SECRET` | Yes      | -           | Secret key for encrypting session cookies. Use a strong random string. |
| `ADMIN_PASSWORD` | Yes      | -           | Password for admin panel access                                        |
| `ADMIN_USERNAME` | No       | admin       | Admin username (currently not used, reserved for future)               |
| `NODE_ENV`       | No       | development | Application environment mode                                           |

### Generating a Strong Session Secret

**Option 1: Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: PowerShell**

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Option 3: Online Generator**

- Visit: https://randomkeygen.com/
- Copy a "CodeIgniter Encryption Key"

### Environment-Specific Configuration

**Development (.env.development):**

```env
SESSION_SECRET=dev-secret-key-not-for-production
ADMIN_PASSWORD=admin123
NODE_ENV=development
```

**Production (.env.production):**

```env
SESSION_SECRET=<strong-random-64-char-string>
ADMIN_PASSWORD=<strong-unique-password>
NODE_ENV=production
```

## Database Setup

This application uses JSON file-based storage. No traditional database setup required!

### Initial Data Structure

The `src/data/posts.json` file structure:

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Welcome to My Blog",
      "slug": "welcome-to-my-blog",
      "excerpt": "This is my first blog post.",
      "content": "<p>Welcome to my blog! This is the full content.</p>",
      "author": "Admin",
      "createdAt": "2025-11-09T10:00:00.000Z",
      "updatedAt": "2025-11-09T10:00:00.000Z"
    }
  ],
  "nextId": 2
}
```

### Adding Sample Data

To populate with sample posts, you can:

1. **Use the Admin Panel** (recommended)

   - Login at http://localhost:3000/login
   - Create posts via the UI

2. **Manually Edit posts.json**
   - Copy the structure above
   - Add more post objects to the array
   - Increment `nextId` accordingly

### Backup Strategy

**Automatic Backups (recommended):**
Create a backup script `backup-data.js`:

```javascript
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "src/data/posts.json");
const backup = path.join(__dirname, "backups", `posts-${Date.now()}.json`);

fs.mkdirSync(path.dirname(backup), { recursive: true });
fs.copyFileSync(source, backup);
console.log("Backup created:", backup);
```

Run before major changes:

```bash
node backup-data.js
```

## IDE Setup

### VS Code (Recommended)

#### Recommended Extensions

Install these extensions for the best development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "wholroyd.jinja",
    "ronnidc.nunjucks",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

Install via VS Code:

1. Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (Mac)
2. Search for each extension
3. Click "Install"

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.njk": "jinja"
  },
  "emmet.includeLanguages": {
    "nunjucks": "html"
  }
}
```

#### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug TypeScript",
      "runtimeArgs": ["-r", "ts-node/register", "--esm"],
      "args": ["${workspaceFolder}/src/app.ts"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### WebStorm / IntelliJ IDEA

1. Open project folder
2. WebStorm will auto-detect TypeScript configuration
3. Right-click `src/app.ts` → "Run" or "Debug"

## Verification

### 1. Check Installation

```bash
# Verify Node.js
node --version
# Should output: v18.0.0 or higher

# Verify npm
npm --version
# Should output: 9.0.0 or higher

# Check dependencies installed
npm list --depth=0
# Should show all packages without errors
```

### 2. Check TypeScript Compilation

```bash
npm run build
```

Expected output:

```
Successfully compiled TypeScript files to dist/
```

### 3. Test the Application

Start in development mode:

```bash
npm run dev
```

You should see:

```
Server running on http://localhost:3000
```

### 4. Verify Routes

Test these URLs in your browser:

- ✅ http://localhost:3000 → Should redirect to `/posts`
- ✅ http://localhost:3000/posts → Should show blog post list
- ✅ http://localhost:3000/login → Should show login form
- ✅ http://localhost:3000/admin → Should redirect to login (if not authenticated)

### 5. Test Admin Login

1. Go to http://localhost:3000/login
2. Enter password from `.env` file
3. Should redirect to admin dashboard
4. Should see "Manage Posts" interface

## Troubleshooting

### Common Issues

#### 1. Port 3000 Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

**Windows (PowerShell):**

```powershell
# Find process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill the process
Stop-Process -Id <PID> -Force
```

**Mac/Linux:**

```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Or change the port in `src/app.ts`:**

```typescript
const port = 3001; // Change from 3000
```

#### 2. Module Not Found Errors

**Error:**

```
Cannot find module 'express'
```

**Solution:**

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript Compilation Errors

**Error:**

```
error TS2307: Cannot find module './types/Post.js'
```

**Solution:**
Ensure `tsconfig.json` has correct settings:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

#### 4. Session Not Persisting

**Symptoms:**

- Login succeeds but immediately redirects back to login
- Admin panel access denied after login

**Solutions:**

1. **Check SESSION_SECRET is set in .env**
2. **Clear browser cookies**
3. **Restart the server**
4. **Check cookie settings in `src/app.ts`:**
   ```typescript
   cookie: {
     secure: false, // Should be false in development
     httpOnly: true
   }
   ```

#### 5. Environment Variables Not Loading

**Error:**

```
ADMIN_PASSWORD is undefined
```

**Solutions:**

1. **Verify .env file exists in project root**
2. **Check .env file format** (no quotes needed):
   ```env
   ADMIN_PASSWORD=mypassword
   # NOT: ADMIN_PASSWORD="mypassword"
   ```
3. **Restart the development server**
4. **Check dotenv is imported in app.ts:**
   ```typescript
   import dotenv from "dotenv";
   dotenv.config();
   ```

#### 6. Cannot Write to posts.json

**Error:**

```
Error writing posts data: EACCES: permission denied
```

**Solutions:**

**Windows:**

```powershell
# Check file permissions
icacls src\data\posts.json

# Grant full control
icacls src\data\posts.json /grant Users:F
```

**Mac/Linux:**

```bash
# Fix permissions
chmod 666 src/data/posts.json
```

#### 7. Import Path Errors (.js vs .ts)

**Error:**

```
Cannot find module './postModel' or its corresponding type declarations
```

**Solution:**
Always use `.js` extension in imports (TypeScript requirement for ES modules):

```typescript
// Correct
import * as postModel from "./models/postModel.js";

// Wrong
import * as postModel from "./models/postModel";
```

### Getting More Help

If you encounter issues not covered here:

1. **Check the logs** - Look at terminal output for detailed error messages
2. **Read TROUBLESHOOTING.md** - More detailed solutions
3. **Check GitHub Issues** - Search existing issues
4. **Open a new issue** - Provide error messages and environment details

## Next Steps

After successful setup:

1. 📖 Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the codebase structure
2. 🔐 Review [SECURITY.md](SECURITY.md) for security best practices
3. 🚀 Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
4. 🧪 Explore [TESTING.md](TESTING.md) to add tests
5. 📝 See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Quick Reference

```bash
# Install dependencies
npm install

# Development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Clean build directory
npm run clean

# Watch mode (compile on save)
npm run watch
```

**Default URLs:**

- Public Blog: http://localhost:3000/posts
- Admin Panel: http://localhost:3000/admin
- Login: http://localhost:3000/login

**Default Credentials:**

- Password: Set in `.env` file (`ADMIN_PASSWORD`)

---

✅ Setup complete! You're ready to start developing.
