import type { FastifyInstance } from 'fastify';
import type { MultipartFile } from '@fastify/multipart';
import pdfParse from 'pdf-parse';
import {
  documentParamsSchema,
  documentQuerySchema,
  documentTextSchema,
  uploadFieldsSchema
} from '../schemas/document.schema.js';
import { clearKnowledgeBase, deleteDocument, ingestDocument } from '../services/ingestion.service.js';
import { errorMessage } from './errors.js';

type UploadFieldValue = string | undefined;

function getUploadField(file: MultipartFile, name: string): UploadFieldValue {
  const field = file.fields[name];

  if (!field || Array.isArray(field)) {
    return undefined;
  }

  if ('value' in field && typeof field.value === 'string') {
    return field.value;
  }

  return undefined;
}

function detectFileType(filename: string, mimetype: string): string {
  const lowerFilename = filename.toLowerCase();

  if (mimetype === 'application/pdf' || lowerFilename.endsWith('.pdf')) {
    return 'pdf';
  }

  if (lowerFilename.endsWith('.md') || lowerFilename.endsWith('.markdown')) {
    return 'md';
  }

  if (mimetype.startsWith('text/') || lowerFilename.endsWith('.txt')) {
    return 'txt';
  }

  throw new Error('Tipo de arquivo não suportado. Envie PDF, TXT ou MD.');
}

async function extractTextFromFile(file: MultipartFile): Promise<{
  content: string;
  fileType: string;
}> {
  const buffer = await file.toBuffer();
  const fileType = detectFileType(file.filename, file.mimetype);

  if (fileType === 'pdf') {
    const parsed = await pdfParse(buffer);
    return {
      content: parsed.text,
      fileType
    };
  }

  return {
    content: buffer.toString('utf8'),
    fileType
  };
}

export async function documentRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/documents/upload', async (request, reply) => {
    try {
      const file = await request.file();

      if (!file) {
        return reply.status(400).send({
          message: 'Arquivo é obrigatório.'
        });
      }

      const fields = uploadFieldsSchema.parse({
        title: getUploadField(file, 'title'),
        module: getUploadField(file, 'module'),
        description: getUploadField(file, 'description')
      });

      const extracted = await extractTextFromFile(file);
      const result = await ingestDocument({
        db: request.server.db,
        title: fields.title,
        module: fields.module,
        description: fields.description,
        content: extracted.content,
        sourceFile: file.filename,
        fileType: extracted.fileType
      });

      return reply.status(201).send({
        success: true,
        documentId: result.documentId,
        chunksCreated: result.chunksCreated
      });
    } catch (error) {
      request.log.error(error);

      return reply.status(400).send({
        message: errorMessage(error)
      });
    }
  });

  fastify.post('/documents/text', async (request, reply) => {
    try {
      const body = documentTextSchema.parse(request.body);
      const result = await ingestDocument({
        db: request.server.db,
        title: body.title,
        module: body.module,
        description: body.description,
        content: body.content,
        fileType: 'manual'
      });

      return reply.status(201).send({
        success: true,
        documentId: result.documentId,
        chunksCreated: result.chunksCreated
      });
    } catch (error) {
      request.log.error(error);

      return reply.status(400).send({
        message: errorMessage(error)
      });
    }
  });

  fastify.get('/documents', async (request, reply) => {
    try {
      const query = documentQuerySchema.parse(request.query);
      const documents = await request.server.db
        .selectFrom('documents')
        .select(['id', 'title', 'module', 'description', 'chunk_count', 'created_at'])
        .$if(Boolean(query.module), (builder) => builder.where('module', '=', query.module ?? ''))
        .$if(Boolean(query.search), (builder) =>
          builder.where((expressionBuilder) =>
            expressionBuilder.or([
              expressionBuilder('title', 'ilike', `%${query.search ?? ''}%`),
              expressionBuilder('description', 'ilike', `%${query.search ?? ''}%`)
            ])
          )
        )
        .orderBy('created_at', 'desc')
        .execute();

      return {
        documents
      };
    } catch (error) {
      request.log.error(error);

      return reply.status(400).send({
        message: errorMessage(error)
      });
    }
  });

  fastify.delete('/documents/:id', async (request, reply) => {
    try {
      const params = documentParamsSchema.parse(request.params);
      await deleteDocument(request.server.db, params.id);

      return {
        success: true
      };
    } catch (error) {
      request.log.error(error);

      return reply.status(400).send({
        message: errorMessage(error)
      });
    }
  });

  fastify.delete('/database', async (request, reply) => {
    try {
      await clearKnowledgeBase(request.server.db);

      return {
        success: true
      };
    } catch (error) {
      request.log.error(error);

      return reply.status(400).send({
        message: errorMessage(error)
      });
    }
  });
}
