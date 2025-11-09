import express from "express";
import * as postController from "../controllers/postController.js";

const router = express.Router();

// Public routes for viewing blog posts
router.get("/", postController.index);
router.get("/:slug", postController.show);

export default router;
