import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: "demo@example.com" },
        update: {},
        create: { email: "demo@example.com", subscriptionStatus: "inactive" }
    })

    console.log("User created: ", user);
}

main().catch((error) => {
    console.error(error);
    process.exit(1)
}).finally(async () => {
    await prisma.$disconnect();
})