<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
        v-if="isOpen"
        @click.self="$emit('close')"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
      >
        <div
          class="modal-card relative w-full max-w-xl bg-[#2B0E14] border border-[#5A1C2A] text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8"
        >
        <!-- Top Header -->
        <div class="px-6 py-5 bg-[#381018] border-b border-[#5A1C2A] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <BookmarkCheck class="w-5 h-5 text-[#E5C378]" />
            <div>
              <h3 class="font-serif text-lg font-bold text-white tracking-wide">
                Guest Booking Verification
              </h3>
              <p class="text-[11px] text-white/60">
                Verify your suite reservation with your registered email address.
              </p>
            </div>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="w-8 h-8 rounded-full bg-[#2B0E14] hover:bg-[#5A1C2A] text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6">
          <form @submit.prevent="handleSearch" class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">
                Your Booking Gmail / Email Address
              </label>
              <span class="text-[10px] text-white/50">No password required</span>
            </div>
            <div class="flex gap-2">
              <input
                type="email"
                required
                v-model="email"
                placeholder="e.g. marcus.sterling@monaco-holdings.co.uk"
                class="flex-1 px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
              <button
                type="submit"
                :disabled="loading"
                class="px-5 py-2.5 rounded-xl bg-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search class="w-4 h-4" />
                <span>{{ loading ? 'Verifying...' : 'Verify' }}</span>
              </button>
            </div>

            <!-- Quick Demo Links -->
            <div class="flex items-center gap-2 text-[11px] text-white/60 pt-1">
              <span>Quick verify:</span>
              <button
                type="button"
                @click="email = 'marcus.sterling@monaco-holdings.co.uk'"
                class="text-[#E5C378] underline hover:text-[#D4AF37] cursor-pointer"
              >
                Marcus Sterling
              </button>
              <span>•</span>
              <button
                type="button"
                @click="email = 'isabella.montenegro@ayala-alabang.ph'"
                class="text-[#E5C378] underline hover:text-[#D4AF37] cursor-pointer"
              >
                Isabella Montenegro
              </button>
            </div>
          </form>

          <div
            v-if="error"
            class="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs"
          >
            {{ error }}
          </div>

          <!-- Results List -->
          <div v-if="bookings" class="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <div class="flex items-center justify-between border-b border-[#5A1C2A] pb-2 text-xs text-white/70">
              <span>Found {{ bookings.length }} Reservation(s)</span>
            </div>

            <div v-if="bookings.length === 0" class="text-center py-8 text-white/50 text-xs">
              No active or past reservations found for this email address.
            </div>

            <div
              v-else
              v-for="b in bookings"
              :key="b.booking_id"
              class="p-4 rounded-2xl bg-[#381018] border border-[#5A1C2A] space-y-3"
            >
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-mono text-xs text-[#E5C378] font-bold">
                    #BSR-2026-{{ b.booking_id }}
                  </span>
                  <h4 class="font-serif font-bold text-base text-white mt-0.5">
                    {{ b.room_type?.room_type || 'Luxury Suite' }} — Room #{{ b.room?.room_number }}
                  </h4>
                </div>
                <span
                  :class="[
                    'text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full',
                    b.booking_status === 'checked-in'
                      ? 'bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/40'
                      : b.booking_status === 'completed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-zinc-800 text-zinc-300',
                  ]"
                >
                  {{ b.booking_status }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs text-white/70 pt-2 border-t border-[#5A1C2A]/60">
                <div>
                  <span class="block text-[10px] text-white/40 uppercase">Check-In</span>
                  <span>{{ b.check_in_date }}</span>
                </div>
                <div>
                  <span class="block text-[10px] text-white/40 uppercase">Check-Out</span>
                  <span>{{ b.check_out_date }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center pt-2 border-t border-[#5A1C2A]/60 text-xs">
                <span class="text-white/60">Total Paid:</span>
                <span class="font-bold text-sm text-[#E5C378]">
                  ₱{{ Number(b.total_amount).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { X, Search, BookmarkCheck } from 'lucide-vue-next';
import { useApi } from '../composables/useApi';

const props = defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const { request } = useApi();
const email = ref('');
const bookings = ref<any[] | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const handleSearch = async () => {
  if (!email.value.trim()) return;
  loading.value = true;
  error.value = null;

  try {
    const res = await request<{ success: boolean; data: any[] }>(
      `/api/bookings?email=${encodeURIComponent(email.value.trim())}`
    );
    bookings.value = (res.data || []).slice().sort((a, b) => Number(b.booking_id || 0) - Number(a.booking_id || 0));
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    loading.value = false;
  }
};
</script>
