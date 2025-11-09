# Einrichtungsanleitung

Vollständige Installations- und Konfigurationsanleitung für die Blog MVC Admin-Anwendung.

## Inhaltsverzeichnis

- [Voraussetzungen](#voraussetzungen)
- [Schritt-für-Schritt-Installation](#schritt-für-schritt-installation)
- [Umgebungskonfiguration](#umgebungskonfiguration)
- [Datenbank-Einrichtung](#datenbank-einrichtung)
- [IDE-Einrichtung](#ide-einrichtung)
- [Überprüfung](#überprüfung)
- [Fehlerbehebung](#fehlerbehebung)

## Voraussetzungen

### Erforderliche Software

1. **Node.js** (v18.0.0 oder höher)

   - Download von: https://nodejs.org/
   - Installation überprüfen: `node --version`
   - Sollte ausgeben: `v18.0.0` oder höher

2. **npm** (kommt mit Node.js) oder **yarn**

   - npm überprüfen: `npm --version`
   - Sollte ausgeben: `9.0.0` oder höher

3. **Git** (optional, zum Klonen)
   - Download von: https://git-scm.com/
   - Überprüfen: `git --version`

### Empfohlene Software

- **VS Code** - Beste IDE für TypeScript-Entwicklung
- **Postman** - Zum Testen von API-Endpunkten
- **Chrome/Firefox** - Moderner Browser mit DevTools

## Schritt-für-Schritt-Installation

### 1. Projekt beziehen

**Option A: Von Git klonen**

```bash
git clone https://github.com/linobollansee/add-mvc-pattern-and-admin-panel.git
cd add-mvc-pattern-and-admin-panel
```

**Option B: ZIP herunterladen**

- ZIP-Datei herunterladen und extrahieren
- Terminal im extrahierten Ordner öffnen

### 2. Abhängigkeiten installieren

```bash
npm install
```

**Was wird installiert:**

- Express.js - Web-Framework
- TypeScript - Typsicheres JavaScript
- Nunjucks - Template-Engine
- express-session - Sitzungsverwaltung
- sanitize-html - XSS-Schutz
- dotenv - Umgebungsvariablen
- Und Entwicklungsabhängigkeiten (nodemon, @types/\*, etc.)

**Erwartete Ausgabe:**

```
added 150 packages, and audited 151 packages in 15s
```

### 3. Umgebungsdatei erstellen

Erstellen Sie eine `.env`-Datei im Projektverzeichnis:

**Windows (PowerShell):**

```powershell
New-Item .env -ItemType File
```

**Windows (Eingabeaufforderung):**

```cmd
type nul > .env
```

**Mac/Linux:**

```bash
touch .env
```

Bearbeiten Sie `.env` mit Ihrem bevorzugten Texteditor und fügen Sie hinzu:

```env
# Sitzungsgeheimnis - verwenden Sie eine zufällige Zeichenfolge (mindestens 32 Zeichen)
SESSION_SECRET=ihr-super-geheimer-schlüssel-ändern-sie-dies-in-produktion-min-32-zeichen

# Admin-Anmeldedaten
ADMIN_USERNAME=admin
ADMIN_PASSWORD=SicheresPasswort123!

# Umgebung (development, production oder test)
NODE_ENV=development
```

### 4. Datenverzeichnis überprüfen

Stellen Sie sicher, dass `src/data/posts.json` existiert. Falls nicht, erstellen Sie es:

**Datei mit Anfangsdaten erstellen:**

```json
{
  "posts": [],
  "nextId": 1
}
```

### 5. Projekt erstellen

TypeScript zu JavaScript kompilieren:

```bash
npm run build
```

Dies erstellt einen `dist/`-Ordner mit kompiliertem Code.

### 6. Anwendung starten

**Entwicklungsmodus (mit automatischem Neuladen):**

```bash
npm run dev
```

**Produktionsmodus:**

```bash
npm start
```

### 7. Auf die Anwendung zugreifen

Öffnen Sie Ihren Browser und navigieren Sie zu:

- **Öffentlicher Blog**: http://localhost:3000/posts
- **Admin-Panel**: http://localhost:3000/admin (erfordert Login)
- **Login-Seite**: http://localhost:3000/login

## Umgebungskonfiguration

### Umgebungsvariablen erklärt

| Variable         | Erforderlich | Standard    | Beschreibung                                                                                                 |
| ---------------- | ------------ | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `SESSION_SECRET` | Ja           | -           | Geheimer Schlüssel zum Verschlüsseln von Sitzungs-Cookies. Verwenden Sie eine starke zufällige Zeichenfolge. |
| `ADMIN_PASSWORD` | Ja           | -           | Passwort für Admin-Panel-Zugriff                                                                             |
| `ADMIN_USERNAME` | Nein         | admin       | Admin-Benutzername (derzeit nicht verwendet, für zukünftige Verwendung reserviert)                           |
| `NODE_ENV`       | Nein         | development | Anwendungsumgebungsmodus                                                                                     |

### Starkes Sitzungsgeheimnis generieren

**Option 1: Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: PowerShell**

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Option 3: Online-Generator**

- Besuchen Sie: https://randomkeygen.com/
- Kopieren Sie einen "CodeIgniter Encryption Key"

### Umgebungsspezifische Konfiguration

**Entwicklung (.env.development):**

```env
SESSION_SECRET=dev-geheimer-schlüssel-nicht-für-produktion
ADMIN_PASSWORD=admin123
NODE_ENV=development
```

**Produktion (.env.production):**

```env
SESSION_SECRET=<starke-zufällige-64-zeichen-zeichenfolge>
ADMIN_PASSWORD=<starkes-eindeutiges-passwort>
NODE_ENV=production
```

## Datenbank-Einrichtung

Diese Anwendung verwendet JSON-dateibasierte Speicherung. Keine traditionelle Datenbank-Einrichtung erforderlich!

### Anfangsdatenstruktur

Die Struktur der `src/data/posts.json`-Datei:

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Willkommen in meinem Blog",
      "slug": "willkommen-in-meinem-blog",
      "excerpt": "Das ist mein erster Blog-Beitrag.",
      "content": "<p>Willkommen in meinem Blog! Das ist der vollständige Inhalt.</p>",
      "author": "Admin",
      "createdAt": "2025-11-09T10:00:00.000Z",
      "updatedAt": "2025-11-09T10:00:00.000Z"
    }
  ],
  "nextId": 2
}
```

### Beispieldaten hinzufügen

Um mit Beispielbeiträgen zu füllen, können Sie:

1. **Admin-Panel verwenden** (empfohlen)

   - Einloggen unter http://localhost:3000/login
   - Beiträge über die Benutzeroberfläche erstellen

2. **posts.json manuell bearbeiten**
   - Obige Struktur kopieren
   - Weitere Beitragsobjekte zum Array hinzufügen
   - `nextId` entsprechend erhöhen

### Backup-Strategie

**Automatische Backups (empfohlen):**
Backup-Skript `backup-data.js` erstellen:

```javascript
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "src/data/posts.json");
const backup = path.join(__dirname, "backups", `posts-${Date.now()}.json`);

fs.mkdirSync(path.dirname(backup), { recursive: true });
fs.copyFileSync(source, backup);
console.log("Backup erstellt:", backup);
```

Vor größeren Änderungen ausführen:

```bash
node backup-data.js
```

## IDE-Einrichtung

### VS Code (Empfohlen)

#### Empfohlene Erweiterungen

Installieren Sie diese Erweiterungen für die beste Entwicklererfahrung:

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

Installation über VS Code:

1. Drücken Sie `Ctrl+Shift+X` (Windows/Linux) oder `Cmd+Shift+X` (Mac)
2. Suchen Sie nach jeder Erweiterung
3. Klicken Sie auf "Install"

#### VS Code-Einstellungen

Erstellen Sie `.vscode/settings.json`:

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

#### Launch-Konfiguration

Erstellen Sie `.vscode/launch.json` zum Debuggen:

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

## Überprüfung

### 1. Installation überprüfen

```bash
# Node.js überprüfen
node --version
# Sollte ausgeben: v18.0.0 oder höher

# npm überprüfen
npm --version
# Sollte ausgeben: 9.0.0 oder höher

# Installierte Abhängigkeiten überprüfen
npm list --depth=0
# Sollte alle Pakete ohne Fehler anzeigen
```

### 2. TypeScript-Kompilierung überprüfen

```bash
npm run build
```

Erwartete Ausgabe:

```
TypeScript-Dateien erfolgreich nach dist/ kompiliert
```

### 3. Anwendung testen

Im Entwicklungsmodus starten:

```bash
npm run dev
```

Sie sollten sehen:

```
Server läuft auf http://localhost:3000
```

### 4. Routen überprüfen

Testen Sie diese URLs in Ihrem Browser:

- ✅ http://localhost:3000 → Sollte zu `/posts` umleiten
- ✅ http://localhost:3000/posts → Sollte Blog-Beitragsliste anzeigen
- ✅ http://localhost:3000/login → Sollte Login-Formular anzeigen
- ✅ http://localhost:3000/admin → Sollte zu Login umleiten (falls nicht authentifiziert)

### 5. Admin-Login testen

1. Zu http://localhost:3000/login gehen
2. Passwort aus `.env`-Datei eingeben
3. Sollte zu Admin-Dashboard umleiten
4. Sollte "Beiträge verwalten"-Oberfläche anzeigen

## Fehlerbehebung

### Häufige Probleme

#### 1. Port 3000 bereits in Verwendung

**Fehler:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Lösung:**

**Windows (PowerShell):**

```powershell
# Prozess finden, der Port 3000 verwendet
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Prozess beenden
Stop-Process -Id <PID> -Force
```

**Mac/Linux:**

```bash
# Prozess finden
lsof -i :3000

# Prozess beenden
kill -9 <PID>
```

**Oder Port in `src/app.ts` ändern:**

```typescript
const port = 3001; // Von 3000 ändern
```

#### 2. Modul nicht gefunden-Fehler

**Fehler:**

```
Cannot find module 'express'
```

**Lösung:**

```bash
# node_modules löschen und neu installieren
rm -rf node_modules package-lock.json
npm install
```

#### 3. TypeScript-Kompilierungsfehler

**Fehler:**

```
error TS2307: Cannot find module './types/Post.js'
```

**Lösung:**
Stellen Sie sicher, dass `tsconfig.json` die korrekten Einstellungen hat:

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

#### 4. Sitzung bleibt nicht bestehen

**Symptome:**

- Login erfolgreich, aber sofort zurück zu Login umgeleitet
- Admin-Panel-Zugriff nach Login verweigert

**Lösungen:**

1. **SESSION_SECRET in .env prüfen**
2. **Browser-Cookies löschen**
3. **Server neu starten**
4. **Cookie-Einstellungen in `src/app.ts` prüfen:**
   ```typescript
   cookie: {
     secure: false, // Sollte in Entwicklung false sein
     httpOnly: true
   }
   ```

#### 5. Umgebungsvariablen werden nicht geladen

**Fehler:**

```
ADMIN_PASSWORD is undefined
```

**Lösungen:**

1. **.env-Datei existiert im Projektverzeichnis überprüfen**
2. **.env-Dateiformat prüfen** (keine Anführungszeichen erforderlich):
   ```env
   ADMIN_PASSWORD=meinpasswort
   # NICHT: ADMIN_PASSWORD="meinpasswort"
   ```
3. **Entwicklungsserver neu starten**
4. **dotenv in app.ts importiert prüfen:**
   ```typescript
   import dotenv from "dotenv";
   dotenv.config();
   ```

## Nächste Schritte

Nach erfolgreicher Einrichtung:

1. 📖 Lesen Sie [ARCHITECTURE.md](ARCHITECTURE.md), um die Codebase-Struktur zu verstehen
2. 🔐 Überprüfen Sie [SECURITY.md](SECURITY.md) für Sicherheits-Best-Practices
3. 🚀 Prüfen Sie [DEPLOYMENT.md](DEPLOYMENT.md) für Produktions-Deployment
4. 🧪 Erkunden Sie [TESTING.md](TESTING.md), um Tests hinzuzufügen
5. 📝 Siehe [CONTRIBUTING.md](CONTRIBUTING.md), um beizutragen

## Schnellreferenz

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsmodus (automatisches Neuladen)
npm run dev

# Für Produktion erstellen
npm run build

# Produktions-Build ausführen
npm start

# Build-Verzeichnis bereinigen
npm run clean

# Watch-Modus (bei Speicherung kompilieren)
npm run watch
```

**Standard-URLs:**

- Öffentlicher Blog: http://localhost:3000/posts
- Admin-Panel: http://localhost:3000/admin
- Login: http://localhost:3000/login

**Standard-Anmeldedaten:**

- Passwort: In `.env`-Datei festgelegt (`ADMIN_PASSWORD`)

---

✅ Einrichtung abgeschlossen! Sie sind bereit, mit der Entwicklung zu beginnen.
