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
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-[#240A10] border-b border-[#5A1C2A] text-white/60 uppercase tracking-wider text-[10px]">
              <th class="py-3.5 px-4 font-bold">Booking ID</th>
              <th class="py-3.5 px-4 font-bold">Guest Details</th>
              <th class="py-3.5 px-4 font-bold">Suite & Room</th>
              <th class="py-3.5 px-4 font-bold">Stay Schedule</th>
              <th class="py-3.5 px-4 font-bold">Payment</th>
              <th class="py-3.5 px-4 font-bold">Status</th>
              <th class="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#5A1C2A]/60 text-white/90">
            <tr v-if="filteredBookings.length === 0">
              <td colspan="7" class="py-12 text-center text-white/40 text-xs">
                No reservation records found for this view filter.
              </td>
            </tr>
            <tr
              v-else
              v-for="b in filteredBookings"
              :key="b.booking_id"
              class="hover:bg-[#4A1521]/40 transition-colors"
            >
              <!-- Booking ID -->
              <td class="py-3.5 px-4 font-mono font-bold text-[#E5C378]">
                #BSR-{{ b.booking_id }}
              </td>

              <!-- Guest Details -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-white">
                  {{ b.guest?.first_name }} {{ b.guest?.last_name }}
                </div>
                <div class="text-[11px] text-white/60 mt-0.5">
                  {{ b.guest?.email_address }}
                </div>
              </td>

              <!-- Suite & Room -->
              <td class="py-3.5 px-4">
                <div class="font-semibold text-white">
                  {{ b.room_type?.room_type || 'Luxury Suite' }}
                </div>
                <div class="text-[11px] text-[#E5C378] font-mono mt-0.5">
                  Room #{{ b.room?.room_number }} (Floor {{ b.room?.floor_number }})
                </div>
              </td>

              <!-- Stay Schedule -->
              <td class="py-3.5 px-4">
                <div class="text-white">{{ b.check_in_date }} → {{ b.check_out_date }}</div>
                <div class="text-[11px] text-white/50 mt-0.5">
                  {{ calculateNights(b.check_in_date, b.check_out_date) }} night(s)
                </div>
              </td>

              <!-- Payment -->
              <td class="py-3.5 px-4">
                <div class="font-bold text-[#E5C378]">
                  ₱{{ Number(b.total_amount).toLocaleString() }}
                </div>
                <div class="text-[10px] text-emerald-400 mt-0.5 uppercase tracking-wide">
                  {{ b.payment?.payment_method || 'Verified' }}
                </div>
              </td>

              <!-- Status Badge -->
              <td class="py-3.5 px-4">
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
              <td class="py-3.5 px-4 text-right">
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
          </tbody>
        </table>
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
import { ref, computed } from 'vue';
import ConfirmModal from './ConfirmModal.vue';

const props = defineProps<{
  bookings: any[];
}>();

const emit = defineEmits<{
  (e: 'checkout', bookingId: number): void;
}>();

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
