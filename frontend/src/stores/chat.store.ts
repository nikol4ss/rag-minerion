import { defineStore } from 'pinia';
import type { ChatMessage, Conversation } from '../types';

interface ChatState {
  currentConversationId: string | null;
  conversations: Conversation[];
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

export const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    currentConversationId: null,
    conversations: [],
    messages: [],
    loading: false,
    error: null
  }),

  actions: {
    startNewConversation() {
      this.currentConversationId = null;
      this.messages = [];
      this.error = null;
    },

    setCurrentConversation(conversationId: string) {
      this.currentConversationId = conversationId;
      this.error = null;
    }
  }
});
