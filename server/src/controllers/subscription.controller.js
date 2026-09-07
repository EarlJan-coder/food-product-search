import prisma from "../lib/prisma.js";
import { createCheckoutSession, createPortalSession } from "../services/stripe.service.js";
export async function createCheckoutController(_req, res) {
    try {
        const demoUser = await prisma.user.findUnique({
            where: {
                email: "demo@example.com",
            },
        });
        if (!demoUser) {
            return res.status(404).json({
                error: "Demo user not found",
            });
        }
        if (demoUser.subscriptionStatus === "active") {
            return res.status(400).json({
                error: "User already has an active subscription",
            });
        }
        const session = await createCheckoutSession(demoUser.email);
        return res.json({
            url: session.url,
        });
    }
    catch (error) {
        console.error("Checkout session creation failed:", error);
        return res.status(500).json({
            error: "Unable to create checkout session",
        });
    }
}
export async function createPortalController(_req, res) {
    try {
        const demoUser = await prisma.user.findUnique({
            where: {
                email: "demo@example.com",
            },
        });
        if (!demoUser) {
            return res.status(404).json({
                error: "Demo user not found",
            });
        }
        if (!demoUser.stripeCustomerId) {
            return res.status(400).json({
                error: "No Stripe customer found for this user",
            });
        }
        const session = await createPortalSession(demoUser.stripeCustomerId);
        return res.json({
            url: session.url,
        });
    }
    catch (error) {
        console.error("Portal session creation failed:", error);
        return res.status(500).json({
            error: "Unable to create portal session",
        });
    }
}
//# sourceMappingURL=subscription.controller.js.map