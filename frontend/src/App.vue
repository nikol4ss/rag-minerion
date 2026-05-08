<script setup lang="ts">
import { Bot, Database, UploadCloud } from 'lucide-vue-next';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();

function navClass(path: string): string {
  const active = route.path === path;
  return active
    ? 'bg-slate-900 text-white'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950';
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <RouterLink to="/" class="flex min-w-0 items-center gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white">
            <Bot class="h-5 w-5" />
          </span>
          <span class="truncate text-base font-semibold text-slate-950">Corporate AI</span>
        </RouterLink>

        <nav class="flex shrink-0 gap-1">
          <RouterLink class="grid h-10 w-10 place-items-center rounded-md transition md:w-auto md:px-3" :class="navClass('/')" to="/" title="Chat" aria-label="Chat">
            <Bot class="h-4 w-4 md:mr-2" />
            <span class="hidden text-sm font-medium md:inline">Chat</span>
          </RouterLink>
          <RouterLink class="grid h-10 w-10 place-items-center rounded-md transition md:w-auto md:px-3" :class="navClass('/documents')" to="/documents" title="Documentos" aria-label="Documentos">
            <Database class="h-4 w-4 md:mr-2" />
            <span class="hidden text-sm font-medium md:inline">Documentos</span>
          </RouterLink>
          <RouterLink class="grid h-10 w-10 place-items-center rounded-md transition md:w-auto md:px-3" :class="navClass('/upload')" to="/upload" title="Upload" aria-label="Upload">
            <UploadCloud class="h-4 w-4 md:mr-2" />
            <span class="hidden text-sm font-medium md:inline">Upload</span>
          </RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>
