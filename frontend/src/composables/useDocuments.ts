import { ref } from 'vue';
import { documentsApi, getApiErrorMessage, type DocumentFilters, type TextDocumentPayload } from '../services/api';
import type { DocumentItem, UploadResponse } from '../types';

export function useDocuments() {
  const documents = ref<DocumentItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchDocuments(filters: DocumentFilters = {}): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      documents.value = await documentsApi.list(filters);
    } catch (requestError) {
      error.value = getApiErrorMessage(requestError);
    } finally {
      loading.value = false;
    }
  }

  async function uploadDocument(formData: FormData, onProgress?: (percentage: number) => void): Promise<UploadResponse> {
    loading.value = true;
    error.value = null;

    try {
      return await documentsApi.upload(formData, onProgress);
    } catch (requestError) {
      error.value = getApiErrorMessage(requestError);
      throw requestError;
    } finally {
      loading.value = false;
    }
  }

  async function createTextDocument(payload: TextDocumentPayload): Promise<UploadResponse> {
    loading.value = true;
    error.value = null;

    try {
      return await documentsApi.createText(payload);
    } catch (requestError) {
      error.value = getApiErrorMessage(requestError);
      throw requestError;
    } finally {
      loading.value = false;
    }
  }

  async function deleteDocument(id: string): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await documentsApi.remove(id);
      documents.value = documents.value.filter((document) => document.id !== id);
    } catch (requestError) {
      error.value = getApiErrorMessage(requestError);
      throw requestError;
    } finally {
      loading.value = false;
    }
  }

  async function clearAllDocuments(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      await documentsApi.clearAll();
      documents.value = [];
    } catch (requestError) {
      error.value = getApiErrorMessage(requestError);
      throw requestError;
    } finally {
      loading.value = false;
    }
  }

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    createTextDocument,
    deleteDocument,
    clearAllDocuments
  };
}
