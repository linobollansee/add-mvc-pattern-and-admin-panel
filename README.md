<!--
  Blog MVC Admin - Project README / Blog MVC Admin - Projekt README
  This is the main documentation file for the blog application / Dies ist die Hauptdokumentationsdatei für die Blog-Anwendung

  Purpose / Zweck:
  - Provide project overview and quick start guide / Projektübersicht und Schnellstartanleitung bereitstellen
  - List features and tech stack / Funktionen und Tech-Stack auflisten
  - Installation and usage instructions / Installations- und Nutzungsanweisungen

  Related Documentation / Verwandte Dokumentation:
  - SETUP.md - Detailed installation guide / Detaillierte Installationsanleitung
  - ARCHITECTURE.md - System architecture / Systemarchitektur
  - API.md - API reference / API-Referenz
  - SECURITY.md - Security best practices / Sicherheits-Best-Practices
-->

# Blog MVC Admin

A full-featured blog application built with Express.js, TypeScript, and the MVC (Model-View-Controller) pattern. Includes an admin panel for managing blog posts with authentication and a WYSIWYG editor.

## Features

### Public Features

- 📝 Browse blog posts
- 📖 Read individual blog posts
- 🎨 Clean, responsive interface

### Admin Panel

- 🔐 Secure authentication system
- ✏️ Create, read, update, and delete blog posts
- 📝 WYSIWYG editor for rich content editing
- 🧹 HTML sanitization for security
- 📊 Manage all posts from a centralized dashboard

## Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Template Engine**: Nunjucks
- **Session Management**: express-session
- **Security**: sanitize-html for XSS protection
- **Data Storage**: JSON file-based storage

## Project Structure

```
├── src/
│   ├── app.ts                 # Application entry point
│   ├── controllers/           # Business logic
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   └── postController.ts
│   ├── models/                # Data models
│   │   └── postModel.ts
│   ├── views/                 # Nunjucks templates
│   │   ├── layout.njk
│   │   ├── login.njk
│   │   ├── admin/            # Admin panel views
│   │   └── posts/            # Public post views
│   ├── routes/               # Route definitions
│   │   ├── adminRoutes.ts
│   │   ├── authRoutes.ts
│   │   └── postRoutes.ts
│   ├── middleware/           # Custom middleware
│   │   └── auth.ts
│   ├── types/               # TypeScript type definitions
│   └── data/                # JSON data storage
├── public/                  # Static assets
│   ├── css/
│   └── js/
└── package.json
```

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd add-mvc-pattern-and-admin-panel
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
SESSION_SECRET=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password-here
```

## Usage

### Development Mode

Run the application with auto-reload:

```bash
npm run dev
```

### Production Build

1. Build the TypeScript code:

```bash
npm run build
```

2. Start the application:

```bash
npm start
```

### Other Commands

- **Clean build directory**: `npm run clean`
- **Watch mode** (compile on save): `npm run watch`

## Accessing the Application

- **Public Blog**: http://localhost:3000/posts
- **Admin Panel**: http://localhost:3000/admin
- **Login**: http://localhost:3000/login

Default admin credentials (set in `.env`):

- Username: admin
- Password: (set via ADMIN_PASSWORD environment variable)

## MVC Architecture

This project follows the Model-View-Controller pattern:

- **Models** (`src/models/`): Handle data operations and business logic
- **Views** (`src/views/`): Nunjucks templates for rendering HTML
- **Controllers** (`src/controllers/`): Process requests and coordinate between models and views

## Security Features

- Session-based authentication
- HTML sanitization to prevent XSS attacks
- Protected admin routes with authentication middleware
- HTTP-only cookies
- Environment variable-based configuration

## API Routes

### Public Routes

- `GET /` - Redirects to posts listing
- `GET /posts` - List all blog posts
- `GET /posts/:id` - View individual post

### Auth Routes

- `GET /login` - Login page
- `POST /login` - Process login
- `GET /logout` - Logout user

### Admin Routes (Protected)

- `GET /admin` - Redirects to admin posts
- `GET /admin/posts` - List all posts (admin view)
- `GET /admin/posts/new` - Create new post form
- `POST /admin/posts` - Save new post
- `GET /admin/posts/:id/edit` - Edit post form
- `POST /admin/posts/:id` - Update post
- `POST /admin/posts/:id/delete` - Delete post

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Acknowledgments

Built as part of a coding challenge to implement MVC pattern and admin panel functionality.
