<template>
  <div class="p-6 sm:p-7 rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl">
    <!-- Title & Legend Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <div class="flex items-center gap-2">
          <BarChart3 class="w-5 h-5 text-[#E5C378]" />
          <h3 class="font-serif text-xl sm:text-2xl font-bold text-white">
            Weekly Performance & Revenue Report
          </h3>
        </div>
        <p class="text-xs text-white/60 mt-1">
          Comparative revenue breakdown and booking trends across current week
        </p>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-2 text-xs text-[#E5C378] font-semibold">
        <span class="w-3.5 h-3.5 rounded-sm bg-gradient-to-t from-[#741B2D] via-[#A62B44] to-[#E5C378]" />
        <span>Revenue (₱)</span>
      </div>
    </div>

    <!-- Chart Canvas -->
    <div class="relative pt-6 pb-2">
      <!-- Horizontal grid guide lines -->
      <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
        <div class="border-b border-[#5A1C2A] w-full" />
        <div class="border-b border-[#5A1C2A] w-full" />
        <div class="border-b border-[#5A1C2A] w-full" />
        <div class="border-b border-[#5A1C2A] w-full" />
      </div>

      <!-- Bar Columns Container -->
      <div class="relative h-64 sm:h-72 flex items-end justify-between gap-2 sm:gap-4 px-2">
        <div
          v-for="(item, idx) in data"
          :key="item.day"
          @mouseenter="hoveredIdx = idx"
          @mouseleave="hoveredIdx = null"
          class="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
        >
          <!-- Floating Tooltip -->
          <div
            v-if="hoveredIdx === idx"
            class="absolute -top-14 z-20 px-3.5 py-1.5 rounded-xl bg-[#240A10] border border-[#E5C378] text-white shadow-xl text-center pointer-events-none whitespace-nowrap"
          >
            <span class="block font-bold text-xs text-[#E5C378]">
              ₱{{ Number(item.revenue).toLocaleString() }}
            </span>
            <span class="text-[10px] text-white/70">
              {{ item.occupancy_pct }}% Occupancy ({{ item.label }})
            </span>
          </div>

          <!-- Burgundy to Gold Gradient Bar -->
          <div
            :style="{ height: `${Math.max(12, Math.round((item.revenue / maxRevenue) * 100))}%` }"
            :class="[
              'w-full max-w-[80px] rounded-t-xl transition-all duration-300 relative overflow-hidden',
              hoveredIdx === idx
                ? 'bg-gradient-to-t from-[#741B2D] via-[#A62B44] to-[#E5C378] shadow-md scale-[1.02]'
                : 'bg-gradient-to-t from-[#8E2238] via-[#A62B44] to-[#D4A359]',
            ]"
          >
            <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <!-- Day Label -->
          <span
            :class="[
              'mt-3 text-xs font-semibold transition-colors',
              hoveredIdx === idx ? 'text-[#E5C378]' : 'text-white/60',
            ]"
          >
            {{ item.day }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BarChart3 } from 'lucide-vue-next';

interface WeeklyDataPoint {
  day: string;
  revenue: number;
  occupancy_pct: number;
  label: string;
}

const props = defineProps<{
  data: WeeklyDataPoint[];
}>();

const hoveredIdx = ref<number | null>(null);

const maxRevenue = computed(() => {
  if (!props.data || props.data.length === 0) return 4000;
  return Math.max(...props.data.map((d) => d.revenue), 4000);
});
</script>
