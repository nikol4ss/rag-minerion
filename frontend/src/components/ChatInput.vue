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
  <form class="surface flex items-end gap-2 rounded-lg p-2" @submit.prevent="submit">
    <textarea
      v-model="draft"
      class="max-h-36 min-h-12 flex-1 resize-none rounded-md border-0 bg-transparent px-2 py-2 text-sm leading-6 text-minerion-ink outline-none placeholder:text-minerion-graphite/45"
      rows="1"
      placeholder="Pergunte algo sobre a Minerion ou sobre documentos ensinados"
      :disabled="disabled"
      @keydown="onKeydown"
    />
    <button
      type="submit"
      class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-minerion-graphite text-minerion-lime shadow-sm hover:bg-minerion-ink disabled:cursor-not-allowed disabled:bg-minerion-graphite/25 disabled:text-white"
      :disabled="disabled || !draft.trim()"
      title="Enviar"
      aria-label="Enviar"
    >
      <SendHorizontal class="h-5 w-5" />
    </button>
  </form>
</template>
