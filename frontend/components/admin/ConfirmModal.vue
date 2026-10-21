<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
        v-if="isOpen"
        @click.self="$emit('close')"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm"
      >
        <div
          class="modal-card relative w-full max-w-lg bg-[#381018] border border-[#5A1C2A] text-white rounded-3xl shadow-2xl overflow-hidden my-8"
          role="dialog"
        >
        <!-- Top Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-[#5A1C2A]/70 bg-[#240A10]/70">
          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-2xl flex items-center justify-center border',
                variant === 'danger'
                  ? 'bg-rose-950 text-rose-400 border-rose-800'
                  : 'bg-[#5A1C2A] text-[#E5C378] border-[#E5C378]/30',
              ]"
            >
              <LogOut v-if="variant === 'danger'" class="w-5 h-5 text-rose-400" />
              <AlertTriangle v-else class="w-5 h-5 text-[#E5C378]" />
            </div>
            <div>
              <h3 class="text-base font-bold text-white font-serif">{{ title }}</h3>
              <p class="text-[11px] text-[#E5C378]/70">Burgundy Suite & Resort Management</p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            :disabled="isLoading"
            class="w-8 h-8 rounded-full bg-[#240A10] hover:bg-[#2B0E14] text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 border border-[#5A1C2A]"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 space-y-4">
          <div class="text-sm text-white/80 leading-relaxed">{{ description }}</div>
          <slot name="detailsCard" />
        </div>

        <!-- Actions Footer -->
        <div class="px-6 py-4 bg-[#240A10]/70 border-t border-[#5A1C2A]/70 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="isLoading"
            class="px-4 py-2.5 rounded-xl border border-[#5A1C2A] text-xs font-semibold text-white/70 hover:bg-[#2B0E14] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {{ cancelLabel || 'Cancel' }}
          </button>
          <button
            type="button"
            @click="$emit('confirm')"
            :disabled="isLoading"
            :class="[
              'px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50',
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#5A1C2A] hover:bg-[#6D2233] text-[#E5C378] border border-[#E5C378]/30',
            ]"
          >
            <Loader2 v-if="isLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ confirmLabel || 'Confirm' }}</span>
          </button>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X, AlertTriangle, LogOut, Loader2 } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'burgundy';
  isLoading?: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
  (e: 'cancel'): void;
  (e: 'confirm'): void;
}>();
</script>
