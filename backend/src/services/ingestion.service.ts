import { sql, type Kysely } from 'kysely';
import type { Database } from '../db/types.js';
import { generateEmbeddingsBatch } from './embeddings.service.js';

const DEFAULT_CHUNK_WORDS = 500;
const DEFAULT_OVERLAP_WORDS = 50;

export interface IngestDocumentParams {
  db: Kysely<Database>;
  title: string;
  module: string;
  content: string;
  description?: string;
  sourceFile?: string;
  fileType?: string;
}

export interface IngestResult {
  documentId: string;
  chunksCreated: number;
}

function normalizeContent(content: string): string {
  return content.replace(/\s+/g, ' ').trim();
}

function findSentenceBoundary(words: string[], start: number, targetEnd: number): number {
  const minimumEnd = Math.min(targetEnd, start + Math.floor(DEFAULT_CHUNK_WORDS * 0.6));

  for (let index = targetEnd - 1; index >= minimumEnd; index -= 1) {
    const word = words[index];

    if (word && /[.!?]["')\]]?$/.test(word)) {
      return index + 1;
    }
  }

  return targetEnd;
}

export function chunkText(
  content: string,
  chunkWords = DEFAULT_CHUNK_WORDS,
  overlapWords = DEFAULT_OVERLAP_WORDS
): string[] {
  const normalized = normalizeContent(content);

  if (!normalized) {
    return [];
  }

  const words = normalized.split(/\s+/);
  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const targetEnd = Math.min(start + chunkWords, words.length);
    const end = targetEnd < words.length ? findSentenceBoundary(words, start, targetEnd) : targetEnd;
    const chunk = words.slice(start, end).join(' ').trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= words.length) {
      break;
    }

    start = Math.max(end - overlapWords, start + 1);
  }

  return chunks;
}

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.map((value) => value.toFixed(8)).join(',')}]`;
}

export async function ingestDocument(params: IngestDocumentParams): Promise<IngestResult> {
  const chunks = chunkText(params.content);

  if (chunks.length === 0) {
    throw new Error('Documento sem conteúdo textual para indexação.');
  }

  let documentId: string | undefined;

  try {
    const document = await params.db
      .insertInto('documents')
      .values({
        title: params.title,
        module: params.module,
        description: params.description ?? null,
        source_file: params.sourceFile ?? null,
        file_type: params.fileType ?? 'manual'
      })
      .returning(['id'])
      .executeTakeFirstOrThrow();

    documentId = document.id;

    const embeddings = await generateEmbeddingsBatch(chunks);

    if (embeddings.length !== chunks.length) {
      throw new Error('Quantidade de embeddings retornada não corresponde aos chunks.');
    }

    await params.db
      .insertInto('chunks')
      .values(
        chunks.map((chunk, index) => ({
          document_id: document.id,
          content: chunk,
          embedding: sql`${toVectorLiteral(embeddings[index] ?? [])}::vector`,
          chunk_index: index
        }))
      )
      .execute();

    await params.db
      .updateTable('documents')
      .set({
        chunk_count: chunks.length
      })
      .where('id', '=', document.id)
      .execute();

    return {
      documentId: document.id,
      chunksCreated: chunks.length
    };
  } catch (error) {
    if (documentId) {
      await params.db.deleteFrom('documents').where('id', '=', documentId).execute();
    }

    throw error;
  }
}

export async function deleteDocument(db: Kysely<Database>, id: string): Promise<void> {
  await db.deleteFrom('documents').where('id', '=', id).execute();
}

export async function clearKnowledgeBase(db: Kysely<Database>): Promise<void> {
  await db.transaction().execute(async (transaction) => {
    await transaction.deleteFrom('messages').execute();
    await transaction.deleteFrom('conversations').execute();
    await transaction.deleteFrom('documents').execute();
  });
}
