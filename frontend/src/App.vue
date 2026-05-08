<script setup lang="ts">
import { Bot, Database, UploadCloud } from 'lucide-vue-next';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();

function navClass(path: string): string {
  const active = route.path === path;
  return active
    ? 'bg-minerion-graphite text-minerion-lime shadow-sm'
    : 'text-minerion-graphite hover:bg-minerion-sand/70 hover:text-minerion-ink';
}
</script>

<template>
  <div class="min-h-screen text-minerion-graphite">
    <header class="sticky top-0 z-40 border-b border-minerion-graphite/10 bg-white/90 backdrop-blur-xl">
      <div class="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-3 px-3 py-3 md:px-8">
        <RouterLink to="/" class="flex min-w-0 items-center gap-3">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-minerion-graphite text-minerion-lime shadow-lift">
            <Bot class="h-5 w-5" />
          </span>
          <span class="min-w-0">
            <span class="block truncate font-mono text-base font-bold uppercase leading-5 text-minerion-ink">IA Minerion</span>
            <span class="hidden truncate text-xs font-medium text-minerion-green sm:block">Conhecimento interno com contexto controlado</span>
          </span>
        </RouterLink>

        <nav class="flex shrink-0 gap-1 rounded-lg border border-minerion-graphite/10 bg-white/70 p-1">
          <RouterLink class="grid h-10 w-10 place-items-center rounded-md md:w-auto md:px-3" :class="navClass('/')" to="/" title="Chat" aria-label="Chat">
            <Bot class="h-4 w-4 md:mr-2" />
            <span class="hidden text-sm font-medium md:inline">Chat</span>
          </RouterLink>
          <RouterLink class="grid h-10 w-10 place-items-center rounded-md md:w-auto md:px-3" :class="navClass('/documents')" to="/documents" title="Documentos" aria-label="Documentos">
            <Database class="h-4 w-4 md:mr-2" />
            <span class="hidden text-sm font-medium md:inline">Documentos</span>
          </RouterLink>
          <RouterLink class="grid h-10 w-10 place-items-center rounded-md md:w-auto md:px-3" :class="navClass('/upload')" to="/upload" title="Upload" aria-label="Upload">
            <UploadCloud class="h-4 w-4 md:mr-2" />
            <span class="hidden text-sm font-medium md:inline">Upload</span>
          </RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>
