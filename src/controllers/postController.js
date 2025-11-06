import * as postModel from "../models/postModel.js";

/**
 * Display all posts (public view) with pagination
 */
export async function index(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6; // Posts per page
    const allPosts = await postModel.getAllPosts();

    // Calculate pagination
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const offset = (page - 1) * limit;
    const posts = allPosts.slice(offset, offset + limit);

    res.render("posts/index.njk", {
      posts,
      currentPage: page,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
      title: "Blog Posts",
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).render("error.njk", {
      message: "Error loading blog posts",
      error,
    });
  }
}

/**
 * Display a single post by slug
 */
export async function show(req, res) {
  try {
    const post = await postModel.getPostBySlug(req.params.slug);

    if (!post) {
      return res.status(404).render("error.njk", {
        message: "Post not found",
        error: { status: 404 },
      });
    }

    res.render("posts/show.njk", {
      post,
      title: post.title,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).render("error.njk", {
      message: "Error loading post",
      error,
    });
  }
}
