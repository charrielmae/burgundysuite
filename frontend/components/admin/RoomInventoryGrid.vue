<template>
  <div class="space-y-6">
    <!-- Title & Filter Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="font-serif text-2xl font-bold text-white tracking-wide">
          Room Inventory & Live Availability
        </h3>
        <p class="text-xs text-white/60 mt-1">
          Real-time occupancy status across all retreat wings and floors
        </p>
      </div>

      <!-- Right: Tab Filters & Add Suite Button -->
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center p-1 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs">
          <button
            type="button"
            @click="filter = 'all'"
            :class="[
              'px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
              filter === 'all'
                ? 'bg-[#5A1C2A] text-[#E5C378] font-bold shadow-md'
                : 'text-white/70 hover:text-white',
            ]"
          >
            All ({{ rooms.length }})
          </button>
          <button
            type="button"
            @click="filter = 'available'"
            :class="[
              'px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
              filter === 'available'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold shadow-md'
                : 'text-white/70 hover:text-white',
            ]"
          >
            Available ({{ availableCount }})
          </button>
          <button
            type="button"
            @click="filter = 'occupied'"
            :class="[
              'px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
              filter === 'occupied'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold shadow-md'
                : 'text-white/70 hover:text-white',
            ]"
          >
            Occupied ({{ occupiedCount }})
          </button>
          <button
            type="button"
            @click="filter = 'maintenance'"
            :class="[
              'px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
              filter === 'maintenance'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold shadow-md'
                : 'text-white/70 hover:text-white',
            ]"
          >
            Maintenance ({{ maintenanceCount }})
          </button>
        </div>

        <button
          type="button"
          @click="$emit('open-add-suite')"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5A1C2A] hover:bg-[#6D2233] text-[#E5C378] border border-[#E5C378]/30 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus class="w-3.5 h-3.5 text-[#E5C378]" />
          <span>Add Suite</span>
        </button>
      </div>
    </div>

    <!-- Grid of Room Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="room in filteredRooms"
        :key="room.room_id"
        :class="[
          'p-5 rounded-2xl bg-[#381018]/90 border transition-all duration-300 shadow-xl flex flex-col justify-between',
          room.room_status === 'occupied'
            ? 'border-rose-900/60 hover:border-rose-500/50'
            : room.room_status === 'available'
            ? 'border-emerald-900/60 hover:border-emerald-500/50'
            : 'border-amber-900/60 hover:border-amber-500/50',
        ]"
      >
        <!-- Card Header: Room # and Status Badge -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2.5">
            <div
              class="w-10 h-10 rounded-xl bg-[#240A10] border border-[#5A1C2A] flex items-center justify-center font-serif font-bold text-[#E5C378] text-base shadow-xs"
            >
              {{ room.room_number }}
            </div>
            <div>
              <h4 class="font-serif font-bold text-base text-white">Room {{ room.room_number }}</h4>
              <span class="text-[11px] text-white/50 flex items-center gap-1 font-medium">
                <Layers class="w-3 h-3 text-[#E5C378]/70" />
                Floor {{ room.floor_number }}
              </span>
            </div>
          </div>

          <div>
            <span
              v-if="room.room_status === 'available'"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
            >
              <CheckCircle class="w-3 h-3" />
              <span>Available</span>
            </span>
            <span
              v-else-if="room.room_status === 'occupied'"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-xs"
            >
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Occupied</span>
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/40"
            >
              <Wrench class="w-3 h-3" />
              <span>Maintenance</span>
            </span>
          </div>
        </div>

        <!-- Suite Information -->
        <div class="py-3 border-y border-[#5A1C2A]/70 space-y-2 text-xs">
          <div class="flex justify-between">
            <span class="text-white/60">Category:</span>
            <span class="font-semibold text-white">{{ room.room_type }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">Max Capacity:</span>
            <span class="text-white/80">{{ room.room_capacity }} Guests</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/60">Nightly Rate:</span>
            <span class="font-bold text-[#E5C378]">₱{{ Number(room.rate_per_night).toLocaleString() }} / night</span>
          </div>
        </div>

        <!-- Status Switcher Control -->
        <div class="pt-4 flex items-center justify-between gap-3">
          <span class="text-[11px] text-white/50 uppercase tracking-wider font-semibold">
            Change Status:
          </span>
          <select
            :disabled="updatingId === room.room_id"
            :value="room.room_status"
            @change="handleStatusChange(room.room_id, ($event.target as HTMLSelectElement).value)"
            class="px-3 py-1.5 rounded-lg bg-[#240A10] border border-[#5A1C2A] text-white text-xs font-medium focus:outline-none focus:border-[#E5C378] cursor-pointer disabled:opacity-50"
          >
            <option value="available" class="bg-[#240A10] text-white">Set Available</option>
            <option value="occupied" class="bg-[#240A10] text-white">Set Occupied</option>
            <option value="maintenance" class="bg-[#240A10] text-white">Set Maintenance</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Layers, CheckCircle, Wrench, Plus } from 'lucide-vue-next';

const props = defineProps<{
  rooms: any[];
}>();

const emit = defineEmits<{
  (e: 'status-change', roomId: number, status: string): void;
  (e: 'open-add-suite'): void;
}>();

const filter = ref<'all' | 'available' | 'occupied' | 'maintenance'>('all');
const updatingId = ref<number | null>(null);

const filteredRooms = computed(() => {
  if (filter.value === 'all') return props.rooms;
  return props.rooms.filter((r) => r.room_status === filter.value);
});

const availableCount = computed(() => props.rooms.filter((r) => r.room_status === 'available').length);
const occupiedCount = computed(() => props.rooms.filter((r) => r.room_status === 'occupied').length);
const maintenanceCount = computed(() => props.rooms.filter((r) => r.room_status === 'maintenance').length);

const handleStatusChange = async (roomId: number, status: string) => {
  updatingId.value = roomId;
  try {
    emit('status-change', roomId, status);
  } finally {
    updatingId.value = null;
  }
};
</script>
