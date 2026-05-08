<script setup lang="ts">
import { MessageSquarePlus } from 'lucide-vue-next';
import { nextTick, onMounted, ref, watch } from 'vue';
import ChatInput from '../components/ChatInput.vue';
import ChatMessage from '../components/ChatMessage.vue';
import { useChat } from '../composables/useChat';

const {
  conversations,
  currentConversationId,
  messages,
  loading,
  error,
  startNewConversation,
  loadConversations,
  loadMessages,
  sendMessage
} = useChat();

const scrollContainer = ref<HTMLElement | null>(null);

async function scrollToBottom(): Promise<void> {
  await nextTick();

  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
}

watch(messages, scrollToBottom, { deep: true });

onMounted(async () => {
  await loadConversations();
});
</script>

<template>
  <div class="grid min-h-[calc(100vh-73px)] grid-cols-1 bg-slate-100 lg:grid-cols-[300px_1fr]">
    <aside class="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
      <div class="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Conversas</h2>
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-md bg-slate-900 text-white hover:bg-slate-700"
          title="Nova conversa"
          aria-label="Nova conversa"
          @click="startNewConversation"
        >
          <MessageSquarePlus class="h-4 w-4" />
        </button>
      </div>

      <div class="max-h-56 overflow-y-auto p-2 lg:max-h-[calc(100vh-145px)]">
        <button
          v-for="conversation in conversations"
          :key="conversation.id"
          type="button"
          class="mb-1 w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
          :class="{ 'bg-slate-100 font-semibold text-slate-950': conversation.id === currentConversationId }"
          @click="loadMessages(conversation.id)"
        >
          <span class="line-clamp-2">{{ conversation.title || 'Conversa sem título' }}</span>
        </button>
      </div>
    </aside>

    <main class="flex min-h-0 flex-col">
      <div ref="scrollContainer" class="flex-1 space-y-4 overflow-y-auto p-4 md:p-8">
        <div v-if="messages.length === 0" class="mx-auto flex min-h-[45vh] max-w-2xl flex-col items-center justify-center text-center">
          <h1 class="text-2xl font-semibold text-slate-950">Base de Conhecimento Corporativa</h1>
          <p class="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Faça perguntas sobre os documentos indexados.
          </p>
        </div>

        <ChatMessage v-for="(message, index) in messages" :key="message.id ?? `${message.role}-${index}`" :message="message" />

        <div v-if="loading" class="flex justify-start">
          <div class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
            <span class="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
            <span class="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
            <span class="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
          </div>
        </div>

        <p v-if="error" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ error }}
        </p>
      </div>

      <div class="border-t border-slate-200 bg-slate-100 p-4 md:px-8">
        <ChatInput :disabled="loading" @send="sendMessage" />
      </div>
    </main>
  </div>
</template>
