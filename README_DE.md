# Blog MVC AdminEine voll ausgestattete Blog-Anwendung mit Express.js, TypeScript und dem MVC-Muster (Model-View-Controller). Enthält ein Admin-Panel zur Verwaltung von Blog-Beiträgen mit Authentifizierung und einem WYSIWYG-Editor.

## Funktionen

### Öffentliche Funktionen

- 📝 Blog-Beiträge durchsuchen
- 📖 Einzelne Blog-Beiträge lesen
- 🎨 Saubere, responsive Benutzeroberfläche

### Admin-Panel

- 🔐 Sicheres Authentifizierungssystem
- ✏️ Blog-Beiträge erstellen, lesen, aktualisieren und löschen
- 📝 WYSIWYG-Editor für die Bearbeitung reichhaltiger Inhalte
- 🧹 HTML-Bereinigung für Sicherheit
- 📊 Alle Beiträge von einem zentralen Dashboard aus verwalten

## Technologie-Stack

- **Backend**: Node.js, Express.js
- **Sprache**: TypeScript
- **Template-Engine**: Nunjucks
- **Sitzungsverwaltung**: express-session
- **Sicherheit**: sanitize-html für XSS-Schutz
- **Datenspeicherung**: JSON-dateibasierte Speicherung

## Projektstruktur

```
├── src/
│   ├── app.ts                 # Anwendungs-Einstiegspunkt
│   ├── controllers/           # Geschäftslogik
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   └── postController.ts
│   ├── models/                # Datenmodelle
│   │   └── postModel.ts
│   ├── views/                 # Nunjucks-Templates
│   │   ├── layout.njk
│   │   ├── login.njk
│   │   ├── admin/            # Admin-Panel-Views
│   │   └── posts/            # Öffentliche Beitrags-Views
│   ├── routes/               # Routendefinitionen
│   │   ├── adminRoutes.ts
│   │   ├── authRoutes.ts
│   │   └── postRoutes.ts
│   ├── middleware/           # Benutzerdefinierte Middleware
│   │   └── auth.ts
│   ├── types/               # TypeScript-Typdefinitionen
│   └── data/                # JSON-Datenspeicherung
├── public/                  # Statische Assets
│   ├── css/
│   └── js/
└── package.json
```

## Voraussetzungen

- Node.js (v18 oder höher empfohlen)
- npm oder yarn

## Installation

1. Repository klonen:

```bash
git clone <repository-url>
cd add-mvc-pattern-and-admin-panel
```

2. Abhängigkeiten installieren:

```bash
npm install
```

3. Eine `.env`-Datei im Stammverzeichnis erstellen:

```env
SESSION_SECRET=ihr-geheimer-schlüssel-hier
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ihr-passwort-hier
```

## Verwendung

### Entwicklungsmodus

Anwendung mit automatischem Neuladen ausführen:

```bash
npm run dev
```

### Produktions-Build

1. TypeScript-Code erstellen:

```bash
npm run build
```

2. Anwendung starten:

```bash
npm start
```

### Weitere Befehle

- **Build-Verzeichnis bereinigen**: `npm run clean`
- **Watch-Modus** (Kompilieren bei Speicherung): `npm run watch`

## Zugriff auf die Anwendung

- **Öffentlicher Blog**: http://localhost:3000/posts
- **Admin-Panel**: http://localhost:3000/admin
- **Login**: http://localhost:3000/login

Standard-Admin-Anmeldedaten (in `.env` festgelegt):

- Benutzername: admin
- Passwort: (über ADMIN_PASSWORD-Umgebungsvariable festgelegt)

## MVC-Architektur

Dieses Projekt folgt dem Model-View-Controller-Muster:

- **Models** (`src/models/`): Verarbeiten Datenoperationen und Geschäftslogik
- **Views** (`src/views/`): Nunjucks-Templates zum Rendern von HTML
- **Controllers** (`src/controllers/`): Verarbeiten Anfragen und koordinieren zwischen Models und Views

## Sicherheitsfunktionen

- Sitzungsbasierte Authentifizierung
- HTML-Bereinigung zur Verhinderung von XSS-Angriffen
- Geschützte Admin-Routen mit Authentifizierungs-Middleware
- Nur-HTTP-Cookies
- Umgebungsvariablenbasierte Konfiguration

## API-Routen

### Öffentliche Routen

- `GET /` - Leitet zur Beitragsliste um
- `GET /posts` - Alle Blog-Beiträge auflisten
- `GET /posts/:id` - Einzelnen Beitrag anzeigen

### Auth-Routen

- `GET /login` - Login-Seite
- `POST /login` - Login verarbeiten
- `GET /logout` - Benutzer abmelden

### Admin-Routen (Geschützt)

- `GET /admin` - Leitet zu Admin-Beiträgen um
- `GET /admin/posts` - Alle Beiträge auflisten (Admin-Ansicht)
- `GET /admin/posts/new` - Formular für neuen Beitrag erstellen
- `POST /admin/posts` - Neuen Beitrag speichern
- `GET /admin/posts/:id/edit` - Formular zum Bearbeiten von Beiträgen
- `POST /admin/posts/:id` - Beitrag aktualisieren
- `POST /admin/posts/:id/delete` - Beitrag löschen

## Mitwirken

Beiträge sind willkommen! Bitte befolgen Sie diese Schritte:

1. Repository forken
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

## Lizenz

ISC

## Danksagungen

Erstellt als Teil einer Coding-Challenge zur Implementierung des MVC-Musters und der Admin-Panel-Funktionalität.
