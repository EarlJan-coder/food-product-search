import { Router } from "express";
import { searchProductsController, getProductController, getProductNutritionController } from "../controllers/product.controller.js";
import { requireActiveSubscription } from '../middleware/subscription.middleware.js';
const router = Router();
router.get("/search", searchProductsController);
router.get("/:barcode/nutrition", requireActiveSubscription, getProductNutritionController);
router.get("/:barcode", getProductController);
export default router;
//# sourceMappingURL=product.routes.js.map