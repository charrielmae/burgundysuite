<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    <!-- 1. Total Revenue -->
    <div
      class="p-6 rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl flex flex-col justify-between hover:border-[#E5C378]/50 transition-all duration-300"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-[#E5C378] uppercase tracking-wider">
          Total Revenue
        </span>
        <div
          class="w-8 h-8 rounded-full bg-[#240A10] border border-[#5A1C2A] flex items-center justify-center text-[#E5C378] font-bold text-sm shadow-xs"
        >
          ₱
        </div>
      </div>
      <div>
        <div class="font-serif text-3xl font-bold text-white tracking-tight">
          ₱{{ Number(kpis.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
        </div>
        <div class="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1.5">
          <TrendingUp class="w-3.5 h-3.5" />
          <span>{{ kpis.weekly_revenue_delta }}</span>
        </div>
      </div>
    </div>

    <!-- 2. Occupancy Rate -->
    <div
      class="p-6 rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl flex flex-col justify-between hover:border-[#E5C378]/50 transition-all duration-300"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-[#E5C378] uppercase tracking-wider">
          Occupancy Rate
        </span>
        <div
          class="w-8 h-8 rounded-full bg-[#240A10] border border-[#5A1C2A] flex items-center justify-center text-[#E5C378] shadow-xs"
        >
          <Percent class="w-4 h-4" />
        </div>
      </div>
      <div>
        <div class="font-serif text-3xl font-bold text-white tracking-tight">
          {{ kpis.occupancy_rate_percent }}%
        </div>
        <div class="text-xs text-white/60 mt-1.5 font-medium">
          {{ kpis.occupied_rooms_count }} / {{ kpis.total_rooms_count }} Rooms Occupied
        </div>
      </div>
    </div>

    <!-- 3. Pending Checkouts Today -->
    <div
      class="p-6 rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl flex flex-col justify-between hover:border-rose-400/50 transition-all duration-300 relative overflow-hidden"
    >
      <div
        v-if="kpis.pending_checkouts_today_count > 0"
        class="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-xl pointer-events-none"
      />
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-[#E5C378] uppercase tracking-wider">
          Pending Checkouts Today
        </span>
        <div
          class="w-8 h-8 rounded-full bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-300 shadow-xs"
        >
          <Bell class="w-4 h-4" />
        </div>
      </div>
      <div>
        <div class="font-serif text-3xl font-bold text-rose-400 tracking-tight">
          {{ kpis.pending_checkouts_today_count }}
        </div>
        <div class="text-xs text-rose-300/80 mt-1.5 font-medium">
          Requires Front Desk clearance
        </div>
      </div>
    </div>

    <!-- 4. Avg Stay Duration -->
    <div
      class="p-6 rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl flex flex-col justify-between hover:border-[#E5C378]/50 transition-all duration-300"
    >
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-semibold text-[#E5C378] uppercase tracking-wider">
          Avg Stay Duration
        </span>
        <div
          class="w-8 h-8 rounded-full bg-[#240A10] border border-[#5A1C2A] flex items-center justify-center text-[#E5C378] shadow-xs"
        >
          <Clock class="w-4 h-4" />
        </div>
      </div>
      <div>
        <div class="font-serif text-3xl font-bold text-white tracking-tight">
          {{ kpis.avg_stay_duration_nights }}
          <span class="text-xl font-normal text-white/60">Nights</span>
        </div>
        <div class="text-xs text-white/60 mt-1.5 font-medium">Based on active logs</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Percent, Bell, Clock, TrendingUp } from 'lucide-vue-next';

defineProps<{
  kpis: any;
}>();
</script>
