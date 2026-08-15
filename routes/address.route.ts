import express from "express";
import {
  createAddress,
  getAddress,
  updateAddress,
  setPrimaryAddress,
  deleteAddress,
} from "../controllers/address.controller";

const router = express.Router();

router.post("/address", createAddress);
router.get("/address", getAddress);
router.patch("/address", updateAddress);
router.patch("/address/:id", updateAddress);
router.patch("/address/:id/primary", setPrimaryAddress);
router.delete("/address/:id", deleteAddress);

export default router;
