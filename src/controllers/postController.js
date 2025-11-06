import * as postModel from "../models/postModel.js";

/**
 * Display all posts (public view)
 */
export async function index(req, res) {
  try {
    const posts = await postModel.getAllPosts();
    res.render("posts/index.njk", {
      posts,
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
