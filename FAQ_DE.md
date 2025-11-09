# Häufig gestellte Fragen (FAQ)

Häufige Fragen und Antworten zur Blog MVC Admin-Anwendung.

## Inhaltsverzeichnis

- [Allgemeine Fragen](#allgemeine-fragen)
- [Installation & Einrichtung](#installation--einrichtung)
- [Verwendung & Funktionen](#verwendung--funktionen)
- [Authentifizierung & Sicherheit](#authentifizierung--sicherheit)
- [Daten & Speicherung](#daten--speicherung)
- [Deployment](#deployment)
- [Anpassung](#anpassung)
- [Fehlerbehebung](#fehlerbehebung)
- [Beiträge](#beiträge)

---

## Allgemeine Fragen

### Was ist dieses Projekt?

Dies ist eine voll ausgestattete Blog-Anwendung, die mit dem MVC-Muster (Model-View-Controller) unter Verwendung von Express.js, TypeScript und Nunjucks-Templates erstellt wurde. Sie enthält sowohl einen öffentlichen Blog als auch ein sicheres Admin-Panel zur Verwaltung von Beiträgen.

### Für wen ist das?

- **Entwickler**, die MVC-Architektur lernen
- **Content-Ersteller**, die eine einfache Blog-Plattform wollen
- **Studenten**, die TypeScript und Express.js studieren
- **Jeder**, der einen leichten, anpassbaren Blog benötigt

### Was macht dies anders als WordPress oder andere CMS?

- ✅ **Leichtgewichtig** - Keine Datenbank anfangs erforderlich
- ✅ **Moderner Stack** - TypeScript, Express.js, ES-Module
- ✅ **Lehrreich** - Gut dokumentierter Code, perfekt zum Lernen
- ✅ **Anpassbar** - Volle Kontrolle über den Quellcode
- ✅ **Einfach** - Keine komplexe Konfiguration oder Plugins

### Was sind die Einschränkungen?

- Einzelbenutzer-Authentifizierung (keine Benutzerverwaltung)
- JSON-Dateispeicherung (nicht für hohen Traffic geeignet)
- Kein eingebautes Kommentarsystem
- Kein Medien-Upload (noch nicht)
- Nicht für Multi-Autor-Blogs geeignet

Siehe [ROADMAP.md](ROADMAP.md) für geplante Verbesserungen.

---

## Installation & Einrichtung

### Was muss ich installieren?

**Erforderlich:**

- Node.js v18.0.0 oder höher
- npm (kommt mit Node.js)

**Optional:**

- Git (zum Klonen)
- VS Code (empfohlener Editor)

### Wie lange dauert die Einrichtung?

Etwa 5-10 Minuten, wenn Sie der [SETUP.md](SETUP.md)-Anleitung folgen.

### Benötige ich eine Datenbank?

Nein! Die Anwendung verwendet standardmäßig JSON-Dateispeicherung. Sie können jedoch für den Produktionseinsatz zu einer Datenbank migrieren (siehe [ROADMAP.md](ROADMAP.md)).

### Kann ich das unter Windows verwenden?

Ja! Die Anwendung funktioniert unter Windows, Mac und Linux. Installationsschritte finden Sie in [SETUP.md](SETUP.md).

### Warum dauert npm install so lange?

npm muss alle Abhängigkeiten (~150 Pakete) herunterladen. Das ist normal. Bei langsamen Verbindungen kann es 2-5 Minuten dauern.

### Ich erhalte Berechtigungsfehler während npm install

**Windows:** Eingabeaufforderung als Administrator ausführen
**Mac/Linux:** `sudo npm install` verwenden (oder npm-Berechtigungen korrigieren)

Siehe [TROUBLESHOOTING.md](TROUBLESHOOTING.md#installationsprobleme) für Details.

---

## Verwendung & Funktionen

### Wie greife ich auf das Admin-Panel zu?

1. Server starten: `npm run dev`
2. Besuchen: http://localhost:3000/login
3. Passwort eingeben (aus `.env`-Datei)
4. Sie werden zum Admin-Dashboard umgeleitet

### Was kann ich im Admin-Panel tun?

- ✅ Neue Blog-Beiträge erstellen
- ✅ Vorhandene Beiträge bearbeiten
- ✅ Beiträge löschen
- ✅ Durch Beiträge suchen
- ✅ Alle Beiträge mit Paginierung anzeigen

### Wie erstelle ich einen Blog-Beitrag?

1. Beim Admin-Panel anmelden
2. Auf "Neuer Beitrag"-Button klicken
3. Titel, Auszug und Inhalt ausfüllen
4. Auf "Beitrag speichern" klicken
5. Beitrag wird sofort veröffentlicht

### Kann ich Beiträge für später planen?

Noch nicht. Diese Funktion ist für Version 3.0.0 geplant (siehe [ROADMAP.md](ROADMAP.md)).

### Kann ich Markdown statt HTML verwenden?

Derzeit nicht. Der Editor akzeptiert HTML. Markdown-Unterstützung ist für Version 2.1.0 geplant.

### Wie füge ich Bilder zu Beiträgen hinzu?

Derzeit müssen Sie:

1. Bilder anderswo hosten (Imgur, Cloudinary, etc.)
2. HTML in Ihrem Beitragsinhalt verwenden: `<img src="url" alt="beschreibung">`

Eingebauter Bild-Upload ist für Version 2.1.0 geplant.

### Kann ich YouTube-Videos einbetten?

Ja! Verwenden Sie HTML-Embed-Code in Ihrem Beitragsinhalt:

```html
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  frameborder="0"
  allowfullscreen
>
</iframe>
```

Hinweis: Der HTML-Sanitizer erlaubt iframe-Tags.

### Wie funktioniert die Suche?

Die Admin-Panel-Suche sucht Ihre Anfrage in:

- Beitragstiteln
- Beitragsauszügen
- Beitragsinhalt (einschließlich HTML)

Sie ist nicht case-sensitiv und durchsucht alle Felder gleichzeitig.

---

## Authentifizierung & Sicherheit

### Was ist das Standardpasswort?

Es gibt kein Standardpasswort. Sie legen es in der `.env`-Datei als `ADMIN_PASSWORD` fest.

### Wie ändere ich das Admin-Passwort?

1. `.env`-Datei bearbeiten
2. `ADMIN_PASSWORD=neues-passwort` ändern
3. Server neu starten
4. Mit neuem Passwort anmelden

### Ist mein Passwort sicher?

**Entwicklung:** Passwort in Klartext in .env gespeichert (akzeptabel für Einzelbenutzer-Blog)

**Produktion:** Sie sollten Passwort-Hashing implementieren (siehe [SECURITY.md](SECURITY.md#passwort-sicherheit))

### Kann ich mehrere Admin-Benutzer haben?

Derzeit nicht. Multi-User-Authentifizierung ist für Version 2.0.0 geplant (siehe [ROADMAP.md](ROADMAP.md)).

### Wie lange bleibe ich eingeloggt?

Standardmäßig 24 Stunden. Sie können dies in `src/app.ts` ändern:

```typescript
app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Tage
    },
  })
);
```

### Ist dies sicher für die Produktion?

Die grundlegende Sicherheit ist für persönliche Blogs solide, aber für die Produktion sollten Sie:

- HTTPS verwenden
- Rate Limiting implementieren
- CSRF-Schutz hinzufügen
- Eine echte Datenbank verwenden
- Passwörter hashen
- Persistenten Session-Store verwenden

Siehe [SECURITY.md](SECURITY.md#produktions-sicherheits-checkliste) für vollständige Checkliste.

---

## Daten & Speicherung

### Wo werden Blog-Beiträge gespeichert?

In `src/data/posts.json` - eine JSON-Datei, die als einfache Datenbank fungiert.

### Was passiert, wenn ich posts.json versehentlich lösche?

Wenn Sie Backups haben, das neueste wiederherstellen:

```bash
cp backups/posts_20251109.json src/data/posts.json
```

Wenn kein Backup vorhanden, müssen Sie Beiträge manuell neu erstellen. **Immer regelmäßig sichern!**

### Wie sichere ich meine Daten?

**Manuelles Backup:**

```bash
cp src/data/posts.json backups/posts_$(date +%Y%m%d).json
```

**Automatisiertes Backup:**
Siehe [DEPLOYMENT.md](DEPLOYMENT.md#backup-strategie) für automatisierte Skripte.

### Kann ich zu WordPress exportieren?

Derzeit nicht. Export-Funktionalität ist für Version 2.0.0 geplant.

### Kann ich von WordPress importieren?

Derzeit nicht. Import-Funktionalität ist für Version 2.0.0 geplant.

### Wie viele Beiträge kann ich haben?

**Technisches Limit:** Kein hartes Limit

**Praktisches Limit:**

- < 100 Beiträge: Funktioniert großartig
- 100-1000 Beiträge: Immer noch in Ordnung, aber Datenbank in Betracht ziehen
- 1000+ Beiträge: Definitiv zu Datenbank migrieren

JSON-Dateileistung verschlechtert sich mit vielen Beiträgen.

### Verliere ich Beiträge bei Server-Neustart?

**Entwicklung (lokal):** Nein, Beiträge in Datei gespeichert
**Produktion:** Hängt von der Hosting-Plattform ab

- **Persistente Festplatte:** Kein Datenverlust
- **Ephemeres Dateisystem:** Ja, Daten gehen verloren (Datenbank verwenden)

Bei Ihrem Hosting-Anbieter nachfragen.

---

## Deployment

### Wo kann ich das deployen?

- Railway (empfohlen, am einfachsten)
- Render
- Heroku
- DigitalOcean
- Jeder VPS mit Node.js
- Ihr eigener Server

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für detaillierte Anleitungen.

### Ist das kostenlos zu deployen?

Viele Plattformen bieten kostenlose Tarife:

- **Railway:** $5 Guthaben/Monat
- **Render:** 750 Stunden/Monat kostenlos
- **Heroku:** Hobby-Tarif verfügbar

### Benötige ich einen Domainnamen?

Nein, Hosting-Plattformen bieten kostenlose Subdomain:

- `ihre-app.railway.app`
- `ihre-app.onrender.com`
- `ihre-app.herokuapp.com`

Sie können aber auch eine benutzerdefinierte Domain verwenden, falls vorhanden.

### Wie richte ich HTTPS ein?

Die meisten Hosting-Plattformen bieten automatisches HTTPS. Für VPS verwenden Sie Let's Encrypt (kostenlos):

```bash
sudo certbot --nginx -d ihre-domain.com
```

Siehe [DEPLOYMENT.md](DEPLOYMENT.md#sslhttps-einrichtung) für Details.

### Wird meine Website hohen Traffic bewältigen?

**JSON-Dateispeicher-Einschränkungen:**

- < 1000 Besuche/Tag: In Ordnung
- 1000-10.000 Besuche/Tag: Könnte Probleme haben
- 10.000+ Besuche/Tag: Zu Datenbank migrieren

Für hohen Traffic siehe Version 2.0.0-Roadmap für Datenbankunterstützung.

---

## Anpassung

### Kann ich das Design ändern?

Ja! Bearbeiten Sie die Templates in `src/views/` und CSS in `public/css/`.

### Wie füge ich eine neue Seite hinzu?

1. Template in `src/views/` erstellen
2. Controller-Funktion erstellen
3. Route in entsprechender Routendatei hinzufügen
4. Von Navigation verlinken

Beispiel in [ARCHITECTURE.md](ARCHITECTURE.md#neue-funktion-hinzufügen---beispiel-workflow).

### Kann ich die URL-Struktur ändern?

Ja, Routen in `src/routes/` bearbeiten. Zum Beispiel, um `/posts` zu `/blog` zu ändern:

```typescript
// In app.ts
app.use("/blog", postRoutes); // Statt "/posts"
```

### Kann ich benutzerdefinierte Felder zu Beiträgen hinzufügen?

Ja!

1. `src/types/Post.ts` aktualisieren
2. Formular in `views/admin/posts/edit.njk` aktualisieren
3. Controller aktualisieren, um neues Feld zu verarbeiten
4. Model aktualisieren, um neues Feld zu speichern/laden

---

## Fehlerbehebung

### Warum startet meine App nicht?

Häufige Ursachen:

1. Port 3000 bereits in Verwendung → Prozess beenden oder Port ändern
2. Fehlende .env-Datei → Erstellen
3. Fehlende posts.json → Erstellen
4. Syntaxfehler → `npm run build` prüfen

Siehe [TROUBLESHOOTING.md](TROUBLESHOOTING.md#laufzeitfehler) für Lösungen.

### Warum kann ich mich nicht anmelden?

Häufige Ursachen:

1. Falsches Passwort in .env
2. Server nach .env-Änderung nicht neu gestartet
3. Session bleibt nicht bestehen (Cookie-Probleme)
4. Anführungszeichen um Passwort in .env (keine Anführungszeichen verwenden!)

Siehe [TROUBLESHOOTING.md](TROUBLESHOOTING.md#authentifizierungsprobleme) für Lösungen.

### Warum werden meine Änderungen nicht angezeigt?

1. **Haben Sie neu gebaut?** `npm run build` ausführen
2. **Haben Sie Server neu gestartet?** Stoppen und `npm run dev` erneut ausführen
3. **Browser-Cache?** Hart aktualisieren (Ctrl+Shift+R)

### Meine Beiträge sind verschwunden!

1. Prüfen, ob `src/data/posts.json` existiert
2. Dateiinhalt prüfen - ist es gültiges JSON?
3. Aus Backup wiederherstellen, falls verfügbar
4. Serverlogs auf Fehler prüfen

### Die App ist langsam

1. posts.json-Größe prüfen - ist sie > 1MB?
2. Prüfen, wie viele Beiträge Sie haben
3. Paginierungseinstellungen in Betracht ziehen
4. Datenbankmigration für 100+ Beiträge in Betracht ziehen

---

## Beiträge

### Wie kann ich beitragen?

1. **Code:** Pull Requests einreichen (siehe [CONTRIBUTING.md](CONTRIBUTING.md))
2. **Dokumentation:** Tippfehler korrigieren, Leitfäden verbessern
3. **Probleme:** Fehler melden, Funktionen anfordern
4. **Testen:** Testen und Ergebnisse melden
5. **Verbreiten:** Repo mit Stern markieren, mit anderen teilen

### Ich habe einen Fehler gefunden. Was soll ich tun?

1. Prüfen, ob er bereits in GitHub Issues gemeldet wurde
2. Falls nicht, neues Issue mit folgenden Informationen erstellen:
   - Klare Beschreibung
   - Schritte zur Reproduktion
   - Erwartetes vs. tatsächliches Verhalten
   - Ihre Umgebung (OS, Node-Version, etc.)

### Ich habe eine Feature-Idee

Großartig! Öffnen Sie eine GitHub-Diskussion, um mit der Community zu diskutieren, bevor Sie implementieren.

### Kann ich das in meinem eigenen Projekt verwenden?

Ja! Dieses Projekt ist Open Source unter der ISC-Lizenz. Sie können es frei:

- Für persönliche oder kommerzielle Projekte verwenden
- Nach Belieben modifizieren
- Ihre modifizierte Version verteilen

Bewahren Sie einfach den Lizenzhinweis auf.

---

## Schnelllinks

### Dokumentation

- [README.md](README.md) - Projektübersicht
- [SETUP.md](SETUP.md) - Installationsanleitung
- [ARCHITECTURE.md](ARCHITECTURE.md) - Code-Struktur
- [API.md](API.md) - API-Referenz
- [SECURITY.md](SECURITY.md) - Sicherheitsleitfaden
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment-Leitfaden
- [CONTRIBUTING.md](CONTRIBUTING.md) - Beitragsleitfaden
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problemlösung
- [TESTING.md](TESTING.md) - Test-Leitfaden
- [ROADMAP.md](ROADMAP.md) - Zukunftspläne
- [CHANGELOG.md](CHANGELOG.md) - Versionshistorie

---

## Haben Sie noch Fragen?

Wenn Ihre Frage hier nicht beantwortet wird:

1. 🔍 Dokumentation durchsuchen
2. 💬 In [GitHub Discussions](https://github.com/linobollansee/add-mvc-pattern-and-admin-panel/discussions) fragen
3. 🐛 [Issue](https://github.com/linobollansee/add-mvc-pattern-and-admin-panel/issues) öffnen, wenn es ein Fehler ist
4. 📧 E-Mail: [your-email@example.com]

---

**Zuletzt aktualisiert:** 9. November 2025
