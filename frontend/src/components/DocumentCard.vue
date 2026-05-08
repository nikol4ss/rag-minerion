<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';
import type { DocumentItem } from '../types';
import SourceBadge from './SourceBadge.vue';

defineProps<{
  document: DocumentItem;
}>();

const emit = defineEmits<{
  delete: [document: DocumentItem];
}>();

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
}
</script>

<template>
  <article class="flex min-h-48 flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div class="space-y-3">
      <div class="flex items-start justify-between gap-3">
        <h3 class="min-w-0 text-base font-semibold leading-6 text-slate-900">
          {{ document.title }}
        </h3>
        <button
          type="button"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
          title="Excluir"
          aria-label="Excluir documento"
          @click="emit('delete', document)"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>

      <SourceBadge
        :source="{
          documentId: document.id,
          title: document.module,
          module: document.module,
          similarity: 1,
          chunkIndex: 0
        }"
      />

      <p v-if="document.description" class="line-clamp-3 text-sm leading-6 text-slate-600">
        {{ document.description }}
      </p>
    </div>

    <dl class="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
      <div>
        <dt class="text-slate-500">Chunks</dt>
        <dd class="font-semibold text-slate-900">{{ document.chunk_count }}</dd>
      </div>
      <div>
        <dt class="text-slate-500">Criado em</dt>
        <dd class="font-semibold text-slate-900">{{ formatDate(document.created_at) }}</dd>
      </div>
    </dl>
  </article>
</template>
