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
      <div class="overflow-x-auto no-scrollbar">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#240A10] border-b border-[#5A1C2A] text-[#E5C378] uppercase tracking-wider font-bold">
            <tr>
              <th class="py-4 px-5">Payment ID</th>
              <th class="py-4 px-5">Booking Ref</th>
              <th class="py-4 px-5">Payment Method</th>
              <th class="py-4 px-5">Amount</th>
              <th class="py-4 px-5">Status</th>
              <th class="py-4 px-5">Timestamp</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#5A1C2A]/60 text-white/90">
            <tr v-if="sortedPayments.length === 0">
              <td colspan="6" class="py-8 text-center text-white/40 text-xs">
                No payment transactions recorded yet.
              </td>
            </tr>
            <tr
              v-else
              v-for="p in sortedPayments"
              :key="p.payment_id"
              class="hover:bg-[#4A1521]/40 transition-colors"
            >
              <td class="py-4 px-5 font-mono font-bold text-[#E5C378]">
                #PAY-{{ p.payment_id }}
              </td>
              <td class="py-4 px-5 font-mono text-white/70">
                #BSR-{{ p.booking_id }}
              </td>
              <td class="py-4 px-5 text-white/70">
                {{ p.payment_method }}
              </td>
              <td class="py-4 px-5 font-bold text-white">
                ₱{{ Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="py-4 px-5">
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
              <td class="py-4 px-5 text-white/50 font-mono text-[11px]">
                {{ p.payment_date ? p.payment_date.replace('T', ' ').slice(0, 19) : 'N/A' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CreditCard, CheckCircle2 } from 'lucide-vue-next';

const props = defineProps<{
  payments: any[];
}>();

const sortedPayments = computed(() => {
  return (props.payments || []).slice().sort((a, b) => Number(b.payment_id || 0) - Number(a.payment_id || 0));
});
</script>
