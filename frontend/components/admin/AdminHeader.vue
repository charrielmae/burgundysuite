<template>
  <div>
    <header class="w-full bg-[#2B0E14]/90 backdrop-blur-md border-b border-[#5A1C2A]/60 py-4 px-4 sm:px-6 lg:px-8 shadow-xl sticky top-0 z-30">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <!-- Left Side: Brand Logo & Title -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="relative w-9 h-9 rounded-full overflow-hidden bg-[#240A10] border border-[#E5C378]/40 shadow-sm shrink-0 p-1 flex items-center justify-center">
            <img
              src="/burgundylogov2.png"
              alt="Burgundy Suite Logo"
              class="w-full h-full object-contain"
            />
          </div>
          <div class="min-w-0">
            <h1 class="text-base font-bold text-white font-serif leading-none tracking-wide truncate">
              Burgundy Suite & Resort
            </h1>
            <p class="text-[11px] text-[#E5C378]/80 mt-1 leading-none font-medium truncate">
              Administrative Command Center (Nuxt 3 + NestJS)
            </p>
          </div>
        </div>

        <!-- Desktop Action Controls -->
        <div class="hidden md:flex flex-wrap items-center justify-end gap-2 lg:gap-3">
          <button
            type="button"
            @click="$emit('open-cloudflare')"
            title="Inspect Cloudflare D1 Database & R2 Storage"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-[#381018] text-[#E5C378] hover:bg-[#4A1521] border border-[#E5C378]/40 transition-all cursor-pointer shadow-sm"
          >
            <Cloud class="w-3.5 h-3.5" />
            <span>Cloudflare Edge</span>
          </button>

          <button
            type="button"
            @click="$emit('open-accounts')"
            title="Manage and Provision Internal Staff Accounts"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-[#240A10] text-[#E5C378] hover:bg-[#381018] border border-[#E5C378]/40 transition-all cursor-pointer shadow-sm"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span>Accounts</span>
          </button>

          <button
            type="button"
            @click="$emit('open-add-suite')"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-emerald-700 hover:bg-emerald-600 text-white transition-all cursor-pointer shadow-sm border border-emerald-500/40"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add Suite</span>
          </button>

          <button
            type="button"
            @click="$emit('export-report')"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide uppercase bg-[#5A1C2A] text-[#E5C378] hover:bg-[#6D2233] border border-[#E5C378]/30 transition-all cursor-pointer shadow-sm"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

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

        <!-- Mobile Hamburger Button -->
        <button
          type="button"
          @click="mobileMenuOpen = true"
          aria-label="Open admin menu"
          class="md:hidden p-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white hover:text-[#E5C378] transition-colors cursor-pointer flex items-center justify-center shadow-xs shrink-0"
        >
          <Menu class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Mobile Admin Drawer -->
    <Teleport to="body">
      <div
        :class="[
          'md:hidden fixed inset-0 z-[9998] bg-black/65 backdrop-blur-sm transition-opacity duration-300',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ]"
        @click="mobileMenuOpen = false"
      />

      <div
        :class="[
          'md:hidden fixed top-0 right-0 z-[9999] h-full w-72 bg-[#2B0E14] border-l border-[#5A1C2A]/60 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col',
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
        ]"
      >
        <div class="flex items-center justify-between px-5 h-20 border-b border-[#5A1C2A]/60">
          <span class="font-serif text-sm font-bold tracking-[0.15em] uppercase text-[#E5C378]">
            Admin Menu
          </span>
          <button
            type="button"
            @click="mobileMenuOpen = false"
            aria-label="Close admin menu"
            class="p-2 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white hover:text-[#E5C378] transition-colors cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div v-if="currentUser" class="px-5 py-4 border-b border-[#5A1C2A]/40 bg-[#240A10]/60 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/30 text-sm font-bold flex items-center justify-center shrink-0">
            {{ currentUser.first_name?.[0] || 'A' }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-white truncate">
              {{ currentUser.first_name }} {{ currentUser.last_name }}
            </p>
            <p class="text-[11px] text-[#E5C378] truncate">
              {{ currentUser.position }}
            </p>
          </div>
        </div>

        <nav class="flex-1 flex flex-col px-5 py-5 space-y-2.5 overflow-y-auto">
          <button
            type="button"
            @click="mobileMenuOpen = false; $emit('open-cloudflare')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase bg-[#381018] text-[#E5C378] hover:bg-[#4A1521] border border-[#E5C378]/30 transition-colors cursor-pointer text-left"
          >
            <Cloud class="w-4 h-4 shrink-0" />
            <span>Cloudflare Edge</span>
          </button>

          <button
            type="button"
            @click="mobileMenuOpen = false; $emit('open-accounts')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase bg-[#240A10] text-[#E5C378] hover:bg-[#381018] border border-[#E5C378]/30 transition-colors cursor-pointer text-left"
          >
            <UserPlus class="w-4 h-4 shrink-0" />
            <span>Accounts</span>
          </button>

          <button
            type="button"
            @click="mobileMenuOpen = false; $emit('open-add-suite')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/40 transition-colors cursor-pointer text-left"
          >
            <Plus class="w-4 h-4 shrink-0" />
            <span>Add Suite</span>
          </button>

          <button
            type="button"
            @click="mobileMenuOpen = false; $emit('export-report')"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase bg-[#5A1C2A] text-[#E5C378] hover:bg-[#6D2233] border border-[#E5C378]/30 transition-colors cursor-pointer text-left"
          >
            <Download class="w-4 h-4 shrink-0" />
            <span>Export Report</span>
          </button>
        </nav>

        <div class="p-5 border-t border-[#5A1C2A]/60">
          <button
            type="button"
            @click="mobileMenuOpen = false; $emit('logout')"
            class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border border-rose-500/40 transition-colors cursor-pointer"
          >
            <LogOut class="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Download, LogOut, Plus, UserPlus, Cloud, Menu, X } from 'lucide-vue-next';

const mobileMenuOpen = ref(false);

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
