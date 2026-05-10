import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete in order of relations to avoid constraint errors
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