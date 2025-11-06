# Conventional Commit Types Reference

## For Claude (Anthropic)

Claude typically suggests these conventional commit types for Node.js projects:

```
feat: add Express middleware, implement REST API endpoints, create authentication system
fix: resolve npm package conflict, correct async/await error, patch route handler bug
docs: update package.json description, add JSDoc comments, create API endpoint documentation
refactor: modularize route handlers, extract middleware functions, reorganize folder structure
style: format with ESLint, fix semicolon usage, apply Prettier rules
chore: update .gitignore for node_modules, remove unused dependencies, clean package-lock.json
test: add Jest unit tests, create Mocha test suite, update Supertest integration tests
build: configure webpack, update npm scripts, add nodemon for development
perf: optimize database connection pooling, reduce middleware overhead, implement Redis caching
ci: add Node.js GitHub Actions workflow, configure npm test pipeline, setup deployment to Heroku
deps: update Express to v4.18, upgrade mongoose version, add dotenv package
config: setup environment variables, configure PORT and DB_URI, add production settings
ui: update Nunjucks templates, modify EJS views, improve Handlebars layouts
i18n: add i18next support, translate validation messages, support multiple languages
security: implement helmet.js, sanitize user input with express-validator, add rate-limiter-flexible
ux: add request timeout handling, improve error response messages, implement graceful shutdown
data: create Mongoose schema, seed MongoDB database, update Sequelize migrations
revert: rollback Express upgrade, undo database schema changes, restore previous API version
a11y: add semantic HTML in templates, improve form labels, enhance navigation structure
wip: experiment with GraphQL, draft WebSocket implementation, prototype microservices architecture
```

---

## For GitHub Copilot

GitHub Copilot commonly uses these simpler, more concise patterns:

```
feat: add new feature, create new component, implement functionality
fix: fix bug, resolve issue, correct error
docs: update documentation, add comments, improve README
refactor: refactor code, restructure files, improve architecture
style: format code, update styling, apply linter
chore: update dependencies, clean up files, maintenance tasks
test: add tests, update test cases, improve test coverage
build: update build configuration, modify package scripts
perf: improve performance, optimize code, reduce load time
ci: update CI/CD pipeline, configure workflows
```

**Copilot-specific patterns:**

- Tends to use shorter, action-focused descriptions
- Often suggests inline with code context
- May combine types: `feat(api): add user endpoint`

---

## For ChatGPT (OpenAI)

ChatGPT typically provides more detailed, educational commit styles:

```
feat: Add new feature to enhance functionality
fix: Fix critical bug in user authentication
docs: Update README with installation instructions
refactor: Refactor codebase for better maintainability
style: Apply consistent code formatting across project
chore: Update project dependencies and configuration
test: Add comprehensive unit tests for core modules
build: Configure build system for production deployment
perf: Optimize database queries for faster response times
ci: Set up continuous integration pipeline with GitHub Actions
```

**ChatGPT-specific patterns:**

- More verbose and explanatory descriptions
- Often includes reasoning in commit body
- May suggest full commit message with body and footer
- Example:

  ```
  feat: Add user authentication system

  Implement JWT-based authentication with:
  - Login and registration endpoints
  - Password hashing with bcrypt
  - Token refresh mechanism

  Closes #123
  ```

---

## For Cursor AI

Cursor AI (using Claude/GPT models) typically suggests context-aware commits:

```
feat: implement feature based on cursor position
fix: resolve error in current file
refactor: improve highlighted code section
style: format current selection
docs: document selected function
test: add tests for current component
```

**Cursor-specific patterns:**

- Context-aware based on cursor/selection
- Often suggests commits for partial file changes
- Inline suggestions while typing
- May use file-specific scopes: `feat(auth): add login`

---

## For Codeium

Codeium typically suggests practical, IDE-integrated commits:

```
feat: add feature implementation
fix: resolve compilation error
refactor: simplify logic
style: auto-format code
docs: add inline documentation
test: create test cases
```

**Codeium-specific patterns:**

- Quick, concise suggestions
- Often based on recent code changes
- May auto-detect type from file changes
- Integrates with IDE git tools

---

## For Tabnine

Tabnine focuses on predictive, pattern-based commits:

```
feat: implement requested feature
fix: correct identified issue
refactor: optimize code structure
docs: enhance code documentation
test: expand test coverage
```

**Tabnine-specific patterns:**

- Learns from your commit history
- Suggests based on your past patterns
- May predict full commit messages
- Adapts to team conventions

---

## Universal Best Practices (All AI Tools)

### Most Common Types (90% of commits):

1. **feat:** - New features
2. **fix:** - Bug fixes
3. **docs:** - Documentation changes
4. **refactor:** - Code restructuring
5. **style:** - Formatting changes

### Format Structure:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

### With Scope Examples:

```
feat(auth): add JWT authentication
fix(api): resolve CORS issue
docs(readme): update installation steps
refactor(controllers): extract validation logic
style(admin): apply consistent spacing
```

### Breaking Changes:

```
feat!: redesign API structure
feat(api)!: change authentication flow

BREAKING CHANGE: API endpoints now require v2 prefix
```

---

## Frequency Sorted (All AIs):

```
1.  feat: - Most common - new features and functionality
2.  fix: - Very common - bug fixes and corrections
3.  docs: - Common - documentation updates
4.  refactor: - Common - code improvements
5.  style: - Regular - formatting and linting
6.  chore: - Regular - maintenance tasks
7.  test: - Regular - test additions and updates
8.  build: - Occasional - build system changes
9.  perf: - Occasional - performance improvements
10. ci: - Occasional - CI/CD updates
11. deps: - Occasional - dependency updates
12. config: - Rare - configuration changes
13. ui: - Rare - UI-specific changes
14. i18n: - Rare - internationalization
15. security: - Rare - security improvements
16. ux: - Rare - UX improvements
17. data: - Rare - database/data changes
18. revert: - Rare - reverting changes
19. a11y: - Very rare - accessibility
20. wip: - Very rare - work in progress
```

---

## Node.js Project Specific Examples:

```javascript
// Express/API Development
feat: add new API endpoint for user management
fix: resolve middleware execution order issue
refactor: extract route handlers into separate files

// Database
feat: implement MongoDB connection with Mongoose
fix: resolve database connection pool exhaustion
data: add migration for new user fields

// Authentication
feat: integrate Passport.js authentication strategy
security: implement rate limiting for login attempts
fix: resolve JWT token expiration handling

// Templates/Views
feat: create Nunjucks templates for admin panel
ui: update EJS layouts with responsive design
style: apply consistent styling across templates

// Testing
test: add Supertest integration tests for API
test: implement Jest unit tests for controllers
fix: resolve failing test cases in CI pipeline

// Dependencies
deps: update Express from 4.17 to 4.18
deps: add sanitize-html for content security
chore: remove unused npm packages

// Configuration
config: setup dotenv for environment variables
config: configure CORS for production
build: add nodemon for development auto-restart

// Performance
perf: implement Redis caching layer
perf: optimize database query with indexes
refactor: reduce middleware overhead
```

---

## Quick Reference Card:

| Type     | Use When                 | Example                        |
| -------- | ------------------------ | ------------------------------ |
| feat     | Adding new feature       | `feat: add user registration`  |
| fix      | Fixing a bug             | `fix: resolve login error`     |
| docs     | Changing docs only       | `docs: update API guide`       |
| refactor | Restructuring code       | `refactor: simplify validator` |
| style    | Formatting only          | `style: apply ESLint rules`    |
| chore    | Maintenance tasks        | `chore: update .gitignore`     |
| test     | Adding tests             | `test: add user model tests`   |
| build    | Build system changes     | `build: configure webpack`     |
| perf     | Performance improvements | `perf: optimize queries`       |
| ci       | CI/CD changes            | `ci: add GitHub Actions`       |

---

**Note:** All major AI coding assistants (Claude, Copilot, ChatGPT, Cursor, etc.) recognize and support these conventional commit types. The key differences are in how they suggest and format the messages, but the underlying types remain consistent across tools.
