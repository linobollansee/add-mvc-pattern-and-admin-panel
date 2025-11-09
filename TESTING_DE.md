# Test-Leitfaden

Vollständiger Leitfaden zum Testen der Blog MVC Admin-Anwendung.

## Inhaltsverzeichnis

- [Test-Philosophie](#test-philosophie)
- [Test-Setup](#test-setup)
- [Unit-Tests](#unit-tests)
- [Integrationstests](#integrationstests)
- [End-to-End-Tests](#end-to-end-tests)
- [Manuelle Tests](#manuelle-tests)
- [Testabdeckung](#testabdeckung)
- [Kontinuierliche Integration](#kontinuierliche-integration)

---

## Test-Philosophie

### Test-Pyramide

```
       /\
      /E2E\       ← Wenige (langsam, teuer)
     /------\
    /  Int   \    ← Einige (moderate Geschwindigkeit)
   /----------\
  /   Unit     \  ← Viele (schnell, günstig)
 /--------------\
```

**Unser Ansatz:**

- **70%** Unit-Tests (Models, Utilities)
- **20%** Integrationstests (Controllers, Routes)
- **10%** E2E-Tests (kritische Benutzerflows)

### Test-Driven Development (TDD)

**Red-Green-Refactor-Zyklus:**

1. 🔴 Fehlschlagenden Test schreiben
2. 🟢 Minimalen Code zum Bestehen schreiben
3. 🔵 Refaktorieren und verbessern
4. Wiederholen

---

## Test-Setup

### Test-Abhängigkeiten installieren

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  @jest/globals \
  supertest \
  @types/supertest
```

### Jest konfigurieren

`jest.config.js` erstellen:

```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/app.ts",
    "!src/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
```

### package.json aktualisieren

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e"
  }
}
```

### Test-Struktur erstellen

```
src/
├── models/
│   ├── postModel.ts
│   └── __tests__/
│       ├── postModel.unit.test.ts
│       └── postModel.integration.test.ts
├── controllers/
│   ├── postController.ts
│   └── __tests__/
│       └── postController.integration.test.ts
└── __tests__/
    └── e2e/
        ├── auth.test.ts
        └── posts.test.ts
```

---

## Unit-Tests

Unit-Tests testen einzelne Funktionen isoliert.

### Beispiel: postModel Unit-Tests

`src/models/__tests__/postModel.unit.test.ts` erstellen:

```typescript
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import * as postModel from "../postModel";
import fs from "fs/promises";

// fs-Modul mocken
jest.mock("fs/promises");

describe("postModel - Unit-Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPosts", () => {
    it("sollte Array von Posts nach Datum sortiert zurückgeben", async () => {
      // Dateisystem mocken
      const mockData = {
        posts: [
          {
            id: 1,
            title: "Zweiter Beitrag",
            slug: "zweiter-beitrag",
            excerpt: "Auszug 2",
            content: "Inhalt 2",
            author: "Autor 2",
            createdAt: "2025-11-09T12:00:00.000Z",
            updatedAt: "2025-11-09T12:00:00.000Z",
          },
          {
            id: 2,
            title: "Erster Beitrag",
            slug: "erster-beitrag",
            excerpt: "Auszug 1",
            content: "Inhalt 1",
            author: "Autor 1",
            createdAt: "2025-11-10T12:00:00.000Z",
            updatedAt: "2025-11-10T12:00:00.000Z",
          },
        ],
        nextId: 3,
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const posts = await postModel.getAllPosts();

      expect(posts).toHaveLength(2);
      expect(posts[0].title).toBe("Erster Beitrag"); // Neuester zuerst
      expect(posts[1].title).toBe("Zweiter Beitrag");
    });

    it("sollte leeres Array zurückgeben, wenn keine Posts vorhanden", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ posts: [], nextId: 1 })
      );

      const posts = await postModel.getAllPosts();

      expect(posts).toHaveLength(0);
    });

    it("sollte Dateilesefehler elegant behandeln", async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(
        new Error("Datei nicht gefunden")
      );

      const posts = await postModel.getAllPosts();

      expect(posts).toEqual([]);
    });
  });

  describe("getPostById", () => {
    it("sollte Post mit passender ID zurückgeben", async () => {
      const mockData = {
        posts: [
          { id: 1, title: "Test-Beitrag" /* ... */ },
          { id: 2, title: "Anderer Beitrag" /* ... */ },
        ],
        nextId: 3,
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const post = await postModel.getPostById(1);

      expect(post).toBeDefined();
      expect(post?.id).toBe(1);
      expect(post?.title).toBe("Test-Beitrag");
    });

    it("sollte undefined zurückgeben, wenn Post nicht gefunden", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ posts: [], nextId: 1 })
      );

      const post = await postModel.getPostById(999);

      expect(post).toBeUndefined();
    });

    it("sollte String-ID akzeptieren und zu Zahl konvertieren", async () => {
      const mockData = {
        posts: [{ id: 1, title: "Test" /* ... */ }],
        nextId: 2,
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const post = await postModel.getPostById("1");

      expect(post).toBeDefined();
      expect(post?.id).toBe(1);
    });
  });

  describe("createPost", () => {
    it("sollte Post mit automatisch generierten Feldern erstellen", async () => {
      const mockData = { posts: [], nextId: 1 };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const postData = {
        title: "Neuer Beitrag",
        excerpt: "Auszug",
        content: "<p>Inhalt</p>",
      };

      const post = await postModel.createPost(postData);

      expect(post).toBeDefined();
      expect(post?.id).toBe(1);
      expect(post?.slug).toBe("neuer-beitrag");
      expect(post?.author).toBe("Anonymous");
      expect(post?.createdAt).toBeDefined();
    });

    it("sollte HTML-Inhalt bereinigen", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ posts: [], nextId: 1 })
      );
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const postData = {
        title: "Test",
        excerpt: "Auszug",
        content: '<script>alert("xss")</script><p>Sicherer Inhalt</p>',
      };

      const post = await postModel.createPost(postData);

      expect(post?.content).not.toContain("<script>");
      expect(post?.content).toContain("<p>");
    });
  });
});
```

### Unit-Tests ausführen

```bash
# Alle Tests ausführen
npm test

# Nur Unit-Tests ausführen
npm run test:unit

# Watch-Modus
npm run test:watch

# Mit Abdeckung
npm run test:coverage
```

---

## Integrationstests

Integrationstests testen, wie Komponenten zusammenarbeiten.

### Beispiel: Controller-Integrationstests

`src/controllers/__tests__/postController.integration.test.ts` erstellen:

```typescript
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import express from "express";
import postRoutes from "../../routes/postRoutes";

let app: express.Application;

beforeAll(() => {
  app = express();
  app.use(express.json());
  app.use("/posts", postRoutes);
});

describe("POST /posts - Integrationstests", () => {
  describe("GET /posts", () => {
    it("sollte 200 und Liste von Posts zurückgeben", async () => {
      const response = await request(app).get("/posts").expect(200);

      expect(response.text).toContain("Blog-Beiträge");
    });

    it("sollte Paginierung unterstützen", async () => {
      const response = await request(app).get("/posts?page=2").expect(200);

      expect(response.text).toBeDefined();
    });
  });

  describe("GET /posts/:slug", () => {
    it("sollte 200 für gültigen Slug zurückgeben", async () => {
      // Angenommen, ein Post mit diesem Slug existiert
      const response = await request(app)
        .get("/posts/test-beitrag")
        .expect(200);

      expect(response.text).toContain("Test-Beitrag");
    });

    it("sollte 404 für ungültigen Slug zurückgeben", async () => {
      const response = await request(app)
        .get("/posts/nicht-existierender-beitrag")
        .expect(404);

      expect(response.text).toContain("Beitrag nicht gefunden");
    });
  });
});

describe("Admin-Routen - Integrationstests", () => {
  it("sollte zu Login umleiten, wenn nicht authentifiziert", async () => {
    const response = await request(app).get("/admin/posts").expect(302);

    expect(response.headers.location).toBe("/login");
  });

  it("sollte Zugriff erlauben, wenn authentifiziert", async () => {
    // Authentifizierte Session einrichten
    const agent = request.agent(app);

    // Zuerst anmelden
    await agent
      .post("/login")
      .send({ password: process.env.ADMIN_PASSWORD })
      .expect(302);

    // Admin-Panel aufrufen
    const response = await agent.get("/admin/posts").expect(200);

    expect(response.text).toContain("Beiträge verwalten");
  });
});
```

---

## End-to-End-Tests

E2E-Tests simulieren echte Benutzerinteraktionen.

### Playwright einrichten

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Playwright-Config erstellen

`playwright.config.ts` erstellen:

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Beispiel: E2E-Tests

`src/__tests__/e2e/auth.spec.ts` erstellen:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentifizierungsablauf", () => {
  test("sollte mit gültigem Passwort anmelden", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/admin/posts");
    await expect(page.locator("h1")).toContainText("Beiträge verwalten");
  });

  test("sollte Fehler bei ungültigem Passwort anzeigen", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="password"]', "falschespasswort");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/login");
    await expect(page.locator(".error")).toContainText("Ungültiges Passwort");
  });

  test("sollte erfolgreich abmelden", async ({ page }) => {
    // Zuerst anmelden
    await page.goto("/login");
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');

    // Abmelden
    await page.click('a[href="/logout"]');

    await expect(page).toHaveURL("/");
  });
});

test.describe("Beitragsverwaltung", () => {
  test.beforeEach(async ({ page }) => {
    // Vor jedem Test anmelden
    await page.goto("/login");
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
  });

  test("sollte neuen Beitrag erstellen", async ({ page }) => {
    await page.goto("/admin/posts/new");

    await page.fill('input[name="title"]', "E2E-Test-Beitrag");
    await page.fill('textarea[name="excerpt"]', "Test-Auszug");
    await page.fill('textarea[name="content"]', "<p>Test-Inhalt</p>");
    await page.fill('input[name="author"]', "E2E-Tester");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/admin/posts");
    await expect(page.locator("body")).toContainText("E2E-Test-Beitrag");
  });

  test("sollte bestehenden Beitrag bearbeiten", async ({ page }) => {
    await page.goto("/admin/posts");

    // Ersten Bearbeiten-Button klicken
    await page.click('a[href*="/edit"]:first-of-type');

    await page.fill('input[name="title"]', "Aktualisierter Titel");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/admin/posts");
    await expect(page.locator("body")).toContainText("Aktualisierter Titel");
  });

  test("sollte Beitrag löschen", async ({ page }) => {
    await page.goto("/admin/posts");

    const postTitle = await page
      .locator("tr:first-of-type td:first-of-type")
      .textContent();

    page.on("dialog", (dialog) => dialog.accept());
    await page.click('button[value*="delete"]:first-of-type');

    await expect(page.locator("body")).not.toContainText(postTitle!);
  });
});
```

### E2E-Tests ausführen

```bash
# E2E-Tests ausführen
npx playwright test

# Mit UI ausführen
npx playwright test --ui

# Spezifischen Test ausführen
npx playwright test auth.spec.ts

# Debug-Modus
npx playwright test --debug
```

---

## Manuelle Tests

### Manuelle Test-Checkliste

#### Authentifizierung

- [ ] Anmeldung mit korrektem Passwort erfolgreich
- [ ] Anmeldung mit falschem Passwort schlägt fehl
- [ ] Session bleibt über Seitenneuladen bestehen
- [ ] Abmeldung funktioniert korrekt
- [ ] Geschützte Routen leiten zu Login um
- [ ] Nach Anmeldung Umleitung zur beabsichtigten Seite

#### Beitragserstellung

- [ ] Erstellungsformular aufrufbar
- [ ] Alle Felder werden korrekt gerendert
- [ ] Pflichtfeldvalidierung funktioniert
- [ ] Slug aus Titel generiert
- [ ] HTML-Inhalt bereinigt
- [ ] Beitrag erscheint nach Erstellung in Liste

#### Beitragsbearbeitung

- [ ] Bearbeitungsformular aufrufbar
- [ ] Formular mit existierenden Daten gefüllt
- [ ] Updates werden korrekt gespeichert
- [ ] Slug aus neuem Titel regeneriert
- [ ] Aktualisierungszeitstempel ändert sich

#### Beitragslöschung

- [ ] Löschbestätigung angezeigt
- [ ] Beitrag aus Liste entfernt
- [ ] Beitrag nicht über URL erreichbar
- [ ] Daten aus JSON-Datei entfernt

#### Öffentlicher Blog

- [ ] Beitragsliste korrekt angezeigt
- [ ] Paginierung funktioniert
- [ ] Einzelne Beiträge laden
- [ ] 404 für ungültige Slugs angezeigt
- [ ] Responsive auf Mobilgeräten

#### Suche

- [ ] Suche findet Beiträge nach Titel
- [ ] Suche findet Beiträge nach Inhalt
- [ ] Leere Suche zeigt alle Beiträge
- [ ] Keine-Ergebnisse-Nachricht angezeigt

---

## Testabdeckung

### Abdeckungsbericht anzeigen

```bash
npm run test:coverage
```

Öffnet HTML-Bericht in `coverage/lcov-report/index.html`

### Abdeckungsziele

| Kategorie  | Ziel | Aktuell |
| ---------- | ---- | ------- |
| Statements | 80%  | -       |
| Branches   | 75%  | -       |
| Functions  | 80%  | -       |
| Lines      | 80%  | -       |

### Abdeckung verbessern

```bash
# Nicht abgedeckte Zeilen finden
npm run test:coverage -- --coverage --collectCoverageFrom="src/**/*.ts"

# Abdeckungsbericht öffnen
start coverage/lcov-report/index.html
```

---

## Kontinuierliche Integration

### GitHub Actions Workflow

`.github/workflows/test.yml` erstellen:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v3

      - name: Node.js ${{ matrix.node-version }} verwenden
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Abhängigkeiten installieren
        run: npm ci

      - name: Unit-Tests ausführen
        run: npm run test:unit

      - name: Integrationstests ausführen
        run: npm run test:integration
        env:
          SESSION_SECRET: test-secret
          ADMIN_PASSWORD: testpassword

      - name: E2E-Tests ausführen
        run: npx playwright test
        env:
          SESSION_SECRET: test-secret
          ADMIN_PASSWORD: testpassword

      - name: Testergebnisse hochladen
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

      - name: Abdeckung hochladen
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Best Practices

### Test-Organisation

- Eine Testdatei pro Quelldatei
- Verwandte Tests mit `describe` gruppieren
- Klare Testnamen, die erklären, was getestet wird
- `beforeEach` für Setup, `afterEach` für Cleanup verwenden

### Testdaten

- Factories für Testdaten verwenden
- Datenbank/Dateien zwischen Tests zurücksetzen
- Nicht von Testausführungsreihenfolge abhängen
- Aussagekräftige, realistische Testdaten verwenden

### Assertions

- Ein Konzept pro Test
- Klare Assertion-Meldungen
- Sowohl Erfolgs- als auch Fehlerfälle testen
- Grenzfälle und Randbedingungen testen

### Mocking

- Externe Abhängigkeiten mocken
- Nicht mocken, was getestet wird
- Mocks einfach halten
- Überprüfen, dass Mocks korrekt aufgerufen werden

---

## Weiterführende Literatur

- [Jest-Dokumentation](https://jestjs.io/)
- [Playwright-Dokumentation](https://playwright.dev/)
- [Supertest-Dokumentation](https://github.com/ladjs/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Viel Erfolg beim Testen! 🧪**
