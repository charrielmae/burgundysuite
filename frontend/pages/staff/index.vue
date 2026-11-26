<template>
  <div class="min-h-screen bg-[#1B1014] text-[#F5EFEB] flex flex-col font-sans">
    <!-- Loading Screen -->
    <div
      v-if="isLoading"
      class="min-h-screen flex flex-col items-center justify-center bg-[#1B1014] text-zinc-300"
    >
      <div class="relative w-16 h-16 rounded-full overflow-hidden bg-[#241319] border-2 border-zinc-400/50 shadow-2xl p-2.5 flex items-center justify-center animate-pulse mb-4">
        <img src="/burgundylogov2.png" alt="Burgundy Suite Logo" class="w-full h-full object-contain" />
      </div>
      <p class="text-xs font-bold uppercase tracking-[0.25em]">Authenticating Staff Session...</p>
    </div>

    <!-- Staff Login Gate -->
    <StaffLoginGate
      v-else-if="!isAuthenticated || adminUser?.user_role !== 'staff'"
      @login-success="handleLoginSuccess"
    />

    <!-- Authenticated Staff Operations Portal -->
    <div v-else class="flex-1 flex flex-col">
      <StaffHeader :current-user="adminUser" @logout="handleLogout" />

      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <div
          v-if="toastMessage"
          class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg"
        >
          <span>{{ toastMessage }}</span>
          <button type="button" @click="toastMessage = null" class="text-emerald-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <!-- 1. Live Room Status Switcher (Available / Not Available / Under Maintenance) -->
        <RoomInventoryGrid
          :rooms="rooms"
          :can-add-suite="false"
          @status-change="handleRoomStatusChange"
        />

        <!-- 2. Reservations & Check-out Desk -->
        <BookingsTable
          :bookings="bookings"
          @checkout="handleCheckout"
        />

        <!-- 3. Guest Reviews & Feedback (with Staff Reply) -->
        <ReviewsPanel
          :reviews="reviews"
          :summary="reviewSummary"
          :can-reply="true"
          @reply="handleReviewReply"
        />
      </main>

      <footer class="mt-auto py-6 border-t border-emerald-500/20 bg-[#12080B] text-center text-xs text-white/50">
        Burgundy Suite & Resort Staff Operations Desk • Real-Time Inventory & Guest Care
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useApi } from '../../composables/useApi';

import StaffLoginGate from '../../components/staff/StaffLoginGate.vue';
import StaffHeader from '../../components/staff/StaffHeader.vue';
import RoomInventoryGrid from '../../components/admin/RoomInventoryGrid.vue';
import BookingsTable from '../../components/admin/BookingsTable.vue';
import ReviewsPanel from '../../components/shared/ReviewsPanel.vue';

const { adminUser, isAuthenticated, isLoading, fetchSession, logout } = useAuth();
const { request } = useApi();

const rooms = ref<any[]>([]);
const bookings = ref<any[]>([]);
const reviews = ref<any[]>([]);
const reviewSummary = ref<any>({});
const toastMessage = ref<string | null>(null);

let pollTimer: ReturnType<typeof setInterval> | null = null;

const loadStaffData = async () => {
  try {
    const [roomRes, bookingRes, reviewRes] = await Promise.all([
      request<{ success: boolean; data: any[] }>('/api/rooms'),
      request<{ success: boolean; data: any[] }>('/api/bookings'),
      request<{ success: boolean; data: any[]; summary: any }>('/api/reviews'),
    ]);
    if (roomRes.success) rooms.value = roomRes.data;
    if (bookingRes.success) bookings.value = bookingRes.data;
    if (reviewRes.success) {
      reviews.value = reviewRes.data || [];
      reviewSummary.value = reviewRes.summary || {};
    }
  } catch (err) {
    console.error('Error fetching staff operations data:', err);
  }
};

const handleVisibility = () => {
  if (document.visibilityState === 'visible' && isAuthenticated.value && adminUser.value?.user_role === 'staff') {
    loadStaffData();
  }
};

onMounted(async () => {
  await fetchSession('staff');
  if (isAuthenticated.value && adminUser.value?.user_role === 'staff') {
    await loadStaffData();
  }
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible' && isAuthenticated.value && adminUser.value?.user_role === 'staff') {
      loadStaffData();
    }
  }, 10000);
  document.addEventListener('visibilitychange', handleVisibility);
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
  document.removeEventListener('visibilitychange', handleVisibility);
});

const handleLoginSuccess = async () => {
  await loadStaffData();
};

const handleLogout = async () => {
  await logout();
};

const handleRoomStatusChange = async (roomId: number, status: string) => {
  const labelMap: Record<string, string> = {
    available: 'Available',
    occupied: 'Not Available',
    maintenance: 'Under Maintenance',
  };
  try {
    const res = await request<{ success: boolean; data: any }>('/api/rooms', {
      method: 'PATCH',
      body: JSON.stringify({ room_id: roomId, status }),
    });
    if (res.success) {
      toastMessage.value = `Room #${res.data?.room_number || roomId} updated to "${labelMap[status] || status}".`;
      await loadStaffData();
    }
  } catch (err) {
    alert((err as Error).message);
  }
};

const handleCheckout = async (bookingId: number) => {
  try {
    const res = await request<{ success: boolean; message: string }>(`/api/bookings/${bookingId}/checkout`, {
      method: 'POST',
    });
    if (res.success) {
      toastMessage.value = res.message || `Booking #${bookingId} checked out.`;
      await loadStaffData();
    }
  } catch (err) {
    alert((err as Error).message);
  }
};

const handleReviewReply = async (reviewId: number, replyText: string) => {
  const repliedBy = adminUser.value
    ? `${adminUser.value.first_name} ${adminUser.value.last_name} (${adminUser.value.position})`
    : 'Resort Staff';
  const res = await request<{ success: boolean; message: string }>(`/api/reviews/${reviewId}/reply`, {
    method: 'PATCH',
    body: JSON.stringify({ staff_reply: replyText, replied_by: repliedBy }),
  });
  if (res.success) {
    toastMessage.value = 'Guest review reply posted.';
    await loadStaffData();
  }
};
</script>
