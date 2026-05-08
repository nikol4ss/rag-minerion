<script setup lang="ts">
import { AlertTriangle, Plus, Search, Trash2 } from 'lucide-vue-next';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import DocumentCard from '../components/DocumentCard.vue';
import ModuleFilter from '../components/ModuleFilter.vue';
import { useDocuments } from '../composables/useDocuments';
import type { DocumentItem } from '../types';

const { documents, loading, error, fetchDocuments, deleteDocument, clearAllDocuments } = useDocuments();
const selectedModule = ref<string | undefined>();
const search = ref('');
const pendingDelete = ref<DocumentItem | null>(null);
const showClearAll = ref(false);
const clearing = ref(false);
let searchTimer: ReturnType<typeof window.setTimeout> | undefined;

const modules = computed(() => {
  const uniqueModules = new Set(documents.value.map((document) => document.module));
  return ['geral', 'financeiro', 'rh', 'erp-nf', 'juridico', 'operacional']
    .filter((module) => uniqueModules.has(module))
    .concat([...uniqueModules].filter((module) => !['geral', 'financeiro', 'rh', 'erp-nf', 'juridico', 'operacional'].includes(module)));
});

async function refresh(): Promise<void> {
  await fetchDocuments({
    module: selectedModule.value,
    search: search.value.trim() || undefined
  });
}

async function confirmDelete(): Promise<void> {
  if (!pendingDelete.value) {
    return;
  }

  await deleteDocument(pendingDelete.value.id);
  pendingDelete.value = null;
}

async function confirmClearAll(): Promise<void> {
  clearing.value = true;

  try {
    await clearAllDocuments();
    showClearAll.value = false;
  } finally {
    clearing.value = false;
  }
}

watch(selectedModule, refresh);
watch(search, () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(refresh, 280);
});

onMounted(refresh);
onUnmounted(() => {
  window.clearTimeout(searchTimer);
});
</script>

<template>
  <main class="mx-auto min-h-[calc(100vh-73px)] max-w-7xl px-4 py-6 md:px-8">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <span class="font-mono text-xs font-bold uppercase tracking-wide text-minerion-green">Base RAG</span>
        <h1 class="mt-1 text-2xl font-bold text-minerion-ink">Documentos</h1>
        <p class="mt-1 text-sm text-minerion-graphite/70">{{ documents.length }} documentos indexados</p>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
          :disabled="loading || documents.length === 0"
          @click="showClearAll = true"
        >
          <Trash2 class="h-4 w-4" />
          Apagar base RAG
        </button>
        <RouterLink
          to="/upload"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-minerion-graphite px-4 text-sm font-semibold text-minerion-lime hover:bg-minerion-ink"
        >
          <Plus class="h-4 w-4" />
          Upload
        </RouterLink>
      </div>
    </div>

    <div class="mb-6 grid gap-4">
      <ModuleFilter v-model="selectedModule" :modules="modules" />

      <form class="relative max-w-xl" @submit.prevent="refresh">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-minerion-graphite/45" />
        <input
          v-model="search"
          class="h-11 w-full rounded-md border border-minerion-graphite/15 bg-white pl-10 pr-3 text-sm text-minerion-ink outline-none focus:border-minerion-green"
          type="search"
          placeholder="Buscar por título ou descrição"
        />
      </form>
    </div>

    <p v-if="error" class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {{ error }}
    </p>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="item in 6" :key="item" class="minerion-loader h-48 rounded-lg bg-white" />
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <DocumentCard
        v-for="document in documents"
        :key="document.id"
        :document="document"
        @delete="pendingDelete = $event"
      />
    </div>

    <div v-if="!loading && documents.length === 0" class="surface rounded-lg p-8 text-center text-sm text-minerion-graphite/70">
      Nenhum documento encontrado.
    </div>

    <div v-if="pendingDelete" class="fixed inset-0 z-50 grid place-items-center bg-minerion-graphite/55 p-4 backdrop-blur-sm">
      <section class="w-full max-w-md rounded-lg bg-white p-5 shadow-soft">
        <h2 class="text-lg font-semibold text-minerion-ink">Excluir documento</h2>
        <p class="mt-2 text-sm leading-6 text-minerion-graphite/70">
          {{ pendingDelete.title }}
        </p>
        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="h-10 rounded-md border border-minerion-graphite/15 px-4 text-sm font-semibold text-minerion-graphite hover:bg-minerion-sand/50"
            @click="pendingDelete = null"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500"
            @click="confirmDelete"
          >
            Excluir
          </button>
        </div>
      </section>
    </div>

    <div v-if="showClearAll" class="fixed inset-0 z-50 grid place-items-center bg-minerion-graphite/55 p-4 backdrop-blur-sm">
      <section class="w-full max-w-lg rounded-lg bg-white p-5 shadow-soft">
        <div class="flex gap-3">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-red-50 text-red-600">
            <AlertTriangle class="h-5 w-5" />
          </span>
          <div>
            <h2 class="text-lg font-semibold text-minerion-ink">Apagar base de documentos?</h2>
            <p class="mt-2 text-sm leading-6 text-minerion-graphite/70">
              Esta ação remove documentos e chunks indexados. Conversas e mensagens permanecem no banco para preservar a memória operacional.
            </p>
          </div>
        </div>
        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="h-10 rounded-md border border-minerion-graphite/15 px-4 text-sm font-semibold text-minerion-graphite hover:bg-minerion-sand/50"
            :disabled="clearing"
            @click="showClearAll = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-wait disabled:opacity-60"
            :disabled="clearing"
            @click="confirmClearAll"
          >
            <span v-if="clearing" class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Apagar base
          </button>
        </div>
      </section>
    </div>
  </main>
</template>
