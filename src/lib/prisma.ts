import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient({
  log: [
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

prisma.$on('warn', (event) => {
  logger.warn('prisma warning', { message: event.message, target: event.target });
});

prisma.$on('error', (event) => {
  logger.error('prisma error', { message: event.message, target: event.target });
});
