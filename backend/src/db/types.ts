import type { ColumnType, Generated } from 'kysely';
import type { Source } from '../services/retrieval.service.js';

export type Timestamp = ColumnType<Date, Date | string | undefined, Date | string>;

export interface DocumentsTable {
  id: Generated<string>;
  title: string;
  module: string;
  description: string | null;
  source_file: string | null;
  file_type: string | null;
  chunk_count: Generated<number>;
  created_at: Generated<Timestamp>;
  updated_at: Generated<Timestamp>;
}

export interface ChunksTable {
  id: Generated<string>;
  document_id: string;
  content: string;
  embedding: ColumnType<string | null, string | null, string | null>;
  chunk_index: number;
  created_at: Generated<Timestamp>;
}

export interface ConversationsTable {
  id: Generated<string>;
  title: string | null;
  created_at: Generated<Timestamp>;
}

export type MessageRole = 'user' | 'assistant';

export interface MessagesTable {
  id: Generated<string>;
  conversation_id: string;
  role: MessageRole;
  content: string;
  sources: ColumnType<Source[] | null, Source[] | null | undefined, Source[] | null>;
  created_at: Generated<Timestamp>;
}

export interface Database {
  documents: DocumentsTable;
  chunks: ChunksTable;
  conversations: ConversationsTable;
  messages: MessagesTable;
}
