import { storeToRefs } from 'pinia';
import { chatApi, getApiErrorMessage } from '../services/api';
import { useChatStore } from '../stores/chat.store';
import type { ChatMessage } from '../types';

export function useChat() {
  const store = useChatStore();
  const refs = storeToRefs(store);

  async function loadConversations(): Promise<void> {
    store.conversations = await chatApi.conversations();
  }

  async function loadMessages(conversationId: string): Promise<void> {
    store.loading = true;
    store.error = null;

    try {
      store.messages = await chatApi.messages(conversationId);
      store.setCurrentConversation(conversationId);
    } catch (error) {
      store.error = getApiErrorMessage(error);
    } finally {
      store.loading = false;
    }
  }

  async function sendMessage(question: string): Promise<void> {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || store.loading) {
      return;
    }

    const previousMessages = store.messages.slice(-6);
    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmedQuestion
    };

    store.messages.push(userMessage);
    store.loading = true;
    store.error = null;

    try {
      const response = await chatApi.send(
        trimmedQuestion,
        store.currentConversationId ?? undefined,
        previousMessages
      );

      store.currentConversationId = response.conversationId;
      store.messages.push({
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        tokensUsed: response.tokensUsed
      });
      await loadConversations();
    } catch (error) {
      store.error = getApiErrorMessage(error);
      store.messages.push({
        role: 'assistant',
        content: store.error,
        sources: []
      });
    } finally {
      store.loading = false;
    }
  }

  async function renameConversation(conversationId: string, title: string): Promise<void> {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    store.error = null;

    try {
      const updatedConversation = await chatApi.renameConversation(conversationId, trimmedTitle);
      store.conversations = store.conversations.map((conversation) =>
        conversation.id === conversationId ? updatedConversation : conversation
      );
    } catch (error) {
      store.error = getApiErrorMessage(error);
      throw error;
    }
  }

  async function deleteConversation(conversationId: string): Promise<void> {
    store.error = null;

    try {
      await chatApi.deleteConversation(conversationId);
      store.conversations = store.conversations.filter((conversation) => conversation.id !== conversationId);

      if (store.currentConversationId === conversationId) {
        store.startNewConversation();
      }
    } catch (error) {
      store.error = getApiErrorMessage(error);
      throw error;
    }
  }

  return {
    ...refs,
    startNewConversation: store.startNewConversation,
    loadConversations,
    loadMessages,
    sendMessage,
    renameConversation,
    deleteConversation
  };
}
