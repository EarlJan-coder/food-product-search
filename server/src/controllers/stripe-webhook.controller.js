import Stripe from "stripe";
import prisma from "../lib/prisma.js";
import stripe from "../lib/stripe.js";
export async function stripeWebhookController(req, res) {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
        return res.status(400).json({
            error: "Missing Stripe signature",
        });
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return res.status(500).json({
            error: "STRIPE_WEBHOOK_SECRET is not configured",
        });
    }
    let event;
    // Verify that the webhook request actually came from Stripe.
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    }
    catch (error) {
        console.error("Stripe webhook signature verification failed:", error);
        return res.status(400).json({
            error: "Invalid Stripe webhook signature",
        });
    }
    try {
        switch (event.type) {
            /**
             * Fired after a Checkout Session is successfully completed.
             * This is where we initially activate the demo user's subscription.
             */
            case "checkout.session.completed": {
                const session = event.data.object;
                const userEmail = session.metadata?.userEmail ??
                    session.customer_details?.email;
                if (!userEmail) {
                    console.error("Checkout session has no user email");
                    break;
                }
                const subscriptionId = typeof session.subscription === "string"
                    ? session.subscription
                    : session.subscription?.id;
                const customerId = typeof session.customer === "string"
                    ? session.customer
                    : session.customer?.id;
                await prisma.user.update({
                    where: {
                        email: userEmail,
                    },
                    data: {
                        subscriptionStatus: "active",
                        stripeSubscriptionId: subscriptionId ?? null,
                        stripeCustomerId: customerId ?? null,
                    },
                });
                console.log(`Subscription activated for ${userEmail}`);
                break;
            }
            /**
             * Handles newly created and updated subscriptions.
             *
             * Stripe can report several subscription states.
             * We consider "active" and "trialing" as having access
             * to the protected nutrition endpoint.
             */
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const subscription = event.data.object;
                const customerId = typeof subscription.customer === "string"
                    ? subscription.customer
                    : subscription.customer.id;
                const isActive = subscription.status === "active" ||
                    subscription.status === "trialing";
                await prisma.user.updateMany({
                    where: {
                        stripeCustomerId: customerId,
                    },
                    data: {
                        subscriptionStatus: isActive
                            ? "active"
                            : "inactive",
                        stripeSubscriptionId: subscription.id,
                    },
                });
                console.log(`Subscription ${subscription.status} for customer ${customerId}`);
                break;
            }
            /**
             * Fired when a subscription is cancelled/deleted.
             *
             * This removes access to protected nutrition data.
             */
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const customerId = typeof subscription.customer === "string"
                    ? subscription.customer
                    : subscription.customer.id;
                await prisma.user.updateMany({
                    where: {
                        stripeCustomerId: customerId,
                    },
                    data: {
                        subscriptionStatus: "inactive",
                        stripeSubscriptionId: null,
                    },
                });
                console.log(`Subscription cancelled for customer ${customerId}`);
                break;
            }
            default:
                console.log(`Unhandled Stripe event: ${event.type}`);
        }
        return res.json({
            received: true,
        });
    }
    catch (error) {
        console.error("Stripe webhook processing failed:", error);
        return res.status(500).json({
            error: "Webhook processing failed",
        });
    }
}
//# sourceMappingURL=stripe-webhook.controller.js.map