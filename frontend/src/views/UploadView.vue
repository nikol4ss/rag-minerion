<script setup lang="ts">
import { RouterLink } from 'vue-router';
import UploadForm from '../components/UploadForm.vue';
</script>

<template>
  <main class="mx-auto min-h-[calc(100vh-73px)] max-w-5xl px-4 py-6 md:px-8">
    <div class="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <span class="font-mono text-xs font-bold uppercase tracking-wide text-minerion-green">Ingestão</span>
        <h1 class="mt-1 text-2xl font-bold text-minerion-ink">Upload</h1>
        <p class="mt-1 text-sm text-minerion-graphite/70">Indexe arquivos ou textos na base RAG.</p>
      </div>

      <RouterLink class="text-sm font-semibold text-minerion-green hover:text-minerion-ink" to="/documents">
        Ver documentos
      </RouterLink>
    </div>

    <section class="surface rounded-lg p-5 md:p-6">
      <UploadForm />
    </section>
  </main>
</template>
