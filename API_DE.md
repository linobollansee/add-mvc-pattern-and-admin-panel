# API-DokumentationVollständige API-Dokumentation für die Blog MVC Admin-Anwendung.

## Inhaltsverzeichnis

- [Überblick](#überblick)
- [Authentifizierung](#authentifizierung)
- [Öffentliche Routen](#öffentliche-routen)
- [Authentifizierungs-Routen](#authentifizierungs-routen)
- [Admin-Routen](#admin-routen)
- [Fehlerantworten](#fehlerantworten)
- [Anfrage-Beispiele](#anfrage-beispiele)

## Überblick

**Basis-URL:** `http://localhost:3000`

**Antwortformat:** HTML (serverseitig gerendert über Nunjucks-Templates)

**Authentifizierung:** Sitzungsbasiert (Cookie)

**Sitzungsdauer:** 24 Stunden

## Authentifizierung

### Wie Authentifizierung funktioniert

1. Benutzer sendet Passwort über `/login`-Formular
2. Server validiert gegen `ADMIN_PASSWORD`-Umgebungsvariable
3. Bei Erfolg wird `session.isAuthenticated = true` gesetzt
4. Sitzung wird in Cookie gespeichert (nur HTTP)
5. Geschützte Routen prüfen Sitzung vor Zugriffgewährung

### Geschützte Routen

Alle Routen unter `/admin/*` erfordern Authentifizierung. Nicht authentifizierte Anfragen werden zu `/login` umgeleitet.

---

## Öffentliche Routen

Diese Routen sind ohne Authentifizierung zugänglich.

### GET /

**Beschreibung:** Root-Endpunkt, leitet zur Blog-Beitragsliste um

**Antwort:** `302 Redirect`

**Umleitung zu:** `/posts`

**Beispiel:**

```bash
curl -L http://localhost:3000/
# Leitet um zu http://localhost:3000/posts
```

---

### GET /posts

**Beschreibung:** Zeigt paginierte Liste aller Blog-Beiträge an

**Query-Parameter:**

| Parameter | Typ     | Erforderlich | Standard | Beschreibung                 |
| --------- | ------- | ------------ | -------- | ---------------------------- |
| `page`    | integer | Nein         | 1        | Seitennummer für Paginierung |

**Antwort:** `200 OK` - HTML-Seite mit Beitragsliste

**Beiträge pro Seite:** 6

**Paginierung:** Zurück/Weiter-Buttons werden angezeigt, wenn zutreffend

**Beispiel:**

```bash
# Erste Seite
curl http://localhost:3000/posts

# Zweite Seite
curl http://localhost:3000/posts?page=2
```

**Gerenderte Daten:**

- Array von Beiträgen (neueste zuerst)
- Jeder Beitrag zeigt: Titel, Auszug, Autor, Datum, Weiterlesen-Link
- Paginierungssteuerung

---

### GET /posts/:slug

**Beschreibung:** Zeigt einen einzelnen Blog-Beitrag anhand seines URL-Slugs an

**URL-Parameter:**

| Parameter | Typ    | Erforderlich | Beschreibung                               |
| --------- | ------ | ------------ | ------------------------------------------ |
| `slug`    | string | Ja           | URL-freundliche Version des Beitragstitels |

**Antwort:**

- `200 OK` - HTML-Seite mit vollständigem Beitrag
- `404 Not Found` - Beitrag existiert nicht

**Beispiel:**

```bash
curl http://localhost:3000/posts/mein-erster-beitrag
```

**Slug-Format:**

- Kleinbuchstaben
- Leerzeichen durch Bindestriche ersetzt
- Sonderzeichen entfernt
- Beispiel: "Hallo Welt!" → "hallo-welt"

**Gerenderte Daten:**

- Vollständiger Beitragstitel
- Vollständiger HTML-Inhalt
- Autorenname
- Erstellungs-/Aktualisierungsdaten
- Zurück zum Blog-Link

---

## Authentifizierungs-Routen

### GET /login

**Beschreibung:** Zeigt Admin-Login-Formular an

**Antwort:** `200 OK` - HTML-Login-Seite

**Verhalten:**

- Falls bereits authentifiziert → Umleitung zu `/admin/posts`
- Falls nicht authentifiziert → Login-Formular anzeigen

**Beispiel:**

```bash
curl http://localhost:3000/login
```

**Formularfelder:**

- `password` (Texteingabe, erforderlich)

---

### POST /login

**Beschreibung:** Verarbeitet Admin-Login

**Content-Type:** `application/x-www-form-urlencoded`

**Body-Parameter:**

| Parameter  | Typ    | Erforderlich | Beschreibung   |
| ---------- | ------ | ------------ | -------------- |
| `password` | string | Ja           | Admin-Passwort |

**Antwort:**

- `302 Redirect` - Login erfolgreich → Umleitung zu Admin oder `returnTo`-URL
- `200 OK` - Login fehlgeschlagen → Formular mit Fehler erneut anzeigen

**Beispiel:**

```bash
curl -X POST http://localhost:3000/login \
  -d "password=ihr-admin-passwort" \
  -c cookies.txt
```

**Erfolgsverhalten:**

- Setzt Sitzungs-Cookie
- Leitet um zu `/admin/posts` oder gespeicherter `returnTo`-URL

**Fehlerantwort:**

- Rendert Login-Formular erneut
- Zeigt Fehler an: "Ungültiges Passwort. Bitte versuchen Sie es erneut."

---

### GET /logout

**Beschreibung:** Beendet Admin-Sitzung

**Antwort:** `302 Redirect` zur Startseite

**Verhalten:**

- Zerstört Sitzung
- Löscht Authentifizierungs-Cookie
- Leitet um zu `/`

**Beispiel:**

```bash
curl -X GET http://localhost:3000/logout \
  -b cookies.txt
```

---

## Admin-Routen

Alle Admin-Routen erfordern Authentifizierung. Nicht authentifizierte Anfragen werden zu `/login` umgeleitet.

### GET /admin/posts

**Beschreibung:** Admin-Dashboard - Liste aller Beiträge mit Verwaltungsoptionen

**Query-Parameter:**

| Parameter | Typ     | Erforderlich | Standard | Beschreibung |
| --------- | ------- | ------------ | -------- | ------------ |
| `page`    | integer | Nein         | 1        | Seitennummer |
| `search`  | string  | Nein         | -        | Suchbegriff  |

**Antwort:** `200 OK` - Admin-Beiträge-Listenseite

**Beiträge pro Seite:** 10

**Funktionen:**

- Suchfunktionalität (durchsucht Titel, Auszug, Inhalt)
- Bearbeiten-Button für jeden Beitrag
- Löschen-Button für jeden Beitrag
- Neuen Beitrag erstellen-Button
- Paginierung

**Beispiel:**

```bash
# Alle Beiträge anzeigen (Seite 1)
curl http://localhost:3000/admin/posts \
  -b cookies.txt

# Beiträge suchen
curl "http://localhost:3000/admin/posts?search=typescript" \
  -b cookies.txt

# Zweite Seite
curl "http://localhost:3000/admin/posts?page=2" \
  -b cookies.txt
```

---

### GET /admin/posts/new

**Beschreibung:** Zeigt Formular zum Erstellen eines neuen Blog-Beitrags an

**Antwort:** `200 OK` - Beitrag erstellen-Formular

**Formularfelder:**

- `title` (Text, erforderlich)
- `excerpt` (Textbereich, erforderlich)
- `content` (WYSIWYG-Editor, erforderlich)
- `author` (Text, optional - Standard: "Anonymous")

**Beispiel:**

```bash
curl http://localhost:3000/admin/posts/new \
  -b cookies.txt
```

---

### POST /admin/posts

**Beschreibung:** Erstellt einen neuen Blog-Beitrag

**Content-Type:** `application/x-www-form-urlencoded`

**Body-Parameter:**

| Parameter | Typ    | Erforderlich | Beschreibung                        |
| --------- | ------ | ------------ | ----------------------------------- |
| `title`   | string | Ja           | Beitragstitel                       |
| `excerpt` | string | Ja           | Kurze Zusammenfassung               |
| `content` | string | Ja           | Vollständiger HTML-Inhalt           |
| `author`  | string | Nein         | Autorenname (Standard: "Anonymous") |

**Antwort:**

- `302 Redirect` - Erfolg → Umleitung zu `/admin/posts`
- `400 Bad Request` - Validierungsfehler → Formular mit Fehler erneut anzeigen
- `500 Server Error` - Datenbankfehler → Formular mit Fehler erneut anzeigen

**Automatische Verarbeitung:**

- Generiert eindeutige ID
- Erstellt URL-Slug aus Titel
- Bereinigt HTML-Inhalt (XSS-Prävention)
- Fügt Zeitstempel hinzu (createdAt, updatedAt)

**Beispiel:**

```bash
curl -X POST http://localhost:3000/admin/posts \
  -b cookies.txt \
  -d "title=Mein neuer Beitrag" \
  -d "excerpt=Das ist eine Zusammenfassung" \
  -d "content=<p>Vollständiger Inhalt hier</p>" \
  -d "author=Max Mustermann"
```

**Validierungsregeln:**

- Titel: Erforderlich, beliebige Länge
- Auszug: Erforderlich, beliebige Länge
- Inhalt: Erforderlich, HTML erlaubt (bereinigt)
- Autor: Optional

---

### GET /admin/posts/:id/edit

**Beschreibung:** Zeigt Formular zum Bearbeiten eines vorhandenen Beitrags an

**URL-Parameter:**

| Parameter | Typ     | Erforderlich | Beschreibung |
| --------- | ------- | ------------ | ------------ |
| `id`      | integer | Ja           | Beitrags-ID  |

**Antwort:**

- `200 OK` - Beitrag bearbeiten-Formular mit ausgefüllten Daten
- `404 Not Found` - Beitrag existiert nicht

**Beispiel:**

```bash
curl http://localhost:3000/admin/posts/1/edit \
  -b cookies.txt
```

**Formularfelder:** Wie beim Erstellen, vorausgefüllt mit vorhandenen Daten

---

### POST /admin/posts/:id

**Beschreibung:** Aktualisiert einen vorhandenen Blog-Beitrag

**URL-Parameter:**

| Parameter | Typ     | Erforderlich | Beschreibung                   |
| --------- | ------- | ------------ | ------------------------------ |
| `id`      | integer | Ja           | Zu aktualisierende Beitrags-ID |

**Content-Type:** `application/x-www-form-urlencoded`

**Body-Parameter:**

| Parameter | Typ    | Erforderlich | Beschreibung              |
| --------- | ------ | ------------ | ------------------------- |
| `title`   | string | Ja           | Beitragstitel             |
| `excerpt` | string | Ja           | Kurze Zusammenfassung     |
| `content` | string | Ja           | Vollständiger HTML-Inhalt |
| `author`  | string | Ja           | Autorenname               |

**Antwort:**

- `302 Redirect` - Erfolg → Umleitung zu `/admin/posts`
- `400 Bad Request` - Validierungsfehler → Formular erneut anzeigen
- `404 Not Found` - Beitrag existiert nicht
- `500 Server Error` - Datenbankfehler → Formular erneut anzeigen

**Automatische Verarbeitung:**

- Generiert Slug aus neuem Titel neu
- Bereinigt HTML-Inhalt
- Aktualisiert `updatedAt`-Zeitstempel
- Behält `createdAt` und `id` bei

**Beispiel:**

```bash
curl -X POST http://localhost:3000/admin/posts/1 \
  -b cookies.txt \
  -d "title=Aktualisierter Titel" \
  -d "excerpt=Aktualisierte Zusammenfassung" \
  -d "content=<p>Aktualisierter Inhalt</p>" \
  -d "author=Erika Musterfrau"
```

---

### POST /admin/posts/:id/delete

**Beschreibung:** Löscht einen Blog-Beitrag

**URL-Parameter:**

| Parameter | Typ     | Erforderlich | Beschreibung             |
| --------- | ------- | ------------ | ------------------------ |
| `id`      | integer | Ja           | Zu löschende Beitrags-ID |

**Antwort:**

- `302 Redirect` - Erfolg → Umleitung zu `/admin/posts`
- `404 Not Found` - Beitrag existiert nicht
- `500 Server Error` - Datenbankfehler → Fehlerseite anzeigen

**Beispiel:**

```bash
curl -X POST http://localhost:3000/admin/posts/1/delete \
  -b cookies.txt
```

**Warnung:** Diese Aktion ist dauerhaft und kann nicht rückgängig gemacht werden.

---

## Fehlerantworten

### 404 Not Found

**Gerenderte Seite:** `views/error.njk`

**Auslöser:**

- Ungültige URL
- Beitrag nicht gefunden (nach Slug oder ID)
- Route existiert nicht

**Beispielantwort:**

```html
<h1>404 - Nicht gefunden</h1>
<p>Seite nicht gefunden</p>
```

---

### 500 Server Error

**Gerenderte Seite:** `views/error.njk`

**Auslöser:**

- Datenbank-Lese-/Schreibfehler
- Unerwarteter Anwendungsfehler
- Template-Rendering-Fehler

**Beispielantwort:**

```html
<h1>Fehler</h1>
<p>Etwas ist schief gelaufen!</p>
```

**Hinweis:** Vollständige Fehlerdetails werden im Entwicklungsmodus in der Konsole protokolliert.

---

### 302 Redirect (Authentifizierung erforderlich)

**Auslöser:**

- Zugriff auf `/admin/*`-Routen ohne Authentifizierung

**Verhalten:**

- Speichert versuchte URL in `session.returnTo`
- Leitet um zu `/login`
- Nach erfolgreichem Login wird zur ursprünglichen URL zurückgeleitet

---

## Anfrage-Beispiele

### Vollständiger Arbeitsablauf: Beitrag erstellen und anzeigen

#### 1. Login

```bash
# Einloggen und Sitzungs-Cookie speichern
curl -X POST http://localhost:3000/login \
  -d "password=ihr-admin-passwort" \
  -c cookies.txt \
  -L
```

#### 2. Beitrag erstellen

```bash
# Neuen Beitrag erstellen
curl -X POST http://localhost:3000/admin/posts \
  -b cookies.txt \
  -d "title=Erste Schritte mit TypeScript" \
  -d "excerpt=Lernen Sie die Grundlagen von TypeScript in diesem Leitfaden" \
  -d "content=<h2>Einführung</h2><p>TypeScript ist großartig!</p>" \
  -d "author=Entwickler" \
  -L
```

#### 3. Beitrag ansehen (Öffentlich)

```bash
# Beitrag öffentlich ansehen (keine Authentifizierung erforderlich)
curl http://localhost:3000/posts/erste-schritte-mit-typescript
```

#### 4. Beitrag bearbeiten

```bash
# Beitrag aktualisieren
curl -X POST http://localhost:3000/admin/posts/1 \
  -b cookies.txt \
  -d "title=Erste Schritte mit TypeScript - Aktualisiert" \
  -d "excerpt=TypeScript-Grundlagen mit Beispielen lernen" \
  -d "content=<h2>Einführung</h2><p>TypeScript ist fantastisch!</p>" \
  -d "author=Senior-Entwickler" \
  -L
```

#### 5. Beitrag löschen

```bash
# Beitrag löschen
curl -X POST http://localhost:3000/admin/posts/1/delete \
  -b cookies.txt \
  -L
```

#### 6. Logout

```bash
# Sitzung beenden
curl http://localhost:3000/logout \
  -b cookies.txt \
  -L
```

---

### Testen mit Postman

#### Collection importieren

Erstellen Sie eine Postman-Collection mit diesen Anfragen:

**1. Login**

- Methode: POST
- URL: `http://localhost:3000/login`
- Body (form-data):
  - `password`: `ihr-admin-passwort`

**2. Admin-Beiträge abrufen**

- Methode: GET
- URL: `http://localhost:3000/admin/posts`

**3. Beitrag erstellen**

- Methode: POST
- URL: `http://localhost:3000/admin/posts`
- Body (form-data):
  - `title`: `Testbeitrag`
  - `excerpt`: `Test-Auszug`
  - `content`: `<p>Testinhalt</p>`
  - `author`: `Tester`

**4. Beiträge suchen**

- Methode: GET
- URL: `http://localhost:3000/admin/posts?search=test`

**5. Logout**

- Methode: GET
- URL: `http://localhost:3000/logout`

---

## Datenmodelle

### Post-Objekt

```typescript
interface Post {
  id: number; // Eindeutiger Bezeichner
  title: string; // Beitragstitel
  slug: string; // URL-freundlicher Slug
  excerpt: string; // Kurze Zusammenfassung
  content: string; // Vollständiger HTML-Inhalt (bereinigt)
  author: string; // Autorenname
  createdAt: string; // ISO 8601 Datumszeichenfolge
  updatedAt: string; // ISO 8601 Datumszeichenfolge
}
```

**Beispiel:**

```json
{
  "id": 1,
  "title": "Willkommen in meinem Blog",
  "slug": "willkommen-in-meinem-blog",
  "excerpt": "Das ist mein erster Blog-Beitrag.",
  "content": "<p>Willkommen in meinem Blog!</p>",
  "author": "Admin",
  "createdAt": "2025-11-09T10:00:00.000Z",
  "updatedAt": "2025-11-09T10:00:00.000Z"
}
```

---

## Rate Limiting

Derzeit ist kein Rate Limiting implementiert. Für den Produktionseinsatz sollten Sie Rate-Limiting-Middleware hinzufügen:

```javascript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // begrenzt jede IP auf 100 Anfragen pro windowMs
});

app.use(limiter);
```

---

## CORS

Diese Anwendung implementiert kein CORS, da sie HTML-Seiten direkt bereitstellt. Wenn Sie API-Zugriff von verschiedenen Ursprüngen benötigen, fügen Sie CORS-Middleware hinzu:

```javascript
import cors from "cors";
app.use(cors());
```

---

## Content Security Policy

Derzeit nicht implementiert. Für die Produktion sollten Sie CSP-Header über `helmet` hinzufügen:

```javascript
import helmet from "helmet";
app.use(helmet());
```

---

## API-Versionierung

Diese Anwendung verwendet keine API-Versionierung. Falls in Zukunft benötigt, erwägen Sie Routen mit Präfix:

```
/api/v1/posts
/api/v2/posts
```

---

## Weiterführende Literatur

- [ARCHITECTURE.md](ARCHITECTURE.md) - Verstehen Sie die Codebase-Struktur
- [SECURITY.md](SECURITY.md) - Sicherheits-Best-Practices
- [DEPLOYMENT.md](DEPLOYMENT.md) - In Produktion deployen
- [SETUP.md](SETUP.md) - Installationsanleitung

---

**Hinweis:** Diese API liefert HTML-Antworten über Nunjucks-Templates. Für eine JSON REST API siehe den Abschnitt zur Konvertierung in REST API in ARCHITECTURE.md.
