import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { sql, type Kysely } from 'kysely';
import { createDb } from '../db/index.js';
import type { Database } from '../db/types.js';

declare module 'fastify' {
  interface FastifyInstance {
    db: Kysely<Database>;
  }
}

export const dbPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não configurada.');
  }

  const db = createDb(databaseUrl);
  await sql`
    ALTER TABLE conversations
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ
  `.execute(db);

  fastify.decorate('db', db);

  fastify.addHook('onClose', async () => {
    await db.destroy();
  });
});
