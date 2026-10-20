<template>
  <div class="space-y-6">
    <div>
      <div class="flex items-center gap-2">
        <CreditCard class="w-5 h-5 text-[#E5C378]" />
        <h3 class="font-serif text-2xl font-bold text-white tracking-wide">
          Payment Transaction Logs & Audit Trail
        </h3>
      </div>
      <p class="text-xs text-white/60 mt-1">
        Exact ledger records mapped to PAYMENT_DETAILS with instant reconciliation
      </p>
    </div>

    <div class="rounded-2xl bg-[#381018]/90 border border-[#5A1C2A] shadow-xl overflow-hidden">
      <div class="overflow-x-auto no-scrollbar min-h-[496px]">
        <table class="w-full text-left text-xs table-fixed min-w-[900px]">
          <thead class="bg-[#240A10] border-b border-[#5A1C2A] text-[#E5C378] uppercase tracking-wider font-bold">
            <tr class="h-[48px]">
              <th class="px-5 w-[16%]">Payment ID</th>
              <th class="px-5 w-[16%]">Booking Ref</th>
              <th class="px-5 w-[22%]">Payment Method</th>
              <th class="px-5 w-[16%]">Amount</th>
              <th class="px-5 w-[14%]">Status</th>
              <th class="px-5 w-[16%]">Timestamp</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#5A1C2A]/60 text-white/90">
            <tr v-if="sortedPayments.length === 0">
              <td colspan="6" class="py-8 text-center text-white/40 text-xs h-[448px]">
                No payment transactions recorded yet.
              </td>
            </tr>
            <template v-else>
              <tr
                v-for="p in paginatedPayments"
                :key="p.payment_id"
                class="hover:bg-[#4A1521]/40 transition-colors h-[56px]"
              >
                <td class="px-5 font-mono font-bold text-[#E5C378] truncate">
                  #PAY-{{ p.payment_id }}
                </td>
                <td class="px-5 font-mono text-white/70 truncate">
                  #BSR-{{ p.booking_id }}
                </td>
                <td class="px-5 text-white/70 truncate">
                  {{ p.payment_method }}
                </td>
                <td class="px-5 font-bold text-white truncate">
                  ₱{{ Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </td>
                <td class="px-5">
                  <span
                    :class="[
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      p.payment_status === 'paid'
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50'
                        : 'bg-amber-950/80 text-amber-300 border border-amber-500/50',
                    ]"
                  >
                    <CheckCircle2 class="w-3 h-3" />
                    <span>{{ p.payment_status }}</span>
                  </span>
                </td>
                <td class="px-5 text-white/50 font-mono text-[11px] truncate">
                  {{ p.payment_date ? p.payment_date.replace('T', ' ').slice(0, 19) : 'N/A' }}
                </td>
              </tr>

              <!-- Invisible filler rows so the table never shrinks or shifts height -->
              <tr
                v-for="i in emptySlots"
                :key="`empty-pay-${i}`"
                class="h-[56px] pointer-events-none opacity-0 select-none"
                aria-hidden="true"
              >
                <td colspan="6" class="px-5">&nbsp;</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination Bar (8 per page) -->
      <div
        v-if="sortedPayments.length > 0"
        class="px-6 py-3.5 bg-[#240A10] border-t border-[#5A1C2A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
      >
        <div class="text-white/60">
          Showing <strong class="text-[#E5C378]">{{ startItem }}</strong> to
          <strong class="text-[#E5C378]">{{ endItem }}</strong> of
          <strong class="text-white">{{ sortedPayments.length }}</strong> payment records
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { CreditCard, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{
  payments: any[];
}>();

const PAGE_SIZE = 8;
const currentPage = ref(1);

const sortedPayments = computed(() => {
  return (props.payments || []).slice().sort((a, b) => Number(b.payment_id || 0) - Number(a.payment_id || 0));
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedPayments.value.length / PAGE_SIZE)));

watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = newTotal;
  }
});

const paginatedPayments = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return sortedPayments.value.slice(start, start + PAGE_SIZE);
});

const emptySlots = computed(() => {
  if (sortedPayments.value.length === 0) return 0;
  return Math.max(0, PAGE_SIZE - paginatedPayments.value.length);
});

const startItem = computed(() => {
  if (sortedPayments.value.length === 0) return 0;
  return (currentPage.value - 1) * PAGE_SIZE + 1;
});

const endItem = computed(() => {
  return Math.min(currentPage.value * PAGE_SIZE, sortedPayments.value.length);
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
</script>
