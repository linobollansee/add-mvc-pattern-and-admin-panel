# Beitragsrichtlinien

Vielen Dank, dass Sie erwägen, zum Blog MVC Admin-Projekt beizutragen! Dieser Leitfaden hilft Ihnen beim Einstieg.

## Inhaltsverzeichnis

- [Verhaltenskodex](#verhaltenskodex)
- [Erste Schritte](#erste-schritte)
- [Entwicklungs-Workflow](#entwicklungs-workflow)
- [Coding-Standards](#coding-standards)
- [Commit-Richtlinien](#commit-richtlinien)
- [Pull-Request-Prozess](#pull-request-prozess)
- [Testen](#testen)
- [Dokumentation](#dokumentation)
- [Probleme melden](#probleme-melden)

## Verhaltenskodex

### Unser Versprechen

Wir verpflichten uns, die Teilnahme an unserem Projekt zu einer belästigungsfreien Erfahrung für alle zu machen, unabhängig von:

- Alter, Körpergröße, Behinderung
- Ethnische Zugehörigkeit, Geschlechtsidentität und -ausdruck
- Erfahrungsstufe, Nationalität
- Persönliches Erscheinungsbild, Rasse, Religion
- Sexuelle Identität und Orientierung

### Unsere Standards

**Positives Verhalten umfasst:**

- Verwendung einer einladenden und inklusiven Sprache
- Respekt vor unterschiedlichen Standpunkten
- Konstruktive Kritik würdevoll annehmen
- Fokus auf das Beste für die Community
- Empathie gegenüber anderen zeigen

**Inakzeptables Verhalten umfasst:**

- Trolling, beleidigende/herabwürdigende Kommentare
- Öffentliche oder private Belästigung
- Veröffentlichung privater Informationen anderer
- Anderes Verhalten, das vernünftigerweise als unangemessen angesehen werden könnte

---

## Erste Schritte

### Voraussetzungen

- Node.js v18+ installiert
- Git installiert
- Code-Editor (VS Code empfohlen)
- Grundkenntnisse in TypeScript und Express.js

### Ersteinrichtung

1. **Repository forken**

   - Auf GitHub auf "Fork"-Button klicken
   - Fork lokal klonen

2. **Fork klonen**

   ```bash
   git clone https://github.com/IHR-BENUTZERNAME/add-mvc-pattern-and-admin-panel.git
   cd add-mvc-pattern-and-admin-panel
   ```

3. **Upstream-Remote hinzufügen**

   ```bash
   git remote add upstream https://github.com/linobollansee/add-mvc-pattern-and-admin-panel.git
   ```

4. **Abhängigkeiten installieren**

   ```bash
   npm install
   ```

5. **.env-Datei erstellen**

   ```bash
   cp .env.example .env
   # .env mit Ihren Werten bearbeiten
   ```

6. **Entwicklungsserver ausführen**
   ```bash
   npm run dev
   ```

---

## Entwicklungs-Workflow

### Branch-Strategie

Wir verwenden ein einfaches Branching-Modell:

- `main` - Produktionsreifer Code
- `develop` - Integrationsbranch (falls verwendet)
- `feature/*` - Neue Funktionen
- `bugfix/*` - Fehlerbehebungen
- `hotfix/*` - Dringende Produktionsfixes

### Feature-Branch erstellen

```bash
# Lokales main aktualisieren
git checkout main
git pull upstream main

# Feature-Branch erstellen
git checkout -b feature/ihr-feature-name
```

### Branch-Benennungskonvention

```
feature/kommentarsystem-hinzufuegen
feature/suche-verbessern
bugfix/session-timeout-beheben
bugfix/paginierung-korrigieren
hotfix/sicherheitspatch
docs/readme-aktualisieren
```

### Branch aktuell halten

```bash
# Neueste Änderungen abrufen
git fetch upstream

# Branch rebasen
git rebase upstream/main

# Oder mergen, falls bevorzugt
git merge upstream/main
```

---

## Coding-Standards

### TypeScript-Stil-Leitfaden

#### 1. Benennungskonventionen

```typescript
// Klassen: PascalCase
class PostController {}

// Interfaces: PascalCase mit optionalem 'I'-Präfix
interface IPost {}
// ODER einfach PascalCase
interface Post {}

// Funktionen/Methoden: camelCase
function getAllPosts() {}

// Variablen: camelCase
const postList = [];

// Konstanten: UPPER_SNAKE_CASE
const MAX_POST_LENGTH = 1000;

// Dateien: camelCase oder kebab-case
// postController.ts
// post-controller.ts
```

#### 2. Typ-Annotationen

Immer explizite Typen verwenden:

```typescript
// ✅ Gut
function createPost(title: string, content: string): Promise<Post | null> {
  // ...
}

// ❌ Vermeiden
function createPost(title, content) {
  // ...
}
```

#### 3. Interface vs Type

Interfaces für Objekte bevorzugen:

```typescript
// ✅ Bevorzugen
interface Post {
  id: number;
  title: string;
}

// Types für Unions/Intersections verwenden
type PostOrNull = Post | null;
```

#### 4. Async/Await über Promises

```typescript
// ✅ Gut
async function getPosts(): Promise<Post[]> {
  const data = await readData();
  return data.posts;
}

// ❌ Vermeiden
function getPosts(): Promise<Post[]> {
  return readData().then((data) => data.posts);
}
```

#### 5. Fehlerbehandlung

Fehler immer ordnungsgemäß behandeln:

```typescript
// ✅ Gut
async function createPost(data: CreatePostInput): Promise<Post | null> {
  try {
    const post = await postModel.createPost(data);
    return post;
  } catch (error) {
    console.error("Fehler beim Erstellen des Beitrags:", error);
    throw error; // oder null zurückgeben
  }
}
```

### Code-Organisation

#### Dateistruktur

```
src/
├── controllers/    # Anfrage-Handler
├── models/        # Datenzugriffsschicht
├── routes/        # URL-Routing
├── middleware/    # Benutzerdefinierte Middleware
├── types/         # TypeScript-Typen
├── utils/         # Hilfsfunktionen
└── views/         # Nunjucks-Templates
```

#### Modul-Exporte

```typescript
// ✅ Benannte Exporte (bevorzugt)
export function getAllPosts() {}
export function getPostById() {}

// ✅ Standard-Export für einzelnen Export
export default router;
```

### Kommentare und Dokumentation

#### Funktionsdokumentation

```typescript
/**
 * Erstellt einen neuen Blog-Beitrag
 *
 * @param postData - Beitragserstellungsdaten
 * @returns Neu erstellter Beitrag oder null bei Fehler
 * @throws Error wenn Validierung fehlschlägt
 */
export async function createPost(
  postData: CreatePostInput
): Promise<Post | null> {
  // Implementierung
}
```

#### Inline-Kommentare

```typescript
// ✅ Gut - Erklärt WARUM
// Verwende strict sameSite zur Verhinderung von CSRF-Angriffen
cookie: {
  sameSite: "strict";
}

// ❌ Schlecht - Erklärt WAS (offensichtlich aus Code)
// Setze sameSite auf strict
cookie: {
  sameSite: "strict";
}
```

### Formatierung

Wir verwenden Prettier für konsistente Formatierung.

**Prettier installieren:**

```bash
npm install --save-dev prettier
```

**`.prettierrc` erstellen:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2
}
```

**Code formatieren:**

```bash
npx prettier --write "src/**/*.ts"
```

### Linting

**ESLint installieren:**

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**`.eslintrc.json` erstellen:**

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

**Linting ausführen:**

```bash
npx eslint "src/**/*.ts"
```

---

## Commit-Richtlinien

### Commit-Message-Format

Wir folgen der [Conventional Commits](https://www.conventionalcommits.org/)-Spezifikation:

```
<typ>(<bereich>): <betreff>

<body>

<footer>
```

### Typen

- `feat`: Neue Funktion
- `fix`: Fehlerbehebung
- `docs`: Dokumentationsänderungen
- `style`: Code-Stil-Änderungen (Formatierung, fehlende Semikolons, etc.)
- `refactor`: Code-Refactoring (keine funktionalen Änderungen)
- `perf`: Leistungsverbesserungen
- `test`: Tests hinzufügen oder aktualisieren
- `build`: Build-System oder Abhängigkeiten
- `ci`: CI/CD-Konfiguration
- `chore`: Andere Änderungen, die src nicht modifizieren

### Beispiele

```bash
# Feature
git commit -m "feat(admin): Beitragssuchfunktion hinzufügen"

# Fehlerbehebung
git commit -m "fix(auth): Session-Timeout-Problem beheben"

# Dokumentation
git commit -m "docs(readme): Installationsanweisungen aktualisieren"

# Mit Body
git commit -m "feat(posts): Paginierung hinzufügen

- Page-Query-Parameter hinzufügen
- Beiträge auf 6 pro Seite begrenzen
- Zurück/Weiter-Navigation hinzufügen"

# Breaking Change
git commit -m "feat(api): Beitrags-Slug-Format ändern

BREAKING CHANGE: Beitrags-URLs verwenden jetzt Slugs statt IDs"
```

---

## Pull-Request-Prozess

### Vor dem Einreichen

- [ ] Code kompiliert ohne Fehler (`npm run build`)
- [ ] Alle Tests bestehen (falls Tests vorhanden)
- [ ] Code folgt Stilrichtlinien
- [ ] Kommentare für komplexe Logik hinzugefügt
- [ ] Dokumentation aktualisiert (falls erforderlich)
- [ ] Commits folgen Commit-Richtlinien
- [ ] Branch ist auf dem neuesten Stand mit main

### Pull Request einreichen

1. **Branch pushen**

   ```bash
   git push origin feature/ihr-feature-name
   ```

2. **Pull Request auf GitHub öffnen**

   - Zu Ihrem Fork auf GitHub gehen
   - Auf "Compare & pull request" klicken
   - Base: `main`, compare: `ihr-branch` auswählen

3. **PR-Template ausfüllen**

   ```markdown
   ## Beschreibung

   Kurze Beschreibung der Änderungen

   ## Art der Änderung

   - [ ] Fehlerbehebung
   - [ ] Neue Funktion
   - [ ] Breaking Change
   - [ ] Dokumentations-Update

   ## Testen

   Wie wurde dies getestet?

   ## Checkliste

   - [ ] Code folgt Stilrichtlinien
   - [ ] Selbstüberprüfung abgeschlossen
   - [ ] Kommentare für komplexe Bereiche hinzugefügt
   - [ ] Dokumentation aktualisiert
   - [ ] Keine neuen Warnungen generiert
   ```

---

## Testen

Derzeit hat das Projekt keine automatisierten Tests. So fügen Sie sie hinzu:

### Jest einrichten

```bash
npm install --save-dev jest @types/jest ts-jest
```

### Jest-Konfiguration

`jest.config.js` erstellen:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/app.ts"],
};
```

### Tests schreiben

`src/models/__tests__/postModel.test.ts` erstellen:

```typescript
import * as postModel from "../postModel";

describe("postModel", () => {
  describe("getAllPosts", () => {
    it("sollte Array von Beiträgen zurückgeben", async () => {
      const posts = await postModel.getAllPosts();
      expect(Array.isArray(posts)).toBe(true);
    });
  });
});
```

### Tests ausführen

```bash
# Alle Tests ausführen
npm test

# Watch-Modus
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## Dokumentation

### Wann Dokumentation aktualisieren

Dokumentation aktualisieren, wenn Sie:

- Neue Funktionen hinzufügen
- Vorhandene Funktionalität ändern
- Fehler beheben, die die Nutzung beeinflussen
- Einrichtungs- oder Deployment-Prozess verbessern

### Zu aktualisierende Dokumentationsdateien

- **README.md** - Übersicht, Schnellstart
- **API.md** - Routenänderungen
- **ARCHITECTURE.md** - Strukturelle Änderungen
- **SECURITY.md** - Sicherheitsbezogene Änderungen
- **DEPLOYMENT.md** - Deployment-Änderungen
- **Code-Kommentare** - Komplexe Logik

---

## Probleme melden

### Vor dem Erstellen eines Problems

1. **Vorhandene Probleme durchsuchen** - Möglicherweise bereits gemeldet
2. **Dokumentation prüfen** - Problem könnte behandelt sein
3. **Neueste Version ausprobieren** - Fehler könnte behoben sein
4. **Informationen sammeln** - Reproduktionsschritte, Umgebungsdetails

### Gutes Problem erstellen

**Fehlerbericht-Template:**

```markdown
## Fehlerbeschreibung

Klare Beschreibung des Fehlers

## Schritte zur Reproduktion

1. Zu '...' gehen
2. Auf '...' klicken
3. Fehler sehen

## Erwartetes Verhalten

Was sollte passieren

## Tatsächliches Verhalten

Was tatsächlich passiert

## Umgebung

- OS: Windows 10
- Node.js: v18.0.0
- Browser: Chrome 96
```

---

## Hilfe erhalten

### Ressourcen

- 📖 Dokumentation lesen
- 💬 GitHub Discussions prüfen
- 🐛 Vorhandene Probleme durchsuchen
- 📧 Maintainer kontaktieren

---

## Anerkennung

Mitwirkende werden anerkannt in:

- README.md-Mitwirkenden-Abschnitt
- Release-Notizen
- GitHub-Mitwirkenden-Seite

Vielen Dank fürs Beitragen! 🎉
