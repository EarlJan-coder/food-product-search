import stripe from "../lib/stripe.js";
export async function createCheckoutSession(customerEmail) {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
        throw new Error("STRIPE_PRICE_ID is not configured");
    }
    const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: customerEmail,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: `${process.env.CLIENT_URL}/subscription/sucess`,
        cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
        metadata: {
            userEmail: customerEmail,
        },
    });
    return session;
}
//# sourceMappingURL=stripe.service.js.map