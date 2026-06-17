"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new client_1.PrismaClient();
async function main() {
    const password = await bcrypt.hash('87654321', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'test@gmail.com' },
        update: {},
        create: {
            email: 'test@gmail.com',
            name: 'Admin',
            password,
            role: client_1.UserRole.ADMIN,
        },
    });
    const user = await prisma.user.upsert({
        where: { email: 'user@gmail.com' },
        update: {},
        create: {
            email: 'user@gmail.com',
            name: 'User',
            password,
            role: client_1.UserRole.USER,
        },
    });
    const trek = await prisma.trek.upsert({
        where: { slug: 'everest-base-camp' },
        update: {},
        create: {
            title: 'Everest Base Camp',
            slug: 'everest-base-camp',
            duration: 14,
            difficulty: client_1.Difficulty.CHALLENGING,
            groupSize: '10-15',
            highlights: ['Base Camp', 'Sherpa Culture'],
            includes: ['Guide', 'Permits'],
            excludes: ['Flights'],
            images: [],
            itinerary: {
                create: [
                    {
                        day: '1',
                        title: 'Arrival in Kathmandu',
                        description: 'Arrive and transfer to hotel.'
                    },
                ],
            },
        },
        include: { itinerary: true },
    });
    await prisma.enquiry.create({
        data: {
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            preferredTrek: trek.title,
            groupSize: "4",
            additionalServices: ['Hotel'],
            specialRequirements: 'Vegetarian meals',
            heardFrom: 'Google',
            trekId: trek.id,
        },
    });
    await prisma.contact.create({
        data: {
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Interested in treks!',
            status: client_1.ContactStatus.UNREAD,
        },
    });
    await prisma.refreshToken.create({
        data: {
            token: 'sample-refresh-token',
            userId: admin.id,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        },
    });
}
main()
    .then(() => {
    console.log('🌱 Database seeded!');
    return prisma.$disconnect();
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map