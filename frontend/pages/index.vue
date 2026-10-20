<template>
  <main class="min-h-screen bg-[#2B0E14] text-[#F5EFEB]">
    <Navbar
      @open-booking="openReservationModal"
      @open-my-bookings="isMyBookingsModalOpen = true"
    />

    <Hero
      :room-types="roomTypes"
      @search="handleHeroSearch"
    />

    <HavenOverview />

    <SuitesSection
      :room-types="roomTypes"
      @book-suite="openReservationModal"
    />

    <AmenitiesSection />

    <Footer />

    <!-- Reservation Modal -->
    <ReservationModal
      :is-open="isReservationModalOpen"
      :room-types="roomTypes"
      :initial-room-type-id="selectedSuiteTypeId"
      :initial-check-in="heroCheckIn"
      :initial-check-out="heroCheckOut"
      @close="isReservationModalOpen = false"
      @booking-success="handleBookingSuccess"
    />

    <!-- Guest Verify Booking Modal -->
    <VerifyBookingModal
      :is-open="isMyBookingsModalOpen"
      @close="isMyBookingsModalOpen = false"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '../composables/useApi';

const { request } = useApi();

const roomTypes = ref<any[]>([]);
const isReservationModalOpen = ref(false);
const isMyBookingsModalOpen = ref(false);
const selectedSuiteTypeId = ref<number>(1);
const heroCheckIn = ref<string>('');
const heroCheckOut = ref<string>('');

const fetchRoomTypes = async () => {
  try {
    const res = await request<{ success: boolean; data: any[] }>('/api/room-types');
    if (res.success && res.data) {
      roomTypes.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load room types:', err);
  }
};

onMounted(() => {
  fetchRoomTypes();
});

const openReservationModal = (suiteTypeId?: number) => {
  if (suiteTypeId) {
    selectedSuiteTypeId.value = suiteTypeId;
  }
  isReservationModalOpen.value = true;
};

const handleHeroSearch = (checkIn: string, checkOut: string, roomTypeId?: number) => {
  heroCheckIn.value = checkIn;
  heroCheckOut.value = checkOut;
  if (roomTypeId) {
    selectedSuiteTypeId.value = roomTypeId;
  }
  isReservationModalOpen.value = true;
};

const handleBookingSuccess = () => {
  fetchRoomTypes();
};
</script>
