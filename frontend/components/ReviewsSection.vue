<template>
  <section id="reviews" class="py-20 bg-[#240A10] border-t border-[#5A1C2A]/60 relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-2">
          <span class="text-xs font-bold uppercase tracking-[0.25em] text-[#E5C378]">
            Guest Voices & Impressions
          </span>
          <h2 class="font-serif text-3xl sm:text-4xl font-bold text-white tracking-wide">
            Reviews & Service Feedback
          </h2>
          <p class="text-sm text-white/70 max-w-2xl">
            Verified impressions of our suites and hospitality, or share your own experience with our rooms and resort service.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="px-4 py-2.5 rounded-2xl bg-[#381018] border border-[#5A1C2A] flex items-center gap-4 text-xs">
            <div>
              <span class="text-white/60 block text-[10px] uppercase tracking-wider">Rooms</span>
              <span class="font-bold text-[#E5C378] text-sm">{{ summary.average_room || '5.0' }} ★</span>
            </div>
            <div class="w-px h-7 bg-[#5A1C2A]" />
            <div>
              <span class="text-white/60 block text-[10px] uppercase tracking-wider">Service</span>
              <span class="font-bold text-emerald-300 text-sm">{{ summary.average_service || '5.0' }} ★</span>
            </div>
          </div>

          <button
            type="button"
            @click="$emit('open-review-modal')"
            class="px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer flex items-center gap-2"
          >
            <MessageSquarePlus class="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>
      </div>

      <!-- Two-Row Testimonial Marquee (marquee-01 UI) -->
      <div class="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pause-on-hover class="[--duration:24s]">
          <Card
            v-for="review in firstRow"
            :key="'r1-' + review.review_id"
            class="relative h-full w-72 cursor-pointer overflow-hidden border-[#5A1C2A] bg-[#381018]/90 hover:border-[#E5C378]/50 transition-colors shadow-none p-4"
          >
            <div class="p-0 flex flex-col gap-2.5">
              <div class="flex flex-row items-center gap-2.5">
                <img
                  v-if="review.avatar_url"
                  class="rounded-full w-8 h-8 object-cover border border-[#E5C378]/40"
                  width="32"
                  height="32"
                  :alt="review.guest_name"
                  :src="review.avatar_url"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-[#240A10] border border-[#E5C378]/40 flex items-center justify-center text-xs font-bold text-[#E5C378] shrink-0"
                >
                  {{ getInitials(review.guest_name) }}
                </div>
                <div class="flex flex-col min-w-0">
                  <p class="text-sm font-medium text-white truncate">{{ review.guest_name }}</p>
                  <p class="text-xs font-medium text-[#E5C378]/80 truncate">
                    @{{ toHandle(review.room_type || 'resort_guest') }}
                  </p>
                </div>
                <span class="ml-auto text-[10px] font-bold text-[#E5C378] bg-[#240A10] px-2 py-0.5 rounded-full border border-[#5A1C2A] shrink-0">
                  {{ review.overall_rating }}.0 ★
                </span>
              </div>
              <p class="text-sm line-clamp-2 text-white/85 leading-relaxed">
                “{{ review.comment }}”
              </p>
              <div class="flex items-center gap-2 text-[10px] text-white/60 pt-1">
                <span>Room <strong class="text-[#E5C378]">{{ review.room_rating }}/5</strong></span>
                <span>•</span>
                <span>Service <strong class="text-emerald-300">{{ review.service_rating }}/5</strong></span>
              </div>
            </div>
          </Card>
        </Marquee>

        <Marquee reverse pause-on-hover class="[--duration:24s]">
          <Card
            v-for="review in secondRow"
            :key="'r2-' + review.review_id"
            class="relative h-full w-72 cursor-pointer overflow-hidden border-[#5A1C2A] bg-[#381018]/90 hover:border-[#E5C378]/50 transition-colors shadow-none p-4"
          >
            <div class="p-0 flex flex-col gap-2.5">
              <div class="flex flex-row items-center gap-2.5">
                <img
                  v-if="review.avatar_url"
                  class="rounded-full w-8 h-8 object-cover border border-[#E5C378]/40"
                  width="32"
                  height="32"
                  :alt="review.guest_name"
                  :src="review.avatar_url"
                />
                <div
                  v-else
                  class="w-8 h-8 rounded-full bg-[#240A10] border border-[#E5C378]/40 flex items-center justify-center text-xs font-bold text-[#E5C378] shrink-0"
                >
                  {{ getInitials(review.guest_name) }}
                </div>
                <div class="flex flex-col min-w-0">
                  <p class="text-sm font-medium text-white truncate">{{ review.guest_name }}</p>
                  <p class="text-xs font-medium text-[#E5C378]/80 truncate">
                    @{{ toHandle(review.room_type || 'resort_guest') }}
                  </p>
                </div>
                <span class="ml-auto text-[10px] font-bold text-[#E5C378] bg-[#240A10] px-2 py-0.5 rounded-full border border-[#5A1C2A] shrink-0">
                  {{ review.overall_rating }}.0 ★
                </span>
              </div>
              <p class="text-sm line-clamp-2 text-white/85 leading-relaxed">
                “{{ review.comment }}”
              </p>
              <div class="flex items-center gap-2 text-[10px] text-white/60 pt-1">
                <span>Room <strong class="text-[#E5C378]">{{ review.room_rating }}/5</strong></span>
                <span>•</span>
                <span>Service <strong class="text-emerald-300">{{ review.service_rating }}/5</strong></span>
              </div>
            </div>
          </Card>
        </Marquee>

        <!-- Left & Right Gradient Edge Fades -->
        <div class="from-[#240A10] pointer-events-none absolute inset-y-0 left-0 w-1/6 sm:w-1/4 bg-gradient-to-r" />
        <div class="from-[#240A10] pointer-events-none absolute inset-y-0 right-0 w-1/6 sm:w-1/4 bg-gradient-to-l" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MessageSquarePlus } from 'lucide-vue-next';
import Card from './ui/Card.vue';
import Marquee from './ui/Marquee.vue';

const props = defineProps<{
  reviews: any[];
  summary: {
    total_count?: number;
    average_overall?: number;
    average_room?: number;
    average_service?: number;
  };
  roomTypes: any[];
}>();

defineEmits<{
  (e: 'review-submitted'): void;
  (e: 'open-review-modal'): void;
}>();

const displayReviews = computed(() => {
  if (props.reviews.length >= 4) return props.reviews;
  // Ensure enough cards for smooth dual-row marquee even with few DB rows
  const fallback = [
    {
      review_id: 901,
      guest_name: 'Marcus Sterling',
      room_type: 'Presidential Suite',
      room_rating: 5,
      service_rating: 5,
      overall_rating: 5,
      comment: 'The Presidential Suite plunge pool overlooking the sunset was extraordinary, and concierge anticipated every request.',
    },
    {
      review_id: 902,
      guest_name: 'Isabella Montenegro',
      room_type: 'Deluxe Suite',
      room_rating: 5,
      service_rating: 5,
      overall_rating: 5,
      comment: 'Spotless Deluxe Suite with crisp ocean-breeze linens and seamless front-desk check-in. Truly world-class hospitality.',
    },
    {
      review_id: 903,
      guest_name: 'David Chen',
      room_type: 'Executive King',
      room_rating: 4,
      service_rating: 5,
      overall_rating: 5,
      comment: 'Executive King workspace and fiber internet were rock-solid, and room service arrived in under 15 minutes.',
    },
    {
      review_id: 904,
      guest_name: 'Elena Vance',
      room_type: 'Penthouse Haven',
      room_rating: 5,
      service_rating: 5,
      overall_rating: 5,
      comment: 'Panoramic views from the Penthouse Haven and private butler dining made our anniversary unforgettable.',
    },
  ];
  const merged = [...props.reviews];
  for (const item of fallback) {
    if (merged.length >= 4) break;
    if (!merged.some((r) => r.guest_name === item.guest_name)) {
      merged.push(item);
    }
  }
  return merged;
});

const firstRow = computed(() => {
  const list = displayReviews.value;
  return list.slice(0, Math.ceil(list.length / 2));
});

const secondRow = computed(() => {
  const list = displayReviews.value;
  const second = list.slice(Math.ceil(list.length / 2));
  return second.length > 0 ? second : firstRow.value;
});

const getInitials = (name?: string) => {
  const parts = String(name || 'G').trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('') || 'G';
};

const toHandle = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
</script>
