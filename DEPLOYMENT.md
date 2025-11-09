# Deployment GuideComplete guide for deploying the Blog MVC Admin application to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Deployment Platforms](#deployment-platforms)
- [Production Configuration](#production-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Performance Optimization](#performance-optimization)
- [Monitoring & Logging](#monitoring--logging)
- [Backup Strategy](#backup-strategy)
- [Rollback Procedures](#rollback-procedures)

## Pre-Deployment Checklist

Before deploying to production, ensure:

### Code Quality

- [ ] All TypeScript compilation errors resolved
- [ ] Code passes linting (`npm run lint` if configured)
- [ ] Remove console.log statements (or use proper logging)
- [ ] Remove debug code and comments
- [ ] Update dependencies (`npm update`)
- [ ] Run security audit (`npm audit`)

### Configuration

- [ ] Production `.env` file created
- [ ] Strong SESSION_SECRET generated (64+ characters)
- [ ] Strong ADMIN_PASSWORD set
- [ ] NODE_ENV set to `production`
- [ ] Database/storage properly configured

### Security

- [ ] Review [SECURITY.md](SECURITY.md) checklist
- [ ] HTTPS/SSL configured
- [ ] Security headers added (Helmet.js)
- [ ] Rate limiting implemented
- [ ] Session store configured (Redis/MongoDB)

### Testing

- [ ] Test all routes manually
- [ ] Test authentication flow
- [ ] Test CRUD operations
- [ ] Test on production-like environment
- [ ] Load testing performed (if high traffic expected)

### Documentation

- [ ] README.md updated with production URLs
- [ ] API documentation complete
- [ ] Deployment notes documented
- [ ] Backup procedures documented

---

## Environment Setup

### Production Environment Variables

Create `.env.production`:

```env
# Node Environment
NODE_ENV=production

# Server Configuration
PORT=3000
HOST=0.0.0.0

# Security
SESSION_SECRET=<generate-strong-random-64-char-string>
ADMIN_PASSWORD=<strong-secure-password>

# Session Store (if using Redis)
REDIS_URL=redis://your-redis-url:6379

# Database (if migrated from JSON)
DATABASE_URL=your-database-connection-string

# Logging
LOG_LEVEL=info

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
```

### Generate Production Secrets

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate random password (then change it)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

---

## Deployment Platforms

### Option 1: Railway (Recommended - Easiest)

Railway offers free tier and easy deployment from GitHub.

#### Step-by-Step

1. **Create Railway Account**

   - Visit: https://railway.app
   - Sign up with GitHub

2. **Create New Project**

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Environment Variables**

   - Go to project settings
   - Add variables:
     ```
     NODE_ENV=production
     SESSION_SECRET=<your-secret>
     ADMIN_PASSWORD=<your-password>
     ```

4. **Configure Build Command**

   - Build Command: `npm run build`
   - Start Command: `npm start`

5. **Deploy**
   - Railway auto-deploys on git push
   - Get public URL from dashboard

#### Railway Configuration File

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### Option 2: Render

Render provides free static sites and web services.

#### Setup

1. **Create Render Account**

   - Visit: https://render.com
   - Sign up with GitHub

2. **Create Web Service**

   - Dashboard → "New" → "Web Service"
   - Connect repository

3. **Configuration**

   - Name: `blog-mvc-admin`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Environment Variables**

   - Add in dashboard:
     ```
     NODE_ENV=production
     SESSION_SECRET=<secret>
     ADMIN_PASSWORD=<password>
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Auto-deploys on push to main branch

#### render.yaml

Create deployment configuration:

```yaml
services:
  - type: web
    name: blog-mvc-admin
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SESSION_SECRET
        sync: false
      - key: ADMIN_PASSWORD
        sync: false
```

---

### Option 3: Heroku

Traditional PaaS with good documentation.

#### Setup

1. **Install Heroku CLI**

   ```bash
   # Windows (via npm)
   npm install -g heroku

   # Mac (via Homebrew)
   brew tap heroku/brew && brew install heroku
   ```

2. **Login**

   ```bash
   heroku login
   ```

3. **Create App**

   ```bash
   heroku create blog-mvc-admin
   ```

4. **Set Environment Variables**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=<your-secret>
   heroku config:set ADMIN_PASSWORD=<your-password>
   ```

5. **Deploy**

   ```bash
   git push heroku main
   ```

6. **Open App**
   ```bash
   heroku open
   ```

#### Procfile

Create `Procfile` in root:

```
web: npm start
```

---

### Option 4: DigitalOcean App Platform

#### Setup

1. **Create DO Account**

   - Visit: https://www.digitalocean.com
   - Create account

2. **Create App**

   - Apps → "Create App"
   - Connect GitHub repository

3. **Configure**

   - Detected: Node.js
   - Build Command: `npm run build`
   - Run Command: `npm start`

4. **Environment Variables**

   - Add in dashboard

5. **Deploy**
   - Click "Create Resources"

---

### Option 5: VPS (Ubuntu Server)

For full control, deploy to your own VPS.

#### Prerequisites

- Ubuntu 22.04 LTS server
- SSH access
- Domain name (optional)

#### Installation Steps

```bash
# 1. Connect to server
ssh user@your-server-ip

# 2. Update system
sudo apt update && sudo apt upgrade -y

# 3. Install Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Install PM2 (process manager)
sudo npm install -g pm2

# 5. Clone repository
git clone https://github.com/linobollansee/add-mvc-pattern-and-admin-panel.git
cd add-mvc-pattern-and-admin-panel

# 6. Install dependencies
npm install

# 7. Create .env file
nano .env
# Add production variables, save (Ctrl+X, Y, Enter)

# 8. Build application
npm run build

# 9. Start with PM2
pm2 start npm --name "blog-app" -- start

# 10. Save PM2 configuration
pm2 save
pm2 startup
# Follow the command output

# 11. Setup Nginx reverse proxy
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/blog

# Add configuration:
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 12. Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

#### PM2 Commands

```bash
# View logs
pm2 logs blog-app

# Restart
pm2 restart blog-app

# Stop
pm2 stop blog-app

# Monitor
pm2 monit

# List processes
pm2 list
```

---

### Option 6: Docker Container

#### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "dist/app.js"]
```

#### .dockerignore

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
dist
```

#### Build and Run

```bash
# Build image
docker build -t blog-mvc-admin .

# Run container
docker run -d \
  -p 3000:3000 \
  -e SESSION_SECRET=<your-secret> \
  -e ADMIN_PASSWORD=<your-password> \
  -e NODE_ENV=production \
  --name blog-app \
  blog-mvc-admin

# View logs
docker logs blog-app

# Stop container
docker stop blog-app
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=${SESSION_SECRET}
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
    volumes:
      - ./src/data:/app/src/data
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

---

## Production Configuration

### Update app.ts for Production

```typescript
// Production-specific settings
if (process.env.NODE_ENV === "production") {
  // Trust proxy (for Railway, Heroku, etc.)
  app.set("trust proxy", 1);

  // Secure cookies
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true, // HTTPS only
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "strict",
      },
    })
  );

  // Add security headers
  app.use(helmet());

  // Enable compression
  app.use(compression());
}
```

### Add Helmet.js for Security

```bash
npm install helmet compression
```

```typescript
import helmet from "helmet";
import compression from "compression";

app.use(helmet());
app.use(compression());
```

### Add Rate Limiting

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Stricter limit for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

app.post("/login", loginLimiter, authController.handleLogin);
```

---

## SSL/HTTPS Setup

### Free SSL with Let's Encrypt (VPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already setup by certbot)
sudo certbot renew --dry-run
```

### Platform-Specific SSL

- **Railway**: Automatic SSL on custom domains
- **Render**: Free SSL included
- **Heroku**: Free SSL on paid dynos
- **DigitalOcean**: Free SSL included

### Force HTTPS

```typescript
// In app.ts (before routes)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && !req.secure) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});
```

---

## Performance Optimization

### 1. Enable Compression

```javascript
import compression from "compression";
app.use(compression());
```

### 2. Cache Static Assets

```javascript
app.use(
  express.static("public", {
    maxAge: "1y",
    etag: true,
  })
);
```

### 3. Add CDN for Static Files

Use Cloudflare or similar CDN for public assets.

### 4. Implement Redis Session Store

```javascript
import RedisStore from "connect-redis";
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    // ... other options
  })
);
```

### 5. Enable HTTP/2

Configure in Nginx:

```nginx
server {
    listen 443 ssl http2;
    # ... rest of config
}
```

---

## Monitoring & Logging

### Add Winston Logger

```bash
npm install winston
```

Create `src/utils/logger.ts`:

```typescript
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
```

### Add Sentry for Error Tracking

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Add before routes
app.use(Sentry.Handlers.requestHandler());

// Add after routes, before error handlers
app.use(Sentry.Handlers.errorHandler());
```

### Health Check Endpoint

```typescript
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

---

## Backup Strategy

### Automatic Backups

Create `scripts/backup.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
DATA_FILE="./src/data/posts.json"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/posts_$TIMESTAMP.json"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
cp $DATA_FILE $BACKUP_FILE

# Keep only last 30 backups
ls -t $BACKUP_DIR/posts_*.json | tail -n +31 | xargs rm -f

echo "Backup created: $BACKUP_FILE"
```

### Cron Job (VPS)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/app/scripts/backup.sh
```

### Cloud Backup

Upload to S3, Google Cloud Storage, or Dropbox:

```bash
# Install AWS CLI
sudo apt install awscli

# Configure
aws configure

# Add to backup script
aws s3 cp $BACKUP_FILE s3://your-bucket/backups/
```

---

## Rollback Procedures

### Quick Rollback (Platform Specific)

**Railway/Render:**

- Go to deployments
- Click on previous deployment
- Click "Redeploy"

**Heroku:**

```bash
heroku releases
heroku rollback v123
```

**PM2 (VPS):**

```bash
# Stop current
pm2 stop blog-app

# Checkout previous version
git checkout <previous-commit>

# Rebuild
npm run build

# Restart
pm2 restart blog-app
```

### Data Rollback

```bash
# Restore from backup
cp backups/posts_YYYYMMDD_HHMMSS.json src/data/posts.json

# Restart application
pm2 restart blog-app
```

---

## Post-Deployment Verification

### Checklist

- [ ] Application accessible via HTTPS
- [ ] Login functionality works
- [ ] Can create/edit/delete posts
- [ ] Public pages display correctly
- [ ] SSL certificate valid
- [ ] All static assets loading
- [ ] No console errors in browser
- [ ] Server logs show no errors
- [ ] Health check endpoint responds
- [ ] Session persistence works

### Monitoring

Set up monitoring alerts for:

- Server downtime
- High error rates
- Slow response times
- Memory/CPU usage
- Disk space

### Recommended Services

- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry
- **Performance**: New Relic, Datadog
- **Logs**: Papertrail, Loggly

---

## Troubleshooting Deployment Issues

### Common Issues

**1. App Won't Start**

- Check logs for errors
- Verify all environment variables set
- Ensure build completed successfully
- Check Node.js version compatibility

**2. 502 Bad Gateway**

- App may have crashed
- Check if process is running
- Review error logs
- Verify port configuration

**3. Session Not Persisting**

- Check secure cookie settings
- Verify HTTPS is enabled
- Check session store configuration

**4. Static Files 404**

- Verify build copied public folder
- Check static file path configuration
- Ensure files included in deployment

---

## Cost Estimates

| Platform     | Free Tier       | Paid Plans   |
| ------------ | --------------- | ------------ |
| Railway      | $5 credit/month | $5-20/month  |
| Render       | 750 hours/month | $7+/month    |
| Heroku       | Hobby: $0       | $7-25+/month |
| DigitalOcean | Free trial      | $5-20+/month |
| VPS          | N/A             | $5-20+/month |

---

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure automatic backups
3. Plan migration to database (if needed)
4. Set up CI/CD pipeline
5. Review [SECURITY.md](SECURITY.md) for hardening
6. Document any custom deployment steps

---

**Congratulations! Your blog is now live in production! 🎉**
