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
  <article class="surface flex min-h-48 flex-col justify-between rounded-lg p-4 hover:-translate-y-0.5 hover:shadow-lift">
    <div class="space-y-3">
      <div class="flex items-start justify-between gap-3">
        <h3 class="min-w-0 text-base font-semibold leading-6 text-minerion-ink">
          {{ document.title }}
        </h3>
        <button
          type="button"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-md text-minerion-graphite/45 hover:bg-red-50 hover:text-red-600"
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

      <p v-if="document.description" class="line-clamp-3 text-sm leading-6 text-minerion-graphite/70">
        {{ document.description }}
      </p>
    </div>

    <dl class="mt-5 grid grid-cols-2 gap-3 border-t border-minerion-graphite/10 pt-4 text-sm">
      <div>
        <dt class="text-minerion-graphite/55">Chunks</dt>
        <dd class="font-semibold text-minerion-ink">{{ document.chunk_count }}</dd>
      </div>
      <div>
        <dt class="text-minerion-graphite/55">Criado em</dt>
        <dd class="font-semibold text-minerion-ink">{{ formatDate(document.created_at) }}</dd>
      </div>
    </dl>
  </article>
</template>
