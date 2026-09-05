import express from 'express';
import  cors from 'cors';
import prisma from './lib/prisma.js';

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
    })
);

app.use(express.json());

app.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            status:"ok",
            database: "connected"
        })
    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            status: "error",
            database: "disconnected"
        });
    }
});

export default app;