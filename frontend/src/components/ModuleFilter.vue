<script setup lang="ts">
const props = defineProps<{
  modules: string[];
  modelValue?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
}>();

const moduleClasses: Record<string, string> = {
  financeiro: 'border-blue-200 bg-blue-50 text-blue-700',
  rh: 'border-green-200 bg-green-50 text-green-700',
  'erp-nf': 'border-amber-200 bg-amber-50 text-amber-700',
  juridico: 'border-red-200 bg-red-50 text-red-700',
  operacional: 'border-purple-200 bg-purple-50 text-purple-700',
  geral: 'border-slate-200 bg-slate-50 text-slate-700'
};

function classesFor(module: string, active: boolean): string {
  const base = moduleClasses[module] ?? moduleClasses.geral;
  return active ? `${base} ring-2 ring-offset-1 ring-slate-400` : `${base} hover:brightness-95`;
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      type="button"
      class="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      :class="{ 'ring-2 ring-slate-400 ring-offset-1': !props.modelValue }"
      @click="emit('update:modelValue', undefined)"
    >
      Todos
    </button>

    <button
      v-for="module in modules"
      :key="module"
      type="button"
      class="rounded-md border px-3 py-1.5 text-sm font-medium"
      :class="classesFor(module, props.modelValue === module)"
      @click="emit('update:modelValue', module)"
    >
      {{ module }}
    </button>
  </div>
</template>
