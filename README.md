# Blog MVC Admin

A blog application implementing the MVC (Model-View-Controller) pattern with an Admin Control Panel (ACP) for managing blog posts.

## Features

### Core Features

- **MVC Pattern Implementation** - Clean separation of concerns using Models, Views, and Controllers
- **Admin Control Panel** - Full CRUD operations for blog posts
  - List all blog entries
  - Create new entries
  - Edit existing entries
  - Delete entries
- **WYSIWYG Editor** - Rich text editor for blog post content
- **HTML Sanitization** - All stored HTML is sanitized for security
- **JSON Storage** - Blog posts are stored in a JSON file

### Optional Features

- **Basic Authentication** - Protected admin routes with login system
- **Search Functionality** - Search through blog entries
- **Pagination** - Paginated listing for both admin and public views

## Technologies

- **Backend**: Express.js (Node.js)
- **Templating**: Nunjucks
- **Frontend**: Vanilla JavaScript
- **Editor**: WYSIWYG editor for content management
- **Security**: sanitize-html for HTML sanitization
- **Session Management**: express-session
- **Environment Config**: dotenv

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd add-mvc-pattern-and-admin-panel
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env` file in the root directory (if needed for configuration)

## Usage

### Start the application

```bash
npm start
```

### Development mode (with auto-reload)

```bash
npm run dev
```

The application will run on the configured port (default: check `src/app.js`).

## Project Structure

```
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   └── js/             # Client-side JavaScript
│       └── editor.js   # WYSIWYG editor integration
├── src/
│   ├── app.js          # Application entry point
│   ├── controllers/    # Route controllers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── postController.js
│   ├── data/           # Data storage
│   │   └── posts.json  # Blog posts database
│   ├── middleware/     # Express middleware
│   │   └── auth.js     # Authentication middleware
│   ├── models/         # Data models
│   │   └── postModel.js
│   ├── routes/         # Route definitions
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   └── postRoutes.js
│   └── views/          # Nunjucks templates
│       ├── layout.njk
│       ├── login.njk
│       ├── error.njk
│       ├── admin/      # Admin panel views
│       │   ├── layout.njk
│       │   └── posts/
│       │       ├── index.njk
│       │       └── edit.njk
│       └── posts/      # Public blog views
│           ├── index.njk
│           └── show.njk
└── package.json
```

## MVC Architecture

- **Models** (`src/models/`): Handle data logic and JSON file operations
- **Views** (`src/views/`): Nunjucks templates for rendering HTML
- **Controllers** (`src/controllers/`): Process requests and coordinate between models and views

## License

ISC
