import type Stripe from "stripe";
export declare function createCheckoutSession(customerEmail: string): Promise<Stripe.Checkout.Session>;
export declare function createPortalSession(customerId: string): Promise<Stripe.BillingPortal.Session>;
//# sourceMappingURL=stripe.service.d.ts.map