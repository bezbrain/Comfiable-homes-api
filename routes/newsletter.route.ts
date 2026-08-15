import express from "express";
import { subscribeNewsletter } from "../controllers/newsletter.controller";

const router = express.Router();

router.post("/newsletter", subscribeNewsletter);

export default router;
