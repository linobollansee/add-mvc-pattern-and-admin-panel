import express from "express";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// Admin routes for managing posts
router.get("/posts", adminController.index);
router.get("/posts/new", adminController.create);
router.post("/posts", adminController.store);
router.get("/posts/:id/edit", adminController.edit);
router.post("/posts/:id", adminController.update);
router.post("/posts/:id/delete", adminController.destroy);

export default router;
