import * as postModel from "../models/postModel.js";

/**
 * Display admin dashboard with all posts and pagination
 */
export async function index(req, res) {
  try {
    const searchQuery = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Posts per page in admin
    let allPosts;

    if (searchQuery) {
      allPosts = await postModel.searchPosts(searchQuery);
    } else {
      allPosts = await postModel.getAllPosts();
    }

    // Calculate pagination
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / limit);
    const offset = (page - 1) * limit;
    const posts = allPosts.slice(offset, offset + limit);

    res.render("admin/posts/index.njk", {
      posts,
      searchQuery,
      currentPage: page,
      totalPages,
      hasPrevious: page > 1,
      hasNext: page < totalPages,
      title: "Admin - Manage Posts",
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).render("error.njk", {
      message: "Error loading posts",
      error,
    });
  }
}

/**
 * Display form to create a new post
 */
export async function create(req, res) {
  res.render("admin/posts/edit.njk", {
    post: null,
    title: "Admin - Create Post",
  });
}

/**
 * Handle post creation
 */
export async function store(req, res) {
  try {
    const { title, excerpt, content, author } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).render("admin/posts/edit.njk", {
        post: req.body,
        error: "Title, excerpt, and content are required",
        title: "Admin - Create Post",
      });
    }

    const newPost = await postModel.createPost({
      title,
      excerpt,
      content,
      author,
    });

    if (newPost) {
      res.redirect("/admin/posts");
    } else {
      throw new Error("Failed to create post");
    }
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).render("admin/posts/edit.njk", {
      post: req.body,
      error: "Error creating post",
      title: "Admin - Create Post",
    });
  }
}

/**
 * Display form to edit an existing post
 */
export async function edit(req, res) {
  try {
    const post = await postModel.getPostById(req.params.id);

    if (!post) {
      return res.status(404).render("error.njk", {
        message: "Post not found",
        error: { status: 404 },
      });
    }

    res.render("admin/posts/edit.njk", {
      post,
      title: `Admin - Edit Post: ${post.title}`,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).render("error.njk", {
      message: "Error loading post",
      error,
    });
  }
}

/**
 * Handle post update
 */
export async function update(req, res) {
  try {
    const { title, excerpt, content, author } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).render("admin/posts/edit.njk", {
        post: { ...req.body, id: req.params.id },
        error: "Title, excerpt, and content are required",
        title: "Admin - Edit Post",
      });
    }

    const updatedPost = await postModel.updatePost(req.params.id, {
      title,
      excerpt,
      content,
      author,
    });

    if (updatedPost) {
      res.redirect("/admin/posts");
    } else {
      throw new Error("Post not found or failed to update");
    }
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).render("admin/posts/edit.njk", {
      post: { ...req.body, id: req.params.id },
      error: "Error updating post",
      title: "Admin - Edit Post",
    });
  }
}

/**
 * Handle post deletion
 */
export async function destroy(req, res) {
  try {
    const success = await postModel.deletePost(req.params.id);

    if (success) {
      res.redirect("/admin/posts");
    } else {
      throw new Error("Post not found or failed to delete");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).render("error.njk", {
      message: "Error deleting post",
      error,
    });
  }
}
