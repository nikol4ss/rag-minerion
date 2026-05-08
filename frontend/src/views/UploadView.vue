<script setup lang="ts">
import { RouterLink } from 'vue-router';
import UploadForm from '../components/UploadForm.vue';
</script>

<template>
  <main class="mx-auto min-h-[calc(100vh-73px)] max-w-5xl px-4 py-6 md:px-8">
    <div class="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-950">Upload</h1>
        <p class="mt-1 text-sm text-slate-600">Indexe arquivos ou textos na base RAG.</p>
      </div>

      <RouterLink class="text-sm font-semibold text-slate-700 hover:text-slate-950" to="/documents">
        Ver documentos
      </RouterLink>
    </div>

    <section class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <UploadForm />
    </section>
  </main>
</template>
