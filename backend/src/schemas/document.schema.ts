import { z } from 'zod';

export const documentTextSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório.'),
  module: z.string().trim().min(1, 'Módulo é obrigatório.'),
  content: z.string().trim().min(1, 'Conteúdo é obrigatório.'),
  description: z.string().trim().optional()
});

export const documentQuerySchema = z.object({
  module: z.string().trim().optional(),
  search: z.string().trim().optional()
});

export const documentParamsSchema = z.object({
  id: z.string().uuid('ID de documento inválido.')
});

export const uploadFieldsSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório.'),
  module: z.string().trim().min(1, 'Módulo é obrigatório.'),
  description: z.string().trim().optional()
});
