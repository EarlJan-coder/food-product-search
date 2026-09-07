import prisma from "../lib/prisma.js";
export async function getCurrentUserController(_req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: "demo@example.com",
            },
            select: {
                id: true,
                email: true,
                name: true,
                subscriptionStatus: true,
                stripeCustomerId: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }
        return res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                subscriptionStatus: user.subscriptionStatus,
                stripeCustomerId: user.stripeCustomerId,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error("Failed to get current user:", error);
        return res.status(500).json({
            error: "Unable to retrieve user information",
        });
    }
}
//# sourceMappingURL=user.controller.js.map