import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { createCheckoutSession } from "../services/stripe.service.js";

export async function createCheckoutController(
  _req: Request,
  res: Response,
) {
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

    const session = await createCheckoutSession(
      demoUser.email,
    );

    return res.json({
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Checkout session creation failed:", error);

    return res.status(500).json({
  error: "Unable to create checkout session",
});
    }
}