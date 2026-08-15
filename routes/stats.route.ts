import express from "express";
import { getStoreStats } from "../controllers/stats.controller";

const router = express.Router();

router.get("/stats", getStoreStats);

export default router;
