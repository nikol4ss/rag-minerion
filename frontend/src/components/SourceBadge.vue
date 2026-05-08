<script setup lang="ts">
import { computed } from 'vue';
import type { Source } from '../types';

const props = defineProps<{
  source: Source;
}>();

const moduleClasses: Record<string, string> = {
  financeiro: 'border-blue-200 bg-blue-50 text-blue-700',
  rh: 'border-green-200 bg-green-50 text-green-700',
  'erp-nf': 'border-amber-200 bg-amber-50 text-amber-700',
  juridico: 'border-red-200 bg-red-50 text-red-700',
  operacional: 'border-purple-200 bg-purple-50 text-purple-700',
  geral: 'border-slate-200 bg-slate-50 text-slate-700'
};

const colorClass = computed(() => moduleClasses[props.source.module] ?? moduleClasses.geral);
const confidence = computed(() => `${Math.round(props.source.similarity * 100)}%`);
</script>

<template>
  <span
    class="inline-flex max-w-full items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-medium"
    :class="colorClass"
    :title="`${source.title} · ${confidence}`"
  >
    <span class="truncate">{{ source.title }}</span>
    <span class="shrink-0 uppercase">{{ source.module }}</span>
    <span class="shrink-0 tabular-nums">{{ confidence }}</span>
  </span>
</template>
