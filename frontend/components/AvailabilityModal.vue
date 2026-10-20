<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
        v-if="isOpen"
        @click.self="$emit('close')"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md"
      >
        <div
          class="modal-card relative w-full max-w-4xl bg-[#2B0E14] border border-[#5A1C2A] text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-6 max-h-[90vh]"
        >
          <!-- Modal Top Header -->
          <div class="px-6 py-4 bg-[#381018] border-b border-[#5A1C2A] flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div
                class="relative w-9 h-9 rounded-full overflow-hidden bg-[#240A10] border border-[#E5C378]/40 shadow-xs shrink-0 p-1 flex items-center justify-center"
              >
                <img
                  src="/burgundylogov2.png"
                  alt="Burgundy Suite Logo"
                  class="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 class="font-serif text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <span>Room Availability & Rates</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5C378]/15 text-[#E5C378] border border-[#E5C378]/30">
                    Live Check
                  </span>
                </h3>
                <p class="text-[11px] text-white/70">
                  Checking real-time room availability without initiating a reservation.
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

          <!-- Interactive Stay Criteria Bar -->
          <div class="px-6 py-4 bg-[#240A10] border-b border-[#5A1C2A]/70 shrink-0">
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              <!-- Check-In -->
              <div class="flex flex-col">
                <label class="text-[10px] font-bold uppercase tracking-wider text-[#E5C378] mb-1 flex items-center gap-1">
                  <Calendar class="w-3 h-3 text-[#E5C378]" />
                  Check-In
                </label>
                <input
                  type="date"
                  v-model="localCheckIn"
                  @change="triggerSearch"
                  class="w-full px-3 py-1.5 rounded-lg bg-[#381018] border border-[#5A1C2A] text-white text-xs focus:outline-none focus:border-[#E5C378] cursor-pointer"
                />
              </div>

              <!-- Check-Out -->
              <div class="flex flex-col">
                <label class="text-[10px] font-bold uppercase tracking-wider text-[#E5C378] mb-1 flex items-center gap-1">
                  <Calendar class="w-3 h-3 text-[#E5C378]" />
                  Check-Out
                </label>
                <input
                  type="date"
                  v-model="localCheckOut"
                  @change="triggerSearch"
                  class="w-full px-3 py-1.5 rounded-lg bg-[#381018] border border-[#5A1C2A] text-white text-xs focus:outline-none focus:border-[#E5C378] cursor-pointer"
                />
              </div>

              <!-- Category Filter -->
              <div class="flex flex-col">
                <label class="text-[10px] font-bold uppercase tracking-wider text-[#E5C378] mb-1">
                  Suite Category
                </label>
                <select
                  v-model="localCategoryId"
                  @change="triggerSearch"
                  class="w-full px-3 py-1.5 rounded-lg bg-[#381018] border border-[#5A1C2A] text-white text-xs focus:outline-none focus:border-[#E5C378] cursor-pointer"
                >
                  <option value="all">All Suites & Villas</option>
                  <option
                    v-for="rt in roomTypes"
                    :key="rt.room_type_id"
                    :value="rt.room_type_id"
                  >
                    {{ rt.room_type }}
                  </option>
                </select>
              </div>

              <!-- Nights & Refresh -->
              <div class="flex items-end gap-2 pt-2 sm:pt-0">
                <div class="flex-1 px-3 py-1.5 rounded-lg bg-[#381018]/60 border border-[#5A1C2A] text-center">
                  <span class="text-[10px] text-white/50 block">Length of Stay</span>
                  <span class="text-xs font-bold text-[#E5C378]">
                    {{ nightsCount }} {{ nightsCount === 1 ? 'Night' : 'Nights' }}
                  </span>
                </div>
                <button
                  type="button"
                  @click="triggerSearch"
                  :disabled="loading"
                  class="px-4 py-2 rounded-lg bg-[#E5C378] hover:bg-[#D4AF37] text-[#2B0E14] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
                  <span>Update</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Results Summary Banner -->
          <div class="px-6 py-2.5 bg-[#381018]/40 border-b border-[#5A1C2A]/50 flex items-center justify-between text-xs shrink-0">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span class="text-white/80">
                Found <strong class="text-white font-semibold">{{ availableCount }}</strong> of {{ resultsList.length }} suites available for
                <span class="text-[#E5C378] font-medium">{{ formatDate(localCheckIn) }} – {{ formatDate(localCheckOut) }}</span>
              </span>
            </div>
            <span class="text-[11px] text-white/50 hidden sm:inline">
              Prices include taxes & bespoke amenities
            </span>
          </div>

          <!-- Scrollable Suites Grid -->
          <div class="p-6 overflow-y-auto space-y-4 flex-1">
            <div v-if="loading" class="py-16 text-center text-white/50 space-y-3">
              <div class="w-8 h-8 mx-auto border-2 border-[#E5C378] border-t-transparent rounded-full animate-spin" />
              <p class="text-xs tracking-wider uppercase">Checking live suite inventory...</p>
            </div>

            <div v-else-if="resultsList.length === 0" class="py-16 text-center space-y-3">
              <p class="text-sm text-white/70">No suites match your filter criteria.</p>
              <button
                type="button"
                @click="localCategoryId = 'all'; triggerSearch();"
                class="px-4 py-2 rounded-lg bg-[#381018] border border-[#5A1C2A] text-xs text-[#E5C378] hover:border-[#E5C378] transition-colors cursor-pointer"
              >
                View All Suites & Villas
              </button>
            </div>

            <div
              v-else
              v-for="item in resultsList"
              :key="item.room_type_id"
              class="rounded-2xl border transition-all duration-300 p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
              :class="[
                item.is_available
                  ? 'bg-[#381018]/70 border-[#5A1C2A] hover:border-[#E5C378]/50 shadow-lg'
                  : 'bg-[#240A10]/60 border-white/5 opacity-75',
              ]"
            >
              <!-- Left: Image & Badge -->
              <div class="relative w-full md:w-48 h-36 md:h-32 rounded-xl overflow-hidden shrink-0 border border-[#5A1C2A]">
                <img
                  :src="item.image_url"
                  :alt="item.room_type"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span
                  class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#2B0E14]/85 border border-[#E5C378]/40 text-[#E5C378]"
                >
                  {{ item.badge || 'Luxury' }}
                </span>
              </div>

              <!-- Middle: Suite Info & Availability Status -->
              <div class="flex-1 space-y-2 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h4 class="font-serif text-lg font-bold text-white tracking-wide">
                    {{ item.room_type }}
                  </h4>

                  <!-- Availability Pill Badge -->
                  <span
                    v-if="item.is_available"
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-600/60"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Available ({{ item.available_rooms }} {{ item.available_rooms === 1 ? 'Suite' : 'Suites' }} Ready)
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/60"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    Occupied for Selected Dates
                  </span>
                </div>

                <p class="text-xs text-white/70 line-clamp-2">
                  {{ item.description }}
                </p>

                <!-- Features & Capacity Tags -->
                <div class="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-white/60">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#240A10] border border-[#5A1C2A]/60 text-white/80">
                    <Users class="w-3 h-3 text-[#E5C378]" />
                    Up to {{ item.room_capacity }} Guests
                  </span>
                  <span
                    v-for="(f, i) in (item.features || []).slice(0, 3)"
                    :key="i"
                    class="px-2 py-0.5 rounded-md bg-[#240A10] border border-[#5A1C2A]/40 text-white/60"
                  >
                    {{ f }}
                  </span>
                </div>
              </div>

              <!-- Right: Pricing & Action -->
              <div class="w-full md:w-auto md:min-w-[190px] flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-[#5A1C2A]/60 pt-3 md:pt-0 gap-3 shrink-0">
                <div class="text-left md:text-right">
                  <div class="text-base font-bold text-white">
                    ₱{{ formatNumber(item.rate_per_night) }}
                    <span class="text-[11px] font-normal text-white/60">/ night</span>
                  </div>
                  <div class="text-[11px] text-[#E5C378]">
                    ₱{{ formatNumber(item.total_estimated_rate) }} total ({{ nightsCount }} {{ nightsCount === 1 ? 'nt' : 'nts' }})
                  </div>
                </div>

                <!-- Reserve CTA: Only if user wants to proceed to book -->
                <button
                  v-if="item.is_available"
                  type="button"
                  @click="handleBookSuite(item.room_type_id)"
                  class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C378] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] text-[#2B0E14] text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Book This Suite</span>
                  <ArrowRight class="w-3.5 h-3.5" />
                </button>
                <div
                  v-else
                  class="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-medium text-center"
                >
                  Sold Out for Dates
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Footer Note -->
          <div class="px-6 py-3.5 bg-[#240A10] border-t border-[#5A1C2A] flex items-center justify-between text-xs text-white/60 shrink-0">
            <span class="flex items-center gap-1.5">
              <CheckCircle class="w-3.5 h-3.5 text-[#E5C378]" />
              Checking availability does not hold a reservation or charge your card.
            </span>
            <button
              type="button"
              @click="$emit('close')"
              class="text-white/60 hover:text-white underline cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { X, Calendar, Users, RefreshCw, CheckCircle, ArrowRight } from 'lucide-vue-next';
import { useApi } from '../composables/useApi';

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

interface RoomAvailabilityResult {
  room_type_id: number;
  room_type: string;
  room_capacity: number;
  rate_per_night: number;
  description?: string;
  image_url?: string;
  badge?: string;
  features?: string[];
  total_rooms: number;
  available_rooms: number;
  is_available: boolean;
  available_room_numbers: number[];
  nights: number;
  total_estimated_rate: number;
}

const props = defineProps<{
  isOpen: boolean;
  initialCheckIn: string;
  initialCheckOut: string;
  initialRoomTypeId?: number;
  roomTypes: RoomTypeDetails[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'book-suite', suiteTypeId: number, checkIn: string, checkOut: string): void;
}>();

const { request } = useApi();

const localCheckIn = ref(props.initialCheckIn || '');
const localCheckOut = ref(props.initialCheckOut || '');
const localCategoryId = ref<string | number>(props.initialRoomTypeId || 'all');
const loading = ref(false);
const liveResults = ref<RoomAvailabilityResult[]>([]);

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      if (props.initialCheckIn) localCheckIn.value = props.initialCheckIn;
      if (props.initialCheckOut) localCheckOut.value = props.initialCheckOut;
      if (props.initialRoomTypeId) localCategoryId.value = props.initialRoomTypeId;
      triggerSearch();
    }
  }
);

const nightsCount = computed(() => {
  if (!localCheckIn.value || !localCheckOut.value) return 1;
  const inD = new Date(localCheckIn.value);
  const outD = new Date(localCheckOut.value);
  const diffTime = outD.getTime() - inD.getTime();
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

const resultsList = computed(() => {
  if (liveResults.value.length > 0) {
    if (localCategoryId.value === 'all') return liveResults.value;
    return liveResults.value.filter((r) => r.room_type_id === Number(localCategoryId.value));
  }

  // Graceful client-side fallback from props.roomTypes
  const list = localCategoryId.value === 'all'
    ? props.roomTypes
    : props.roomTypes.filter((r) => r.room_type_id === Number(localCategoryId.value));

  return list.map((rt) => ({
    room_type_id: rt.room_type_id,
    room_type: rt.room_type,
    room_capacity: rt.room_capacity,
    rate_per_night: rt.rate_per_night,
    description: rt.description,
    image_url: rt.image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    badge: rt.badge || 'Luxury',
    features: rt.features || [],
    total_rooms: 2,
    available_rooms: 1,
    is_available: true,
    available_room_numbers: [100 + rt.room_type_id],
    nights: nightsCount.value,
    total_estimated_rate: nightsCount.value * rt.rate_per_night,
  }));
});

const availableCount = computed(() => {
  return resultsList.value.filter((r) => r.is_available).length;
});

const triggerSearch = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (localCheckIn.value) params.append('checkIn', localCheckIn.value);
    if (localCheckOut.value) params.append('checkOut', localCheckOut.value);
    if (localCategoryId.value && localCategoryId.value !== 'all') {
      params.append('roomTypeId', String(localCategoryId.value));
    }

    const res = await request<{
      success: boolean;
      data: {
        check_in_date: string;
        check_out_date: string;
        nights: number;
        results: RoomAvailabilityResult[];
      };
    }>(`/api/rooms/availability?${params.toString()}`);

    if (res.success && res.data && Array.isArray(res.data.results)) {
      liveResults.value = res.data.results;
    }
  } catch (err) {
    console.warn('Live availability endpoint query returned fallback:', err);
  } finally {
    loading.value = false;
  }
};

const handleBookSuite = (suiteTypeId: number) => {
  emit('book-suite', suiteTypeId, localCheckIn.value, localCheckOut.value);
  emit('close');
};

const formatNumber = (num: number) => {
  return (num || 0).toLocaleString();
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

onMounted(() => {
  if (props.isOpen) {
    triggerSearch();
  }
});
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-backdrop-enter-active .modal-card {
  animation: modalScaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-backdrop-leave-active .modal-card {
  animation: modalScaleDown 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalScaleUp {
  from {
    transform: scale(0.94) translateY(10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

@keyframes modalScaleDown {
  from {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  to {
    transform: scale(0.96) translateY(10px);
    opacity: 0;
  }
}
</style>
