<template>
  <div class="space-y-6">
    <!-- Table Header and Filter Buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="font-serif text-2xl font-bold text-white tracking-wide">
          Guest Reservations & Room Bookings
        </h3>
        <p class="text-xs text-white/60 mt-1">
          Official relational booking logs directly bound to ROOM_BOOKING and GUEST_DETAILS
        </p>
      </div>

      <!-- Tab Switchers -->
      <div class="flex items-center p-1 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-xs">
        <button
          type="button"
          @click="filter = 'active'"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
            filter === 'active'
              ? 'bg-[#5A1C2A] text-[#E5C378] font-bold shadow-md'
              : 'text-white/70 hover:text-white',
          ]"
        >
          Active Stays
        </button>
        <button
          type="button"
          @click="filter = 'upcoming'"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
            filter === 'upcoming'
              ? 'bg-[#5A1C2A] text-[#E5C378] font-bold shadow-md'
              : 'text-white/70 hover:text-white',
          ]"
        >
          Upcoming
        </button>
        <button
          type="button"
          @click="filter = 'completed'"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
            filter === 'completed'
              ? 'bg-[#5A1C2A] text-[#E5C378] font-bold shadow-md'
              : 'text-white/70 hover:text-white',
          ]"
        >
          Completed
        </button>
        <button
          type="button"
          @click="filter = 'all'"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
            filter === 'all'
              ? 'bg-[#5A1C2A] text-[#E5C378] font-bold shadow-md'
              : 'text-white/70 hover:text-white',
          ]"
        >
          All History
        </button>
      </div>
    </div>

    <!-- Bookings Table Container -->
    <div class="rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl overflow-hidden">
      <div class="overflow-x-auto min-h-[528px]">
        <table class="w-full text-left text-xs table-fixed min-w-[960px]">
          <thead>
            <tr class="bg-[#240A10] border-b border-[#5A1C2A] text-white/60 uppercase tracking-wider text-[10px] h-[48px]">
              <th class="px-4 font-bold w-[13%]">Booking ID</th>
              <th class="px-4 font-bold w-[22%]">Guest Details</th>
              <th class="px-4 font-bold w-[21%]">Suite & Room</th>
              <th class="px-4 font-bold w-[18%]">Stay Schedule</th>
              <th class="px-4 font-bold w-[12%]">Payment</th>
              <th class="px-4 font-bold w-[12%]">Status</th>
              <th class="px-4 font-bold w-[12%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#5A1C2A]/60 text-white/90">
            <tr v-if="filteredBookings.length === 0">
              <td colspan="7" class="py-12 text-center text-white/40 text-xs h-[480px]">
                No reservation records found for this view filter.
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="b in paginatedBookings"
                :key="b.booking_id"
                class="hover:bg-[#4A1521]/40 transition-colors h-[60px]"
              >
                <!-- Booking ID -->
                <td class="px-4 font-mono font-bold text-[#E5C378] truncate">
                  #BSR-{{ b.booking_id }}
                </td>

                <!-- Guest Details -->
                <td class="px-4">
                  <div class="font-bold text-white truncate">
                    {{ b.guest?.first_name }} {{ b.guest?.last_name }}
                  </div>
                  <div class="text-[11px] text-white/60 mt-0.5 truncate">
                    {{ b.guest?.email_address }}
                  </div>
                </td>

                <!-- Suite & Room -->
                <td class="px-4">
                  <div class="font-semibold text-white truncate">
                    {{ b.room_type?.room_type || 'Luxury Suite' }}
                  </div>
                  <div class="text-[11px] text-[#E5C378] font-mono mt-0.5 truncate">
                    Room #{{ b.room?.room_number }} (Floor {{ b.room?.floor_number }})
                  </div>
                </td>

                <!-- Stay Schedule -->
                <td class="px-4">
                  <div class="text-white truncate">{{ b.check_in_date }} → {{ b.check_out_date }}</div>
                  <div class="text-[11px] text-white/50 mt-0.5 truncate">
                    {{ calculateNights(b.check_in_date, b.check_out_date) }} night(s)
                  </div>
                </td>

                <!-- Payment -->
                <td class="px-4">
                  <div class="font-bold text-[#E5C378]">
                    ₱{{ Number(b.total_amount).toLocaleString() }}
                  </div>
                  <div class="text-[10px] text-emerald-400 mt-0.5 uppercase tracking-wide truncate">
                    {{ b.payment?.payment_method || 'Verified' }}
                  </div>
                </td>

                <!-- Status Badge -->
                <td class="px-4">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      b.booking_status === 'checked-in'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                        : b.booking_status === 'completed'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        : 'bg-zinc-800 text-zinc-300',
                    ]"
                  >
                    <span
                      v-if="b.booking_status === 'checked-in'"
                      class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"
                    />
                    <span>{{ b.booking_status }}</span>
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-4 text-right">
                  <button
                    v-if="b.booking_status === 'checked-in'"
                    type="button"
                    @click="selectedCheckoutBooking = b"
                    class="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Check Out
                  </button>
                  <span v-else class="text-white/40 text-xs font-mono">—</span>
                </td>
              </tr>

              <!-- Invisible filler rows so the table never shrinks or shifts height -->
              <tr
                v-for="i in emptySlots"
                :key="`empty-${i}`"
                class="h-[60px] pointer-events-none opacity-0 select-none"
                aria-hidden="true"
              >
                <td colspan="7" class="px-4">&nbsp;</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination Bar (8 per page) -->
      <div
        v-if="filteredBookings.length > 0"
        class="px-6 py-3.5 bg-[#240A10] border-t border-[#5A1C2A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
      >
        <div class="text-white/60">
          Showing <strong class="text-[#E5C378]">{{ startItem }}</strong> to
          <strong class="text-[#E5C378]">{{ endItem }}</strong> of
          <strong class="text-white">{{ filteredBookings.length }}</strong> reservations
        </div>

        <div class="flex items-center gap-1.5" v-if="totalPages > 1">
          <button
            type="button"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 rounded-lg bg-[#381018] border border-[#5A1C2A] text-white hover:border-[#E5C378] hover:text-[#E5C378] disabled:opacity-30 disabled:hover:border-[#5A1C2A] disabled:hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Prev</span>
          </button>

          <template v-for="(p, idx) in displayedPages" :key="idx">
            <span
              v-if="p === '...'"
              class="w-7 h-7 flex items-center justify-center text-white/40 text-xs"
            >
              ...
            </span>
            <button
              v-else
              type="button"
              @click="goToPage(Number(p))"
              :class="[
                'w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center',
                currentPage === p
                  ? 'bg-[#E5C378] text-[#2B0E14] shadow-md font-bold'
                  : 'bg-[#381018] border border-[#5A1C2A] text-white/80 hover:text-white hover:border-[#E5C378]',
              ]"
            >
              {{ p }}
            </button>
          </template>

          <button
            type="button"
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 rounded-lg bg-[#381018] border border-[#5A1C2A] text-white hover:border-[#E5C378] hover:text-[#E5C378] disabled:opacity-30 disabled:hover:border-[#5A1C2A] disabled:hover:text-white transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
          >
            <span class="hidden sm:inline">Next</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Checkout Confirmation Modal -->
    <ConfirmModal
      :is-open="Boolean(selectedCheckoutBooking)"
      title="Check Out Guest"
      :description="`Are you sure you want to process check-out for ${selectedCheckoutBooking?.guest?.first_name} ${selectedCheckoutBooking?.guest?.last_name}? Room #${selectedCheckoutBooking?.room?.room_number} will immediately become Available for new reservations.`"
      confirm-label="Complete Check-Out"
      variant="danger"
      :is-loading="isProcessingCheckout"
      @close="selectedCheckoutBooking = null"
      @confirm="confirmCheckout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import ConfirmModal from './ConfirmModal.vue';

const props = defineProps<{
  bookings: any[];
}>();

const emit = defineEmits<{
  (e: 'checkout', bookingId: number): void;
}>();

const PAGE_SIZE = 8;
const currentPage = ref(1);

const filter = ref<'active' | 'upcoming' | 'completed' | 'all'>('active');
const selectedCheckoutBooking = ref<any | null>(null);
const isProcessingCheckout = ref(false);

const filteredBookings = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  const list = props.bookings.filter((b) => {
    if (filter.value === 'active') return b.booking_status === 'checked-in';
    if (filter.value === 'upcoming')
      return b.booking_status === 'pending' || (b.check_in_date > today && b.booking_status !== 'cancelled');
    if (filter.value === 'completed') return b.booking_status === 'completed' || b.booking_status === 'cancelled';
    return true;
  });
  return list.slice().sort((a, b) => Number(b.booking_id || 0) - Number(a.booking_id || 0));
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredBookings.value.length / PAGE_SIZE)));

watch(filter, () => {
  currentPage.value = 1;
});

watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = newTotal;
  }
});

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredBookings.value.slice(start, start + PAGE_SIZE);
});

const emptySlots = computed(() => {
  if (filteredBookings.value.length === 0) return 0;
  return Math.max(0, PAGE_SIZE - paginatedBookings.value.length);
});

const startItem = computed(() => {
  if (filteredBookings.value.length === 0) return 0;
  return (currentPage.value - 1) * PAGE_SIZE + 1;
});

const endItem = computed(() => {
  return Math.min(currentPage.value * PAGE_SIZE, filteredBookings.value.length);
});

const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | string)[] = [];
  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...');
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push(1);
    pages.push('...');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('...');
    pages.push(current - 1);
    pages.push(current);
    pages.push(current + 1);
    pages.push('...');
    pages.push(total);
  }
  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const calculateNights = (inDate: string, outDate: string) => {
  try {
    const d1 = new Date(inDate).getTime();
    const d2 = new Date(outDate).getTime();
    return Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  } catch {
    return 1;
  }
};

const confirmCheckout = async () => {
  if (!selectedCheckoutBooking.value) return;
  isProcessingCheckout.value = true;
  try {
    emit('checkout', selectedCheckoutBooking.value.booking_id);
    selectedCheckoutBooking.value = null;
  } finally {
    isProcessingCheckout.value = false;
  }
};
</script>
