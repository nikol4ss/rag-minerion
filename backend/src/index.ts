import 'dotenv/config';
import multipart from '@fastify/multipart';
import Fastify from 'fastify';
import { corsPlugin } from './plugins/cors.plugin.js';
import { dbPlugin } from './plugins/db.plugin.js';
import { chatRoutes } from './routes/chat.route.js';
import { documentRoutes } from './routes/documents.route.js';
import { healthRoutes } from './routes/health.route.js';

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info'
  }
});

await app.register(corsPlugin);
await app.register(multipart, {
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 1
  }
});
await app.register(dbPlugin);
await app.register(healthRoutes, { prefix: '/api' });
await app.register(documentRoutes, { prefix: '/api' });
await app.register(chatRoutes, { prefix: '/api' });

const port = Number(process.env.PORT ?? 3000);

try {
  await app.listen({
    host: '0.0.0.0',
    port
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
