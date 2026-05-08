import OpenAI from 'openai';
import { sql, type Kysely } from 'kysely';
import type {
  ChatCompletionChunk,
  ChatCompletionMessageParam
} from 'openai/resources/chat/completions';
import type { Database, MessageRole } from '../db/types.js';
import { generateEmbedding } from './embeddings.service.js';

const CHAT_MODEL = 'gpt-4o';
const SIMILARITY_THRESHOLD = 0.75;
const TOP_K = 5;
const NO_CONTEXT_ANSWER = 'Não encontrei essa informação na base de conhecimento.';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurada.');
  }

  openaiClient ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  return openaiClient;
}

export interface Source {
  documentId: string;
  title: string;
  module: string;
  similarity: number;
  chunkIndex: number;
}

export interface AnswerParams {
  db: Kysely<Database>;
  question: string;
  history?: Array<{
    role: MessageRole;
    content: string;
  }>;
}

export interface AnswerResult {
  answer: string;
  sources: Source[];
  tokensUsed: number;
}

interface RetrievedChunk {
  id: string;
  content: string;
  chunk_index: number;
  document_id: string;
  title: string;
  module: string;
  similarity: number;
}

export interface AnswerStreamResult {
  sources: Source[];
  fallbackAnswer?: string;
  stream?: AsyncIterable<ChatCompletionChunk>;
}

function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.map((value) => value.toFixed(8)).join(',')}]`;
}

function buildSystemPrompt(context: string): string {
  return `Você é um assistente especializado nos processos internos da empresa.
Responda APENAS com base nos documentos fornecidos.
Seja objetivo, cite o módulo e o documento de origem.
Se a informação não estiver nos documentos, responda: "Essa informação não está na base de conhecimento cadastrada."
Nunca invente informações. Nunca use conhecimento externo.

DOCUMENTOS:
${context}`;
}

function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, index) => {
      return `[${index + 1}] Módulo: ${chunk.module}
Documento: ${chunk.title}
Similaridade: ${(chunk.similarity * 100).toFixed(1)}%
Conteúdo: ${chunk.content}`;
    })
    .join('\n\n---\n\n');
}

function buildMessages(
  question: string,
  history: AnswerParams['history'],
  chunks: RetrievedChunk[]
): ChatCompletionMessageParam[] {
  const recentHistory = (history ?? []).slice(-6);

  return [
    {
      role: 'system',
      content: buildSystemPrompt(buildContext(chunks))
    },
    ...recentHistory.map((message) => ({
      role: message.role,
      content: message.content
    })),
    {
      role: 'user',
      content: question
    }
  ];
}

function mapSources(chunks: RetrievedChunk[]): Source[] {
  return chunks.map((chunk) => ({
    documentId: chunk.document_id,
    title: chunk.title,
    module: chunk.module,
    similarity: Number(chunk.similarity),
    chunkIndex: chunk.chunk_index
  }));
}

async function retrieveRelevantChunks(db: Kysely<Database>, question: string): Promise<RetrievedChunk[]> {
  const questionEmbedding = await generateEmbedding(question);
  const vector = toVectorLiteral(questionEmbedding);

  const result = await sql<RetrievedChunk>`
    SELECT
      c.id,
      c.content,
      c.chunk_index,
      d.id AS document_id,
      d.title,
      d.module,
      1 - (c.embedding <=> ${vector}::vector) AS similarity
    FROM chunks c
    INNER JOIN documents d ON d.id = c.document_id
    WHERE c.embedding IS NOT NULL
      AND 1 - (c.embedding <=> ${vector}::vector) >= ${SIMILARITY_THRESHOLD}
    ORDER BY c.embedding <=> ${vector}::vector
    LIMIT ${TOP_K}
  `.execute(db);

  return result.rows.map((row) => ({
    ...row,
    similarity: Number(row.similarity)
  }));
}

export async function answerQuestion(params: AnswerParams): Promise<AnswerResult> {
  const chunks = await retrieveRelevantChunks(params.db, params.question);

  if (chunks.length === 0) {
    return {
      answer: NO_CONTEXT_ANSWER,
      sources: [],
      tokensUsed: 0
    };
  }

  const response = await getOpenAIClient().chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.1,
    messages: buildMessages(params.question, params.history, chunks)
  });

  return {
    answer: response.choices[0]?.message.content?.trim() || NO_CONTEXT_ANSWER,
    sources: mapSources(chunks),
    tokensUsed: response.usage?.total_tokens ?? 0
  };
}

export async function streamAnswerQuestion(params: AnswerParams): Promise<AnswerStreamResult> {
  const chunks = await retrieveRelevantChunks(params.db, params.question);

  if (chunks.length === 0) {
    return {
      sources: [],
      fallbackAnswer: NO_CONTEXT_ANSWER
    };
  }

  const stream = await getOpenAIClient().chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.1,
    stream: true,
    messages: buildMessages(params.question, params.history, chunks)
  });

  return {
    sources: mapSources(chunks),
    stream
  };
}
