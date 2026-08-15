import express from "express";
import {
  cartIncrease,
  cartDecrease,
} from "../controllers/cartCont.controller";

const router = express.Router();

router.get("/increaseItem/:itemId", cartIncrease);
router.get("/decreaseItem/:itemId", cartDecrease);

export default router;
