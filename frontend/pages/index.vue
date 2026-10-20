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

const DEFAULT_SUITES = [
  {
    room_type_id: 1,
    room_type: 'Deluxe Suite',
    room_capacity: 2,
    rate_per_night: 18500,
    description: 'Spacious coastal retreat with ocean view balcony and plush king bedding.',
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    badge: 'Coastal Classic',
    features: ['Ocean Balcony', 'King Plush Bed', 'Walk-in Rain Shower', 'Complimentary Wine'],
  },
  {
    room_type_id: 2,
    room_type: 'Executive King',
    room_capacity: 3,
    rate_per_night: 28000,
    description: 'Designed for business and leisure, offering dedicated workspace and hydro tub.',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    badge: 'Executive Choice',
    features: ['Dedicated Executive Desk', 'Hydro Soak Tub', 'Espresso Bar', 'High-Speed Fiber'],
  },
  {
    room_type_id: 3,
    room_type: 'Presidential Suite',
    room_capacity: 4,
    rate_per_night: 55000,
    description: 'Expansive private suite with personal butler, living lounge, and ocean plunge pool.',
    image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    badge: 'VIP Presidential',
    features: ['24/7 Butler Service', 'Private Plunge Pool', 'Double Vanity Marble', 'Sunset Terrace'],
  },
  {
    room_type_id: 4,
    room_type: 'Penthouse Haven',
    room_capacity: 6,
    rate_per_night: 95000,
    description: 'Top-floor 360-degree panorama, private elevator access, and helipad transfer.',
    image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    badge: 'Ultra Luxury Peak',
    features: ['Helipad VIP Transfer', 'Private Elevator Key', 'Panoramic 360° Glass', 'Private Chef Service'],
  },
  {
    room_type_id: 5,
    room_type: 'Oceanview Sunset Villa',
    room_capacity: 4,
    rate_per_night: 68000,
    description: 'Secluded standalone villa perched on emerald bluffs with direct beach access.',
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    badge: 'Private Villa',
    features: ['Direct Beach Access', 'Sunset Infinity Deck', 'Open-Air Stone Bath', 'Private Wine Cellar'],
  },
  {
    room_type_id: 6,
    room_type: 'Family Garden Suite',
    room_capacity: 5,
    rate_per_night: 32000,
    description: 'Lush tropical courtyard views with adjoining twin bedrooms and child-safe infinity edge.',
    image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    badge: 'Family Sanctuary',
    features: ['Two Master Bedrooms', 'Private Tropical Garden', 'Kids Glamping Setup', 'In-Suite Dining Table'],
  },
  {
    room_type_id: 7,
    room_type: 'Royal Emerald Penthouse',
    room_capacity: 8,
    rate_per_night: 135000,
    description: 'The pinnacle of resort luxury with 500 sqm floorplan, screening room, and 24/7 security detail.',
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    badge: 'Royal Reserve',
    features: ['500 sqm Private Floor', 'Private Cinema', 'Executive Sommelier', 'Chauffeured Rolls Royce'],
  },
  {
    room_type_id: 8,
    room_type: 'Sapphire Ocean Suite',
    room_capacity: 2,
    rate_per_night: 24500,
    description: 'Intimate honeymoon hideaway facing the azure sea with floating breakfast service.',
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    badge: 'Honeymoon Bliss',
    features: ['Floating Breakfast Daily', 'King Canopy Bed', 'Aromatherapy Steam', 'Couples Massage Suite'],
  },
];

const { request } = useApi();

const roomTypes = ref<any[]>(DEFAULT_SUITES);
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
  isReservationModalOpen.value = true;
};

const handleBookingSuccess = () => {
  fetchRoomTypes();
};
</script>
