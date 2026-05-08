<script setup lang="ts">
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { computed } from 'vue';
import SourceBadge from './SourceBadge.vue';
import type { ChatMessage } from '../types';

const props = defineProps<{
  message: ChatMessage;
}>();

const renderedContent = computed(() => {
  const html = marked.parse(props.message.content, {
    async: false,
    breaks: true
  }) as string;

  return DOMPurify.sanitize(html);
});

const isAssistant = computed(() => props.message.role === 'assistant');
</script>

<template>
  <article class="flex w-full gap-3" :class="isAssistant ? 'justify-start' : 'justify-end'">
    <div
      class="max-w-[min(780px,100%)] rounded-lg px-4 py-3 shadow-sm"
      :class="
        isAssistant
          ? 'border border-minerion-graphite/10 bg-white text-minerion-graphite'
          : 'bg-minerion-graphite text-white'
      "
    >
      <div
        class="markdown-body text-sm leading-6"
        :class="isAssistant ? 'text-minerion-graphite' : 'text-white'"
        v-html="renderedContent"
      />

      <div v-if="isAssistant && message.sources?.length" class="mt-3 flex flex-wrap gap-2">
        <SourceBadge v-for="source in message.sources" :key="`${source.documentId}-${source.chunkIndex}`" :source="source" />
      </div>
    </div>
  </article>
</template>
