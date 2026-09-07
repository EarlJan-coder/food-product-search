import { Router } from "express";
import { getCurrentUserController } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", getCurrentUserController);

export default router;
