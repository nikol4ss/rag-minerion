<script setup lang="ts">
import { computed } from 'vue';
import type { Source } from '../types';

const props = defineProps<{
  source: Source;
}>();

const moduleClasses: Record<string, string> = {
  financeiro: 'border-minerion-green/25 bg-minerion-green/10 text-minerion-green',
  rh: 'border-minerion-lime/70 bg-minerion-lime/35 text-minerion-graphite',
  'erp-nf': 'border-minerion-sand bg-minerion-sand/70 text-minerion-graphite',
  juridico: 'border-red-200 bg-red-50 text-red-700',
  operacional: 'border-minerion-graphite/20 bg-minerion-graphite/10 text-minerion-graphite',
  geral: 'border-minerion-graphite/15 bg-white text-minerion-graphite'
};

const colorClass = computed(() => moduleClasses[props.source.module] ?? moduleClasses.geral);
const confidence = computed(() => `${Math.round(props.source.similarity * 100)}%`);
</script>

<template>
  <span
    class="inline-flex max-w-full items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold"
    :class="colorClass"
    :title="`${source.title} · ${confidence}`"
  >
    <span class="truncate">{{ source.title }}</span>
    <span class="shrink-0 uppercase">{{ source.module }}</span>
    <span class="shrink-0 tabular-nums">{{ confidence }}</span>
  </span>
</template>
