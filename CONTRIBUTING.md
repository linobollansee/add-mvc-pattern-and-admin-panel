# Contributing Guide

Thank you for considering contributing to the Blog MVC Admin project! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of:

- Age, body size, disability
- Ethnicity, gender identity and expression
- Level of experience, nationality
- Personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behavior includes:**

- Using welcoming and inclusive language
- Respecting differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**

- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js v18+ installed
- Git installed
- Code editor (VS Code recommended)
- Basic knowledge of TypeScript and Express.js

### Initial Setup

1. **Fork the repository**

   - Click "Fork" button on GitHub
   - Clone your fork locally

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR-USERNAME/add-mvc-pattern-and-admin-panel.git
   cd add-mvc-pattern-and-admin-panel
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/linobollansee/add-mvc-pattern-and-admin-panel.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Create .env file**

   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```

---

## Development Workflow

### Branch Strategy

We use a simple branching model:

- `main` - Production-ready code
- `develop` - Integration branch (if used)
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
# Update your local main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Convention

```
feature/add-comment-system
feature/improve-search
bugfix/fix-session-timeout
bugfix/correct-pagination
hotfix/security-patch
docs/update-readme
```

### Keeping Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Or merge if you prefer
git merge upstream/main
```

---

## Coding Standards

### TypeScript Style Guide

#### 1. Naming Conventions

```typescript
// Classes: PascalCase
class PostController {}

// Interfaces: PascalCase with 'I' prefix (optional)
interface IPost {}
// OR just PascalCase
interface Post {}

// Functions/Methods: camelCase
function getAllPosts() {}

// Variables: camelCase
const postList = [];

// Constants: UPPER_SNAKE_CASE
const MAX_POST_LENGTH = 1000;

// Files: camelCase or kebab-case
// postController.ts
// post-controller.ts
```

#### 2. Type Annotations

Always use explicit types:

```typescript
// ✅ Good
function createPost(title: string, content: string): Promise<Post | null> {
  // ...
}

// ❌ Avoid
function createPost(title, content) {
  // ...
}
```

#### 3. Interface vs Type

Prefer interfaces for objects:

```typescript
// ✅ Prefer
interface Post {
  id: number;
  title: string;
}

// Use types for unions/intersections
type PostOrNull = Post | null;
```

#### 4. Async/Await over Promises

```typescript
// ✅ Good
async function getPosts(): Promise<Post[]> {
  const data = await readData();
  return data.posts;
}

// ❌ Avoid
function getPosts(): Promise<Post[]> {
  return readData().then((data) => data.posts);
}
```

#### 5. Error Handling

Always handle errors properly:

```typescript
// ✅ Good
async function createPost(data: CreatePostInput): Promise<Post | null> {
  try {
    const post = await postModel.createPost(data);
    return post;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error; // or return null
  }
}
```

### Code Organization

#### File Structure

```
src/
├── controllers/    # Request handlers
├── models/        # Data access layer
├── routes/        # URL routing
├── middleware/    # Custom middleware
├── types/         # TypeScript types
├── utils/         # Helper functions
└── views/         # Nunjucks templates
```

#### Module Exports

```typescript
// ✅ Named exports (preferred)
export function getAllPosts() {}
export function getPostById() {}

// ✅ Default export for single export
export default router;
```

### Comments and Documentation

#### Function Documentation

```typescript
/**
 * Create a new blog post
 *
 * @param postData - Post creation data
 * @returns Newly created post or null if failed
 * @throws Error if validation fails
 */
export async function createPost(
  postData: CreatePostInput
): Promise<Post | null> {
  // Implementation
}
```

#### Inline Comments

```typescript
// ✅ Good - Explain WHY
// Use strict sameSite to prevent CSRF attacks
cookie: {
  sameSite: "strict";
}

// ❌ Bad - Explains WHAT (obvious from code)
// Set sameSite to strict
cookie: {
  sameSite: "strict";
}
```

### Formatting

We use Prettier for consistent formatting.

**Install Prettier:**

```bash
npm install --save-dev prettier
```

**Create `.prettierrc`:**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2
}
```

**Format code:**

```bash
npx prettier --write "src/**/*.ts"
```

### Linting

**Install ESLint:**

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Create `.eslintrc.json`:**

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

**Run linting:**

```bash
npx eslint "src/**/*.ts"
```

---

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring (no functional changes)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependencies
- `ci`: CI/CD configuration
- `chore`: Other changes that don't modify src

### Examples

```bash
# Feature
git commit -m "feat(admin): add post search functionality"

# Bug fix
git commit -m "fix(auth): resolve session timeout issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# With body
git commit -m "feat(posts): add pagination

- Add page query parameter
- Limit posts to 6 per page
- Add previous/next navigation"

# Breaking change
git commit -m "feat(api): change post slug format

BREAKING CHANGE: Post URLs now use slugs instead of IDs"
```

### Commit Best Practices

- Keep commits atomic (one logical change per commit)
- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Don't commit broken code
- Test before committing

---

## Pull Request Process

### Before Submitting

- [ ] Code compiles without errors (`npm run build`)
- [ ] All tests pass (if tests exist)
- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] Commits follow commit guidelines
- [ ] Branch is up to date with main

### Submitting a Pull Request

1. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open Pull Request on GitHub**

   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Select base: `main`, compare: `your-branch`

3. **Fill out PR template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   How was this tested?

   ## Checklist

   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex areas
   - [ ] Documentation updated
   - [ ] No new warnings generated
   ```

4. **Link related issues**
   - Reference issues: "Closes #123"
   - Mention related PRs

### PR Review Process

1. **Automated checks run** (if CI/CD configured)
2. **Maintainers review code**
3. **Requested changes addressed**
4. **PR approved and merged**

### After Merge

```bash
# Update your local main
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

---

## Testing

Currently, the project doesn't have automated tests. Here's how to add them:

### Setting Up Jest

```bash
npm install --save-dev jest @types/jest ts-jest
```

### Jest Configuration

Create `jest.config.js`:

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/app.ts"],
};
```

### Writing Tests

Create `src/models/__tests__/postModel.test.ts`:

```typescript
import * as postModel from "../postModel";

describe("postModel", () => {
  describe("getAllPosts", () => {
    it("should return array of posts", async () => {
      const posts = await postModel.getAllPosts();
      expect(Array.isArray(posts)).toBe(true);
    });
  });

  describe("createPost", () => {
    it("should create a new post", async () => {
      const postData = {
        title: "Test Post",
        excerpt: "Test excerpt",
        content: "Test content",
      };

      const post = await postModel.createPost(postData);
      expect(post).toBeDefined();
      expect(post?.title).toBe("Test Post");
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

---

## Documentation

### When to Update Documentation

Update documentation when you:

- Add new features
- Change existing functionality
- Fix bugs that affect usage
- Improve setup or deployment process

### Documentation Files to Update

- **README.md** - Overview, quick start
- **API.md** - Route changes
- **ARCHITECTURE.md** - Structural changes
- **SECURITY.md** - Security-related changes
- **DEPLOYMENT.md** - Deployment changes
- **Code comments** - Complex logic

### Documentation Style

- Use clear, concise language
- Include code examples
- Add diagrams for complex flows
- Keep formatting consistent
- Test all code examples

---

## Reporting Issues

### Before Creating an Issue

1. **Search existing issues** - It may already be reported
2. **Check documentation** - Issue might be addressed
3. **Try latest version** - Bug might be fixed
4. **Gather information** - Reproduction steps, environment details

### Creating a Good Issue

**Bug Report Template:**

```markdown
## Bug Description

Clear description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS: Windows 10
- Node.js: v18.0.0
- Browser: Chrome 96

## Additional Context

Screenshots, error messages, etc.
```

**Feature Request Template:**

```markdown
## Feature Description

Clear description of the feature

## Problem it Solves

Why is this needed?

## Proposed Solution

How should it work?

## Alternatives Considered

Other possible solutions

## Additional Context

Examples, mockups, etc.
```

---

## Getting Help

### Resources

- 📖 Read the documentation
- 💬 Check GitHub Discussions
- 🐛 Search existing issues
- 📧 Contact maintainers

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - Questions, ideas
- **Pull Requests** - Code contributions

---

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing! 🎉

---

## Quick Reference

```bash
# Setup
git clone https://github.com/YOUR-USERNAME/add-mvc-pattern-and-admin-panel.git
cd add-mvc-pattern-and-admin-panel
npm install

# Create feature
git checkout -b feature/my-feature
# Make changes
npm run build  # Test compilation
git commit -m "feat: my feature"
git push origin feature/my-feature

# Update from upstream
git fetch upstream
git rebase upstream/main

# Format code
npx prettier --write "src/**/*.ts"

# Lint code
npx eslint "src/**/*.ts"
```

---

**Happy Contributing! 🚀**
