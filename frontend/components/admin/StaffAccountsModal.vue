<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
        v-if="isOpen"
        @click.self="$emit('close')"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
      >
        <div
          class="modal-card relative w-full max-w-3xl bg-[#2B0E14] border border-[#5A1C2A] text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col my-8"
        >
        <!-- Modal Top Bar -->
        <div class="px-6 py-5 bg-[#381018] border-b border-[#5A1C2A] flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-full bg-[#240A10] border border-[#E5C378]/40 flex items-center justify-center text-[#E5C378]"
            >
              <Users class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-serif text-lg font-bold text-white tracking-wide">
                Staff Directory & Account Provisioning
              </h3>
              <p class="text-[11px] text-[#E5C378]/80 font-medium">
                Manage administrative credentials and internal staff records
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

        <!-- Navigation Tabs -->
        <div class="px-6 py-3 bg-[#240A10] border-b border-[#5A1C2A]/60 flex items-center gap-2">
          <button
            type="button"
            @click="activeTab = 'list'"
            :class="[
              'px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer',
              activeTab === 'list'
                ? 'bg-[#5A1C2A] text-[#E5C378] shadow-md'
                : 'text-white/60 hover:text-white',
            ]"
          >
            Directory ({{ accounts.length }})
          </button>
          <button
            type="button"
            @click="activeTab = 'create'"
            :class="[
              'px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5',
              activeTab === 'create'
                ? 'bg-[#5A1C2A] text-[#E5C378] shadow-md'
                : 'text-white/60 hover:text-white',
            ]"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span>+ Provision Account</span>
          </button>
        </div>

        <!-- Notifications -->
        <div v-if="error" class="m-6 mb-0 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
          {{ error }}
        </div>
        <div v-if="success" class="m-6 mb-0 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs">
          {{ success }}
        </div>

        <!-- Tab 1: Directory Table -->
        <div v-if="activeTab === 'list'" class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div v-if="fetching" class="text-center py-12 text-white/50 text-xs">
            Loading internal staff profiles...
          </div>
          <div v-else-if="accounts.length === 0" class="text-center py-12 text-white/50 text-xs">
            No accounts found.
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="acc in accounts"
              :key="acc.user_id"
              class="p-4 rounded-2xl bg-[#381018] border border-[#5A1C2A] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-[#240A10] border border-[#5A1C2A] text-[#E5C378] font-bold flex items-center justify-center text-sm shrink-0"
                >
                  {{ acc.first_name[0] }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-serif font-bold text-white text-sm">
                      {{ acc.first_name }} {{ acc.last_name }}
                    </h4>
                    <span
                      :class="[
                        'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                        acc.user_role === 'admin'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-[#5A1C2A] text-[#E5C378]',
                      ]"
                    >
                      {{ acc.user_role }}
                    </span>
                  </div>
                  <div class="text-[11px] text-white/60 flex items-center gap-3 mt-1">
                    <span>{{ acc.position }}</span>
                    <span>•</span>
                    <span class="font-mono text-white/80">{{ acc.user_name }}</span>
                    <span>•</span>
                    <span>{{ acc.contact_number }}</span>
                  </div>
                </div>
              </div>

              <!-- Delete Action -->
              <div class="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  @click="handleDeleteClick(acc.user_id)"
                  class="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 transition-colors cursor-pointer"
                  title="Remove staff account"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Provision Account Form -->
        <div v-else class="p-6">
          <div class="flex items-center justify-between pb-3 border-b border-[#5A1C2A]/60 mb-4">
            <div>
              <h4 class="font-serif font-bold text-sm text-white">Provision Internal Staff Account</h4>
              <p class="text-[11px] text-white/50">Stored securely in USER_ACCOUNT and STAFF_DETAILS with Cloudflare D1 sync.</p>
            </div>
            <button
              type="button"
              @click="autofillDemoStaff"
              class="text-[11px] text-[#E5C378] hover:text-[#D4AF37] underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>Autofill Demo Staff</span>
            </button>
          </div>

          <form @submit.prevent="handleCreateSubmit" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">First Name</label>
                <input
                  type="text"
                  required
                  v-model="firstName"
                  placeholder="e.g. Julian"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Last Name</label>
                <input
                  type="text"
                  required
                  v-model="lastName"
                  placeholder="e.g. Vance"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Username</label>
                <input
                  type="text"
                  required
                  v-model="username"
                  placeholder="e.g. staff_julian"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Initial Password</label>
                <input
                  type="password"
                  required
                  v-model="password"
                  placeholder="At least 4 characters"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Position Title</label>
                <input
                  type="text"
                  required
                  v-model="position"
                  placeholder="e.g. Senior Concierge"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Role Authority</label>
                <select
                  v-model="role"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378] cursor-pointer"
                >
                  <option value="staff">Staff Member</option>
                  <option value="admin">Administrator / GM</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Phone Contact</label>
                <input
                  type="text"
                  required
                  v-model="contactNumber"
                  placeholder="e.g. +63 917 555 0100"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                />
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="px-6 py-3 rounded-xl bg-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-colors cursor-pointer disabled:opacity-50"
              >
                {{ loading ? 'Provisioning...' : 'Save & Provision Account' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, Users, UserPlus, Trash2, Sparkles } from 'lucide-vue-next';
import { useApi } from '../../composables/useApi';

const props = defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const { request } = useApi();

const activeTab = ref<'list' | 'create'>('list');
const accounts = ref<any[]>([]);
const fetching = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const firstName = ref('');
const lastName = ref('');
const username = ref('');
const password = ref('');
const position = ref('');
const role = ref<'staff' | 'admin'>('staff');
const contactNumber = ref('');

const autofillDemoStaff = () => {
  firstName.value = 'Julian';
  lastName.value = 'Vance';
  username.value = 'staff_julian';
  password.value = 'staff123';
  position.value = 'Senior Concierge';
  role.value = 'staff';
  contactNumber.value = '+63 917 555 0100';
  error.value = null;
};

const loadAccounts = async () => {
  fetching.value = true;
  try {
    const res = await request<{ success: boolean; data: any[] }>('/api/admin/accounts');
    if (res.success) {
      accounts.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load accounts:', err);
  } finally {
    fetching.value = false;
  }
};

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      loadAccounts();
      error.value = null;
      success.value = null;
    }
  }
);

const handleCreateSubmit = async () => {
  error.value = null;
  success.value = null;

  if (!username.value || !password.value || !firstName.value || !lastName.value) {
    error.value = 'Please complete all required fields.';
    return;
  }

  loading.value = true;
  try {
    const res = await request<{ success: boolean; message: string; data: any }>('/api/admin/accounts', {
      method: 'POST',
      body: JSON.stringify({
        user_name: username.value,
        password: password.value,
        first_name: firstName.value,
        last_name: lastName.value,
        position: position.value,
        user_role: role.value,
        contact_number: contactNumber.value,
      }),
    });

    success.value = res.message || 'Staff account created successfully!';
    activeTab.value = 'list';
    firstName.value = '';
    lastName.value = '';
    username.value = '';
    password.value = '';
    position.value = '';
    contactNumber.value = '';
    loadAccounts();
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    loading.value = false;
  }
};

const handleDeleteClick = async (userId: number) => {
  if (!confirm(`Are you sure you want to remove staff account #${userId}?`)) return;

  try {
    await request(`/api/admin/accounts?id=${userId}`, { method: 'DELETE' });
    loadAccounts();
  } catch (err) {
    alert((err as Error).message);
  }
};
</script>
