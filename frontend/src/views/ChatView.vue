<script setup lang="ts">
import { Check, MessageSquarePlus, Pencil, Trash2, X } from 'lucide-vue-next';
import { nextTick, onMounted, ref, watch } from 'vue';
import ChatInput from '../components/ChatInput.vue';
import ChatMessage from '../components/ChatMessage.vue';
import { useChat } from '../composables/useChat';
import type { Conversation } from '../types';

const {
  conversations,
  currentConversationId,
  messages,
  loading,
  error,
  startNewConversation,
  loadConversations,
  loadMessages,
  sendMessage,
  renameConversation,
  deleteConversation
} = useChat();

const scrollContainer = ref<HTMLElement | null>(null);
const editingConversationId = ref<string | null>(null);
const editingTitle = ref('');
const deletingConversation = ref<Conversation | null>(null);

async function scrollToBottom(): Promise<void> {
  await nextTick();

  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
}

function beginRename(conversation: Conversation): void {
  editingConversationId.value = conversation.id;
  editingTitle.value = conversation.title ?? 'Conversa sem título';
}

function cancelRename(): void {
  editingConversationId.value = null;
  editingTitle.value = '';
}

async function saveRename(): Promise<void> {
  if (!editingConversationId.value) {
    return;
  }

  await renameConversation(editingConversationId.value, editingTitle.value);
  cancelRename();
}

async function confirmDeleteConversation(): Promise<void> {
  if (!deletingConversation.value) {
    return;
  }

  await deleteConversation(deletingConversation.value.id);
  deletingConversation.value = null;
}

watch(messages, scrollToBottom, { deep: true });

onMounted(async () => {
  await loadConversations();
});
</script>

<template>
  <div class="grid min-h-[calc(100vh-73px)] grid-cols-1 lg:grid-cols-[332px_1fr]">
    <aside class="border-b border-minerion-graphite/10 bg-white/90 backdrop-blur lg:border-b-0 lg:border-r">
      <div class="flex items-center justify-between gap-3 border-b border-minerion-graphite/10 p-4">
        <h2 class="font-mono text-xs font-bold uppercase tracking-wide text-minerion-green">Conversas</h2>
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-md bg-minerion-graphite text-minerion-lime hover:bg-minerion-ink"
          title="Nova conversa"
          aria-label="Nova conversa"
          @click="startNewConversation"
        >
          <MessageSquarePlus class="h-4 w-4" />
        </button>
      </div>

      <div class="max-h-56 overflow-y-auto p-2 lg:max-h-[calc(100vh-145px)]">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          class="group mb-1 flex min-h-11 items-center gap-1 rounded-md px-2 py-1 text-sm"
          :class="{ 'bg-minerion-lime/35 font-semibold text-minerion-ink': conversation.id === currentConversationId, 'text-minerion-graphite hover:bg-minerion-sand/70': conversation.id !== currentConversationId }"
        >
          <form
            v-if="editingConversationId === conversation.id"
            class="flex min-w-0 flex-1 items-center gap-1"
            @submit.prevent="saveRename"
          >
            <input
              v-model="editingTitle"
              class="h-9 min-w-0 flex-1 rounded-md border border-minerion-green bg-white px-2 text-sm text-minerion-ink outline-none"
              maxlength="120"
              aria-label="Nome da conversa"
              @keydown.esc.prevent="cancelRename"
            />
            <button type="submit" class="grid h-9 w-9 shrink-0 place-items-center rounded-md text-minerion-green hover:bg-white" title="Salvar" aria-label="Salvar nome">
              <Check class="h-4 w-4" />
            </button>
            <button type="button" class="grid h-9 w-9 shrink-0 place-items-center rounded-md text-minerion-graphite/60 hover:bg-white" title="Cancelar" aria-label="Cancelar edição" @click="cancelRename">
              <X class="h-4 w-4" />
            </button>
          </form>

          <template v-else>
            <button type="button" class="min-w-0 flex-1 px-1 py-1 text-left" @click="loadMessages(conversation.id)">
              <span class="line-clamp-2">{{ conversation.title || 'Conversa sem título' }}</span>
            </button>
            <button
              type="button"
              class="grid h-8 w-8 shrink-0 place-items-center rounded-md text-minerion-graphite/45 opacity-100 hover:bg-white hover:text-minerion-green md:opacity-0 md:group-hover:opacity-100"
              title="Renomear conversa"
              aria-label="Renomear conversa"
              @click="beginRename(conversation)"
            >
              <Pencil class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="grid h-8 w-8 shrink-0 place-items-center rounded-md text-minerion-graphite/45 opacity-100 hover:bg-red-50 hover:text-red-600 md:opacity-0 md:group-hover:opacity-100"
              title="Excluir conversa"
              aria-label="Excluir conversa"
              @click="deletingConversation = conversation"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </template>
        </div>
      </div>
    </aside>

    <main class="flex min-h-0 flex-col">
      <div ref="scrollContainer" class="flex-1 space-y-4 overflow-y-auto p-4 md:p-8">
        <div v-if="messages.length === 0" class="mx-auto flex min-h-[48vh] max-w-2xl flex-col items-center justify-center text-center">
          <span class="mb-4 rounded-md bg-minerion-lime px-3 py-1 font-mono text-xs font-bold uppercase text-minerion-graphite">IA Minerion</span>
          <h1 class="text-3xl font-bold text-minerion-ink md:text-4xl">Pergunte sobre a Minerion</h1>
          <p class="mt-3 max-w-xl text-sm leading-6 text-minerion-graphite/70">
            A resposta usa somente a base cadastrada. Quando o assunto estiver fora do contexto Minerion, a IA vai avisar em vez de inventar.
          </p>
        </div>

        <ChatMessage v-for="(message, index) in messages" :key="message.id ?? `${message.role}-${index}`" :message="message" />

        <div v-if="loading" class="flex justify-start">
          <div class="inline-flex items-center gap-2 rounded-lg border border-minerion-graphite/10 bg-white px-4 py-3 text-sm text-minerion-graphite shadow-sm">
            <span class="h-2 w-2 animate-bounce rounded-full bg-minerion-lime" />
            <span class="h-2 w-2 animate-bounce rounded-full bg-minerion-green [animation-delay:120ms]" />
            <span class="h-2 w-2 animate-bounce rounded-full bg-minerion-graphite [animation-delay:240ms]" />
          </div>
        </div>

        <p v-if="error" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {{ error }}
        </p>
      </div>

      <div class="border-t border-minerion-graphite/10 bg-minerion-mist/80 p-4 md:px-8">
        <ChatInput :disabled="loading" @send="sendMessage" />
      </div>
    </main>

    <div v-if="deletingConversation" class="fixed inset-0 z-50 grid place-items-center bg-minerion-graphite/55 p-4 backdrop-blur-sm">
      <section class="w-full max-w-md rounded-lg bg-white p-5 shadow-soft">
        <h2 class="text-lg font-semibold text-minerion-ink">Excluir conversa</h2>
        <p class="mt-2 text-sm leading-6 text-minerion-graphite/70">
          A conversa sairá da lista, mas as mensagens permanecem no banco para preservar a memória operacional.
        </p>
        <p class="mt-3 rounded-md bg-minerion-sand/45 px-3 py-2 text-sm font-medium text-minerion-graphite">
          {{ deletingConversation.title || 'Conversa sem título' }}
        </p>
        <div class="mt-5 flex justify-end gap-2">
          <button type="button" class="h-10 rounded-md border border-minerion-graphite/15 px-4 text-sm font-semibold text-minerion-graphite hover:bg-minerion-sand/50" @click="deletingConversation = null">
            Cancelar
          </button>
          <button type="button" class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500" @click="confirmDeleteConversation">
            <Trash2 class="h-4 w-4" />
            Excluir da lista
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
