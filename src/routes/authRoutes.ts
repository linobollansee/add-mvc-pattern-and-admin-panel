import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Login routes
router.get("/login", authController.showLogin);
router.post("/login", authController.handleLogin);

// Logout route
router.get("/logout", authController.handleLogout);

export default router;
