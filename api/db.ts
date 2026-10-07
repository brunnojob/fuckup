import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from '../lib/database-config.js';

let prisma: PrismaClient;

const databaseUrl = getDatabaseUrl();
const prismaOptions = databaseUrl ? { datasources: { db: { url: databaseUrl } } } : undefined;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaOptions);
} else {
  // Avoid instantiating multiple PrismaClient instances in development
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient(prismaOptions);
  }
  prisma = globalForPrisma.prisma;
}

export default prisma;
