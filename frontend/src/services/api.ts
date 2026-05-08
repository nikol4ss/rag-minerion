import axios from 'axios';
import type { ChatMessage, ChatResponse, Conversation, DocumentItem, UploadResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  timeout: 120000
});

export interface DocumentFilters {
  module?: string;
  search?: string;
}

export interface TextDocumentPayload {
  title: string;
  module: string;
  content: string;
  description?: string;
}

export const documentsApi = {
  async list(filters: DocumentFilters = {}): Promise<DocumentItem[]> {
    const response = await api.get<{ documents: DocumentItem[] }>('/documents', {
      params: filters
    });

    return response.data.documents;
  },

  async upload(formData: FormData, onProgress?: (percentage: number) => void): Promise<UploadResponse> {
    const response = await api.post<UploadResponse>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 60));
        }
      }
    });

    return response.data;
  },

  async createText(payload: TextDocumentPayload): Promise<UploadResponse> {
    const response = await api.post<UploadResponse>('/documents/text', payload);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async clearAll(): Promise<void> {
    await api.delete('/database');
  }
};

export const chatApi = {
  async send(question: string, conversationId?: string, history?: ChatMessage[]): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>('/chat', {
      question,
      conversationId,
      history: history?.map((message) => ({
        role: message.role,
        content: message.content
      }))
    });

    return response.data;
  },

  async conversations(): Promise<Conversation[]> {
    const response = await api.get<{ conversations: Conversation[] }>('/chat/conversations');
    return response.data.conversations;
  },

  async messages(conversationId: string): Promise<ChatMessage[]> {
    const response = await api.get<{ messages: ChatMessage[] }>(`/chat/conversations/${conversationId}/messages`);
    return response.data.messages;
  }
};

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? 'Falha ao comunicar com a API.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro inesperado.';
}
