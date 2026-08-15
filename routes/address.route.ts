import express from "express";
import {
  createAddress,
  getAddress,
  updateAddress,
} from "../controllers/address.controller";

const router = express.Router();

router.post("/address", createAddress);
router.get("/address", getAddress);
router.patch("/address", updateAddress);

export default router;
