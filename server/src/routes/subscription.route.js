import { Router } from "express";
import { createCheckoutController, createPortalController, } from "../controllers/subscription.controller.js";
const router = Router();
router.post("/checkout", createCheckoutController);
router.post("/portal", createPortalController);
export default router;
//# sourceMappingURL=subscription.route.js.map