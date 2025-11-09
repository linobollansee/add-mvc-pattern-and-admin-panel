import express from "express";
import * as adminController from "../controllers/adminController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all admin routes
router.use(requireAuth);

// Admin routes for managing posts
router.get("/posts", adminController.index);
router.get("/posts/new", adminController.create);
router.post("/posts", adminController.store);
router.get("/posts/:id/edit", adminController.edit);
router.post("/posts/:id", adminController.update);
router.post("/posts/:id/delete", adminController.destroy);

export default router;
