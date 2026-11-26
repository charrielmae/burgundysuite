<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
        v-if="isOpen"
        @click.self="$emit('close')"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md"
      >
        <div
          class="modal-card relative w-full max-w-lg bg-[#2B0E14] border border-[#E5C378]/40 text-white rounded-3xl shadow-2xl overflow-hidden my-8"
        >
          <!-- Header -->
          <div class="px-6 py-5 bg-[#381018] border-b border-[#5A1C2A] flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-[#240A10] border border-[#E5C378]/50 flex items-center justify-center text-[#E5C378]">
                <MessageSquareHeart class="w-4 h-4" />
              </div>
              <div>
                <h3 class="font-serif text-lg font-bold text-white tracking-wide">
                  Share Your Experience
                </h3>
                <p class="text-[11px] text-[#E5C378] tracking-wider uppercase font-semibold">
                  Rooms & Hospitality Feedback
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="$emit('close')"
              aria-label="Close review popup"
              class="w-8 h-8 rounded-full bg-[#2B0E14] hover:bg-[#5A1C2A] text-white/75 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5">
            <div
              v-if="submitSuccess"
              class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-semibold text-center space-y-2"
            >
              <p>{{ submitSuccess }}</p>
              <button
                type="button"
                @click="$emit('close')"
                class="px-4 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>

            <form v-else @submit.prevent="handleSubmit" class="space-y-4">
              <div v-if="submitError" class="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs">
                {{ submitError }}
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-[#E5C378] mb-1">Your Name</label>
                  <input
                    v-model="form.guest_name"
                    type="text"
                    required
                    placeholder="e.g. Sophia Alcaraz"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-[#E5C378] mb-1">Email Address</label>
                  <input
                    v-model="form.guest_email"
                    type="email"
                    required
                    placeholder="sophia@example.com"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-[#E5C378] mb-1">Suite / Room</label>
                  <select
                    v-model="form.room_type_id"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                  >
                    <option :value="null">General Resort Service</option>
                    <option v-for="rt in roomTypes" :key="rt.room_type_id" :value="rt.room_type_id">
                      {{ rt.room_type }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-[#E5C378] mb-1">Focus</label>
                  <select
                    v-model="form.target_type"
                    class="w-full px-3.5 py-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                  >
                    <option value="both">Room & Service</option>
                    <option value="room">Room & Suite</option>
                    <option value="service">Hospitality Service</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="p-3 rounded-xl bg-[#240A10] border border-[#5A1C2A] flex flex-col items-center gap-1.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-white/75">Room Rating</span>
                  <div class="flex items-center gap-1">
                    <button
                      v-for="n in 5"
                      :key="'pr-' + n"
                      type="button"
                      @click="form.room_rating = n"
                      class="cursor-pointer p-0.5"
                    >
                      <Star
                        :class="[
                          'w-4 h-4 transition-colors',
                          n <= form.room_rating ? 'text-[#E5C378] fill-[#E5C378]' : 'text-white/25',
                        ]"
                      />
                    </button>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-[#240A10] border border-[#5A1C2A] flex flex-col items-center gap-1.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-white/75">Service Rating</span>
                  <div class="flex items-center gap-1">
                    <button
                      v-for="n in 5"
                      :key="'ps-' + n"
                      type="button"
                      @click="form.service_rating = n"
                      class="cursor-pointer p-0.5"
                    >
                      <Star
                        :class="[
                          'w-4 h-4 transition-colors',
                          n <= form.service_rating ? 'text-emerald-400 fill-emerald-400' : 'text-white/25',
                        ]"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-[#E5C378] mb-1">Your Review</label>
                <textarea
                  v-model="form.comment"
                  rows="3"
                  required
                  placeholder="How was your stay, room comfort, or our concierge service?"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                />
              </div>

              <div class="flex items-center justify-between pt-2">
                <button
                  type="button"
                  @click="$emit('close')"
                  class="text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
                <button
                  type="submit"
                  :disabled="submitting"
                  class="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {{ submitting ? 'Sending...' : 'Send Review' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { X, Star, MessageSquareHeart } from 'lucide-vue-next';
import { useApi } from '../composables/useApi';

defineProps<{
  isOpen: boolean;
  roomTypes: any[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'review-submitted'): void;
}>();

const { request } = useApi();
const submitting = ref(false);
const submitSuccess = ref<string | null>(null);
const submitError = ref<string | null>(null);

const form = reactive({
  guest_name: '',
  guest_email: '',
  room_type_id: null as number | null,
  target_type: 'both' as 'room' | 'service' | 'both',
  room_rating: 5,
  service_rating: 5,
  comment: '',
});

const handleSubmit = async () => {
  submitting.value = true;
  submitSuccess.value = null;
  submitError.value = null;

  try {
    const res = await request<{ success: boolean; message: string }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    if (res.success) {
      submitSuccess.value = res.message || 'Thank you! Your review is now live.';
      form.comment = '';
      emit('review-submitted');
    }
  } catch (err: any) {
    submitError.value = err?.message || 'Could not submit review. Please try again.';
  } finally {
    submitting.value = false;
  }
};
</script>
