export interface Source {
  documentId: string;
  title: string;
  module: string;
  similarity: number;
  chunkIndex: number;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[] | null;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  module: string;
  description: string | null;
  chunk_count: number;
  created_at: string;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  conversationId: string;
}

export interface UploadResponse {
  success: true;
  documentId: string;
  chunksCreated: number;
}
