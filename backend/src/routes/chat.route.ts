import type { FastifyInstance, FastifyReply } from 'fastify';
import {
  chatQuerySchema,
  chatRequestSchema,
  conversationParamsSchema,
  type ChatMessageInput
} from '../schemas/chat.schema.js';
import type { MessageRole } from '../db/types.js';
import type { Source } from '../services/retrieval.service.js';
import { answerQuestion, streamAnswerQuestion } from '../services/retrieval.service.js';
import { errorMessage } from './errors.js';

interface StreamConversationEvent {
  type: 'conversation';
  conversationId: string;
}

interface StreamSourcesEvent {
  type: 'sources';
  sources: Source[];
}

interface StreamDeltaEvent {
  type: 'delta';
  delta: string;
}

interface StreamDoneEvent {
  type: 'done';
}

interface StreamErrorEvent {
  type: 'error';
  message: string;
}

type StreamEvent =
  | StreamConversationEvent
  | StreamSourcesEvent
  | StreamDeltaEvent
  | StreamDoneEvent
  | StreamErrorEvent;

async function createConversation(fastify: FastifyInstance, question: string): Promise<string> {
  const title = question.length > 80 ? `${question.slice(0, 77)}...` : question;
  const conversation = await fastify.db
    .insertInto('conversations')
    .values({ title })
    .returning(['id'])
    .executeTakeFirstOrThrow();

  return conversation.id;
}

async function getRecentHistory(
  fastify: FastifyInstance,
  conversationId: string,
  fallbackHistory?: ChatMessageInput[]
): Promise<Array<{ role: MessageRole; content: string }>> {
  if (fallbackHistory && fallbackHistory.length > 0) {
    return fallbackHistory.slice(-6);
  }

  const rows = await fastify.db
    .selectFrom('messages')
    .select(['role', 'content', 'created_at'])
    .where('conversation_id', '=', conversationId)
    .orderBy('created_at', 'desc')
    .limit(6)
    .execute();

  return rows
    .reverse()
    .map((row) => ({
      role: row.role,
      content: row.content
    }));
}

async function insertMessage(
  fastify: FastifyInstance,
  conversationId: string,
  role: MessageRole,
  content: string,
  sources: Source[] | null = null
): Promise<void> {
  await fastify.db
    .insertInto('messages')
    .values({
      conversation_id: conversationId,
      role,
      content,
      sources
    })
    .execute();
}

function writeStream(reply: FastifyReply, event: StreamEvent): void {
  reply.raw.write(`${JSON.stringify(event)}\n`);
}

export async function chatRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/chat', async (request, reply) => {
    try {
      const query = chatQuerySchema.parse(request.query);
      const body = chatRequestSchema.parse(request.body);
      const conversationId = body.conversationId ?? (await createConversation(fastify, body.question));
      const history = await getRecentHistory(fastify, conversationId, body.history);

      await insertMessage(fastify, conversationId, 'user', body.question);

      if (query.stream) {
        reply.hijack();
        reply.raw.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
        reply.raw.setHeader('Cache-Control', 'no-cache');
        reply.raw.setHeader('Transfer-Encoding', 'chunked');
        writeStream(reply, {
          type: 'conversation',
          conversationId
        });

        try {
          const streamResult = await streamAnswerQuestion({
            db: fastify.db,
            question: body.question,
            history
          });
          let answer = streamResult.fallbackAnswer ?? '';

          writeStream(reply, {
            type: 'sources',
            sources: streamResult.sources
          });

          if (streamResult.fallbackAnswer) {
            writeStream(reply, {
              type: 'delta',
              delta: streamResult.fallbackAnswer
            });
          }

          if (streamResult.stream) {
            for await (const chunk of streamResult.stream) {
              const delta = chunk.choices[0]?.delta?.content ?? '';

              if (delta) {
                answer += delta;
                writeStream(reply, {
                  type: 'delta',
                  delta
                });
              }
            }
          }

          await insertMessage(fastify, conversationId, 'assistant', answer, streamResult.sources);
          writeStream(reply, { type: 'done' });
          reply.raw.end();
        } catch (streamError) {
          request.log.error(streamError);
          writeStream(reply, {
            type: 'error',
            message: errorMessage(streamError)
          });
          reply.raw.end();
        }

        return;
      }

      const result = await answerQuestion({
        db: fastify.db,
        question: body.question,
        history
      });

      await insertMessage(fastify, conversationId, 'assistant', result.answer, result.sources);

      return {
        answer: result.answer,
        sources: result.sources,
        conversationId
      };
    } catch (error) {
      request.log.error(error);

      return reply.status(400).send({
        message: errorMessage(error)
      });
    }
  });

  fastify.get('/chat/conversations', async () => {
    const conversations = await fastify.db
      .selectFrom('conversations')
      .select(['id', 'title', 'created_at'])
      .orderBy('created_at', 'desc')
      .execute();

    return {
      conversations
    };
  });

  fastify.get('/chat/conversations/:id/messages', async (request, reply) => {
    try {
      const params = conversationParamsSchema.parse(request.params);
      const messages = await fastify.db
        .selectFrom('messages')
        .select(['id', 'role', 'content', 'sources', 'created_at'])
        .where('conversation_id', '=', params.id)
        .orderBy('created_at', 'asc')
        .execute();

      return {
        messages
      };
    } catch (error) {
      request.log.error(error);

      return reply.status(400).send({
        message: errorMessage(error)
      });
    }
  });
}
