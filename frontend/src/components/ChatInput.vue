<script setup lang="ts">
import { SendHorizontal } from 'lucide-vue-next';
import { ref } from 'vue';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  send: [value: string];
}>();

const draft = ref('');

function submit(): void {
  const value = draft.value.trim();

  if (!value) {
    return;
  }

  emit('send', value);
  draft.value = '';
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    submit();
  }
}
</script>

<template>
  <form class="flex items-end gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-soft" @submit.prevent="submit">
    <textarea
      v-model="draft"
      class="max-h-36 min-h-12 flex-1 resize-none rounded-md border-0 bg-transparent px-2 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
      rows="1"
      placeholder="Pergunte sobre processos, regras ou manuais cadastrados"
      :disabled="disabled"
      @keydown="onKeydown"
    />
    <button
      type="submit"
      class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      :disabled="disabled || !draft.trim()"
      title="Enviar"
      aria-label="Enviar"
    >
      <SendHorizontal class="h-5 w-5" />
    </button>
  </form>
</template>
