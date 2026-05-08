<script setup lang="ts">
import { computed, ref } from 'vue';
import { FileText, UploadCloud, X } from 'lucide-vue-next';
import { getApiErrorMessage } from '../services/api';
import { useDocuments } from '../composables/useDocuments';
import type { UploadResponse } from '../types';

const emit = defineEmits<{
  uploaded: [result: UploadResponse];
}>();

const modules = ['geral', 'financeiro', 'rh', 'erp-nf', 'juridico', 'operacional', 'outro'];
const { uploadDocument, createTextDocument } = useDocuments();

const title = ref('');
const module = ref('geral');
const customModule = ref('');
const description = ref('');
const content = ref('');
const file = ref<File | null>(null);
const dragging = ref(false);
const loading = ref(false);
const progress = ref(0);
const error = ref<string | null>(null);
const success = ref<UploadResponse | null>(null);

const selectedModule = computed(() => (module.value === 'outro' ? customModule.value.trim() : module.value));
const canSubmit = computed(() => {
  return Boolean(title.value.trim() && selectedModule.value && (file.value || content.value.trim()));
});

function onDrop(event: DragEvent): void {
  dragging.value = false;
  const droppedFile = event.dataTransfer?.files[0];

  if (droppedFile) {
    file.value = droppedFile;
    content.value = '';
  }
}

function onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  file.value = input.files?.[0] ?? null;

  if (file.value) {
    content.value = '';
  }
}

function clearFile(): void {
  file.value = null;
}

function resetForm(): void {
  title.value = '';
  module.value = 'geral';
  customModule.value = '';
  description.value = '';
  content.value = '';
  file.value = null;
  progress.value = 0;
}

async function submit(): Promise<void> {
  if (!canSubmit.value || loading.value) {
    return;
  }

  loading.value = true;
  error.value = null;
  success.value = null;
  progress.value = 10;

  try {
    let result: UploadResponse;

    if (file.value) {
      const formData = new FormData();
      formData.append('file', file.value);
      formData.append('title', title.value.trim());
      formData.append('module', selectedModule.value);

      if (description.value.trim()) {
        formData.append('description', description.value.trim());
      }

      result = await uploadDocument(formData, (percentage) => {
        progress.value = Math.max(percentage, 10);
      });
    } else {
      progress.value = 40;
      result = await createTextDocument({
        title: title.value.trim(),
        module: selectedModule.value,
        description: description.value.trim() || undefined,
        content: content.value.trim()
      });
    }

    progress.value = 100;
    success.value = result;
    emit('uploaded', result);
    resetForm();
  } catch (requestError) {
    error.value = getApiErrorMessage(requestError);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <div class="grid gap-4 md:grid-cols-2">
      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Título</span>
        <input
          v-model="title"
          class="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500"
          type="text"
          required
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-sm font-medium text-slate-700">Módulo</span>
        <select
          v-model="module"
          class="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500"
        >
          <option v-for="item in modules" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
    </div>

    <label v-if="module === 'outro'" class="block">
      <span class="mb-1 block text-sm font-medium text-slate-700">Nome do módulo</span>
      <input
        v-model="customModule"
        class="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500"
        type="text"
        required
      />
    </label>

    <label class="block">
      <span class="mb-1 block text-sm font-medium text-slate-700">Descrição</span>
      <input
        v-model="description"
        class="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500"
        type="text"
      />
    </label>

    <div
      class="rounded-lg border border-dashed p-6 text-center transition"
      :class="dragging ? 'border-slate-900 bg-slate-50' : 'border-slate-300 bg-white'"
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <UploadCloud class="mx-auto h-8 w-8 text-slate-500" />
      <p class="mt-3 text-sm font-medium text-slate-800">PDF, TXT ou MD</p>
      <label class="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        <FileText class="h-4 w-4" />
        Selecionar arquivo
        <input class="sr-only" type="file" accept=".pdf,.txt,.md,.markdown,text/plain,application/pdf" @change="onFileChange" />
      </label>

      <div v-if="file" class="mx-auto mt-4 flex max-w-xl items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        <span class="truncate">{{ file.name }}</span>
        <button type="button" class="grid h-8 w-8 place-items-center rounded-md hover:bg-white" title="Remover arquivo" aria-label="Remover arquivo" @click="clearFile">
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <label class="block">
      <span class="mb-1 block text-sm font-medium text-slate-700">Texto</span>
      <textarea
        v-model="content"
        class="min-h-48 w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-slate-500"
        :disabled="Boolean(file)"
      />
    </label>

    <div v-if="loading" class="h-2 overflow-hidden rounded-full bg-slate-200">
      <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: `${progress}%` }" />
    </div>

    <p v-if="error" class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {{ error }}
    </p>

    <p v-if="success" class="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
      Documento indexado com {{ success.chunksCreated }} chunks.
    </p>

    <button
      type="submit"
      class="inline-flex h-11 items-center gap-2 rounded-md bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      :disabled="!canSubmit || loading"
    >
      <UploadCloud class="h-4 w-4" />
      Indexar documento
    </button>
  </form>
</template>
