import OpenAI from 'openai';

const EMBEDDING_MODEL = 'text-embedding-ada-002';
const EMBEDDING_BATCH_SIZE = 10;
const BATCH_DELAY_MS = 200;

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

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
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
