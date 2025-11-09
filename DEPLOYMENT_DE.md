# Deployment-Leitfaden

Vollständiger Leitfaden für das Deployment der Blog MVC Admin-Anwendung in die Produktion.

## Inhaltsverzeichnis

- [Pre-Deployment-Checkliste](#pre-deployment-checkliste)
- [Umgebungseinrichtung](#umgebungseinrichtung)
- [Deployment-Plattformen](#deployment-plattformen)
- [Produktionskonfiguration](#produktionskonfiguration)
- [SSL/HTTPS-Einrichtung](#sslhttps-einrichtung)
- [Leistungsoptimierung](#leistungsoptimierung)
- [Überwachung & Protokollierung](#überwachung--protokollierung)
- [Backup-Strategie](#backup-strategie)
- [Rollback-Verfahren](#rollback-verfahren)

## Pre-Deployment-Checkliste

Vor dem Deployment in die Produktion sicherstellen:

### Code-Qualität

- [ ] Alle TypeScript-Kompilierungsfehler behoben
- [ ] Code besteht Linting (`npm run lint` falls konfiguriert)
- [ ] console.log-Anweisungen entfernen (oder richtige Protokollierung verwenden)
- [ ] Debug-Code und Kommentare entfernen
- [ ] Abhängigkeiten aktualisieren (`npm update`)
- [ ] Sicherheitsaudit ausführen (`npm audit`)

### Konfiguration

- [ ] Produktions-`.env`-Datei erstellt
- [ ] Starkes SESSION_SECRET generiert (64+ Zeichen)
- [ ] Starkes ADMIN_PASSWORD festgelegt
- [ ] NODE_ENV auf `production` gesetzt
- [ ] Datenbank/Speicher richtig konfiguriert

### Sicherheit

- [ ] [SECURITY.md](SECURITY.md)-Checkliste überprüfen
- [ ] HTTPS/SSL konfiguriert
- [ ] Sicherheitsheader hinzugefügt (Helmet.js)
- [ ] Rate Limiting implementiert
- [ ] Session-Store konfiguriert (Redis/MongoDB)

### Testen

- [ ] Alle Routen manuell testen
- [ ] Authentifizierungsablauf testen
- [ ] CRUD-Operationen testen
- [ ] In produktionsähnlicher Umgebung testen
- [ ] Lasttest durchgeführt (falls hoher Traffic erwartet)

### Dokumentation

- [ ] README.md mit Produktions-URLs aktualisiert
- [ ] API-Dokumentation vollständig
- [ ] Deployment-Notizen dokumentiert
- [ ] Backup-Verfahren dokumentiert

---

## Umgebungseinrichtung

### Produktions-Umgebungsvariablen

`.env.production` erstellen:

```env
# Node-Umgebung
NODE_ENV=production

# Server-Konfiguration
PORT=3000
HOST=0.0.0.0

# Sicherheit
SESSION_SECRET=<starke-zufällige-64-zeichen-zeichenfolge-generieren>
ADMIN_PASSWORD=<starkes-sicheres-passwort>

# Session-Store (falls Redis verwendet)
REDIS_URL=redis://ihre-redis-url:6379

# Datenbank (falls von JSON migriert)
DATABASE_URL=ihre-datenbank-verbindungszeichenfolge

# Protokollierung
LOG_LEVEL=info

# Überwachung (optional)
SENTRY_DSN=ihr-sentry-dsn
```

### Produktionsgeheimnisse generieren

```bash
# SESSION_SECRET generieren
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Zufälliges Passwort generieren (dann ändern)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

---

## Deployment-Plattformen

### Option 1: Railway (Empfohlen - Am einfachsten)

Railway bietet kostenlosen Tarif und einfaches Deployment von GitHub.

#### Schritt-für-Schritt

1. **Railway-Account erstellen**

   - Besuchen: https://railway.app
   - Mit GitHub anmelden

2. **Neues Projekt erstellen**

   - "New Project" klicken
   - "Deploy from GitHub repo" wählen
   - Ihr Repository auswählen

3. **Umgebungsvariablen konfigurieren**

   - Zu Projekteinstellungen gehen
   - Variablen hinzufügen:
     ```
     NODE_ENV=production
     SESSION_SECRET=<ihr-geheimnis>
     ADMIN_PASSWORD=<ihr-passwort>
     ```

4. **Build-Befehl konfigurieren**

   - Build-Befehl: `npm run build`
   - Start-Befehl: `npm start`

5. **Deployen**
   - Railway deployt automatisch bei git push
   - Öffentliche URL aus Dashboard abrufen

---

### Option 2: Render

Render bietet kostenlose statische Sites und Web-Services.

#### Einrichtung

1. **Render-Account erstellen**

   - Besuchen: https://render.com
   - Mit GitHub anmelden

2. **Web-Service erstellen**

   - Dashboard → "New" → "Web Service"
   - Repository verbinden

3. **Konfiguration**

   - Name: `blog-mvc-admin`
   - Umgebung: `Node`
   - Build-Befehl: `npm install && npm run build`
   - Start-Befehl: `npm start`

4. **Umgebungsvariablen**

   - Im Dashboard hinzufügen:
     ```
     NODE_ENV=production
     SESSION_SECRET=<geheimnis>
     ADMIN_PASSWORD=<passwort>
     ```

5. **Deployen**
   - "Create Web Service" klicken
   - Auto-Deploy bei Push zu main-Branch

---

### Option 3: Heroku

Traditionelle PaaS mit guter Dokumentation.

#### Einrichtung

1. **Heroku CLI installieren**

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

3. **App erstellen**

   ```bash
   heroku create blog-mvc-admin
   ```

4. **Umgebungsvariablen setzen**

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=<ihr-geheimnis>
   heroku config:set ADMIN_PASSWORD=<ihr-passwort>
   ```

5. **Deployen**

   ```bash
   git push heroku main
   ```

6. **App öffnen**
   ```bash
   heroku open
   ```

#### Procfile

`Procfile` im Root erstellen:

```
web: npm start
```

---

### Option 4: VPS (Ubuntu Server)

Für volle Kontrolle auf eigenem VPS deployen.

#### Voraussetzungen

- Ubuntu 22.04 LTS Server
- SSH-Zugriff
- Domainname (optional)

#### Installationsschritte

```bash
# 1. Mit Server verbinden
ssh benutzer@ihre-server-ip

# 2. System aktualisieren
sudo apt update && sudo apt upgrade -y

# 3. Node.js installieren (v18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 4. PM2 installieren (Prozessmanager)
sudo npm install -g pm2

# 5. Repository klonen
git clone https://github.com/linobollansee/add-mvc-pattern-and-admin-panel.git
cd add-mvc-pattern-and-admin-panel

# 6. Abhängigkeiten installieren
npm install

# 7. .env-Datei erstellen
nano .env
# Produktionsvariablen hinzufügen, speichern (Ctrl+X, Y, Enter)

# 8. Anwendung erstellen
npm run build

# 9. Mit PM2 starten
pm2 start npm --name "blog-app" -- start

# 10. PM2-Konfiguration speichern
pm2 save
pm2 startup
# Befehlsausgabe folgen

# 11. Nginx Reverse Proxy einrichten
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/blog
```

Konfiguration hinzufügen:

```nginx
server {
    listen 80;
    server_name ihre-domain.com;

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
# Site aktivieren
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 12. SSL mit Let's Encrypt einrichten
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d ihre-domain.com
```

#### PM2-Befehle

```bash
# Logs anzeigen
pm2 logs blog-app

# Neustarten
pm2 restart blog-app

# Stoppen
pm2 stop blog-app

# Überwachen
pm2 monit

# Prozesse auflisten
pm2 list
```

---

## Produktionskonfiguration

### app.ts für Produktion aktualisieren

```typescript
// Produktionsspezifische Einstellungen
if (process.env.NODE_ENV === "production") {
  // Proxy vertrauen (für Railway, Heroku, etc.)
  app.set("trust proxy", 1);

  // Sichere Cookies
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true, // Nur HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "strict",
      },
    })
  );

  // Sicherheitsheader hinzufügen
  app.use(helmet());

  // Komprimierung aktivieren
  app.use(compression());
}
```

### Helmet.js für Sicherheit hinzufügen

```bash
npm install helmet compression
```

```typescript
import helmet from "helmet";
import compression from "compression";

app.use(helmet());
app.use(compression());
```

### Rate Limiting hinzufügen

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Jede IP auf 100 Anfragen pro windowMs begrenzen
});

app.use(limiter);

// Strengeres Limit für Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

app.post("/login", loginLimiter, authController.handleLogin);
```

---

## SSL/HTTPS-Einrichtung

### Kostenloses SSL mit Let's Encrypt (VPS)

```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx

# Zertifikat erhalten
sudo certbot --nginx -d ihre-domain.com

# Auto-Erneuerung (bereits durch certbot eingerichtet)
sudo certbot renew --dry-run
```

### Plattformspezifisches SSL

- **Railway**: Automatisches SSL auf benutzerdefinierten Domains
- **Render**: Kostenloses SSL enthalten
- **Heroku**: Kostenloses SSL auf bezahlten Dynos
- **DigitalOcean**: Kostenloses SSL enthalten

### HTTPS erzwingen

```typescript
// In app.ts (vor Routen)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && !req.secure) {
    return res.redirect("https://" + req.headers.host + req.url);
  }
  next();
});
```

---

## Leistungsoptimierung

### 1. Komprimierung aktivieren

```javascript
import compression from "compression";
app.use(compression());
```

### 2. Statische Assets cachen

```javascript
app.use(
  express.static("public", {
    maxAge: "1y",
    etag: true,
  })
);
```

### 3. Redis Session Store implementieren

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
    // ... andere Optionen
  })
);
```

---

## Überwachung & Protokollierung

### Winston Logger hinzufügen

```bash
npm install winston
```

`src/utils/logger.ts` erstellen:

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

### Sentry für Fehler-Tracking hinzufügen

```bash
npm install @sentry/node
```

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Vor Routen hinzufügen
app.use(Sentry.Handlers.requestHandler());

// Nach Routen, vor Fehler-Handlern hinzufügen
app.use(Sentry.Handlers.errorHandler());
```

---

## Backup-Strategie

### Automatische Backups

`scripts/backup.sh` erstellen:

```bash
#!/bin/bash

# Konfiguration
BACKUP_DIR="./backups"
DATA_FILE="./src/data/posts.json"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/posts_$TIMESTAMP.json"

# Backup-Verzeichnis erstellen
mkdir -p $BACKUP_DIR

# Backup erstellen
cp $DATA_FILE $BACKUP_FILE

# Nur letzte 30 Backups behalten
ls -t $BACKUP_DIR/posts_*.json | tail -n +31 | xargs rm -f

echo "Backup erstellt: $BACKUP_FILE"
```

### Cron Job (VPS)

```bash
# Crontab bearbeiten
crontab -e

# Tägliches Backup um 2 Uhr morgens hinzufügen
0 2 * * * /pfad/zur/app/scripts/backup.sh
```

---

## Rollback-Verfahren

### Schneller Rollback (Plattformspezifisch)

**Railway/Render:**

- Zu Deployments gehen
- Auf vorheriges Deployment klicken
- "Redeploy" klicken

**Heroku:**

```bash
heroku releases
heroku rollback v123
```

**PM2 (VPS):**

```bash
# Aktuell stoppen
pm2 stop blog-app

# Vorherige Version auschecken
git checkout <vorheriger-commit>

# Neu erstellen
npm run build

# Neustarten
pm2 restart blog-app
```

### Daten-Rollback

```bash
# Aus Backup wiederherstellen
cp backups/posts_JJJJMMTT_HHMMSS.json src/data/posts.json

# Anwendung neu starten
pm2 restart blog-app
```

---

## Post-Deployment-Überprüfung

### Checkliste

- [ ] Anwendung über HTTPS zugänglich
- [ ] Login-Funktionalität funktioniert
- [ ] Kann Beiträge erstellen/bearbeiten/löschen
- [ ] Öffentliche Seiten werden korrekt angezeigt
- [ ] SSL-Zertifikat gültig
- [ ] Alle statischen Assets werden geladen
- [ ] Keine Konsolenfehler im Browser
- [ ] Serverlogs zeigen keine Fehler
- [ ] Health-Check-Endpunkt antwortet
- [ ] Session-Persistenz funktioniert

---

**Glückwunsch! Ihr Blog ist jetzt live in Produktion! 🎉**
