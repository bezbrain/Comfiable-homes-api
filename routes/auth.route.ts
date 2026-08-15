import express from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller";
import authMiddleware from "../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

export default router;
