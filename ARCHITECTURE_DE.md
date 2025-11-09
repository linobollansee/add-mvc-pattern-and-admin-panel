# Anwendungsarchitektur-Leitfaden

## 📋 Überblick

Dies ist eine Blog-Anwendung, die mit dem **MVC (Model-View-Controller)**-Muster unter Verwendung von Express.js, TypeScript und Nunjucks-Templates erstellt wurde.

---

## 🏗️ Architekturfluss

```
Benutzeranfrage → Routen → Middleware (Auth) → Controller → Model → Datenbank (JSON)
                                                     ↓
                                                   View (Nunjucks Template)
                                                     ↓
                                                 HTML-Antwort
```

---

## 📁 Dateistruktur & Verbindungen

### **Einstiegspunkt**

- **`src/app.ts`** - Haupt-Anwendungsdatei
  - Initialisiert Express-Server
  - Konfiguriert Middleware (Session, Body-Parser, statische Dateien)
  - Richtet Nunjucks-Templating-Engine ein
  - Bindet alle Routenmodule ein
  - **Importiert:** `postRoutes`, `adminRoutes`, `authRoutes`
  - **Verwendet:** `.env`-Datei für Konfiguration

---

## 🎯 Anfrage-Fluss nach Funktion

### **1. ÖFFENTLICHER BLOG (Keine Authentifizierung)**

#### Alle Beiträge anzeigen: `/posts`

```
Benutzer → /posts
  → app.ts (Router)
    → routes/postRoutes.ts
      → controllers/postController.ts (index-Funktion)
        → models/postModel.ts (getAllPosts)
          → data/posts.json (lesen)
        ← gibt Post[] zurück
      → rendert views/posts/index.njk
    ← HTML-Antwort mit Beitragsliste
```

#### Einzelnen Beitrag anzeigen: `/posts/mein-erster-beitrag`

```
Benutzer → /posts/:slug
  → app.ts (Router)
    → routes/postRoutes.ts
      → controllers/postController.ts (show-Funktion)
        → models/postModel.ts (getPostBySlug)
          → data/posts.json (lesen)
        ← gibt Post oder undefined zurück
      → rendert views/posts/show.njk
    ← HTML-Antwort mit vollständigem Beitrag
```

---

### **2. AUTHENTIFIZIERUNG**

#### Login: `/login`

```
GET /login
  → routes/authRoutes.ts
    → controllers/authController.ts (showLogin)
      → prüft ob bereits eingeloggt (session.isAuthenticated)
      → rendert views/login.njk
    ← HTML-Login-Formular

POST /login (Formularübermittlung)
  → routes/authRoutes.ts
    → controllers/authController.ts (handleLogin)
      → prüft Passwort gegen process.env.ADMIN_PASSWORD
      → wenn korrekt: setzt session.isAuthenticated = true
      → leitet um zu /admin/posts oder returnTo-URL
    ← Umleitungsantwort
```

#### Logout: `/logout`

```
GET /logout
  → routes/authRoutes.ts
    → controllers/authController.ts (handleLogout)
      → zerstört Session
      → leitet um zu /
    ← Umleitung zur Startseite
```

---

### **3. ADMIN-PANEL (Authentifizierung erforderlich)**

#### Zugriffsschutz-Fluss

```
Benutzer → /admin/posts
  → app.ts (Router)
    → routes/adminRoutes.ts
      → middleware/auth.ts (requireAuth)
        → prüft session.isAuthenticated
        → wenn false:
          - speichert returnTo-URL
          - leitet um zu /login
        → wenn true: ruft next() auf
      → controllers/adminController.ts
```

#### Beiträge auflisten (Admin): `/admin/posts`

```
Benutzer (eingeloggt) → /admin/posts
  → routes/adminRoutes.ts (requireAuth angewendet)
    → controllers/adminController.ts (index)
      → models/postModel.ts (getAllPosts oder searchPosts)
        → data/posts.json (lesen)
      → rendert views/admin/posts/index.njk
    ← HTML mit Beitragsliste + Bearbeiten/Löschen-Buttons
```

#### Beitrag erstellen: `/admin/posts/new`

```
GET /admin/posts/new
  → routes/adminRoutes.ts
    → controllers/adminController.ts (create)
      → rendert views/admin/posts/edit.njk (leeres Formular)
    ← HTML-Formular

POST /admin/posts (Formularübermittlung)
  → routes/adminRoutes.ts
    → controllers/adminController.ts (store)
      → validiert Eingabe
      → models/postModel.ts (createPost)
        → generiert Slug aus Titel
        → bereinigt HTML-Inhalt
        → fügt Zeitstempel hinzu
        → schreibt in data/posts.json
      → leitet um zu /admin/posts
    ← Umleitungsantwort
```

#### Beitrag bearbeiten: `/admin/posts/5/edit`

```
GET /admin/posts/:id/edit
  → routes/adminRoutes.ts
    → controllers/adminController.ts (edit)
      → models/postModel.ts (getPostById)
        → data/posts.json (lesen)
      → rendert views/admin/posts/edit.njk (ausgefülltes Formular)
    ← HTML-Formular mit vorhandenen Daten

POST /admin/posts/:id (Formularübermittlung)
  → routes/adminRoutes.ts
    → controllers/adminController.ts (update)
      → validiert Eingabe
      → models/postModel.ts (updatePost)
        → aktualisiert Beitrag im Speicher
        → generiert Slug neu
        → bereinigt HTML
        → aktualisiert updatedAt-Zeitstempel
        → schreibt in data/posts.json
      → leitet um zu /admin/posts
    ← Umleitungsantwort
```

#### Beitrag löschen: `/admin/posts/5/delete`

```
POST /admin/posts/:id/delete
  → routes/adminRoutes.ts
    → controllers/adminController.ts (destroy)
      → models/postModel.ts (deletePost)
        → entfernt Beitrag aus Array
        → schreibt in data/posts.json
      → leitet um zu /admin/posts
    ← Umleitungsantwort
```

---

## 📦 Modulverantwortlichkeiten

### **Routen** (URL-Zuordnung)

| Datei            | Basispfad | Zweck                    | Auth erforderlich |
| ---------------- | --------- | ------------------------ | ----------------- |
| `authRoutes.ts`  | `/`       | Login/Logout             | Nein              |
| `postRoutes.ts`  | `/posts`  | Öffentliche Blog-Ansicht | Nein              |
| `adminRoutes.ts` | `/admin`  | Beitragsverwaltung       | Ja                |

### **Controller** (Anfrage-Handler)

| Datei                | Verwendet von | Zweck                    |
| -------------------- | ------------- | ------------------------ |
| `authController.ts`  | `authRoutes`  | Login/Logout verarbeiten |
| `postController.ts`  | `postRoutes`  | Blog-Beiträge anzeigen   |
| `adminController.ts` | `adminRoutes` | CRUD-Operationen         |

### **Models** (Datenzugriff)

| Datei          | Verwendet von   | Zweck                      |
| -------------- | --------------- | -------------------------- |
| `postModel.ts` | Alle Controller | posts.json lesen/schreiben |

### **Middleware** (Anfrage-Interceptoren)

| Datei     | Angewendet auf       | Zweck                                      |
| --------- | -------------------- | ------------------------------------------ |
| `auth.ts` | `adminRoutes` (alle) | Nicht authentifizierte Benutzer blockieren |

### **Types** (TypeScript-Definitionen)

| Datei            | Verwendet von                 | Zweck                   |
| ---------------- | ----------------------------- | ----------------------- |
| `Post.ts`        | Models, Controller            | Beitragsdatenstrukturen |
| `Session.ts`     | Alle Dateien mit Sessions     | Session-Eigenschaften   |
| `Environment.ts` | `app.ts`, `authController.ts` | Umgebungsvariablentypen |

### **Views** (Templates)

| Verzeichnis/Datei             | Gerendert von     | Zweck                         |
| ----------------------------- | ----------------- | ----------------------------- |
| `views/layout.njk`            | Alle Views        | Basis-Template                |
| `views/login.njk`             | `authController`  | Login-Formular                |
| `views/posts/index.njk`       | `postController`  | Öffentliche Beitragsliste     |
| `views/posts/show.njk`        | `postController`  | Einzelne Beitragsansicht      |
| `views/admin/layout.njk`      | Admin-Views       | Admin-Basis-Template          |
| `views/admin/posts/index.njk` | `adminController` | Admin-Beitragsliste           |
| `views/admin/posts/edit.njk`  | `adminController` | Erstellen/Bearbeiten-Formular |

---

## 🔐 Authentifizierungssystem

### Session-Fluss

1. **Login**: `authController.handleLogin()` setzt `session.isAuthenticated = true`
2. **Schutz**: `middleware/auth.ts` prüft `session.isAuthenticated`
3. **Logout**: `authController.handleLogout()` zerstört Session

### Session-Eigenschaften (definiert in `types/Session.ts`)

- `isAuthenticated` - Boolean-Flag für Login-Status
- `returnTo` - URL für Umleitung nach Login
- `username` - Reserviert für zukünftige Verwendung

---

## 💾 Datenspeicherung

### Datenbank: `src/data/posts.json`

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Mein erster Beitrag",
      "slug": "mein-erster-beitrag",
      "excerpt": "Kurze Zusammenfassung...",
      "content": "<p>Vollständiger HTML-Inhalt...</p>",
      "author": "Max Mustermann",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "nextId": 2
}
```

### Datenoperationen (in `postModel.ts`)

- **Lesen**: `fs.readFile()` → JSON parsen → Daten zurückgeben
- **Schreiben**: Daten ändern → `JSON.stringify()` → `fs.writeFile()`
- **Bereinigung**: HTML-Inhalt mit `sanitize-html`-Bibliothek bereinigt

---

## 🔄 Schlüsselkonzepte

### MVC-Muster

- **Model** (`postModel.ts`): Datenlogik, Datenbankoperationen
- **View** (`views/*.njk`): Präsentationsschicht, HTML-Templates
- **Controller** (`*Controller.ts`): Geschäftslogik, verbindet Model & View

### Slug-System

- **Zweck**: URL-freundliche Beitrags-Identifikatoren
- **Generierung**: `createSlug()` in `postModel.ts`
- **Beispiel**: "Hallo Welt!" → "hallo-welt"
- **Verwendung**: `/posts/hallo-welt` statt `/posts/1`

### Paginierung

- **Öffentlicher Blog**: 6 Beiträge pro Seite (`postController.ts`)
- **Admin-Panel**: 10 Beiträge pro Seite (`adminController.ts`)
- **Implementierung**: Offset basierend auf Seitennummer berechnen, Array slicen

### Suche

- **Ort**: Nur Admin-Panel
- **Implementierung**: `searchPosts()` in `postModel.ts`
- **Durchsucht**: Titel-, Auszug- und Inhaltsfelder

---

## 🌐 Umgebungsvariablen (`.env`-Datei)

```env
SESSION_SECRET=ihr-geheimer-schlüssel-hier
ADMIN_PASSWORD=ihr-admin-passwort
NODE_ENV=development
```

### Verwendung

- **SESSION_SECRET**: Verschlüsselt Session-Cookies (`app.ts`)
- **ADMIN_PASSWORD**: Login-Authentifizierung (`authController.ts`)
- **NODE_ENV**: Umgebungsmodus (derzeit nicht aktiv verwendet)

---

## 🚀 Startsequenz

1. `npm run dev` oder `npm start`
2. `.env`-Variablen laden
3. Express-App initialisieren
4. Nunjucks-Templates konfigurieren
5. Session-Middleware einrichten
6. Routenmodule einbinden
7. Auf Port 3000 lauschen beginnen
8. Bereit, Anfragen entgegenzunehmen!

---

## 📝 Neue Funktion hinzufügen - Beispiel-Workflow

### Beispiel: Kommentarsystem hinzufügen

1. **Types aktualisieren** (`types/Comment.ts`)

   - Comment-Interface definieren

2. **Model aktualisieren** (`models/commentModel.ts`)

   - CRUD-Funktionen für Kommentare hinzufügen
   - comments.json lesen/schreiben

3. **Controller aktualisieren** (`controllers/commentController.ts`)

   - Funktionen zum Verarbeiten von Kommentarerstellung, Anzeige hinzufügen

4. **Routen erstellen** (`routes/commentRoutes.ts`)

   - URL-Muster für Kommentare definieren

5. **Views aktualisieren** (`views/posts/show.njk`)

   - Kommentarformular und Anzeige hinzufügen

6. **Routen einbinden** (`app.ts`)
   - `app.use('/comments', commentRoutes)` hinzufügen

---

## 🔍 Debugging-Tipps

1. **Routen-Reihenfolge prüfen** in `app.ts` - spezifische Routen vor generischen
2. **Authentifizierung überprüfen** - ist `requireAuth` korrekt angewendet?
3. **Session inspizieren** - ist `isAuthenticated` richtig gesetzt?
4. **Dateipfade prüfen** - werden absolute Pfade verwendet?
5. **Konsolenprotokolle überprüfen** - Fehler im Terminal protokolliert
6. **JSON validieren** - ist `posts.json` richtig formatiert?

---

## 📚 Technologie-Stack

- **Runtime**: Node.js mit TypeScript
- **Framework**: Express.js
- **Template-Engine**: Nunjucks
- **Sitzungsverwaltung**: express-session
- **HTML-Bereinigung**: sanitize-html
- **Datenspeicherung**: JSON-Dateien
- **Entwicklung**: nodemon, ts-node

---

Diese Architektur ermöglicht:
✅ Klare Trennung der Anliegen (MVC)
✅ Geschützte Admin-Routen
✅ Typsicherer Code (TypeScript)
✅ Sicherer HTML-Inhalt (Bereinigung)
✅ Sitzungsbasierte Authentifizierung
✅ Einfach zu erweitern und zu warten
