<template>
  <header class="w-full bg-[#2B0E14]/90 backdrop-blur-md border-b border-[#5A1C2A]/60 py-4 px-4 sm:px-6 lg:px-8 shadow-xl sticky top-0 z-30">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <!-- Left Side: Brand Logo & Title -->
      <div class="flex items-center gap-3">
        <div class="relative w-9 h-9 rounded-full overflow-hidden bg-[#240A10] border border-[#E5C378]/40 shadow-sm shrink-0 p-1 flex items-center justify-center">
          <img
            src="/burgundylogov2.png"
            alt="Burgundy Suite Logo"
            class="w-full h-full object-contain"
          />
        </div>
        <div>
          <h1 class="text-base font-bold text-white font-serif leading-none tracking-wide">
            Burgundy Suite & Resort
          </h1>
          <p class="text-[11px] text-[#E5C378]/80 mt-1 leading-none font-medium">
            Administrative Command Center (Nuxt 3 + NestJS)
          </p>
        </div>
      </div>

      <!-- Right Side: Action Controls -->
      <div class="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full md:w-auto">
        <!-- Cloudflare D1 & R2 Modal Trigger -->
        <button
          type="button"
          @click="$emit('open-cloudflare')"
          title="Inspect Cloudflare D1 Database & R2 Storage"
          class="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-[#381018] text-[#E5C378] hover:bg-[#4A1521] border border-[#E5C378]/40 transition-all cursor-pointer shadow-sm"
        >
          <Cloud class="w-3.5 h-3.5" />
          <span>Cloudflare Edge</span>
        </button>

        <!-- Staff Accounts Management -->
        <button
          type="button"
          @click="$emit('open-accounts')"
          title="Manage and Provision Internal Staff Accounts"
          class="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-[#240A10] text-[#E5C378] hover:bg-[#381018] border border-[#E5C378]/40 transition-all cursor-pointer shadow-sm"
        >
          <UserPlus class="w-3.5 h-3.5" />
          <span>Accounts</span>
        </button>

        <!-- Add Suite Button -->
        <button
          type="button"
          @click="$emit('open-add-suite')"
          class="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-emerald-700 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-sm border border-emerald-500/40"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Suite</span>
        </button>

        <!-- Export Weekly Report Button -->
        <button
          type="button"
          @click="$emit('export-report')"
          class="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-[#5A1C2A] text-[#E5C378] hover:bg-[#6D2233] border border-[#E5C378]/30 transition-all cursor-pointer shadow-sm"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>

        <!-- Active Admin Profile Pill with Logout -->
        <div v-if="currentUser" class="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#240A10] border border-[#5A1C2A] shadow-md">
          <div class="w-7 h-7 rounded-full bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/30 text-xs font-bold flex items-center justify-center shadow-xs">
            {{ currentUser.first_name?.[0] || 'A' }}
          </div>
          <div class="text-left text-xs">
            <span class="font-semibold text-white block leading-tight">
              {{ currentUser.first_name }} {{ currentUser.last_name }}
            </span>
            <span class="text-[10px] text-[#E5C378] font-medium block leading-tight">
              {{ currentUser.position }}
            </span>
          </div>
          <button
            type="button"
            @click="$emit('logout')"
            title="Log Out of Admin System"
            class="ml-1 p-1 rounded-full bg-[#381018] hover:bg-rose-950/60 text-white/70 hover:text-rose-300 border border-[#5A1C2A] hover:border-rose-400/40 transition-colors cursor-pointer flex items-center gap-1 text-[10px] px-2 font-medium"
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
import { Download, LogOut, Plus, UserPlus, Cloud } from 'lucide-vue-next';

defineProps<{
  currentUser?: any;
}>();

defineEmits<{
  (e: 'export-report'): void;
  (e: 'open-add-suite'): void;
  (e: 'open-accounts'): void;
  (e: 'open-cloudflare'): void;
  (e: 'logout'): void;
}>();
</script>
