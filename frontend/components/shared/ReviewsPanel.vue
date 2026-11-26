<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="font-serif text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
          <MessageSquareHeart class="w-6 h-6 text-[#E5C378]" />
          <span>Guest Reviews & Feedback</span>
        </h3>
        <p class="text-xs text-white/60 mt-1">
          Visible across Guest, Staff, and Admin portals • Rate rooms & resort service
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3 text-xs">
        <div class="px-3.5 py-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] flex items-center gap-2">
          <Star class="w-4 h-4 text-[#E5C378] fill-[#E5C378]" />
          <span class="text-white/70">Room Avg:</span>
          <span class="font-bold text-[#E5C378]">{{ summary.average_room || '—' }} / 5</span>
        </div>
        <div class="px-3.5 py-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-emerald-300" />
          <span class="text-white/70">Service Avg:</span>
          <span class="font-bold text-emerald-300">{{ summary.average_service || '—' }} / 5</span>
        </div>
        <div class="px-3.5 py-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white/80 font-semibold">
          {{ summary.total_count || reviews.length }} Reviews
        </div>
      </div>
    </div>

    <div v-if="reviews.length === 0" class="p-8 rounded-2xl bg-[#381018]/70 border border-[#5A1C2A] text-center text-sm text-white/60">
      No guest reviews have been submitted yet.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div
        v-for="rev in reviews"
        :key="rev.review_id"
        class="p-5 rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl flex flex-col justify-between space-y-4"
      >
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h4 class="font-serif font-bold text-base text-white">{{ rev.guest_name }}</h4>
              <p class="text-[11px] text-[#E5C378]/80 font-medium">
                {{ rev.room_type || 'Resort Service' }} • {{ formatDate(rev.created_at) }}
              </p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#240A10] text-[#E5C378] border border-[#E5C378]/30">
              {{ rev.target_type === 'both' ? 'Room & Service' : rev.target_type }}
            </span>
          </div>

          <div class="flex flex-wrap gap-3 text-[11px]">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#240A10] border border-[#5A1C2A] text-white/85">
              Room: <strong class="text-[#E5C378]">{{ rev.room_rating }}/5 ★</strong>
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#240A10] border border-[#5A1C2A] text-white/85">
              Service: <strong class="text-emerald-300">{{ rev.service_rating }}/5 ★</strong>
            </span>
          </div>

          <p class="text-sm text-white/85 leading-relaxed">
            "{{ rev.comment }}"
          </p>

          <div
            v-if="rev.staff_reply"
            class="p-3.5 rounded-xl bg-[#240A10]/90 border border-emerald-500/30 text-xs space-y-1"
          >
            <div class="text-emerald-300 font-bold flex items-center justify-between">
              <span>Response from {{ rev.replied_by || 'Resort Team' }}</span>
              <span v-if="rev.replied_at" class="text-[10px] text-white/40 font-normal">
                {{ formatDate(rev.replied_at) }}
              </span>
            </div>
            <p class="text-white/80">{{ rev.staff_reply }}</p>
          </div>
        </div>

        <!-- Staff/Admin Reply Form -->
        <div v-if="canReply" class="pt-3 border-t border-[#5A1C2A]/60">
          <div v-if="editingId === rev.review_id" class="space-y-2">
            <textarea
              v-model="replyDraft"
              rows="2"
              placeholder="Write a polite official response..."
              class="w-full p-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E5C378]"
            />
            <div class="flex items-center justify-end gap-2">
              <button
                type="button"
                @click="editingId = null; replyDraft = ''"
                class="px-3 py-1.5 rounded-lg text-[11px] text-white/60 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                :disabled="submitting || !replyDraft.trim()"
                @click="submitReply(rev.review_id)"
                class="px-3.5 py-1.5 rounded-lg bg-[#5A1C2A] hover:bg-[#6D2233] text-[#E5C378] border border-[#E5C378]/30 text-[11px] font-bold cursor-pointer disabled:opacity-50"
              >
                {{ submitting ? 'Posting...' : 'Post Reply' }}
              </button>
            </div>
          </div>
          <button
            v-else
            type="button"
            @click="startReply(rev)"
            class="text-xs font-semibold text-[#E5C378] hover:text-white transition-colors cursor-pointer"
          >
            {{ rev.staff_reply ? 'Edit Official Reply' : 'Reply to Guest →' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MessageSquareHeart, Star, Sparkles } from 'lucide-vue-next';

defineProps<{
  reviews: any[];
  summary: {
    total_count?: number;
    average_overall?: number;
    average_room?: number;
    average_service?: number;
  };
  canReply?: boolean;
}>();

const emit = defineEmits<{
  (e: 'reply', reviewId: number, replyText: string): Promise<void> | void;
}>();

const editingId = ref<number | null>(null);
const replyDraft = ref('');
const submitting = ref(false);

const startReply = (rev: any) => {
  editingId.value = rev.review_id;
  replyDraft.value = rev.staff_reply || '';
};

const submitReply = async (reviewId: number) => {
  if (!replyDraft.value.trim()) return;
  submitting.value = true;
  try {
    await emit('reply', reviewId, replyDraft.value.trim());
    editingId.value = null;
    replyDraft.value = '';
  } finally {
    submitting.value = false;
  }
};

const formatDate = (iso?: string) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
};
</script>
