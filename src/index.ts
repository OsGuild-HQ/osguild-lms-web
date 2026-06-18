import { app } from './app';
import { logger, serializeError } from './lib/logger';
import { prisma } from './lib/prisma';

const PORT = Number(process.env.PORT ?? 3000);

const server = app.listen(PORT, () => {
  logger.info('server started', { port: PORT, url: `http://localhost:${PORT}` });
});

function shutdown(code = 0, reason?: string) {
  logger.info('server shutting down', { reason });

  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(code));
  });

  // Force exit if connections don't drain in time.
  setTimeout(() => process.exit(code), 10_000).unref();
}

process.on('unhandledRejection', (reason) => {
  logger.error('unhandled promise rejection', serializeError(reason));
});

process.on('uncaughtException', (err) => {
  logger.error('uncaught exception', serializeError(err));
  shutdown(1, 'uncaughtException');
});

process.on('SIGINT', () => shutdown(0, 'SIGINT'));
process.on('SIGTERM', () => shutdown(0, 'SIGTERM'));
