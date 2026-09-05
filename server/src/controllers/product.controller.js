import prisma from '../lib/prisma.js';
import { searchProducts, getProductByBarcode } from '../services/openFoodFacts.service.js';
export async function searchProductsController(req, res) {
    try {
        const query = String(req.query.q ?? "").trim();
        const language = String(req.query.lang ?? "en");
        if (!query) {
            return res.status(400).json({
                error: "Search query is required"
            });
        }
        const allowedLanguages = ["en", "nl", "de", "fr"];
        if (!allowedLanguages.includes(language)) {
            return res.status(400).json({
                error: "Unsupported Language",
            });
        }
        const products = await searchProducts(query, language);
        const demoUser = await prisma.user.findUnique({
            where: {
                email: "demo@example.com"
            }
        });
        if (demoUser) {
            await prisma.search.create({
                data: {
                    query,
                    language,
                    userId: demoUser.id,
                }
            });
        }
        return res.json({
            query,
            language,
            count: products.length,
            products,
        });
    }
    catch (error) {
        console.error("Product search failed: ", error);
        return res.status(502).json({
            error: "Unable to retrieve products",
        });
    }
}
export async function getProductController(req, res) {
    try {
        const barcode = String(req.params.barcode ?? "").trim();
        const language = String(req.query.lang ?? "en");
        if (!barcode) {
            return res.status(400).json({
                error: "Product barcode is required",
            });
        }
        const allowedLanguages = ["en", "nl", "de", "fr"];
        if (!allowedLanguages.includes(language)) {
            return res.status(400).json({
                error: "Unsupported language",
            });
        }
        const product = await getProductByBarcode(barcode, language);
        if (!product) {
            return res.status(404).json({
                error: "Product not found",
            });
        }
        const demoUser = await prisma.user.findUnique({
            where: {
                email: "demo@example.com",
            },
            select: {
                subscriptionStatus: true,
            },
        });
        const hasActiveSubscription = demoUser?.subscriptionStatus === "active";
        return res.json({
            product: {
                barcode: product.barcode,
                name: product.name,
                brand: product.brand,
                imageUrl: product.imageUrl,
                nutrition: hasActiveSubscription
                    ? product.nutrition
                    : null,
            },
        });
    }
    catch (error) {
        console.error("Product details request failed:", error);
        return res.status(502).json({
            error: "Unable to retrieve product",
        });
    }
}
export async function getProductNutritionController(req, res) {
    try {
        const barcode = String(req.params.barcode ?? "").trim();
        const language = String(req.query.lang ?? "en");
        if (!barcode) {
            return res.status(400).json({
                error: "Product barcode is required",
            });
        }
        const allowedLanguages = ["en", "nl", "de", "fr"];
        if (!allowedLanguages.includes(language)) {
            return res.status(400).json({
                error: "Unsupported language",
            });
        }
        const product = await getProductByBarcode(barcode, language);
        if (!product) {
            return res.status(404).json({
                error: "Product not found",
            });
        }
        return res.json({
            barcode: product.barcode,
            nutrition: product.nutrition,
        });
    }
    catch (error) {
        console.error("Product nutrition request failed:", error);
        return res.status(502).json({
            error: "Unable to retrieve product nutrition",
        });
    }
}
//# sourceMappingURL=product.controller.js.map