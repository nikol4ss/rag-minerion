import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1)
});

export const chatRequestSchema = z.object({
  question: z.string().trim().min(1, 'Pergunta é obrigatória.'),
  conversationId: z.string().uuid().optional(),
  history: z.array(chatMessageSchema).optional()
});

export const chatQuerySchema = z.object({
  stream: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((value) => value === 'true')
});

export const conversationParamsSchema = z.object({
  id: z.string().uuid('ID de conversa inválido.')
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
