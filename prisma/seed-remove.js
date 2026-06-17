"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    await prisma.refreshToken.deleteMany({});
    await prisma.enquiry.deleteMany({});
    await prisma.itinerary.deleteMany({});
    await prisma.trek.deleteMany({});
    await prisma.contact.deleteMany({});
    await prisma.user.deleteMany({});
}
main()
    .then(() => {
    console.log('🧹 Database cleaned!');
    return prisma.$disconnect();
})
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed-remove.js.map