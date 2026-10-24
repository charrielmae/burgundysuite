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

    <!-- Room Availability Modal (Check room availability without reserving) -->
    <AvailabilityModal
      :is-open="isAvailabilityModalOpen"
      :room-types="roomTypes"
      :initial-room-type-id="selectedSuiteTypeId"
      :initial-check-in="heroCheckIn"
      :initial-check-out="heroCheckOut"
      @close="isAvailabilityModalOpen = false"
      @book-suite="handleProceedToBook"
    />

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

const DEFAULT_SUITES = [
  {
    room_type_id: 1,
    room_type: 'Deluxe Suite',
    room_capacity: 2,
    rate_per_night: 250,
    description: 'Spacious coastal retreat with ocean view balcony and plush king bedding.',
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    badge: 'Up to 2 Guests',
    features: ['Balcony with Sea Breeze', 'En-suite Rain Shower', 'Artisanal Mini Bar'],
  },
  {
    room_type_id: 2,
    room_type: 'Executive King',
    room_capacity: 3,
    rate_per_night: 420,
    description: 'Designed for business and leisure, offering dedicated workspace and hydro tub.',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    badge: 'Up to 3 Guests',
    features: ['Deep Hydro Soak Tub', 'Executive Work Station', 'Dedicated High-Speed WiFi'],
  },
  {
    room_type_id: 3,
    room_type: 'Presidential Suite',
    room_capacity: 4,
    rate_per_night: 750,
    description: 'Expansive private suite with personal butler, living lounge, and ocean plunge pool.',
    image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    badge: 'Up to 4 Guests',
    features: ['Private Butler Service', 'Infinity Edge Plunge Pool', 'Grand Living Salon'],
  },
  {
    room_type_id: 4,
    room_type: 'Penthouse Haven',
    room_capacity: 6,
    rate_per_night: 1200,
    description: 'Top-floor 360-degree panorama, private elevator access, and helipad transfer.',
    image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    badge: 'Up to 6 Guests',
    features: ['Direct Helipad Transfer', 'Private Elevator Keycard', '360° Glass Ocean View'],
  },
  {
    room_type_id: 5,
    room_type: 'Oceanview Sunset Villa',
    room_capacity: 4,
    rate_per_night: 550,
    description: 'Secluded seaside villa with private infinity plunge pool, oceanview sunset deck, and butler service.',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    badge: 'Up to 4 Guests',
    features: ['Private Plunge Pool', 'Panoramic Sunset Deck', '24/7 Butler Service'],
  },
  {
    room_type_id: 6,
    room_type: 'Family Suite',
    room_capacity: 10,
    rate_per_night: 3200,
    description: 'Spacious coastal retreat with ocean view balcony and plush king bedding.',
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    badge: 'Up to 10 Guests',
    features: ['Balcony with Sea Breeze', 'En-suite Rain Shower', 'Artisanal Mini Bar'],
  },
  {
    room_type_id: 7,
    room_type: 'Royal Emerald Penthouse',
    room_capacity: 8,
    rate_per_night: 4500,
    description: 'Ultra-exclusive 360-degree top-floor penthouse with private helicopter charter and infinity ocean plunge pool.',
    image_url: '/api/media/suites/1792035835546-emerald-villa-ocean.png',
    badge: 'Up to 8 Guests',
    features: ['Helipad VIP Transfer', 'Private Infinity Plunge Pool', 'Personal Dedicated Butler'],
  },
  {
    room_type_id: 8,
    room_type: 'Sapphire Ocean Villa',
    room_capacity: 4,
    rate_per_night: 750,
    description: 'Exclusive ocean villa with infinity plunge pool and sunset panorama.',
    image_url: '/api/media/suites/test-suite.png',
    badge: 'Up to 4 Guests',
    features: ['Private Lagoon Access', 'Sunken Lounge', 'Designer King Suite'],
  },
];

const { request } = useApi();

const roomTypes = ref<any[]>(DEFAULT_SUITES);
const isAvailabilityModalOpen = ref(false);
const isReservationModalOpen = ref(false);
const isMyBookingsModalOpen = ref(false);
const selectedSuiteTypeId = ref<number>(1);
const heroCheckIn = ref<string>('');
const heroCheckOut = ref<string>('');

const fetchRoomTypes = async () => {
  try {
    const res = await request<{ success: boolean; data: any[] }>('/api/room-types');
    if (res.success && res.data && res.data.length > 0) {
      roomTypes.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load room types, retaining curated suites:', err);
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
  // Check room availability without initiating a booking reservation
  isAvailabilityModalOpen.value = true;
};

const handleProceedToBook = (suiteTypeId: number, checkIn: string, checkOut: string) => {
  selectedSuiteTypeId.value = suiteTypeId;
  heroCheckIn.value = checkIn;
  heroCheckOut.value = checkOut;
  isAvailabilityModalOpen.value = false;
  isReservationModalOpen.value = true;
};

const handleBookingSuccess = () => {
  fetchRoomTypes();
};
</script>
