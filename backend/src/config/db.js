import { PrismaClient } from '../../generated/prisma/index.js';

// Create a single Prisma client instance and export it.
// This ensures we reuse the same client across the app.
const prisma = new PrismaClient();

export default prisma;
