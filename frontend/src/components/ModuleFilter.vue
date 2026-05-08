<script setup lang="ts">
const props = defineProps<{
  modules: string[];
  modelValue?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const moduleClasses: Record<string, string> = {
  financeiro: 'border-minerion-green/25 bg-minerion-green/10 text-minerion-green',
  rh: 'border-minerion-lime/70 bg-minerion-lime/35 text-minerion-graphite',
  'erp-nf': 'border-minerion-sand bg-minerion-sand/70 text-minerion-graphite',
  juridico: 'border-red-200 bg-red-50 text-red-700',
  operacional: 'border-minerion-graphite/20 bg-minerion-graphite/10 text-minerion-graphite',
  geral: 'border-minerion-graphite/15 bg-white text-minerion-graphite'
};

function classesFor(module: string, active: boolean): string {
  const base = moduleClasses[module] ?? moduleClasses.geral;
  return active ? `${base} ring-2 ring-minerion-lime ring-offset-1` : `${base} hover:-translate-y-0.5 hover:shadow-sm`;
}
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-1 md:flex-wrap">
    <button
      type="button"
      class="shrink-0 rounded-md border border-minerion-graphite/15 bg-white px-3 py-1.5 text-sm font-semibold text-minerion-graphite hover:-translate-y-0.5 hover:shadow-sm"
      :class="{ 'ring-2 ring-minerion-lime ring-offset-1': !props.modelValue }"
      @click="emit('update:modelValue', undefined)"
    >
      Todos
    </button>

    <button
      v-for="module in modules"
      :key="module"
      type="button"
      class="shrink-0 rounded-md border px-3 py-1.5 text-sm font-semibold"
      :class="classesFor(module, props.modelValue === module)"
      @click="emit('update:modelValue', module)"
    >
      {{ module }}
    </button>
  </div>
</template>
