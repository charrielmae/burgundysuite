<template>
  <header class="w-full bg-[#1B1014]/95 backdrop-blur-md border-b border-zinc-500/30 py-4 px-4 sm:px-6 lg:px-8 shadow-xl sticky top-0 z-30">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="relative w-9 h-9 rounded-full overflow-hidden bg-[#12080B] border border-zinc-400/50 shadow-sm shrink-0 p-1 flex items-center justify-center">
          <img
            src="/burgundylogov2.png"
            alt="Burgundy Suite Logo"
            class="w-full h-full object-contain"
          />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base font-bold text-white font-serif leading-none tracking-wide">
              Burgundy Suite & Resort
            </h1>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-zinc-800/90 text-zinc-300 border border-zinc-500/40">
              Staff Desk
            </span>
          </div>
          <p class="text-[11px] text-zinc-300/80 mt-1 leading-none font-medium">
            Front Desk, Housekeeping & Guest Feedback Operations
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-zinc-800/70 text-zinc-300 border border-zinc-500/30">
          <span class="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
          Live Sync Active
        </span>

        <NuxtLink
          to="/"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#241319] text-white/80 hover:text-white border border-white/15 transition-colors"
        >
          Guest Portal
        </NuxtLink>

        <div v-if="currentUser" class="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#12080B] border border-zinc-500/30 shadow-md">
          <div class="w-7 h-7 rounded-full bg-zinc-700/80 text-zinc-200 border border-zinc-400/40 text-xs font-bold flex items-center justify-center">
            {{ currentUser.first_name?.[0] || 'S' }}
          </div>
          <div class="text-left text-xs">
            <span class="font-semibold text-white block leading-tight">
              {{ currentUser.first_name }} {{ currentUser.last_name }}
            </span>
            <span class="text-[10px] text-zinc-300 font-medium block leading-tight">
              {{ currentUser.position }}
            </span>
          </div>
          <button
            type="button"
            @click="$emit('logout')"
            title="Log Out of Staff Portal"
            class="ml-1 py-1 px-2 rounded-full bg-[#241319] hover:bg-rose-950/60 text-white/70 hover:text-rose-300 border border-white/15 hover:border-rose-400/40 transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-medium"
          >
            <LogOut class="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { LogOut } from 'lucide-vue-next';

defineProps<{
  currentUser?: any;
}>();

defineEmits<{
  (e: 'logout'): void;
}>();
</script>
