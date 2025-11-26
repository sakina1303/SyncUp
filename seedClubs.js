import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  // First, make sure you have at least one user
  const user = await prisma.user.findFirst();
  
  if (!user) {
    console.log('No users found. Please create a user first (signup).');
    return;
  }

  console.log('Using user:', user.name);

  // Create clubs
  await prisma.club.createMany({
    data: [
      {
        name: 'Chess Club',
        description: 'Strategic thinking and competitive gameplay',
        created_by: user.user_id
      },
      {
        name: 'Debate Society',
        description: 'Sharpen your argumentation skills',
        created_by: user.user_id
      },
      {
        name: 'Hiking Adventures',
        description: 'Explore nature trails every weekend',
        created_by: user.user_id
      },
      {
        name: 'Tech Innovators',
        description: 'Build the future with code',
        created_by: user.user_id
      }
    ]
  });

  const clubs = await prisma.club.findMany();
  console.log('Created clubs:', clubs);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());