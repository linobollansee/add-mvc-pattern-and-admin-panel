# Sicherheitsrichtlinie

Sicherheits-Best-Practices und Schwachstellen-Meldung für die Blog MVC Admin-Anwendung.

## Inhaltsverzeichnis

- [Sicherheitsschwachstellen melden](#sicherheitsschwachstellen-melden)
- [Sicherheitsfunktionen](#sicherheitsfunktionen)
- [Authentifizierung & Autorisierung](#authentifizierung--autorisierung)
- [Sitzungsverwaltung](#sitzungsverwaltung)
- [Eingabevalidierung & Bereinigung](#eingabevalidierung--bereinigung)
- [XSS-Prävention](#xss-prävention)
- [CSRF-Schutz](#csrf-schutz)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Produktions-Sicherheits-Checkliste](#produktions-sicherheits-checkliste)
- [Bekannte Einschränkungen](#bekannte-einschränkungen)

## Sicherheitsschwachstellen melden

Falls Sie eine Sicherheitsschwachstelle entdecken, befolgen Sie bitte verantwortungsvolle Offenlegung:

### NICHT:

- ❌ Öffentliches GitHub-Issue öffnen
- ❌ Schwachstellendetails öffentlich offenlegen
- ❌ Schwachstelle ausnutzen

### BITTE:

- ✅ Sicherheitsbedenken privat per E-Mail senden an: [your-email@example.com]
- ✅ Detaillierte Beschreibung und Reproduktionsschritte bereitstellen
- ✅ Angemessene Zeit für Patches einräumen (typischerweise 90 Tage)
- ✅ Mit Maintainern an koordinierter Offenlegung arbeiten

### Was einzuschließen ist:

- Beschreibung der Schwachstelle
- Schritte zur Reproduktion
- Potenzielle Auswirkungsbewertung
- Vorgeschlagene Lösung (falls vorhanden)
- Ihre Kontaktinformationen

**Antwortzeit:** Wir streben an, Berichte innerhalb von 48 Stunden zu bestätigen.

---

## Sicherheitsfunktionen

### Aktuelle Implementierungen

✅ **Sitzungsbasierte Authentifizierung**

- HTTP-only-Cookies
- Secure-Cookie-Flag in Produktion
- 24-Stunden-Sitzungsablauf

✅ **HTML-Bereinigung**

- Alle benutzergenerierten Inhalte bereinigt
- Verwendet `sanitize-html`-Bibliothek
- Verhindert XSS-Angriffe

✅ **Geschützte Routen**

- Middleware-basierte Authentifizierung
- Automatische Umleitung zu Login
- Return-to-URL-Beibehaltung

✅ **Umgebungsvariablenkonfiguration**

- Sensible Daten nicht im Code
- `.env`-Datei von Versionskontrolle ausgeschlossen
- Separate Konfigurationen für Dev/Prod

✅ **Eingabevalidierung**

- Pflichtfeldvalidierung
- Serverseitige Validierung für alle Eingaben

---

## Authentifizierung & Autorisierung

### Wie es funktioniert

```
Benutzer → Login-Formular → POST /login → Passwort validieren
                                               ↓
                                      Session setzen
```

### Passwortsicherheit

**Aktuelle Implementierung:**

- Einzelnes Admin-Passwort in Umgebungsvariable gespeichert
- Klartext-Vergleich (nicht gehasht)

**⚠️ Sicherheitseinschränkung:**
Dies ist für Einzelbenutzer-Blogs geeignet, aber NICHT für Multi-User-Systeme.

**Empfohlen für Produktion:**

1. **bcrypt für Passwort-Hashing verwenden:**

```javascript
import bcrypt from "bcrypt";

// Passwort hashen (einmal tun, in .env speichern)
const hashedPassword = await bcrypt.hash("ihr-passwort", 10);

// Während Login vergleichen
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

2. **Passwortanforderungen implementieren:**

   - Mindestens 12 Zeichen
   - Groß- und Kleinbuchstaben mischen
   - Keine häufigen Passwörter verwenden

3. **Rate Limiting hinzufügen, um Brute Force zu verhindern:**

```javascript
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 5, // 5 Versuche
  message: "Zu viele Login-Versuche, bitte später erneut versuchen",
});

app.post("/login", loginLimiter, authController.handleLogin);
```

---

## Sitzungsverwaltung

### Konfiguration

```javascript
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 Stunden
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  })
);
```

### Sicherheits-Best-Practices

#### 1. Sitzungsgeheimnis

**❌ Schlecht:**

```env
SESSION_SECRET=mysecret
```

**✅ Gut:**

```env
SESSION_SECRET=a1f8d9c7e5b3a2f1d8c6b4e9a7f5d3c1b9e7a5d3f1c9b7e5a3d1f9c7b5e3a1d9
```

**Starkes Geheimnis generieren:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2. Session Store

**Aktuell:** Memory Store (nicht für Produktion geeignet)

**⚠️ Problem:** Sitzungen bei Server-Neustart verloren

**✅ Produktionslösung:** Persistenten Session Store verwenden

**Option A: Redis**

```javascript
import RedisStore from "connect-redis";
import { createClient } from "redis";

const redisClient = createClient();
redisClient.connect();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    // ... andere Optionen
  })
);
```

---

## Eingabevalidierung & Bereinigung

### Serverseitige Validierung

**Alle Formulareingaben werden vor der Verarbeitung validiert:**

```typescript
// Beispiel aus adminController.ts
if (!title || !excerpt || !content) {
  return res.status(400).render("admin/posts/edit.njk", {
    error: "Titel, Auszug und Inhalt sind erforderlich",
  });
}
```

### Empfohlene Verbesserungen

**1. Validierungsbibliothek verwenden (z.B. Joi, Yup, Zod):**

```javascript
import { z } from "zod";

const postSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  author: z.string().max(100).optional(),
});

// Im Controller
try {
  const validatedData = postSchema.parse(req.body);
} catch (error) {
  // Validierungsfehler behandeln
}
```

---

## XSS-Prävention

### Aktueller Schutz

**HTML-Bereinigung über `sanitize-html`:**

```typescript
import sanitizeHtml from "sanitize-html";

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title"],
  },
};

// In postModel.ts angewendet
content: sanitizeHtml(postData.content, sanitizeOptions);
```

### Was geschützt ist

✅ Beitragsinhalt (HTML bereinigt)
✅ Template-Auto-Escaping (Nunjucks)

### Worauf zu achten ist

⚠️ Beitragstitel (nicht bereinigt - nur Text erwartet)
⚠️ Autorennamen (nicht bereinigt - nur Text erwartet)

---

## CSRF-Schutz

### Aktueller Status

❌ **Nicht implementiert**

### Risiko

Cross-Site Request Forgery-Angriffe könnten:

- Beiträge von bösartigen Sites erstellen
- Beiträge über gefälschte Anfragen löschen
- Benutzer unerwartet abmelden

### Empfohlene Implementierung

**1. CSRF-Middleware installieren:**

```bash
npm install csurf
```

**2. Zu app.ts hinzufügen:**

```javascript
import csrf from "csurf";

const csrfProtection = csrf({ cookie: true });

// Auf Routen anwenden, die Daten ändern
app.use("/admin", csrfProtection);
```

**3. Token zu Formularen hinzufügen:**

```html
<!-- In admin/posts/edit.njk -->
<form method="POST">
  <input type="hidden" name="_csrf" value="{{ csrfToken }}" />
  <!-- andere Felder -->
</form>
```

---

## Umgebungsvariablen

### Erforderliche Variablen

```env
SESSION_SECRET=<zufällige-64-zeichen-zeichenfolge>
ADMIN_PASSWORD=<starkes-passwort>
NODE_ENV=production
```

### Sicherheits-Best-Practices

#### 1. .env niemals committen

**Sicherstellen, dass `.gitignore` enthält:**

```
.env
.env.local
.env.production
.env.*
```

#### 2. Verschiedene Geheimnisse pro Umgebung verwenden

```env
# .env.development
SESSION_SECRET=dev-secret-nicht-für-produktion

# .env.production
SESSION_SECRET=prod-b8f4e2a9d7c5b3e1f9d7c5b3a1f8e6d4c2b9e7a5f3d1c9b7e5a3d1f9c7b5e3a1
```

#### 3. Geheimnisse regelmäßig rotieren

- SESSION_SECRET alle 90 Tage ändern
- ADMIN_PASSWORD alle 90 Tage ändern
- Alle Benutzer nach Rotation abmelden

---

## Produktions-Sicherheits-Checkliste

Vor Deployment in Produktion:

### Umgebung

- [ ] `NODE_ENV=production` setzen
- [ ] Starkes SESSION_SECRET generieren (64+ Zeichen)
- [ ] Starkes ADMIN_PASSWORD verwenden (12+ Zeichen, gemischt)
- [ ] Geheimnisse in sicherem Secret Manager speichern

### HTTPS

- [ ] SSL-Zertifikat konfigurieren
- [ ] HTTPS für alle Routen erzwingen
- [ ] Secure-Cookie-Flag aktivieren
- [ ] HSTS-Header hinzufügen

### Sicherheitsheader

- [ ] Helmet.js installieren und konfigurieren
- [ ] Content Security Policy (CSP) setzen
- [ ] X-Frame-Options setzen
- [ ] X-Content-Type-Options setzen

### Rate Limiting

- [ ] Rate Limiting auf allen Routen
- [ ] Strengeres Limit für Login
- [ ] IP-basiertes Blocking für Missbrauch

### Authentifizierung

- [ ] Passwort-Hashing implementieren
- [ ] Zwei-Faktor-Authentifizierung in Betracht ziehen
- [ ] Session Store (Redis/MongoDB)
- [ ] Sitzungstimeout konfigurieren

### CSRF-Schutz

- [ ] CSRF-Token für Formulare
- [ ] SameSite-Cookie-Attribut

### Eingabevalidierung

- [ ] Alle Benutzereingaben validieren
- [ ] HTML-Inhalte bereinigen
- [ ] SQL-Injection-Schutz (falls Datenbank verwendet)

### Überwachung

- [ ] Fehler-Tracking einrichten (Sentry)
- [ ] Sicherheitsereignisse protokollieren
- [ ] Regelmäßige Sicherheitsaudits

---

## Bekannte Einschränkungen

### Aktuell nicht implementiert

- ❌ CSRF-Schutz
- ❌ Rate Limiting
- ❌ Zwei-Faktor-Authentifizierung
- ❌ Passwort-Hashing
- ❌ Persistenter Session Store
- ❌ Audit-Protokollierung
- ❌ Automatisierte Sicherheitstests

### Für wen geeignet

✅ **Geeignet für:**

- Persönliche Blogs
- Portfolio-Websites
- Lernprojekte
- Websites mit geringem Traffic
- Einzelbenutzer-Szenarien

❌ **Nicht geeignet für:**

- Multi-User-Plattformen
- E-Commerce-Sites
- Websites mit sensiblen Daten
- Hochsicherheitsumgebungen
- Enterprise-Anwendungen

---

## Sicherheitsupdates

Wir nehmen Sicherheit ernst. Sicherheitsupdates werden:

- **Schnell veröffentlicht** - Innerhalb von Tagen nach Entdeckung
- **Klar kommuniziert** - Via GitHub Security Advisories
- **Rückwärts gepatcht** - Für unterstützte Versionen
- **Dokumentiert** - In CHANGELOG.md

### Benachrichtigungen abonnieren

- GitHub-Repository beobachten
- Sicherheitshinweise aktivieren
- RSS-Feed abonnieren

---

**Für Sicherheitsfragen oder Berichte:** [your-email@example.com]

**Zuletzt aktualisiert:** 9. November 2025
