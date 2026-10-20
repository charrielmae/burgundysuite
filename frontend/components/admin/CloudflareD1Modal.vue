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
              <Cloud class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-serif text-lg font-bold text-white tracking-wide">
                Cloudflare Edge Services & D1 Telemetry
              </h3>
              <p class="text-[11px] text-[#E5C378]/80 font-medium">
                D1 Serverless Database, R2 Object Storage, and Edge Sync
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
        <div class="px-6 py-3 bg-[#240A10] border-b border-[#5A1C2A]/60 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="activeTab = 'status'"
              :class="[
                'px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer',
                activeTab === 'status' ? 'bg-[#5A1C2A] text-[#E5C378] shadow-md' : 'text-white/60 hover:text-white',
              ]"
            >
              Live Telemetry
            </button>
            <button
              type="button"
              @click="activeTab = 'd1'"
              :class="[
                'px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer',
                activeTab === 'd1' ? 'bg-[#5A1C2A] text-[#E5C378] shadow-md' : 'text-white/60 hover:text-white',
              ]"
            >
              D1 Credentials
            </button>
            <button
              type="button"
              @click="activeTab = 'r2'"
              :class="[
                'px-4 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer',
                activeTab === 'r2' ? 'bg-[#5A1C2A] text-[#E5C378] shadow-md' : 'text-white/60 hover:text-white',
              ]"
            >
              R2 Storage
            </button>
          </div>

          <button
            type="button"
            @click="checkStatus"
            :disabled="statusLoading"
            class="flex items-center gap-1.5 text-xs text-[#E5C378] hover:text-white cursor-pointer disabled:opacity-50"
          >
            <RefreshCw :class="['w-3.5 h-3.5', statusLoading ? 'animate-spin' : '']" />
            <span>Refresh</span>
          </button>
        </div>

        <!-- Notifications -->
        <div v-if="toast" :class="['m-6 mb-0 p-3.5 rounded-xl text-xs border', toast.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' : 'bg-rose-950/80 border-rose-800 text-rose-200']">
          {{ toast.message }}
        </div>

        <!-- Tab 1: Live Telemetry & Quick Sync -->
        <div v-if="activeTab === 'status'" class="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div v-if="statusLoading" class="text-center py-12 text-white/50 text-xs">
            Probing Cloudflare D1 & R2 connectivity...
          </div>
          <div v-else class="space-y-6">
            <!-- Connection Status Card -->
            <div
              :class="[
                'p-5 rounded-2xl border flex items-center justify-between',
                status?.connected
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-200',
              ]"
            >
              <div class="flex items-center gap-3">
                <CheckCircle2 v-if="status?.connected" class="w-6 h-6 text-emerald-400" />
                <AlertTriangle v-else class="w-6 h-6 text-amber-400" />
                <div>
                  <h4 class="font-serif font-bold text-white text-base">
                    {{ status?.connected ? 'Cloudflare D1 Connected & Verified' : 'D1 Offline or Local Fallback' }}
                  </h4>
                  <p class="text-xs text-white/70 mt-0.5">{{ status?.message }}</p>
                </div>
              </div>

              <!-- 1-Click Sync Button -->
              <button
                type="button"
                @click="handleManualSync"
                :disabled="loading"
                class="px-4 py-2 rounded-xl bg-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {{ loading ? 'Syncing...' : '1-Click Sync Data' }}
              </button>
            </div>

            <!-- Table Counts Grid -->
            <div v-if="status?.tables && status.tables.length > 0" class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-[#E5C378]">
                Cloudflare D1 Table Row Counts
              </h4>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  v-for="tbl in status.tables"
                  :key="tbl"
                  class="p-3 rounded-xl bg-[#381018] border border-[#5A1C2A] text-center"
                >
                  <span class="text-[10px] text-white/50 block font-mono">{{ tbl }}</span>
                  <span class="font-serif font-bold text-lg text-white mt-1 block">
                    {{ status?.counts?.[tbl] ?? 0 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- R2 Storage Status -->
            <div class="p-5 rounded-2xl bg-[#381018] border border-[#5A1C2A] space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs uppercase tracking-wider text-[#E5C378]">
                  Cloudflare R2 Object Storage
                </span>
                <span
                  :class="[
                    'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                    status?.r2?.connected ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-zinc-800 text-zinc-300',
                  ]"
                >
                  {{ status?.r2?.connected ? 'Connected' : 'Ready' }}
                </span>
              </div>
              <p class="text-xs text-white/70">{{ status?.r2?.message }}</p>
            </div>
          </div>
        </div>

        <!-- Tab 2: D1 Credentials Form -->
        <div v-else-if="activeTab === 'd1'" class="p-6">
          <form @submit.prevent="handleSaveD1" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Cloudflare Account ID</label>
              <input
                type="text"
                required
                v-model="accountId"
                placeholder="b730d1dce2f590cd1ae5726758a0e590"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Cloudflare D1 Database ID</label>
              <input
                type="text"
                required
                v-model="databaseId"
                placeholder="9b1eb0fe-1e04-44d1-9cc7-e1a800009618"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">Cloudflare API Token</label>
              <input
                type="password"
                required
                v-model="apiToken"
                placeholder="••••••••••••••••••••••••"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
            </div>

            <div class="pt-4 flex justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="px-6 py-2.5 rounded-xl bg-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-colors cursor-pointer disabled:opacity-50"
              >
                {{ loading ? 'Saving & Testing...' : 'Save & Connect D1' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Tab 3: R2 Credentials Form -->
        <div v-else class="p-6">
          <form @submit.prevent="handleSaveR2" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">R2 Bucket Name</label>
              <input
                type="text"
                required
                v-model="r2BucketName"
                placeholder="burgundy-bucket"
                class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
              />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">R2 Access Key ID</label>
                <input
                  type="text"
                  v-model="r2AccessKeyId"
                  placeholder="Optional S3 Key"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-bold uppercase tracking-wider text-[#E5C378] block">R2 Secret Access Key</label>
                <input
                  type="password"
                  v-model="r2SecretAccessKey"
                  placeholder="Optional S3 Secret"
                  class="w-full px-4 py-2.5 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white text-sm focus:outline-none focus:border-[#E5C378]"
                />
              </div>
            </div>

            <div class="pt-4 flex justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="px-6 py-2.5 rounded-xl bg-[#E5C378] text-[#2B0E14] text-xs font-bold uppercase tracking-wider hover:bg-[#D4AF37] transition-colors cursor-pointer disabled:opacity-50"
              >
                {{ loading ? 'Saving...' : 'Save R2 Settings' }}
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
import { X, Cloud, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-vue-next';
import { useApi } from '../../composables/useApi';

const props = defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const { request } = useApi();

const activeTab = ref<'status' | 'd1' | 'r2'>('status');
const accountId = ref('');
const databaseId = ref('');
const apiToken = ref('');

const r2BucketName = ref('');
const r2AccessKeyId = ref('');
const r2SecretAccessKey = ref('');

const loading = ref(false);
const statusLoading = ref(true);
const status = ref<any>(null);
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null);

const checkStatus = async () => {
  statusLoading.value = true;
  try {
    const res = await request<{ success: boolean; data: any }>('/api/cloudflare');
    if (res.success && res.data) {
      status.value = res.data;
      if (!accountId.value && res.data.r2?.config?.accountId) {
        accountId.value = res.data.r2.config.accountId;
      }
      if (!r2BucketName.value && res.data.r2?.config?.bucketName) {
        r2BucketName.value = res.data.r2.config.bucketName;
      }
    }
  } catch (err) {
    console.error('Failed to probe Cloudflare:', err);
  } finally {
    statusLoading.value = false;
  }
};

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      checkStatus();
      toast.value = null;
    }
  }
);

const handleManualSync = async () => {
  loading.value = true;
  toast.value = null;
  try {
    const res = await request<{ success: boolean; message: string; data: any }>('/api/cloudflare', {
      method: 'POST',
      body: JSON.stringify({ action: 'sync_now' }),
    });
    toast.value = { type: 'success', message: res.message || 'Data synchronized into Cloudflare D1!' };
    checkStatus();
  } catch (err) {
    toast.value = { type: 'error', message: (err as Error).message };
  } finally {
    loading.value = false;
  }
};

const handleSaveD1 = async () => {
  loading.value = true;
  toast.value = null;
  try {
    const res = await request<{ success: boolean; message: string }>('/api/cloudflare', {
      method: 'POST',
      body: JSON.stringify({
        accountId: accountId.value.trim(),
        databaseId: databaseId.value.trim(),
        apiToken: apiToken.value.trim(),
      }),
    });
    toast.value = { type: 'success', message: res.message || 'Cloudflare D1 credentials saved!' };
    activeTab.value = 'status';
    checkStatus();
  } catch (err) {
    toast.value = { type: 'error', message: (err as Error).message };
  } finally {
    loading.value = false;
  }
};

const handleSaveR2 = async () => {
  loading.value = true;
  toast.value = null;
  try {
    const res = await request<{ success: boolean; message: string }>('/api/cloudflare', {
      method: 'POST',
      body: JSON.stringify({
        action: 'save_r2',
        accountId: accountId.value.trim(),
        r2BucketName: r2BucketName.value.trim(),
        r2AccessKeyId: r2AccessKeyId.value.trim(),
        r2SecretAccessKey: r2SecretAccessKey.value.trim(),
      }),
    });
    toast.value = { type: 'success', message: res.message || 'R2 settings saved!' };
    activeTab.value = 'status';
    checkStatus();
  } catch (err) {
    toast.value = { type: 'error', message: (err as Error).message };
  } finally {
    loading.value = false;
  }
};
</script>
