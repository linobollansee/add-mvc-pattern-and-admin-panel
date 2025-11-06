import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sanitizeHtml from "sanitize-html";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "../data/posts.json");

// Sanitize options for HTML content
const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title"],
    a: ["href", "target", "rel"],
  },
};

/**
 * Read posts from JSON file
 */
async function readData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading posts data:", error);
    return { posts: [], nextId: 1 };
  }
}

/**
 * Write posts to JSON file
 */
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing posts data:", error);
    return false;
  }
}

/**
 * Get all posts
 */
export async function getAllPosts() {
  const data = await readData();
  return data.posts.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Get a single post by ID
 */
export async function getPostById(id) {
  const data = await readData();
  return data.posts.find((post) => post.id === parseInt(id));
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug) {
  const data = await readData();
  return data.posts.find((post) => post.slug === slug);
}

/**
 * Create a new post
 */
export async function createPost(postData) {
  const data = await readData();

  const newPost = {
    id: data.nextId,
    title: postData.title,
    slug: createSlug(postData.title),
    excerpt: postData.excerpt,
    content: sanitizeHtml(postData.content, sanitizeOptions),
    author: postData.author || "Anonymous",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.posts.push(newPost);
  data.nextId += 1;

  const success = await writeData(data);
  return success ? newPost : null;
}

/**
 * Update an existing post
 */
export async function updatePost(id, postData) {
  const data = await readData();
  const index = data.posts.findIndex((post) => post.id === parseInt(id));

  if (index === -1) {
    return null;
  }

  data.posts[index] = {
    ...data.posts[index],
    title: postData.title,
    slug: createSlug(postData.title),
    excerpt: postData.excerpt,
    content: sanitizeHtml(postData.content, sanitizeOptions),
    author: postData.author,
    updatedAt: new Date().toISOString(),
  };

  const success = await writeData(data);
  return success ? data.posts[index] : null;
}

/**
 * Delete a post
 */
export async function deletePost(id) {
  const data = await readData();
  const index = data.posts.findIndex((post) => post.id === parseInt(id));

  if (index === -1) {
    return false;
  }

  data.posts.splice(index, 1);
  return await writeData(data);
}

/**
 * Search posts by title or content
 */
export async function searchPosts(query) {
  const data = await readData();
  const lowerQuery = query.toLowerCase();

  return data.posts
    .filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery) ||
        post.content.toLowerCase().includes(lowerQuery)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Create a URL-friendly slug from a title
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
