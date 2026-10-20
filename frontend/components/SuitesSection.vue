<template>
  <section id="suites" class="py-24 bg-white text-[#1C1917] relative scroll-mt-20 transition-all duration-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="text-xs font-bold tracking-[0.25em] text-[#742537] uppercase block mb-3">
          Accommodations
        </span>
        <h2 class="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#2B0E14] mb-4">
          Curated Suites & Private Havens
        </h2>
        <p class="text-sm sm:text-base text-[#5C4047] font-light leading-relaxed">
          Directly mapped from our database. Each room type offers meticulously crafted interiors,
          king plush bedding, and high-speed fiber connectivity.
        </p>
      </div>

      <!-- Horizontal Sliding Carousel Viewport -->
      <div class="overflow-hidden w-full py-4">
        <div
          class="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
          :style="{
            gap: '2.5rem',
            transform: `translateX(calc(-${(currentPage - 1) * 100}% - ${(currentPage - 1) * 2.5}rem))`,
          }"
        >
          <div
            v-for="(_, pageIdx) in totalPages"
            :key="pageIdx"
            class="w-full shrink-0 px-1"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
              <div
                v-for="suite in roomTypes.slice(pageIdx * ITEMS_PER_PAGE, (pageIdx + 1) * ITEMS_PER_PAGE)"
                :key="suite.room_type_id"
                class="group bg-white rounded-2xl overflow-hidden border border-[#5A1C2A]/15 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <!-- Photo Plate with Capacity Badge -->
                <div class="relative aspect-[4/3] overflow-hidden bg-[#2B0E14]">
                  <img
                    :src="suite.image_url"
                    :alt="suite.room_type"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <!-- Capacity Pill -->
                  <div
                    class="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#2B0E14]/80 backdrop-blur-md border border-[#E5C378]/30 text-[#E5C378] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm"
                  >
                    <Users class="w-3 h-3 text-[#E5C378]" />
                    <span>Up to {{ suite.room_capacity }} Guests</span>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      class="font-serif text-xl font-bold text-[#2B0E14] mb-2 group-hover:text-[#742537] transition-colors"
                    >
                      {{ suite.room_type }}
                    </h3>
                    <p class="text-xs text-[#5C4047] leading-relaxed mb-4 line-clamp-3">
                      {{ suite.description }}
                    </p>

                    <!-- Highlights / Features list -->
                    <div
                      v-if="suite.features && suite.features.length > 0"
                      class="space-y-1.5 mb-5 pt-3 border-t border-[#5A1C2A]/10"
                    >
                      <div
                        v-for="(f, i) in suite.features.slice(0, 3)"
                        :key="i"
                        class="flex items-center gap-2 text-[11px] text-[#5C4047]"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                        <span>{{ f }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Price and Book Suite Button -->
                  <div class="pt-4 border-t border-[#5A1C2A]/10 flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="text-[10px] text-[#5C4047] uppercase tracking-wider font-semibold">
                        Starting from
                      </span>
                      <div class="flex items-baseline gap-1">
                        <span class="font-serif text-xl sm:text-2xl font-bold text-[#742537]">
                          ₱{{ suite.rate_per_night }}
                        </span>
                        <span class="text-[11px] text-[#5C4047]">/ night</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="$emit('book-suite', suite.room_type_id)"
                      class="px-4 py-2.5 rounded-xl bg-[#2B0E14] text-[#E5C378] text-xs font-bold tracking-wider uppercase hover:bg-[#4A1521] hover:text-white transition-all duration-200 flex items-center gap-1.5 shadow hover:shadow-lg cursor-pointer"
                    >
                      <span>Book Suite</span>
                      <ArrowRight class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Luxury Pagination Bar -->
      <div
        v-if="totalPages > 1"
        class="mt-12 pt-8 border-t border-[#5A1C2A]/10 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div class="text-xs text-[#5C4047] font-medium tracking-wide">
          Showing
          <span class="font-bold text-[#742537]">
            {{ startIndex + 1 }}–{{ Math.min(startIndex + ITEMS_PER_PAGE, roomTypes.length) }}
          </span>
          of <span class="font-bold text-[#742537]">{{ roomTypes.length }}</span> curated
          accommodations
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#5A1C2A]/20 bg-white text-xs font-bold text-[#2B0E14] hover:border-[#742537] hover:text-[#742537] hover:bg-[#742537]/5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ChevronLeft class="w-3.5 h-3.5 text-[#742537]" />
            <span class="hidden sm:inline">Previous</span>
          </button>

          <div class="flex items-center gap-1.5 px-1">
            <button
              v-for="page in totalPages"
              :key="page"
              type="button"
              @click="currentPage = page"
              :class="[
                'w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center active:scale-95',
                currentPage === page
                  ? 'bg-[#742537] text-white shadow-md scale-105'
                  : 'bg-white border border-[#5A1C2A]/15 text-[#5C4047] hover:border-[#742537] hover:text-[#742537] hover:bg-[#742537]/5',
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            type="button"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#5A1C2A]/20 bg-white text-xs font-bold text-[#2B0E14] hover:border-[#742537] hover:text-[#742537] hover:bg-[#742537]/5 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span class="hidden sm:inline">Next</span>
            <ChevronRight class="w-3.5 h-3.5 text-[#742537]" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Users, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-vue-next';

interface RoomTypeDetails {
  room_type_id: number;
  room_type: string;
  room_capacity: number;
  rate_per_night: number;
  description?: string;
  image_url?: string;
  badge?: string;
  features?: string[];
}

const props = defineProps<{
  roomTypes: RoomTypeDetails[];
}>();

defineEmits<{
  (e: 'book-suite', roomTypeId: number): void;
}>();

const ITEMS_PER_PAGE = 4;
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(props.roomTypes.length / ITEMS_PER_PAGE));
const startIndex = computed(() => (currentPage.value - 1) * ITEMS_PER_PAGE);

watch(
  () => props.roomTypes.length,
  () => {
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value;
    }
  }
);
</script>
