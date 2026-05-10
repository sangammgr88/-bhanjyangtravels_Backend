import { PrismaClient, UserRole, Difficulty, ContactStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed Users
  const password = await bcrypt.hash('87654321', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'test@gmail.com' },
    update: {},
    create: {
      email: 'test@gmail.com',
      name: 'Admin',
      password,
      role: UserRole.ADMIN,
    },
  });
  const user = await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {},
    create: {
      email: 'user@gmail.com',
      name: 'User',
      password,
      role: UserRole.USER,
    },
  });

  // Seed Treks
  const trek = await prisma.trek.upsert({
    where: { slug: 'everest-base-camp' },
    update: {},
    create: {
      title: 'Everest Base Camp',
      slug: 'everest-base-camp',
      duration: 14,
      difficulty: Difficulty.CHALLENGING,
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

  // Seed Enquiry
  await prisma.enquiry.create({
    data: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      preferredTrek: trek.title,
      groupSize:"4",
      additionalServices: ['Hotel'],
      specialRequirements: 'Vegetarian meals',
      heardFrom: 'Google',
      trekId: trek.id,
    },
  });

  // Seed Contact
  await prisma.contact.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Interested in treks!',
      status: ContactStatus.UNREAD,
    },
  });

  // Seed RefreshToken (for admin)
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