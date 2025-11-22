import dotenv from 'dotenv';
import { PrismaClient } from './generated/prisma/index.js';

dotenv.config();
const prisma = new PrismaClient();

(async function(){
  try {
    console.log('DATABASE_URL env:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
    const u = await prisma.user.findFirst();
    console.log('Prisma findFirst returned:', u);
  } catch (err) {
    console.error('Prisma debug error:', err && err.stack ? err.stack : err);
  } finally {
    await prisma.$disconnect();
  }
})();
