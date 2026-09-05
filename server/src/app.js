import { stripeWebhookController } from './controllers/stripe-webhook.controller.js';
import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma.js';
import productRoutes from "./routes/product.routes.js";
import subscriptionRoutes from "./routes/subscription.route.js";
const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
}));
app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookController);
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: "ok",
            database: "connected"
        });
    }
    catch (error) {
        console.error("Database connection error:", error);
        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
});
export default app;
//# sourceMappingURL=app.js.map