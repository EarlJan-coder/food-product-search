import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma.js";

export async function requireActiveSubscription(
    _req: Request,
    res: Response,
    next: NextFunction,
){
    try{
        const demoUser = await prisma.user.findUnique({
            where:{
                email: "demo@example.com"
            },
            select:{
                subscriptionStatus: true,
            }
        })

        if (!demoUser) {
            return res.status(400).json({
                error: "Demo user not found",
            })
        }

        if (demoUser.subscriptionStatus!=="active") {
            return res.status(403).json({
                error: "Subscription required",
            })
        }

        next();
    }catch(error){
        console.error("Subscription check failed: ", error);

        return res.status(500).json({
            error: "Unable to verify subscription",
        })
    }
}