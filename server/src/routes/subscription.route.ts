import { Router } from "express";
import {
  createCheckoutController,
} from "../controllers/subscription.controller.js";

const router = Router();

router.post(
  "/checkout",
  createCheckoutController,
);

export default router;