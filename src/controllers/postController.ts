import { Request, Response } from "express";
import * as postModel from "../models/postModel.js";

/**
 * Display all posts (public view) with pagination
 */
export async function index(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
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
export async function show(req: Request, res: Response): Promise<void> {
  try {
    const post = await postModel.getPostBySlug(req.params.slug);

    if (!post) {
      res.status(404).render("error.njk", {
        message: "Post not found",
        error: { status: 404 },
      });
      return;
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
