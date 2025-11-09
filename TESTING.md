# Testing GuideComplete guide to testing the Blog MVC Admin application.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Setup](#test-setup)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Manual Testing](#manual-testing)
- [Test Coverage](#test-coverage)
- [Continuous Integration](#continuous-integration)

---

## Testing Philosophy

### Testing Pyramid

```
       /\
      /E2E\       ← Few (slow, expensive)
     /------\
    /  Int   \    ← Some (moderate speed)
   /----------\
  /   Unit     \  ← Many (fast, cheap)
 /--------------\
```

**Our Approach:**

- **70%** Unit tests (models, utilities)
- **20%** Integration tests (controllers, routes)
- **10%** E2E tests (critical user flows)

### Test-Driven Development (TDD)

**Red-Green-Refactor cycle:**

1. 🔴 Write failing test
2. 🟢 Write minimum code to pass
3. 🔵 Refactor and improve
4. Repeat

---

## Test Setup

### Install Testing Dependencies

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  @jest/globals \
  supertest \
  @types/supertest
```

### Configure Jest

Create `jest.config.js`:

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

### Update package.json

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

### Create Test Structure

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

## Unit Testing

Unit tests test individual functions in isolation.

### Example: postModel Unit Tests

Create `src/models/__tests__/postModel.unit.test.ts`:

```typescript
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import * as postModel from "../postModel";
import fs from "fs/promises";

// Mock fs module
jest.mock("fs/promises");

describe("postModel - Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPosts", () => {
    it("should return array of posts sorted by date", async () => {
      // Mock file system
      const mockData = {
        posts: [
          {
            id: 1,
            title: "Second Post",
            slug: "second-post",
            excerpt: "Excerpt 2",
            content: "Content 2",
            author: "Author 2",
            createdAt: "2025-11-09T12:00:00.000Z",
            updatedAt: "2025-11-09T12:00:00.000Z",
          },
          {
            id: 2,
            title: "First Post",
            slug: "first-post",
            excerpt: "Excerpt 1",
            content: "Content 1",
            author: "Author 1",
            createdAt: "2025-11-10T12:00:00.000Z",
            updatedAt: "2025-11-10T12:00:00.000Z",
          },
        ],
        nextId: 3,
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const posts = await postModel.getAllPosts();

      expect(posts).toHaveLength(2);
      expect(posts[0].title).toBe("First Post"); // Newest first
      expect(posts[1].title).toBe("Second Post");
    });

    it("should return empty array if no posts", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ posts: [], nextId: 1 })
      );

      const posts = await postModel.getAllPosts();

      expect(posts).toHaveLength(0);
    });

    it("should handle file read errors gracefully", async () => {
      (fs.readFile as jest.Mock).mockRejectedValue(new Error("File not found"));

      const posts = await postModel.getAllPosts();

      expect(posts).toEqual([]);
    });
  });

  describe("getPostById", () => {
    it("should return post with matching ID", async () => {
      const mockData = {
        posts: [
          { id: 1, title: "Test Post" /* ... */ },
          { id: 2, title: "Another Post" /* ... */ },
        ],
        nextId: 3,
      };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const post = await postModel.getPostById(1);

      expect(post).toBeDefined();
      expect(post?.id).toBe(1);
      expect(post?.title).toBe("Test Post");
    });

    it("should return undefined if post not found", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ posts: [], nextId: 1 })
      );

      const post = await postModel.getPostById(999);

      expect(post).toBeUndefined();
    });

    it("should accept string ID and convert to number", async () => {
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
    it("should create post with auto-generated fields", async () => {
      const mockData = { posts: [], nextId: 1 };

      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const postData = {
        title: "New Post",
        excerpt: "Excerpt",
        content: "<p>Content</p>",
      };

      const post = await postModel.createPost(postData);

      expect(post).toBeDefined();
      expect(post?.id).toBe(1);
      expect(post?.slug).toBe("new-post");
      expect(post?.author).toBe("Anonymous");
      expect(post?.createdAt).toBeDefined();
    });

    it("should sanitize HTML content", async () => {
      (fs.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify({ posts: [], nextId: 1 })
      );
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

      const postData = {
        title: "Test",
        excerpt: "Excerpt",
        content: '<script>alert("xss")</script><p>Safe content</p>',
      };

      const post = await postModel.createPost(postData);

      expect(post?.content).not.toContain("<script>");
      expect(post?.content).toContain("<p>");
    });
  });
});
```

### Running Unit Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

---

## Integration Testing

Integration tests test how components work together.

### Example: Controller Integration Tests

Create `src/controllers/__tests__/postController.integration.test.ts`:

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

describe("POST /posts - Integration Tests", () => {
  describe("GET /posts", () => {
    it("should return 200 and list of posts", async () => {
      const response = await request(app).get("/posts").expect(200);

      expect(response.text).toContain("Blog Posts");
    });

    it("should support pagination", async () => {
      const response = await request(app).get("/posts?page=2").expect(200);

      expect(response.text).toBeDefined();
    });
  });

  describe("GET /posts/:slug", () => {
    it("should return 200 for valid slug", async () => {
      // Assuming a post with this slug exists
      const response = await request(app).get("/posts/test-post").expect(200);

      expect(response.text).toContain("Test Post");
    });

    it("should return 404 for invalid slug", async () => {
      const response = await request(app)
        .get("/posts/non-existent-post")
        .expect(404);

      expect(response.text).toContain("Post not found");
    });
  });
});

describe("Admin Routes - Integration Tests", () => {
  it("should redirect to login when not authenticated", async () => {
    const response = await request(app).get("/admin/posts").expect(302);

    expect(response.headers.location).toBe("/login");
  });

  it("should allow access when authenticated", async () => {
    // Setup authenticated session
    const agent = request.agent(app);

    // Login first
    await agent
      .post("/login")
      .send({ password: process.env.ADMIN_PASSWORD })
      .expect(302);

    // Access admin panel
    const response = await agent.get("/admin/posts").expect(200);

    expect(response.text).toContain("Manage Posts");
  });
});
```

---

## End-to-End Testing

E2E tests simulate real user interactions.

### Setup Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Create Playwright Config

Create `playwright.config.ts`:

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

### Example: E2E Tests

Create `src/__tests__/e2e/auth.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should login with valid password", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/admin/posts");
    await expect(page.locator("h1")).toContainText("Manage Posts");
  });

  test("should show error with invalid password", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/login");
    await expect(page.locator(".error")).toContainText("Invalid password");
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');

    // Logout
    await page.click('a[href="/logout"]');

    await expect(page).toHaveURL("/");
  });
});

test.describe("Post Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
  });

  test("should create new post", async ({ page }) => {
    await page.goto("/admin/posts/new");

    await page.fill('input[name="title"]', "E2E Test Post");
    await page.fill('textarea[name="excerpt"]', "Test excerpt");
    await page.fill('textarea[name="content"]', "<p>Test content</p>");
    await page.fill('input[name="author"]', "E2E Tester");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/admin/posts");
    await expect(page.locator("body")).toContainText("E2E Test Post");
  });

  test("should edit existing post", async ({ page }) => {
    await page.goto("/admin/posts");

    // Click first edit button
    await page.click('a[href*="/edit"]:first-of-type');

    await page.fill('input[name="title"]', "Updated Title");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/admin/posts");
    await expect(page.locator("body")).toContainText("Updated Title");
  });

  test("should delete post", async ({ page }) => {
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

### Run E2E Tests

```bash
# Run E2E tests
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test auth.spec.ts

# Debug mode
npx playwright test --debug
```

---

## Manual Testing

### Manual Test Checklist

#### Authentication

- [ ] Login with correct password succeeds
- [ ] Login with wrong password fails
- [ ] Session persists across page reloads
- [ ] Logout works correctly
- [ ] Protected routes redirect to login
- [ ] After login, redirects to intended page

#### Post Creation

- [ ] Can access create form
- [ ] All fields render correctly
- [ ] Required field validation works
- [ ] Slug generated from title
- [ ] HTML content sanitized
- [ ] Post appears in list after creation

#### Post Editing

- [ ] Can access edit form
- [ ] Form populated with existing data
- [ ] Updates save correctly
- [ ] Slug regenerated from new title
- [ ] Updated timestamp changes

#### Post Deletion

- [ ] Delete confirmation shown
- [ ] Post removed from list
- [ ] Post not accessible via URL
- [ ] Data removed from JSON file

#### Public Blog

- [ ] Post list displays correctly
- [ ] Pagination works
- [ ] Individual posts load
- [ ] 404 shown for invalid slugs
- [ ] Responsive on mobile

#### Search

- [ ] Search finds posts by title
- [ ] Search finds posts by content
- [ ] Empty search shows all posts
- [ ] No results message displayed

---

## Test Coverage

### View Coverage Report

```bash
npm run test:coverage
```

Opens HTML report in `coverage/lcov-report/index.html`

### Coverage Goals

| Category   | Target | Current |
| ---------- | ------ | ------- |
| Statements | 80%    | -       |
| Branches   | 75%    | -       |
| Functions  | 80%    | -       |
| Lines      | 80%    | -       |

### Improving Coverage

```bash
# Find uncovered lines
npm run test:coverage -- --coverage --collectCoverageFrom="src/**/*.ts"

# Open coverage report
open coverage/lcov-report/index.html
```

---

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

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

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration
        env:
          SESSION_SECRET: test-secret
          ADMIN_PASSWORD: testpassword

      - name: Run E2E tests
        run: npx playwright test
        env:
          SESSION_SECRET: test-secret
          ADMIN_PASSWORD: testpassword

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Best Practices

### Test Organization

- One test file per source file
- Group related tests with `describe`
- Clear test names that explain what they test
- Use `beforeEach` for setup, `afterEach` for cleanup

### Test Data

- Use factories for test data
- Reset database/files between tests
- Don't depend on test execution order
- Use meaningful, realistic test data

### Assertions

- One concept per test
- Clear assertion messages
- Test both success and failure cases
- Test edge cases and boundaries

### Mocking

- Mock external dependencies
- Don't mock what you're testing
- Keep mocks simple
- Verify mocks are called correctly

---

## Further Reading

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Happy Testing! 🧪**
