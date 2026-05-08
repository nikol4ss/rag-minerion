<script setup lang="ts">
import { Plus, Search } from 'lucide-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import DocumentCard from '../components/DocumentCard.vue';
import ModuleFilter from '../components/ModuleFilter.vue';
import { useDocuments } from '../composables/useDocuments';
import type { DocumentItem } from '../types';

const { documents, loading, error, fetchDocuments, deleteDocument } = useDocuments();
const selectedModule = ref<string | undefined>();
const search = ref('');
const pendingDelete = ref<DocumentItem | null>(null);

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

watch(selectedModule, refresh);

onMounted(refresh);
</script>

<template>
  <main class="mx-auto min-h-[calc(100vh-73px)] max-w-7xl px-4 py-6 md:px-8">
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-950">Documentos</h1>
        <p class="mt-1 text-sm text-slate-600">{{ documents.length }} documentos indexados</p>
      </div>

      <RouterLink
        to="/upload"
        class="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700"
      >
        <Plus class="h-4 w-4" />
        Upload
      </RouterLink>
    </div>

    <div class="mb-6 grid gap-4">
      <ModuleFilter v-model="selectedModule" :modules="modules" />

      <form class="relative max-w-xl" @submit.prevent="refresh">
        <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="search"
          class="h-11 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-slate-500"
          type="search"
          placeholder="Buscar por título ou descrição"
          @input="refresh"
        />
      </form>
    </div>

    <p v-if="error" class="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {{ error }}
    </p>

    <div v-if="loading" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="item in 6" :key="item" class="h-48 animate-pulse rounded-lg bg-white" />
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <DocumentCard
        v-for="document in documents"
        :key="document.id"
        :document="document"
        @delete="pendingDelete = $event"
      />
    </div>

    <div v-if="!loading && documents.length === 0" class="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
      Nenhum documento encontrado.
    </div>

    <div v-if="pendingDelete" class="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <section class="w-full max-w-md rounded-lg bg-white p-5 shadow-soft">
        <h2 class="text-lg font-semibold text-slate-950">Excluir documento</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          {{ pendingDelete.title }}
        </p>
        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="h-10 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
  </main>
</template>
