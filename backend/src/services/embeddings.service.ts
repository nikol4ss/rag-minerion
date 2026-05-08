import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_BATCH_SIZE = 10;
const BATCH_DELAY_MS = 200;
const LOCAL_EMBEDDING_DIMENSIONS = 1536;

let openaiClient: OpenAI | null = null;

export type AiProvider = 'local' | 'openai';

export function getAiProvider(): AiProvider {
  return process.env.AI_PROVIDER === 'openai' ? 'openai' : 'local';
}

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurada.');
  }

  openaiClient ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  return openaiClient;
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function hashToken(token: string): number {
  let hash = 2166136261;

  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function addTokenToVector(vector: number[], token: string, weight: number): void {
  const hash = hashToken(token);
  const index = hash % LOCAL_EMBEDDING_DIMENSIONS;
  const sign = hash & 1 ? 1 : -1;
  vector[index] = (vector[index] ?? 0) + sign * weight;
}

function generateLocalEmbedding(text: string): number[] {
  const tokens = tokenize(text);

  if (tokens.length === 0) {
    throw new Error('Texto vazio não pode gerar embedding.');
  }

  const vector = Array.from({ length: LOCAL_EMBEDDING_DIMENSIONS }, () => 0);

  tokens.forEach((token, index) => {
    addTokenToVector(vector, token, 1);

    const nextToken = tokens[index + 1];
    if (nextToken) {
      addTokenToVector(vector, `${token}_${nextToken}`, 0.65);
    }
  });

  const magnitude = Math.sqrt(vector.reduce((total, value) => total + value * value, 0));

  return vector.map((value) => (magnitude > 0 ? value / magnitude : 0));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    throw new Error('Texto vazio não pode gerar embedding.');
  }

  if (getAiProvider() === 'local') {
    return generateLocalEmbedding(normalizedText);
  }

  const response = await getOpenAIClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: normalizedText
  });

  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    throw new Error('A OpenAI não retornou embedding para o texto enviado.');
  }

  return embedding;
}

export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  if (getAiProvider() === 'local') {
    return texts.map((text) => generateLocalEmbedding(text));
  }

  const embeddings: number[][] = [];

  for (let index = 0; index < texts.length; index += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(index, index + EMBEDDING_BATCH_SIZE).map(normalizeText);
    const response = await getOpenAIClient().embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch
    });

    const orderedEmbeddings = [...response.data]
      .sort((left, right) => left.index - right.index)
      .map((item) => item.embedding);

    embeddings.push(...orderedEmbeddings);

    if (index + EMBEDDING_BATCH_SIZE < texts.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return embeddings;
}
