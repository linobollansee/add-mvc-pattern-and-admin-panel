# Blog MVC Admin Panel

A complete blog application with MVC architecture and admin panel for managing blog posts.

## Features Implemented

### Core Requirements ✅

- **MVC Pattern**: Clean separation of concerns with Models, Views, and Controllers
- **Nunjucks Templating**: Server-side rendering with template inheritance and filters
- **Admin Control Panel**: Full CRUD operations for blog posts
- **WYSIWYG Editor**: Quill.js rich text editor for content creation
- **HTML Sanitization**: All content is sanitized using `sanitize-html` before storage
- **JSON Storage**: Data persists in `src/data/posts.json`
- **Bootstrap UI**: Professional admin interface with Bootstrap 5

### Optional Features ✅

- **Search Functionality**: Search posts by title, excerpt, or content in admin panel
- **Responsive Design**: Mobile-friendly layouts for both public and admin views

## Project Structure

```
├── public/
│   ├── css/
│   │   ├── style.css       # Public site styles
│   │   └── admin.css       # Admin panel styles
│   └── js/
│       └── editor.js       # Quill editor initialization
├── src/
│   ├── controllers/
│   │   ├── postController.js    # Public post viewing
│   │   └── adminController.js   # Admin CRUD operations
│   ├── data/
│   │   └── posts.json      # Blog posts storage
│   ├── models/
│   │   └── postModel.js    # Data access layer
│   ├── routes/
│   │   ├── postRoutes.js   # Public routes
│   │   └── adminRoutes.js  # Admin routes
│   ├── views/
│   │   ├── layout.njk      # Base template
│   │   ├── error.njk       # Error page
│   │   ├── posts/
│   │   │   ├── index.njk   # List all posts
│   │   │   └── show.njk    # Single post view
│   │   └── admin/
│   │       ├── layout.njk  # Admin base template
│   │       └── posts/
│   │           ├── index.njk    # Manage posts
│   │           └── edit.njk     # Create/edit form
│   └── app.js              # Express application
└── package.json

```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. For development with auto-restart:

```bash
npm run dev
```

## Usage

### Public Site

- **Home**: http://localhost:3000/
- **All Posts**: http://localhost:3000/posts
- **Single Post**: http://localhost:3000/posts/[slug]

### Admin Panel

- **Dashboard**: http://localhost:3000/admin/posts
- **Create Post**: http://localhost:3000/admin/posts/new
- **Edit Post**: http://localhost:3000/admin/posts/[id]/edit
- **Search Posts**: Use search bar in admin dashboard

## Technologies Used

- **Backend**: Node.js, Express.js
- **Template Engine**: Nunjucks
- **WYSIWYG Editor**: Quill.js
- **CSS Framework**: Bootstrap 5
- **Security**: sanitize-html
- **Data Storage**: JSON file system

## MVC Architecture

### Model (`src/models/postModel.js`)

- Data access layer
- CRUD operations on posts.json
- HTML sanitization
- Search functionality

### View (`src/views/*.njk`)

- Nunjucks templates
- Template inheritance
- Custom filters (date, truncate)
- Responsive layouts

### Controller (`src/controllers/*.js`)

- Business logic
- Request handling
- Response rendering
- Error handling

## Security Features

- HTML content sanitization with `sanitize-html`
- Only safe HTML tags and attributes allowed
- XSS protection through Nunjucks autoescaping
- Content validation before storage

## API Endpoints

### Public Routes

- `GET /` - Redirect to posts
- `GET /posts` - List all posts
- `GET /posts/:slug` - View single post

### Admin Routes

- `GET /admin/posts` - List all posts (admin view)
- `GET /admin/posts?search=query` - Search posts
- `GET /admin/posts/new` - Create post form
- `POST /admin/posts` - Store new post
- `GET /admin/posts/:id/edit` - Edit post form
- `POST /admin/posts/:id` - Update post
- `POST /admin/posts/:id/delete` - Delete post

## Development Notes

- Server runs on port 3000 by default
- Data is stored in `src/data/posts.json`
- Posts are automatically assigned unique IDs
- Slugs are auto-generated from post titles
- Timestamps (createdAt, updatedAt) are managed automatically

## Future Enhancements

- [ ] User authentication for admin routes
- [ ] Pagination for post listings
- [ ] Image upload functionality
- [ ] Categories and tags
- [ ] Comments system
- [ ] RSS feed
- [ ] SEO meta tags
