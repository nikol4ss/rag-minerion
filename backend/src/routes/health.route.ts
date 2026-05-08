import type { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async (request, reply) => {
    try {
      await request.server.db.selectFrom('documents').select('id').limit(1).execute();

      return {
        status: 'ok',
        dbConnected: true
      };
    } catch (error) {
      request.log.error(error);

      return reply.status(503).send({
        status: 'error',
        dbConnected: false
      });
    }
  });
}
