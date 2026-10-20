<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
        v-if="isOpen"
        @click.self="$emit('close')"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
      >
        <div
          class="modal-card relative w-full max-w-2xl bg-[#2B0E14] border border-[#5A1C2A] text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8"
        >
        <!-- Modal Top Bar -->
        <div class="px-6 py-5 bg-[#381018] border-b border-[#5A1C2A] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div
              class="relative w-8 h-8 rounded-full overflow-hidden bg-[#240A10] border border-[#E5C378]/40 shadow-xs shrink-0 p-1 flex items-center justify-center"
            >
              <img
                src="/burgundylogov2.png"
                alt="Burgundy Suite Logo"
                class="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 class="font-serif text-lg font-bold text-white tracking-wide">
                Reserve Your Stay
              </h3>
              <p class="text-[11px] text-[#E5C378] tracking-wider uppercase font-semibold">
                Burgundy Suite & Resort
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="$emit('close')"
            class="w-8 h-8 rounded-full bg-[#2B0E14] hover:bg-[#5A1C2A] text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Multi-Step Indicator (Steps 1 to 3) -->
        <div
          v-if="step < 4"
          class="px-6 py-3 bg-[#240A10] border-b border-[#5A1C2A]/60 flex items-center justify-between text-xs font-semibold"
        >
          <div :class="['flex items-center gap-1.5', step >= 1 ? 'text-[#E5C378]' : 'text-white/40']">
            <span
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
                step >= 1 ? 'bg-[#E5C378] text-[#2B0E14]' : 'bg-[#381018] text-white/40',
              ]"
            >
              1
            </span>
            <span>Suite & Dates</span>
          </div>
          <div class="w-6 sm:w-12 h-px bg-[#5A1C2A]" />
          <div :class="['flex items-center gap-1.5', step >= 2 ? 'text-[#E5C378]' : 'text-white/40']">
            <span
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
                step >= 2 ? 'bg-[#E5C378] text-[#2B0E14]' : 'bg-[#381018] text-white/40',
              ]"
            >
              2
            </span>
            <span>Guest Profile</span>
          </div>
          <div class="w-6 sm:w-12 h-px bg-[#5A1C2A]" />
          <div :class="['flex items-center gap-1.5', step >= 3 ? 'text-[#E5C378]' : 'text-white/40']">
            <span
              :class="[
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
                step >= 3 ? 'bg-[#E5C378] text-[#2B0E14]' : 'bg-[#381018] text-white/40',
              ]"
            >
              3
            </span>
            <span>Settlement</span>
          </div>
        </div>

        <!-- Error alert -->
        <div
          v-if="error"
          class="m-6 mb-0 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs"
        >
          {{ error }}
        </div>

        <!-- Step 1: Suite Selection & Stay Dates -->
        <div v-if="step === 1" class="p-6 space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">
              Selected Suite or Villa
            </label>
            <select
              v-model="roomTypeId"
              class="w-full px-4 py-3 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378] cursor-pointer"
            >
              <option
                v-for="rt in roomTypes"
                :key="rt.room_type_id"
                :value="rt.room_type_id"
                class="bg-[#2B0E14]"
              >
                {{ rt.room_type }} — ₱{{ rt.rate_per_night }} / night (Up to {{ rt.room_capacity }} Guests)
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">
                Check-In Date
              </label>
              <input
                type="date"
                v-model="checkIn"
                class="w-full px-4 py-3 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378] cursor-pointer"
              />
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">
                Check-Out Date
              </label>
              <input
                type="date"
                v-model="checkOut"
                class="w-full px-4 py-3 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378] cursor-pointer"
              />
            </div>
          </div>

          <!-- Suite Preview Card -->
          <div
            v-if="selectedSuite"
            class="p-4 rounded-2xl bg-[#381018] border border-[#5A1C2A] flex items-center gap-4"
          >
            <img
              :src="selectedSuite.image_url"
              :alt="selectedSuite.room_type"
              class="w-20 h-20 rounded-xl object-cover shrink-0"
            />
            <div class="flex-1">
              <h4 class="font-serif font-bold text-white text-base">{{ selectedSuite.room_type }}</h4>
              <p class="text-xs text-white/60 line-clamp-1 mt-0.5">{{ selectedSuite.description }}</p>
              <div class="flex items-center gap-3 mt-2 text-xs">
                <span class="text-[#E5C378] font-bold">₱{{ selectedSuite.rate_per_night }} / nt</span>
                <span class="text-white/40">•</span>
                <span class="text-white/70">{{ nights }} Night(s)</span>
                <span class="text-white/40">•</span>
                <span class="text-white/90 font-bold">Total: ₱{{ subtotal.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <div class="pt-4 flex justify-end">
            <button
              type="button"
              @click="handleNextToGuest"
              class="px-6 py-3 rounded-xl bg-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Guest Profile</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Step 2: Guest Profile Information -->
        <div v-else-if="step === 2" class="p-6 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-[#5A1C2A]/60">
            <div>
              <h4 class="font-serif font-bold text-sm text-white">Guest Personal Details</h4>
              <p class="text-[11px] text-white/50">Details are securely registered into the Burgundy Haven and Cloudflare D1 guest database.</p>
            </div>
            <button
              type="button"
              @click="autofillDemoProfile"
              class="text-[11px] text-[#E5C378] hover:text-[#D4AF37] underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>Autofill Demo</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">First Name</label>
              <input
                type="text"
                v-model="firstName"
                placeholder="e.g. John"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Last Name</label>
              <input
                type="text"
                v-model="lastName"
                placeholder="e.g. Doe"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Email Address</label>
              <input
                type="email"
                v-model="email"
                placeholder="e.g. john.doe@example.com"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Contact Number</label>
              <input
                type="text"
                v-model="contactNumber"
                placeholder="e.g. +63 917 555 8822"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Nationality</label>
              <input
                type="text"
                v-model="nationality"
                placeholder="e.g. Filipino"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Civil Status</label>
              <select
                v-model="civilStatus"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378] cursor-pointer"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Birth Date</label>
              <input
                type="date"
                v-model="birthDate"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378] cursor-pointer"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Residential Address</label>
            <input
              type="text"
              v-model="address"
              placeholder="e.g. Unit 402, Burgundy Residences, Makati City"
              class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
            />
          </div>

          <div class="pt-4 flex justify-between items-center">
            <button
              type="button"
              @click="step = 1"
              class="px-5 py-2.5 rounded-xl border border-[#5A1C2A] text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider hover:bg-[#381018] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              @click="handleNextToPayment"
              class="px-6 py-2.5 rounded-xl bg-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Settlement</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Step 3: Payment Method & Authorization -->
        <div v-else-if="step === 3" class="p-6 space-y-6">
          <div class="space-y-3">
            <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">
              Payment Method Option
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                :class="[
                  'p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all',
                  paymentMethod === 'E-Wallet'
                    ? 'bg-[#381018] border-[#E5C378] text-white'
                    : 'bg-[#240A10] border-[#5A1C2A] text-white/70 hover:border-white/30',
                ]"
              >
                <input
                  type="radio"
                  name="pm"
                  value="E-Wallet"
                  v-model="paymentMethod"
                  class="text-[#E5C378] focus:ring-0"
                />
                <div>
                  <span class="font-bold text-sm block">E-Wallet Express</span>
                  <span class="text-[11px] text-white/60">GCash, Maya, GrabPay Instant settlement</span>
                </div>
              </label>

              <label
                :class="[
                  'p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all',
                  paymentMethod === 'Pay at Counter'
                    ? 'bg-[#381018] border-[#E5C378] text-white'
                    : 'bg-[#240A10] border-[#5A1C2A] text-white/70 hover:border-white/30',
                ]"
              >
                <input
                  type="radio"
                  name="pm"
                  value="Pay at Counter"
                  v-model="paymentMethod"
                  class="text-[#E5C378] focus:ring-0"
                />
                <div>
                  <span class="font-bold text-sm block">Pay at Counter</span>
                  <span class="text-[11px] text-white/60">Front desk settlement upon check-in</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Stay Cost Summary -->
          <div class="p-4 rounded-2xl bg-[#381018] border border-[#5A1C2A] space-y-2 text-xs">
            <div class="flex justify-between text-white/70">
              <span>{{ selectedSuite?.room_type }} x {{ nights }} night(s)</span>
              <span>₱{{ subtotal.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between text-white/70">
              <span>Service Charge & Luxury Resort Tax</span>
              <span>Included</span>
            </div>
            <div class="pt-2 border-t border-[#5A1C2A]/60 flex justify-between items-center text-sm font-bold text-white">
              <span>Total Settlement</span>
              <span class="text-base text-[#E5C378]">₱{{ subtotal.toLocaleString() }}</span>
            </div>
          </div>

          <div class="pt-4 flex justify-between items-center">
            <button
              type="button"
              @click="step = 2"
              class="px-5 py-2.5 rounded-xl border border-[#5A1C2A] text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider hover:bg-[#381018] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft class="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              :disabled="loading"
              @click="handleAuthorizeBooking"
              class="px-7 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ loading ? 'Authorizing...' : 'Confirm & Authorize Stay' }}</span>
            </button>
          </div>
        </div>

        <!-- Step 4: Reservation Confirmation -->
        <div v-else-if="step === 4" class="p-8 text-center space-y-6">
          <div
            class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto"
          >
            <CheckCircle2 class="w-8 h-8" />
          </div>

          <div>
            <h3 class="font-serif text-2xl font-bold text-white">Reservation Confirmed!</h3>
            <p class="text-xs text-white/70 max-w-md mx-auto mt-2 leading-relaxed">
              We are honored to welcome you to Burgundy Suite & Resort. A formal itinerary and check-in voucher
              have been dispatched to <strong class="text-white">{{ email }}</strong>.
            </p>
          </div>

          <div class="p-5 rounded-2xl bg-[#381018] border border-[#5A1C2A] text-left max-w-md mx-auto space-y-3 text-xs">
            <div class="flex justify-between items-center pb-2 border-b border-[#5A1C2A]/60">
              <span class="text-white/60">Booking Reference</span>
              <span class="font-mono font-bold text-[#E5C378]">
                #BSR-{{ confirmedBooking?.booking_id || 108 }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-white/60">Suite</span>
              <span class="font-bold text-white">{{ selectedSuite?.room_type }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-white/60">Stay Dates</span>
              <span class="text-white">{{ checkIn }} to {{ checkOut }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-white/60">Payment Method</span>
              <span class="text-emerald-400 font-semibold">{{ paymentMethod }}</span>
            </div>
          </div>

          <div class="pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-8 py-3 rounded-full bg-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-colors cursor-pointer"
            >
              Done & Return to Haven
            </button>
          </div>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-vue-next';
import { useApi } from '../composables/useApi';

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
  isOpen: boolean;
  roomTypes: RoomTypeDetails[];
  initialRoomTypeId?: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'booking-success', booking: any): void;
}>();

const { request } = useApi();

const step = ref<1 | 2 | 3 | 4>(1);
const loading = ref(false);
const error = ref<string | null>(null);

const roomTypeId = ref<number>(props.initialRoomTypeId || 1);
const checkIn = ref<string>(props.initialCheckIn || '');
const checkOut = ref<string>(props.initialCheckOut || '');

const firstName = ref('');
const lastName = ref('');
const birthDate = ref('1990-06-15');
const nationality = ref('Filipino');
const civilStatus = ref('Single');
const contactNumber = ref('');
const email = ref('');
const address = ref('');

const autofillDemoProfile = () => {
  firstName.value = 'Marcus';
  lastName.value = 'Sterling';
  birthDate.value = '1988-06-14';
  nationality.value = 'British';
  civilStatus.value = 'Married';
  contactNumber.value = '+44 7700 900123';
  email.value = 'marcus.sterling@monaco-holdings.co.uk';
  address.value = '45 Knightsbridge, London SW1X 7LY';
  error.value = null;
};

const paymentMethod = ref('E-Wallet');
const confirmedBooking = ref<any | null>(null);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      if (step.value === 4) {
        step.value = 1;
        confirmedBooking.value = null;
      }
      error.value = null;
    }
  }
);

watch(
  () => props.initialRoomTypeId,
  (val) => {
    if (val) roomTypeId.value = val;
  }
);

onMounted(() => {
  if (!checkIn.value) {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    checkIn.value = tmrw.toISOString().split('T')[0];
  }
  if (!checkOut.value) {
    const out = new Date();
    out.setDate(out.getDate() + 4);
    checkOut.value = out.toISOString().split('T')[0];
  }
});

const selectedSuite = computed(
  () => props.roomTypes.find((r) => r.room_type_id === Number(roomTypeId.value)) || props.roomTypes[0]
);

const nights = computed(() => {
  if (!checkIn.value || !checkOut.value) return 1;
  const d1 = new Date(checkIn.value);
  const d2 = new Date(checkOut.value);
  const diffTime = Math.max(1, d2.getTime() - d1.getTime());
  return Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)));
});

const subtotal = computed(() => {
  const rate = selectedSuite.value ? selectedSuite.value.rate_per_night : 20000;
  return nights.value * rate;
});

const handleNextToGuest = () => {
  if (!checkIn.value || !checkOut.value || checkIn.value >= checkOut.value) {
    error.value = 'Please select valid check-in and check-out dates.';
    return;
  }
  error.value = null;
  step.value = 2;
};

const handleNextToPayment = () => {
  if (!firstName.value.trim() || !lastName.value.trim() || !email.value.trim() || !contactNumber.value.trim()) {
    error.value = 'Please provide all required guest identification details.';
    return;
  }
  error.value = null;
  step.value = 3;
};

const handleAuthorizeBooking = async () => {
  loading.value = true;
  error.value = null;

  const payload = {
    room_type_id: Number(roomTypeId.value),
    check_in_date: checkIn.value,
    check_out_date: checkOut.value,
    guest_first_name: firstName.value,
    guest_last_name: lastName.value,
    guest_birth_date: birthDate.value,
    guest_nationality: nationality.value,
    guest_civil_status: civilStatus.value,
    guest_contact_number: contactNumber.value,
    guest_email: email.value,
    guest_address: address.value,
    payment_method: paymentMethod.value,
  };

  try {
    const res = await request<{ success: boolean; data: any }>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    confirmedBooking.value = res.data;
    step.value = 4;
    emit('booking-success', res.data);
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    loading.value = false;
  }
};
</script>
