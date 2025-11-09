# Fehlerbehebungs-Leitfaden

Häufige Probleme und Lösungen für die Blog MVC Admin-Anwendung.

## Inhaltsverzeichnis

- [Installationsprobleme](#installationsprobleme)
- [Laufzeitfehler](#laufzeitfehler)
- [Authentifizierungsprobleme](#authentifizierungsprobleme)
- [Daten- & Speicherprobleme](#daten---speicherprobleme)
- [Leistungsprobleme](#leistungsprobleme)
- [Deployment-Probleme](#deployment-probleme)
- [Entwicklungsprobleme](#entwicklungsprobleme)
- [Browser-Probleme](#browser-probleme)

---

## Installationsprobleme

### npm install schlägt fehl

**Symptome:**

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Lösungen:**

1. **npm-Cache leeren:**

   ```powershell
   npm cache clean --force
   Remove-Item -Recurse -Force node_modules, package-lock.json
   npm install
   ```

2. **Legacy Peer Dependencies verwenden:**

   ```powershell
   npm install --legacy-peer-deps
   ```

3. **npm aktualisieren:**

   ```powershell
   npm install -g npm@latest
   ```

4. **Node.js-Version prüfen:**
   ```powershell
   node --version  # Sollte v18.0.0 oder höher sein
   ```

---

### TypeScript-Kompilierungsfehler

**Symptome:**

```
error TS2307: Cannot find module './types/Post.js'
```

**Lösungen:**

1. **tsconfig.json überprüfen:**

   ```json
   {
     "compilerOptions": {
       "module": "CommonJS",
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

2. **KEINE .js-Erweiterung in Importen verwenden:**

   ```typescript
   // ✅ Korrekt
   import { Post } from "./types/Post";

   // ❌ Falsch
   import { Post } from "./types/Post.js";
   ```

3. **Bereinigen und neu erstellen:**
   ```powershell
   npm run clean
   npm run build
   ```

---

### Cannot find module 'express'

**Symptome:**

```
Error: Cannot find module 'express'
```

**Lösungen:**

1. **Abhängigkeiten neu installieren:**

   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

2. **package.json prüfen:**

   - Überprüfen, dass express in dependencies ist (nicht devDependencies)

3. **Explizit installieren:**
   ```powershell
   npm install express @types/express
   ```

---

## Laufzeitfehler

### Port 3000 bereits belegt

**Symptome:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Lösungen:**

**Windows (PowerShell):**

```powershell
# Prozess finden
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Prozess beenden
Stop-Process -Id <PID> -Force

# Oder alle Node-Prozesse beenden
Get-Process node | Stop-Process -Force
```

**Alternative:** Port in `src/app.ts` ändern:

```typescript
const port = 3001; // Von 3000 ändern
```

---

### Anwendung stürzt beim Start ab

**Symptome:**

```
Server running on http://localhost:3000
[Absturz ohne Fehler]
```

**Lösungen:**

1. **Nach Syntaxfehlern suchen:**

   ```powershell
   npm run build
   # Nach TypeScript-Fehlern suchen
   ```

2. **.env-Datei existiert überprüfen:**

   ```powershell
   Get-Item .env
   ```

3. **posts.json existiert überprüfen:**

   ```powershell
   Get-Content src\data\posts.json
   ```

   Falls fehlend, erstellen mit:

   ```json
   {
     "posts": [],
     "nextId": 1
   }
   ```

4. **Mit mehr Logging ausführen:**
   ```powershell
   $env:NODE_ENV="development"; npm run dev
   ```

---

### Modul nach Build nicht gefunden

**Symptome:**

```
Error: Cannot find module '/app/dist/app.js'
```

**Lösungen:**

1. **Build-Ausgabe überprüfen:**

   ```powershell
   Get-ChildItem dist\
   # Sollte app.js und andere kompilierte Dateien enthalten
   ```

2. **package.json-Skripte prüfen:**

   ```json
   {
     "scripts": {
       "build": "tsc",
       "postbuild": "xcopy /E /I /Y src\\views dist\\views && xcopy /E /I /Y src\\data dist\\data"
     }
   }
   ```

3. **Erforderliche Dateien manuell kopieren:**

   ```powershell
   # Views kopieren
   Copy-Item -Recurse src\views dist\views

   # Daten kopieren
   Copy-Item -Recurse src\data dist\data
   ```

---

## Authentifizierungsprobleme

### Anmeldung nicht möglich - "Invalid password"

**Symptome:**

- Korrektes Passwort zeigt "Invalid password" Fehler
- Keine Anmeldung möglich

**Lösungen:**

1. **.env-Datei prüfen:**

   ```powershell
   Get-Content .env
   ```

   Überprüfen, dass `ADMIN_PASSWORD` korrekt gesetzt ist

2. **Nach Leerzeichen suchen:**

   ```env
   # ❌ Falsch (hat Anführungszeichen)
   ADMIN_PASSWORD="meinpasswort"

   # ✅ Korrekt (keine Anführungszeichen)
   ADMIN_PASSWORD=meinpasswort
   ```

3. **Server nach .env-Änderungen neu starten:**

   ```powershell
   # Server stoppen (Strg+C)
   npm run dev
   ```

4. **Passwort in authController prüfen:**
   ```typescript
   console.log("Erwartet:", process.env.ADMIN_PASSWORD);
   console.log("Erhalten:", password);
   ```

---

### Session bleibt nicht bestehen

**Symptome:**

- Anmeldung erfolgreich, aber sofortige Umleitung zurück zu Login
- Kann nicht angemeldet bleiben
- "Access denied" nach Anmeldung

**Lösungen:**

1. **SESSION_SECRET in .env prüfen:**

   ```env
   SESSION_SECRET=ihr-geheimer-schluessel-mindestens-32-zeichen-lang
   ```

2. **Secure-Cookies in Entwicklung deaktivieren:**

   ```typescript
   // In app.ts
   app.use(
     session({
       cookie: {
         secure: false, // false für HTTP, true für HTTPS
         httpOnly: true,
       },
     })
   );
   ```

3. **Browser-Cookies löschen:**

   - DevTools öffnen (F12)
   - Application-Tab → Cookies
   - Alle für localhost:3000 löschen

4. **Cookie im Browser prüfen:**

   - DevTools → Application → Cookies
   - Sollte connect.sid-Cookie sehen
   - Falls fehlend, funktioniert Session-Middleware nicht

5. **Session-Middleware vor Routen überprüfen:**

   ```typescript
   // ✅ Korrekte Reihenfolge
   app.use(
     session({
       /* config */
     })
   );
   app.use("/admin", adminRoutes);

   // ❌ Falsche Reihenfolge
   app.use("/admin", adminRoutes);
   app.use(
     session({
       /* config */
     })
   );
   ```

---

### Unerwartet abgemeldet

**Symptome:**

- Session läuft zu schnell ab
- Nach Server-Neustart abgemeldet

**Lösungen:**

1. **Session-Timeout erhöhen:**

   ```typescript
   app.use(
     session({
       cookie: {
         maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Tage
       },
     })
   );
   ```

2. **Persistenten Session Store verwenden:**

   ```powershell
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

## Daten- & Speicherprobleme

### posts.json nicht gefunden

**Symptome:**

```
Error reading posts data: ENOENT: no such file or directory
```

**Lösungen:**

1. **Datei erstellen:**

   ```powershell
   New-Item -Path src\data -ItemType Directory -Force
   Set-Content -Path src\data\posts.json -Value '{"posts":[],"nextId":1}'
   ```

2. **Pfad in postModel.ts überprüfen:**

   ```typescript
   const DATA_FILE = path.join(__dirname, "../data/posts.json");
   console.log("Suche Posts in:", DATA_FILE);
   ```

3. **Dateiberechtigungen prüfen:**

   ```powershell
   icacls src\data\posts.json /grant Users:F
   ```

---

### Kann Posts nicht speichern - EACCES

**Symptome:**

```
Error writing posts data: EACCES: permission denied
```

**Lösungen:**

**Windows:**

```powershell
# Berechtigungen prüfen
icacls src\data\posts.json

# Schreibzugriff gewähren
icacls src\data\posts.json /grant Users:F
```

---

### posts.json beschädigt

**Symptome:**

```
SyntaxError: Unexpected token in JSON
```

**Lösungen:**

1. **JSON validieren:**

   ```powershell
   Get-Content src\data\posts.json | ConvertFrom-Json
   ```

2. **Aus Backup wiederherstellen:**

   ```powershell
   Copy-Item backups\posts_YYYYMMDD.json src\data\posts.json
   ```

3. **Auf leer zurücksetzen:**

   ```powershell
   Set-Content src\data\posts.json '{"posts":[],"nextId":1}'
   ```

4. **JSON manuell korrigieren:**
   - In Texteditor öffnen
   - Suchen nach:
     - Fehlenden Kommas
     - Zusätzlichen Kommas
     - Nicht passenden Klammern
     - Ungültigen Zeichen

---

### Alle Posts nach Neustart verloren

**Symptome:**

- Posts verschwinden nach Server-Neustart
- Passiert nur in Produktion

**Ursache:** Dateisystem ist ephemer (Heroku, einige Cloud-Plattformen)

**Lösungen:**

1. **Persistenten Speicher verwenden:**

   - Volume/Disk an Container anhängen
   - Datenbank statt JSON verwenden

2. **Für Docker:**
   ```yaml
   # docker-compose.yml
   services:
     app:
       volumes:
         - ./src/data:/app/src/data
   ```

---

## Leistungsprobleme

### Langsame Seitenladezeiten

**Symptome:**

- Seiten brauchen 3+ Sekunden zum Laden
- Hohe CPU-Auslastung

**Lösungen:**

1. **posts.json-Größe prüfen:**

   ```powershell
   (Get-Item src\data\posts.json).Length
   ```

   Falls > 1MB, Datenbankmigration erwägen

2. **Kompression aktivieren:**

   ```powershell
   npm install compression
   ```

   ```typescript
   import compression from "compression";
   app.use(compression());
   ```

3. **Caching hinzufügen:**

   ```typescript
   app.use(
     express.static("public", {
       maxAge: "1d",
       etag: true,
     })
   );
   ```

4. **Paginierung überall implementieren:**
   - Bereits für Beitragslisten vorhanden
   - Überprüfen, dass es korrekt funktioniert

---

### Hoher Speicherverbrauch

**Symptome:**

- Server stürzt mit "Out of memory" ab
- Speicherverbrauch wächst im Laufe der Zeit

**Lösungen:**

1. **Regelmäßig neu starten (PM2):**

   ```bash
   pm2 start npm --name "blog" -- start --max-memory-restart 200M
   ```

2. **Nach Speicherlecks suchen:**

   ```powershell
   node --inspect dist\app.js
   # Chrome DevTools zur Profilerstellung verwenden
   ```

3. **Persistenten Session Store verwenden:**
   - Speicher-Sessions wachsen unbegrenzt
   - Redis- oder Datenbank-Store verwenden

---

## Deployment-Probleme

### 502 Bad Gateway

**Symptome:**

- Nginx zeigt 502-Fehler
- App nicht erreichbar

**Lösungen:**

1. **Prüfen, dass App läuft:**

   ```bash
   pm2 list
   # oder
   ps aux | grep node
   ```

2. **Logs prüfen:**

   ```bash
   pm2 logs blog-app
   # oder
   tail -f /var/log/nginx/error.log
   ```

3. **Port-Konfiguration überprüfen:**

   ```nginx
   # /etc/nginx/sites-available/blog
   location / {
     proxy_pass http://localhost:3000;  # Mit App-Port abgleichen
   }
   ```

4. **Services neu starten:**
   ```bash
   pm2 restart blog-app
   sudo systemctl restart nginx
   ```

---

### Umgebungsvariablen funktionieren nicht

**Symptome:**

- `process.env.ADMIN_PASSWORD` ist undefined
- "Invalid password" in Produktion

**Lösungen:**

1. **.env-Datei existiert prüfen:**

   ```powershell
   Get-Item .env
   ```

2. **Überprüfen, dass dotenv geladen ist:**

   ```typescript
   // Am Anfang von app.ts
   import dotenv from "dotenv";
   dotenv.config();

   console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "✓" : "✗");
   ```

3. **Plattformspezifische Umgebung:**

   **Heroku:**

   ```bash
   heroku config:set ADMIN_PASSWORD=ihrpasswort
   ```

   **Railway/Render:**

   - In Dashboard Environment Variables Sektion setzen

   **Docker:**

   ```bash
   docker run -e ADMIN_PASSWORD=ihrpasswort ...
   ```

4. **.gitignore prüfen:**
   ```powershell
   Get-Content .gitignore | Select-String ".env"
   ```

---

### SSL/HTTPS-Probleme

**Symptome:**

- "Ihre Verbindung ist nicht privat"
- Mixed Content-Warnungen

**Lösungen:**

1. **SSL-Zertifikat überprüfen:**

   ```bash
   sudo certbot certificates
   ```

2. **Zertifikat erneuern:**

   ```bash
   sudo certbot renew
   ```

3. **HTTPS erzwingen:**

   ```typescript
   app.use((req, res, next) => {
     if (!req.secure && process.env.NODE_ENV === "production") {
       return res.redirect("https://" + req.get("host") + req.url);
     }
     next();
   });
   ```

4. **Secure Cookies aktivieren:**
   ```typescript
   app.use(
     session({
       cookie: {
         secure: true, // Funktioniert nur mit HTTPS
       },
     })
   );
   ```

---

## Entwicklungsprobleme

### Hot Reload funktioniert nicht

**Symptome:**

- Änderungen am Code werden nicht reflektiert
- Muss Server manuell neu starten

**Lösungen:**

1. **nodemon verwenden:**

   ```powershell
   npm run dev  # Sollte nodemon verwenden
   ```

2. **nodemon.json prüfen:**

   ```json
   {
     "watch": ["src"],
     "ext": "ts,njk",
     "exec": "ts-node --esm src/app.ts"
   }
   ```

3. **Cache leeren:**
   ```powershell
   Remove-Item -Recurse -Force dist\
   npm run build
   npm run dev
   ```

---

### TypeScript-Typen nicht erkannt

**Symptome:**

```
Property 'isAuthenticated' does not exist on type 'SessionData'
```

**Lösungen:**

1. **TypeScript-Server neu starten:**

   - VS Code: Strg+Umschalt+P → "TypeScript: Restart TS Server"

2. **Prüfen, dass Typen importiert sind:**

   ```typescript
   import "./types/Session.js";
   ```

3. **Declaration Merging überprüfen:**
   ```typescript
   // src/types/Session.ts
   declare module "express-session" {
     interface SessionData {
       isAuthenticated?: boolean;
     }
   }
   ```

---

## Browser-Probleme

### WYSIWYG-Editor lädt nicht

**Symptome:**

- Textarea wird anstelle von Rich-Editor angezeigt
- Konsolenfehler über Editor-Bibliothek

**Lösungen:**

1. **Prüfen, dass Editor-Skript geladen:**

   ```html
   <!-- In views/admin/posts/edit.njk -->
   <script src="https://cdn.quilljs.com/..."></script>
   ```

2. **Konsole nach Fehlern prüfen:**

   - F12 → Console-Tab
   - Nach 404- oder CORS-Fehlern suchen

3. **Element-ID überprüfen:**

   ```html
   <textarea id="content"></textarea>
   ```

   ```javascript
   var quill = new Quill("#content");
   ```

---

### Statische Dateien 404

**Symptome:**

- CSS lädt nicht
- Bilder werden nicht angezeigt
- 404-Fehler für /css/style.css

**Lösungen:**

1. **Static-Middleware prüfen:**

   ```typescript
   app.use(express.static(path.join(__dirname, "../public")));
   ```

2. **Dateipfade überprüfen:**

   ```powershell
   Get-ChildItem public\css\
   Get-ChildItem dist\  # Nach Build
   ```

3. **Pfade in Templates prüfen:**

   ```html
   <!-- ✅ Korrekt (kein 'public' im Pfad) -->
   <link rel="stylesheet" href="/css/style.css" />

   <!-- ❌ Falsch -->
   <link rel="stylesheet" href="/public/css/style.css" />
   ```

---

## Weitere Hilfe erhalten

Falls Ihr Problem hier nicht behandelt wird:

### 1. Dokumentation prüfen

- [README.md](README_DE.md) - Übersicht
- [SETUP.md](SETUP_DE.md) - Installation
- [API.md](API_DE.md) - API-Referenz
- [SECURITY.md](SECURITY_DE.md) - Sicherheitsprobleme

### 2. GitHub Issues durchsuchen

- Bestehende Issues: https://github.com/linobollansee/add-mvc-pattern-and-admin-panel/issues
- Vielleicht ist Ihr Problem bereits gelöst!

### 3. Debug-Logging aktivieren

```typescript
// In app.ts
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
```

### 4. Issue erstellen

Einschließen:

- Fehlermeldungen (vollständiger Stack-Trace)
- Schritte zur Reproduktion
- Umgebung (OS, Node-Version, etc.)
- Was Sie versucht haben
- Relevante Code-Snippets

---

## Häufige Fehlermeldungen

### Schnellreferenz

| Fehler                     | Wahrscheinliche Ursache | Lösung                           |
| -------------------------- | ----------------------- | -------------------------------- |
| EADDRINUSE                 | Port belegt             | Prozess beenden oder Port ändern |
| ENOENT                     | Datei nicht gefunden    | Dateipfad prüfen                 |
| EACCES                     | Zugriff verweigert      | Dateiberechtigungen korrigieren  |
| Cannot find module         | Abhängigkeitsproblem    | npm install                      |
| Invalid password           | Falsches .env-Passwort  | ADMIN_PASSWORD prüfen            |
| 502 Bad Gateway            | App abgestürzt          | Logs prüfen, App neu starten     |
| Session funktioniert nicht | Cookie-Einstellungen    | secure/httpOnly prüfen           |
| TypeScript-Fehler          | Typen-Inkompatibilität  | Typ-Definitionen prüfen          |

---

**Immer noch nicht weiter? Öffnen Sie ein Issue mit Details und wir helfen! 🚑**
