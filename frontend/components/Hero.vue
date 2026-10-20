<template>
  <section
    id="home"
    class="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#2B0E14] scroll-mt-20 transition-all duration-500"
  >
    <!-- Background Photography with Warm Dusk Ambient Lighting -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
      style="background-image: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85');"
    />

    <!-- Atmospheric Maroon Vignette & Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-[#2B0E14]/90 via-[#381018]/75 to-[#2B0E14]" />

    <!-- Hero Content Container -->
    <div class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
      <!-- Subtitle Pill with Frosted Glass Blur -->
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E5C378]/30 bg-[#2B0E14]/75 backdrop-blur-md text-[#E5C378] text-xs font-semibold tracking-[0.25em] uppercase mb-8 shadow-md"
      >
        <Sparkles class="w-3.5 h-3.5 text-[#E5C378]" />
        <span>A Sanctuary of Coastal Opulence</span>
      </div>

      <!-- Main Title -->
      <h1 class="font-serif text-4xl sm:text-6xl md:text-7xl font-light text-white tracking-tight leading-[1.25] mb-6 overflow-visible">
        Experience Unmatched
        <span class="italic font-normal font-serif text-[#E5C378] gold-gradient-text tracking-normal drop-shadow-[0_2px_12px_rgba(212,175,55,0.3)] pr-4 pl-1 py-1">
          Elegance
        </span>
      </h1>

      <!-- Body Narrative -->
      <p class="max-w-3xl text-base sm:text-lg text-[#F5EFEB]/90 font-light leading-relaxed mb-12 drop-shadow">
        Welcome to <strong class="font-semibold text-white">Burgundy Suite</strong>, your premier smart booking platform designed to make finding and reserving your ideal stay effortless. We believe that booking accommodations should be as relaxing as the vacation itself.
      </p>

      <!-- Floating Availability Pill Card -->
      <form
        @submit.prevent="handleSubmit"
        class="w-full max-w-4xl bg-[#381018]/85 backdrop-blur-xl border border-[#5A1C2A] p-4 sm:p-5 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <!-- Check-In Date -->
        <div class="w-full sm:w-1/3 flex flex-col px-4 text-left border-b sm:border-b-0 sm:border-r border-[#5A1C2A]/60 pb-3 sm:pb-0">
          <label class="text-[10px] font-bold tracking-widest uppercase text-[#E5C378]/90 mb-1 flex items-center gap-1.5">
            <Calendar class="w-3 h-3 text-[#E5C378]" />
            Check-In Date
          </label>
          <input
            type="date"
            v-model="checkIn"
            class="bg-transparent text-white text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer"
          />
        </div>

        <!-- Check-Out Date -->
        <div class="w-full sm:w-1/3 flex flex-col px-4 text-left border-b sm:border-b-0 sm:border-r border-[#5A1C2A]/60 pb-3 sm:pb-0">
          <label class="text-[10px] font-bold tracking-widest uppercase text-[#E5C378]/90 mb-1 flex items-center gap-1.5">
            <Calendar class="w-3 h-3 text-[#E5C378]" />
            Check-Out Date
          </label>
          <input
            type="date"
            v-model="checkOut"
            class="bg-transparent text-white text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer"
          />
        </div>

        <!-- Suite Category Dropdown -->
        <div class="w-full sm:w-1/3 flex flex-col px-4 text-left pb-2 sm:pb-0">
          <label class="text-[10px] font-bold tracking-widest uppercase text-[#E5C378]/90 mb-1">
            Suite Category
          </label>
          <div class="relative">
            <select
              v-model="selectedCategory"
              class="w-full bg-transparent text-white text-sm font-medium focus:outline-none appearance-none pr-6 cursor-pointer"
            >
              <option value="all" class="bg-[#2B0E14] text-white">All Suites & Villas</option>
              <option
                v-for="rt in roomTypes"
                :key="rt.room_type_id"
                :value="rt.room_type_id"
                class="bg-[#2B0E14] text-white"
              >
                {{ rt.room_type }} (₱{{ rt.rate_per_night }}/nt)
              </option>
            </select>
            <ChevronDown class="w-3.5 h-3.5 text-[#E5C378] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <!-- Gold Action Button -->
        <button
          type="submit"
          class="w-full sm:w-auto px-7 py-3.5 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
        >
          <Search class="w-4 h-4" />
          <span>Check Availability</span>
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Calendar, ChevronDown, Sparkles } from 'lucide-vue-next';

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

const emit = defineEmits<{
  (e: 'search', checkIn: string, checkOut: string, roomTypeId?: number): void;
}>();

const checkIn = ref('2026-10-15');
const checkOut = ref('2026-10-18');
const selectedCategory = ref<string | number>('all');

onMounted(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  checkIn.value = tomorrow.toISOString().split('T')[0];

  const out = new Date(tomorrow);
  out.setDate(out.getDate() + 3);
  checkOut.value = out.toISOString().split('T')[0];
});

const handleSubmit = () => {
  const typeId = selectedCategory.value === 'all' ? undefined : Number(selectedCategory.value);
  emit('search', checkIn.value, checkOut.value, typeId);
};
</script>
