# Frequently Asked Questions (FAQ)

Common questions and answers about the Blog MVC Admin application.

## Table of Contents

- [General Questions](#general-questions)
- [Installation & Setup](#installation--setup)
- [Usage & Features](#usage--features)
- [Authentication & Security](#authentication--security)
- [Data & Storage](#data--storage)
- [Deployment](#deployment)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## General Questions

### What is this project?

This is a full-featured blog application built with the MVC (Model-View-Controller) pattern using Express.js, TypeScript, and Nunjucks templates. It includes both a public-facing blog and a secure admin panel for managing posts.

### Who is this for?

- **Developers** learning MVC architecture
- **Content creators** wanting a simple blog platform
- **Students** studying TypeScript and Express.js
- **Anyone** needing a lightweight, customizable blog

### What makes this different from WordPress or other CMSs?

- ✅ **Lightweight** - No database required initially
- ✅ **Modern stack** - TypeScript, Express.js, ES modules
- ✅ **Educational** - Well-documented code perfect for learning
- ✅ **Customizable** - Full source code control
- ✅ **Simple** - No complex configuration or plugins

### What are the limitations?

- Single user authentication (no user management)
- JSON file storage (not suitable for high traffic)
- No built-in comment system
- No media upload (yet)
- Not suitable for multi-author blogs

See [ROADMAP.md](ROADMAP.md) for planned improvements.

---

## Installation & Setup

### What do I need to install this?

**Required:**

- Node.js v18.0.0 or higher
- npm (comes with Node.js)

**Optional:**

- Git (for cloning)
- VS Code (recommended editor)

### How long does setup take?

About 5-10 minutes if you follow the [SETUP.md](SETUP.md) guide.

### Do I need a database?

No! The application uses JSON file storage by default. However, you can migrate to a database for production use (see [ROADMAP.md](ROADMAP.md)).

### Can I use this on Windows?

Yes! The application works on Windows, Mac, and Linux. Installation steps are in [SETUP.md](SETUP.md).

### Why does npm install take so long?

npm needs to download all dependencies (~150 packages). This is normal. On slow connections, it may take 2-5 minutes.

### I get permission errors during npm install

**Windows:** Run command prompt as Administrator
**Mac/Linux:** Use `sudo npm install` (or fix npm permissions)

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#installation-issues) for details.

---

## Usage & Features

### How do I access the admin panel?

1. Start the server: `npm run dev`
2. Visit: http://localhost:3000/login
3. Enter your password (from `.env` file)
4. You'll be redirected to the admin dashboard

### What can I do in the admin panel?

- ✅ Create new blog posts
- ✅ Edit existing posts
- ✅ Delete posts
- ✅ Search through posts
- ✅ View all posts with pagination

### How do I create a blog post?

1. Login to admin panel
2. Click "New Post" button
3. Fill in title, excerpt, and content
4. Click "Save Post"
5. Post is immediately published

### Can I schedule posts for later?

Not yet. This feature is planned for version 3.0.0 (see [ROADMAP.md](ROADMAP.md)).

### Can I use Markdown instead of HTML?

Not currently. The editor accepts HTML. Markdown support is planned for version 2.1.0.

### How do I add images to posts?

Currently, you need to:

1. Host images elsewhere (Imgur, Cloudinary, etc.)
2. Use HTML in your post content: `<img src="url" alt="description">`

Built-in image upload is planned for version 2.1.0.

### Can I embed YouTube videos?

Yes! Use HTML embed code in your post content:

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

Note: The HTML sanitizer allows iframe tags.

### How does the search work?

The admin panel search looks for your query in:

- Post titles
- Post excerpts
- Post content (including HTML)

It's case-insensitive and searches all fields simultaneously.

---

## Authentication & Security

### What's the default password?

There is no default password. You set it in the `.env` file as `ADMIN_PASSWORD`.

### How do I change the admin password?

1. Edit `.env` file
2. Change `ADMIN_PASSWORD=newpassword`
3. Restart the server
4. Login with new password

### Is my password secure?

**Development:** Password stored in plaintext in .env (acceptable for single-user blog)

**Production:** You should implement password hashing (see [SECURITY.md](SECURITY.md#password-security))

### Can I have multiple admin users?

Not currently. Multi-user authentication is planned for version 2.0.0 (see [ROADMAP.md](ROADMAP.md)).

### How long do I stay logged in?

24 hours by default. You can change this in `src/app.ts`:

```typescript
app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);
```

### Is this secure for production?

The basic security is solid for personal blogs, but for production you should:

- Use HTTPS
- Implement rate limiting
- Add CSRF protection
- Use a real database
- Hash passwords
- Use persistent session store

See [SECURITY.md](SECURITY.md#production-security-checklist) for full checklist.

---

## Data & Storage

### Where are blog posts stored?

In `src/data/posts.json` - a JSON file that acts as a simple database.

### What if I accidentally delete posts.json?

If you have backups, restore the latest:

```bash
cp backups/posts_20251109.json src/data/posts.json
```

If no backup, you'll need to recreate posts manually. **Always backup regularly!**

### How do I backup my data?

**Manual backup:**

```bash
cp src/data/posts.json backups/posts_$(date +%Y%m%d).json
```

**Automated backup:**
See [DEPLOYMENT.md](DEPLOYMENT.md#backup-strategy) for automated scripts.

### Can I export to WordPress?

Not currently. Export functionality is planned for version 2.0.0.

### Can I import from WordPress?

Not currently. Import functionality is planned for version 2.0.0.

### How many posts can I have?

**Technical limit:** No hard limit

**Practical limit:**

- < 100 posts: Works great
- 100-1000 posts: Still fine, but consider database
- 1000+ posts: Definitely migrate to database

JSON file performance degrades with many posts.

### Will I lose posts if server restarts?

**Development (local):** No, posts saved to file
**Production:** Depends on hosting platform

- **Persistent disk:** No data loss
- **Ephemeral filesystem:** Yes, data lost (use database)

Check with your hosting provider.

---

## Deployment

### Where can I deploy this?

- Railway (recommended, easiest)
- Render
- Heroku
- DigitalOcean
- Any VPS with Node.js
- Your own server

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guides.

### Is it free to deploy?

Many platforms offer free tiers:

- **Railway:** $5 credit/month
- **Render:** 750 hours/month free
- **Heroku:** Hobby tier available

### Do I need a domain name?

No, hosting platforms provide a free subdomain:

- `yourapp.railway.app`
- `yourapp.onrender.com`
- `yourapp.herokuapp.com`

But you can use a custom domain if you have one.

### How do I set up HTTPS?

Most hosting platforms provide automatic HTTPS. For VPS, use Let's Encrypt (free):

```bash
sudo certbot --nginx -d yourdomain.com
```

See [DEPLOYMENT.md](DEPLOYMENT.md#sslhttps-setup) for details.

### Will my site handle high traffic?

**JSON file storage limitations:**

- < 1000 visits/day: Fine
- 1000-10,000 visits/day: May struggle
- 10,000+ visits/day: Migrate to database

For high traffic, see version 2.0.0 roadmap for database support.

---

## Customization

### Can I change the design?

Yes! Edit the templates in `src/views/` and CSS in `public/css/`.

### How do I add a new page?

1. Create template in `src/views/`
2. Create controller function
3. Add route in appropriate routes file
4. Link from navigation

Example in [ARCHITECTURE.md](ARCHITECTURE.md#adding-a-new-feature---example-workflow).

### Can I change the URL structure?

Yes, edit the routes in `src/routes/`. For example, to change `/posts` to `/blog`:

```typescript
// In app.ts
app.use("/blog", postRoutes); // Instead of "/posts"
```

### Can I add custom fields to posts?

Yes!

1. Update `src/types/Post.ts`:

   ```typescript
   interface Post {
     // ... existing fields
     customField: string;
   }
   ```

2. Update form in `views/admin/posts/edit.njk`
3. Update controllers to handle new field
4. Update model to save/load new field

### Can I change the post slug format?

Yes, edit `createSlug()` function in `src/models/postModel.ts`.

### Can I add a sidebar or widgets?

Yes, edit `src/views/layout.njk` or create partials.

---

## Troubleshooting

### Why won't my app start?

Common causes:

1. Port 3000 already in use → Kill process or change port
2. Missing .env file → Create it
3. Missing posts.json → Create it
4. Syntax error → Check `npm run build`

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#runtime-errors) for solutions.

### Why can't I login?

Common causes:

1. Wrong password in .env
2. Server not restarted after .env change
3. Session not persisting (cookie issues)
4. Quotes around password in .env (don't use quotes!)

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#authentication-problems) for solutions.

### Why are my changes not showing?

1. **Did you rebuild?** Run `npm run build`
2. **Did you restart server?** Stop and run `npm run dev` again
3. **Browser cache?** Hard refresh (Ctrl+Shift+R)

### My posts disappeared!

1. Check if `src/data/posts.json` exists
2. Check file content - is it valid JSON?
3. Restore from backup if available
4. Check server logs for errors

### The app is slow

1. Check posts.json size - is it > 1MB?
2. Check how many posts you have
3. Consider pagination settings
4. Consider database migration for 100+ posts

---

## Contributing

### How can I contribute?

1. **Code:** Submit pull requests (see [CONTRIBUTING.md](CONTRIBUTING.md))
2. **Documentation:** Fix typos, improve guides
3. **Issues:** Report bugs, request features
4. **Testing:** Test and report findings
5. **Spread the word:** Star the repo, share with others

### I found a bug. What should I do?

1. Check if it's already reported in GitHub Issues
2. If not, create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node version, etc.)

### I have a feature idea

Great! Open a GitHub Discussion to discuss with the community before implementing.

### Can I use this in my own project?

Yes! This project is open source under the ISC license. You're free to:

- Use it for personal or commercial projects
- Modify it as you wish
- Distribute your modified version

Just keep the license notice.

### I want to add TypeScript support for X

This project already uses TypeScript! If you want to improve type definitions, submit a PR.

---

## Technical Questions

### Why TypeScript instead of JavaScript?

- Type safety catches errors early
- Better IDE autocomplete
- Easier to maintain large codebases
- Self-documenting code

### Why Nunjucks instead of React/Vue?

- Server-side rendering (SSR) for better SEO
- No client-side JavaScript needed
- Simpler architecture
- Faster initial page load

For an API-based approach, see version 3.2.0 roadmap.

### Why JSON file instead of database?

- Zero configuration
- No database setup needed
- Easy to understand and debug
- Perfect for learning and small projects

Database support coming in version 2.0.0.

### Why Express instead of Fastify/Koa?

- Most popular Node.js framework
- Extensive documentation
- Large ecosystem
- Familiar to most developers

### Can I use this as a REST API?

Currently, it serves HTML. For REST API support, see:

- [API.md](API.md) for current endpoints
- [ROADMAP.md](ROADMAP.md) version 3.2.0 for planned REST/GraphQL APIs

### What's the performance like?

**Excellent for:**

- Personal blogs
- Portfolio sites
- Small business sites
- < 10,000 visits/month

**Not ideal for:**

- High-traffic sites
- Multi-tenant applications
- Real-time features

### Is this production-ready?

**Yes, if:**

- Single-user blog
- < 1000 posts
- < 10,000 visits/month
- You implement production checklist in [DEPLOYMENT.md](DEPLOYMENT.md)

**No, if:**

- Multi-user blog
- High traffic expectations
- Enterprise features needed
- Strict SLA requirements

---

## Getting Help

### Where can I get help?

1. **Documentation:** Check all .md files in the repository
2. **GitHub Issues:** Search existing issues
3. **GitHub Discussions:** Ask questions
4. **Email:** [your-email@example.com]

### How quickly will I get a response?

- **Bug reports:** Within 48 hours
- **Feature requests:** Within 1 week
- **Questions:** Within 3-5 days
- **Security issues:** Within 24 hours

### Can I hire you for custom work?

Please contact via email for consulting inquiries.

---

## Quick Links

### Documentation

- [README.md](README.md) - Project overview
- [SETUP.md](SETUP.md) - Installation guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Code structure
- [API.md](API.md) - API reference
- [SECURITY.md](SECURITY.md) - Security guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problem solving
- [TESTING.md](TESTING.md) - Testing guide
- [ROADMAP.md](ROADMAP.md) - Future plans
- [CHANGELOG.md](CHANGELOG.md) - Version history

### External Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Nunjucks Documentation](https://mozilla.github.io/nunjucks/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Still Have Questions?

If your question isn't answered here:

1. 🔍 Search the documentation
2. 💬 Ask in [GitHub Discussions](https://github.com/linobollansee/add-mvc-pattern-and-admin-panel/discussions)
3. 🐛 Open an [Issue](https://github.com/linobollansee/add-mvc-pattern-and-admin-panel/issues) if it's a bug
4. 📧 Email: [your-email@example.com]

---

**Last Updated:** November 9, 2025
