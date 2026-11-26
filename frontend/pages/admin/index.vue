<template>
  <div class="min-h-screen bg-[#2B0E14] text-[#F5EFEB] flex flex-col font-sans">
    <!-- Loading Screen -->
    <div
      v-if="isLoading"
      class="min-h-screen flex flex-col items-center justify-center bg-[#2B0E14] text-[#E5C378]"
    >
      <div class="relative w-16 h-16 rounded-full overflow-hidden bg-[#381018] border-2 border-[#E5C378]/50 shadow-2xl p-2.5 flex items-center justify-center animate-pulse mb-4">
        <img
          src="/burgundylogov2.png"
          alt="Burgundy Suite Logo"
          class="w-full h-full object-contain"
        />
      </div>
      <p class="text-xs font-bold uppercase tracking-[0.25em]">Authenticating Executive Session...</p>
    </div>

    <!-- Login Gate if not authenticated as Admin -->
    <AdminLoginGate
      v-else-if="!isAuthenticated || adminUser?.user_role !== 'admin'"
      @login-success="handleLoginSuccess"
    />

    <!-- Authenticated Command Center -->
    <div v-else class="flex-1 flex flex-col">
      <AdminHeader
        :current-user="adminUser"
        @logout="handleLogout"
        @open-accounts="isAccountsModalOpen = true"
        @open-add-suite="isAddSuiteModalOpen = true"
        @open-cloudflare="isCloudflareModalOpen = true"
        @export-report="handleExportReport"
      />

      <AdminHeroBanner />

      <main id="command-center" class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        <!-- Toast Notification Banner -->
        <div
          v-if="toastMessage"
          class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg"
        >
          <span>{{ toastMessage }}</span>
          <button type="button" @click="toastMessage = null" class="text-emerald-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <!-- 1. Executive KPIs -->
        <AdminKPIs :kpis="kpis" />

        <!-- 2. Revenue & Occupancy Trend Chart -->
        <AdminChart :data="kpis.weekly_performance_chart || []" />

        <!-- 3. Room Inventory Grid & Status Switcher -->
        <RoomInventoryGrid
          :rooms="rooms"
          @status-change="handleRoomStatusChange"
          @open-add-suite="isAddSuiteModalOpen = true"
        />

        <!-- 4. Reservations & Ledger -->
        <BookingsTable
          :bookings="bookings"
          @checkout="handleCheckout"
        />

        <!-- 5. Payment Audit Logs -->
        <PaymentLogs :payments="payments" />

        <!-- 6. Team Presence (All Staff & Admins - Cloudflare Durable Objects) -->
        <TeamPresencePanel :members="teamPresence" />

        <!-- 7. Guest Reviews & Feedback -->
        <ReviewsPanel
          :reviews="reviews"
          :summary="reviewSummary"
          :can-reply="true"
          @reply="handleReviewReply"
        />
      </main>

      <!-- Footer -->
      <footer class="mt-auto py-6 border-t border-[#5A1C2A]/60 bg-[#1f090e] text-center text-xs text-white/50">
        Burgundy Suite & Resort Management Command Center • Nuxt 3 Frontend + NestJS Cloudflare D1 Backend
      </footer>

      <!-- Modals -->
      <AddSuiteModal
        :is-open="isAddSuiteModalOpen"
        @close="isAddSuiteModalOpen = false"
        @success="handleAddSuiteSuccess"
      />

      <StaffAccountsModal
        :is-open="isAccountsModalOpen"
        @close="isAccountsModalOpen = false"
      />

      <CloudflareD1Modal
        :is-open="isCloudflareModalOpen"
        @close="isCloudflareModalOpen = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useApi } from '../../composables/useApi';
import { usePresence } from '../../composables/usePresence';

import AdminLoginGate from '../../components/admin/AdminLoginGate.vue';
import AdminHeader from '../../components/admin/AdminHeader.vue';
import AdminHeroBanner from '../../components/admin/AdminHeroBanner.vue';
import AdminKPIs from '../../components/admin/AdminKPIs.vue';
import AdminChart from '../../components/admin/AdminChart.vue';
import RoomInventoryGrid from '../../components/admin/RoomInventoryGrid.vue';
import BookingsTable from '../../components/admin/BookingsTable.vue';
import PaymentLogs from '../../components/admin/PaymentLogs.vue';
import AddSuiteModal from '../../components/admin/AddSuiteModal.vue';
import StaffAccountsModal from '../../components/admin/StaffAccountsModal.vue';
import CloudflareD1Modal from '../../components/admin/CloudflareD1Modal.vue';
import ReviewsPanel from '../../components/shared/ReviewsPanel.vue';
import TeamPresencePanel from '../../components/admin/TeamPresencePanel.vue';

const { adminUser, isAuthenticated, isLoading, fetchSession, logout } = useAuth();
const { request } = useApi();
const { startPresence, stopPresence } = usePresence();

const kpis = ref<any>({
  total_revenue: 0,
  weekly_revenue_delta: '0%',
  occupancy_rate_percent: 0,
  occupied_rooms_count: 0,
  total_rooms_count: 0,
  pending_checkouts_today_count: 0,
  avg_stay_duration_nights: 0,
  weekly_performance_chart: [],
});
const rooms = ref<any[]>([]);
const bookings = ref<any[]>([]);
const payments = ref<any[]>([]);
const reviews = ref<any[]>([]);
const reviewSummary = ref<any>({});
const teamPresence = ref<any[]>([]);

let pollTimer: ReturnType<typeof setInterval> | null = null;
let presenceEventSource: EventSource | null = null;

const connectPresenceStream = () => {
  if (typeof window === 'undefined') return;
  if (presenceEventSource) {
    presenceEventSource.close();
    presenceEventSource = null;
  }
  const token = localStorage.getItem('burgundy_admin_token') || '';
  const url = token ? `/api/presence/stream?token=${encodeURIComponent(token)}` : '/api/presence/stream';
  const es = new EventSource(url);
  es.onmessage = (evt) => {
    try {
      const payload = JSON.parse(evt.data);
      if (Array.isArray(payload?.members)) {
        teamPresence.value = payload.members;
      }
    } catch {}
  };
  presenceEventSource = es;
};

const disconnectPresenceStream = () => {
  if (presenceEventSource) {
    presenceEventSource.close();
    presenceEventSource = null;
  }
};

const isAddSuiteModalOpen = ref(false);
const isAccountsModalOpen = ref(false);
const isCloudflareModalOpen = ref(false);
const toastMessage = ref<string | null>(null);

const loadDashboardData = async () => {
  try {
    const [kpiRes, roomRes, bookingRes, paymentRes, reviewRes, presenceRes] = await Promise.allSettled([
      request<{ success: boolean; data: any }>('/api/admin/metrics'),
      request<{ success: boolean; data: any[] }>('/api/rooms'),
      request<{ success: boolean; data: any[] }>('/api/bookings'),
      request<{ success: boolean; data: any[] }>('/api/payments'),
      request<{ success: boolean; data: any[]; summary: any }>('/api/reviews'),
      request<{ success: boolean; data: any[] }>('/api/presence'),
    ]);

    if (kpiRes.status === 'fulfilled' && kpiRes.value.success) kpis.value = kpiRes.value.data;
    if (roomRes.status === 'fulfilled' && roomRes.value.success) rooms.value = roomRes.value.data;
    if (bookingRes.status === 'fulfilled' && bookingRes.value.success) bookings.value = bookingRes.value.data;
    if (paymentRes.status === 'fulfilled' && paymentRes.value.success) payments.value = paymentRes.value.data;
    if (reviewRes.status === 'fulfilled' && reviewRes.value.success) {
      reviews.value = reviewRes.value.data || [];
      reviewSummary.value = reviewRes.value.summary || {};
    }
    if (presenceRes.status === 'fulfilled' && presenceRes.value.success) {
      teamPresence.value = presenceRes.value.data || [];
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  }
};

const handleVisibility = () => {
  if (document.visibilityState === 'visible' && isAuthenticated.value && adminUser.value?.user_role === 'admin') {
    loadDashboardData();
  }
};

onMounted(async () => {
  await fetchSession('admin');
  if (isAuthenticated.value && adminUser.value?.user_role === 'admin') {
    await startPresence(adminUser.value);
    connectPresenceStream();
    loadDashboardData();
  }
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible' && isAuthenticated.value && adminUser.value?.user_role === 'admin') {
      loadDashboardData();
    }
  }, 10000);
  document.addEventListener('visibilitychange', handleVisibility);
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
  disconnectPresenceStream();
  stopPresence(true);
  document.removeEventListener('visibilitychange', handleVisibility);
});

const handleLoginSuccess = async () => {
  if (adminUser.value) {
    await startPresence(adminUser.value);
    connectPresenceStream();
  }
  await loadDashboardData();
};

const handleLogout = async () => {
  disconnectPresenceStream();
  stopPresence(true);
  await logout('admin');
};

const handleRoomStatusChange = async (roomId: number, status: string) => {
  try {
    const res = await request<{ success: boolean; data: any }>('/api/rooms', {
      method: 'PATCH',
      body: JSON.stringify({ room_id: roomId, status }),
    });
    if (res.success) {
      toastMessage.value = `Room #${res.data.room_number} status updated to "${status}".`;
      loadDashboardData();
    }
  } catch (err) {
    alert((err as Error).message);
  }
};

const handleCheckout = async (bookingId: number) => {
  try {
    const res = await request<{ success: boolean; message: string; data: any }>(
      `/api/bookings/${bookingId}/checkout`,
      { method: 'POST' }
    );
    if (res.success) {
      toastMessage.value = res.message || `Booking #${bookingId} checked out successfully.`;
      loadDashboardData();
    }
  } catch (err) {
    alert((err as Error).message);
  }
};

const handleAddSuiteSuccess = (name: string) => {
  toastMessage.value = `Suite "${name}" registered and published to inventory!`;
  loadDashboardData();
};

const handleReviewReply = async (reviewId: number, replyText: string) => {
  const repliedBy = adminUser.value
    ? `${adminUser.value.first_name} ${adminUser.value.last_name} (${adminUser.value.position})`
    : 'Executive Admin';
  const res = await request<{ success: boolean; message: string }>(`/api/reviews/${reviewId}/reply`, {
    method: 'PATCH',
    body: JSON.stringify({ staff_reply: replyText, replied_by: repliedBy }),
  });
  if (res.success) {
    toastMessage.value = 'Guest review reply posted.';
    await loadDashboardData();
  }
};

const handleExportReport = () => {
  const report = {
    generated_at: new Date().toISOString(),
    kpis: kpis.value,
    total_rooms: rooms.value.length,
    total_bookings: bookings.value.length,
    total_payments: payments.value.length,
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `burgundy-report-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>
