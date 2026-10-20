<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div
        v-if="isOpen"
        @click.self="$emit('close')"
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm"
      >
        <div
          class="modal-card relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white border border-slate-200 text-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto"
        >
          <!-- Compact Header -->
          <div class="px-5 sm:px-6 py-3 sm:py-3.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-[#741B2D]/10 text-[#741B2D] flex items-center justify-center border border-[#741B2D]/20 shrink-0"
              >
                <Hotel class="w-4 h-4 text-[#741B2D]" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-tight">
                    Add New Suite / Room
                  </h3>
                  <span
                    class="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1 shrink-0"
                  >
                    <Cloud class="w-2.5 h-2.5 text-emerald-600" />
                    <span>Cloudflare D1 & R2</span>
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 leading-tight mt-0.5 hidden sm:block">
                  Publish a new accommodation type directly to the guest portal, Cloudflare D1, and R2 Object Storage.
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="$emit('close')"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Form Wrapping Body and Footer -->
          <form @submit.prevent="handleSubmit" id="add-suite-form" class="flex flex-col flex-1 min-h-0 overflow-hidden">
            <!-- Scrollable Body Container -->
            <div class="flex-1 overflow-y-auto px-5 sm:px-6 py-3.5 sm:py-4 space-y-3.5">
              <!-- Notifications -->
              <div
                v-if="error"
                class="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5"
              >
                <span class="font-bold">Error:</span>
                <span>{{ error }}</span>
              </div>
              <div
                v-if="uploadSuccess"
                class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-1.5"
              >
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                <span>{{ uploadSuccess }}</span>
              </div>

              <!-- Two-Column Grid: Form + Live Preview -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <!-- Left Column: Form Fields (7 cols) -->
                <div class="lg:col-span-7 space-y-2.5">
                  <!-- Suite Name -->
                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Room / Suite Name *
                    </label>
                    <input
                      type="text"
                      required
                      v-model="roomType"
                      placeholder="e.g., Royal Ocean Penthouse, Deluxe Suite"
                      class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#741B2D] shadow-xs"
                    />
                  </div>

                  <!-- Price & Capacity Side by Side -->
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Price Per Night (₱) *
                      </label>
                      <div class="relative">
                        <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₱</span>
                        <input
                          type="number"
                          required
                          min="1"
                          v-model.number="ratePerNight"
                          placeholder="320"
                          class="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#741B2D] shadow-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Guest Capacity *
                      </label>
                      <div class="relative">
                        <Users class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="number"
                          required
                          min="1"
                          max="16"
                          v-model.number="roomCapacity"
                          placeholder="2"
                          class="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#741B2D] shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Short Description -->
                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Short Description
                    </label>
                    <textarea
                      rows="2"
                      required
                      v-model="description"
                      placeholder="Spacious coastal retreat with ocean view balcony and plush king bedding."
                      class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#741B2D] shadow-xs leading-relaxed resize-none"
                    />
                  </div>

                  <!-- Suite Image Controls -->
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <label class="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Suite Image
                      </label>
                      <div class="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px]">
                        <button
                          type="button"
                          @click="imageMode = 'upload'"
                          :class="[
                            'px-2 py-0.5 rounded font-medium transition-colors cursor-pointer flex items-center gap-1',
                            imageMode === 'upload' ? 'bg-white text-[#741B2D] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900',
                          ]"
                        >
                          <UploadCloud class="w-3 h-3" />
                          <span>Upload to R2</span>
                        </button>
                        <button
                          type="button"
                          @click="imageMode = 'presets'"
                          :class="[
                            'px-2 py-0.5 rounded font-medium transition-colors cursor-pointer',
                            imageMode === 'presets' ? 'bg-white text-[#741B2D] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900',
                          ]"
                        >
                          Presets
                        </button>
                        <button
                          type="button"
                          @click="imageMode = 'url'"
                          :class="[
                            'px-2 py-0.5 rounded font-medium transition-colors cursor-pointer flex items-center gap-1',
                            imageMode === 'url' ? 'bg-white text-[#741B2D] font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900',
                          ]"
                        >
                          <LinkIcon class="w-2.5 h-2.5" />
                          <span>URL</span>
                        </button>
                      </div>
                    </div>

                    <!-- Upload Mode: Compact Dropzone -->
                    <div
                      v-if="imageMode === 'upload'"
                      @dragover.prevent="dragActive = true"
                      @dragleave.prevent="dragActive = false"
                      @drop.prevent="handleDrop"
                      @click="triggerFileInput"
                      :class="[
                        'p-3 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer',
                        dragActive ? 'border-[#741B2D] bg-[#741B2D]/5' : 'border-slate-200 bg-slate-50/50 hover:border-[#741B2D]/40',
                      ]"
                    >
                      <input
                        type="file"
                        ref="fileInputRef"
                        @change="handleFileChange"
                        accept="image/*"
                        class="hidden"
                      />
                      <div class="w-7 h-7 rounded-full bg-rose-50 text-[#741B2D] flex items-center justify-center mb-1">
                        <UploadCloud class="w-3.5 h-3.5" />
                      </div>
                      <span class="text-[11px] font-semibold text-slate-700">
                        {{ isUploading ? 'Uploading to Cloudflare R2...' : 'Click to select an image, or drag & drop here' }}
                      </span>
                      <span class="text-[9px] text-slate-400 mt-0.5">
                        JPG, PNG, WEBP, GIF up to 15MB • Target: Cloudflare R2 burgundy-bucket
                      </span>
                    </div>

                    <!-- Presets Mode: Mini Thumbnails -->
                    <div v-else-if="imageMode === 'presets'" class="grid grid-cols-5 gap-1.5 p-1.5 rounded-xl border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        v-for="p in PHOTO_PRESETS"
                        :key="p.name"
                        @click="imageUrl = p.url"
                        :class="[
                          'relative aspect-video rounded-lg overflow-hidden border transition-all cursor-pointer group',
                          imageUrl === p.url ? 'border-[#741B2D] ring-2 ring-[#741B2D]/30' : 'border-slate-200 opacity-75 hover:opacity-100',
                        ]"
                        :title="p.name"
                      >
                        <img :src="p.url" :alt="p.name" class="w-full h-full object-cover" />
                        <span class="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white truncate px-1 py-0.5 text-center">
                          {{ p.name }}
                        </span>
                      </button>
                    </div>

                    <!-- Direct URL Mode -->
                    <div v-else>
                      <input
                        type="url"
                        v-model="imageUrl"
                        placeholder="https://images.unsplash.com/photo-..."
                        class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#741B2D] shadow-xs"
                      />
                    </div>
                  </div>

                  <!-- Key Amenities (3 bullet points) -->
                  <div>
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Key Amenities (Display bullet points in guest card)
                    </label>
                    <div class="space-y-1.5">
                      <input
                        type="text"
                        v-model="feature1"
                        placeholder="Feature 1 (e.g. Balcony with Sea Breeze)"
                        class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#741B2D] shadow-xs"
                      />
                      <input
                        type="text"
                        v-model="feature2"
                        placeholder="Feature 2 (e.g. En-suite Rain Shower)"
                        class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#741B2D] shadow-xs"
                      />
                      <input
                        type="text"
                        v-model="feature3"
                        placeholder="Feature 3 (e.g. Artisanal Mini Bar)"
                        class="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#741B2D] shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <!-- Right Column: Live Guest View Preview (5 cols) -->
                <div class="lg:col-span-5 flex flex-col">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles class="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Guest View Live Preview</span>
                    </span>
                    <span class="text-[10px] text-slate-400 font-medium">Auto-updates</span>
                  </div>

                  <div class="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 flex items-center justify-center flex-1">
                    <!-- Luxury Suite Card (Larger preview card matching guest view) -->
                    <div class="w-full max-w-[340px] sm:max-w-[360px] bg-white rounded-2xl overflow-hidden border border-[#5A1C2A]/15 shadow-xl flex flex-col justify-between">
                      <!-- Photo with Capacity Badge -->
                      <div class="relative aspect-[4/3] overflow-hidden bg-[#2B0E14]">
                        <img
                          :src="imageUrl || PHOTO_PRESETS[0].url"
                          :alt="roomType || 'Suite Preview'"
                          class="w-full h-full object-cover"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        <!-- Capacity Badge -->
                        <div class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#2B0E14]/85 backdrop-blur-md border border-[#E5C378]/30 text-[#E5C378] text-[9px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                          <Users class="w-3 h-3 text-[#E5C378]" />
                          <span>Up to {{ roomCapacity || 2 }} Guests</span>
                        </div>

                        <!-- R2 indicator if uploaded -->
                        <div
                          v-if="uploadedFileName"
                          class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[9px] text-[#E5C378] flex items-center gap-1"
                        >
                          <Cloud class="w-3 h-3" />
                          <span class="truncate max-w-[130px]">{{ uploadedFileName }}</span>
                        </div>
                      </div>

                      <!-- Card Body -->
                      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 class="font-serif text-lg font-bold text-[#2B0E14] truncate">
                            {{ roomType || 'Deluxe Suite' }}
                          </h4>
                          <p class="text-xs text-[#5C4047] leading-relaxed line-clamp-2 mt-1">
                            {{ description || 'Spacious coastal retreat with ocean view balcony and plush king bedding.' }}
                          </p>

                          <!-- Amenities bullet points -->
                          <div class="space-y-1.5 pt-2.5 mt-2.5 border-t border-[#5A1C2A]/10 text-[11px] text-[#5C4047]">
                            <div
                              v-for="(f, i) in activeFeatures"
                              :key="i"
                              class="flex items-center gap-2"
                            >
                              <span class="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                              <span class="truncate">{{ f }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Card Price and Action -->
                        <div class="pt-3 border-t border-[#5A1C2A]/10 flex items-center justify-between">
                          <div class="flex flex-col">
                            <span class="text-[9px] text-[#5C4047] uppercase tracking-wider font-semibold">
                              Starting from
                            </span>
                            <div class="flex items-baseline gap-1">
                              <span class="font-serif text-lg sm:text-xl font-bold text-[#742537]">
                                ₱{{ ratePerNight || 320 }}
                              </span>
                              <span class="text-[10px] text-[#5C4047]">/ night</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled
                            class="px-3 py-1.5 rounded-lg bg-[#2B0E14] text-[#E5C378] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow cursor-default"
                          >
                            <span>Book Suite</span>
                            <ArrowRight class="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fixed Footer inside Form -->
            <div class="px-5 sm:px-6 py-2.5 sm:py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                @click="$emit('close')"
                :disabled="submitting"
                class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                @click="handleSubmit"
                :disabled="submitting || isUploading"
                class="px-5 sm:px-6 py-2 rounded-xl bg-[#741B2D] hover:bg-[#5A1C2A] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <Plus v-if="!submitting" class="w-4 h-4" />
                <div v-else class="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>{{ submitting ? 'Publishing to Cloudflare...' : 'Add Suite to Guest View' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  X,
  Hotel,
  Cloud,
  Users,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Link as LinkIcon,
  CheckCircle2,
  Plus,
} from 'lucide-vue-next';
import { useApi } from '../../composables/useApi';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success', name: string): void;
}>();

const PHOTO_PRESETS = [
  {
    name: 'Coastal Haven',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Ocean Villa',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sunset Penthouse',
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Boutique Terrace',
    url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Royal Master',
    url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
  },
];

const { request } = useApi();

const roomType = ref('');
const ratePerNight = ref<number | ''>(320);
const roomCapacity = ref<number | ''>(2);
const imageUrl = ref(PHOTO_PRESETS[0].url);
const description = ref('Spacious coastal retreat with ocean view balcony and plush king bedding.');
const feature1 = ref('Balcony with Sea Breeze');
const feature2 = ref('En-suite Rain Shower');
const feature3 = ref('Artisanal Mini Bar');

const imageMode = ref<'upload' | 'presets' | 'url'>('upload');
const submitting = ref(false);
const isUploading = ref(false);
const error = ref<string | null>(null);
const uploadSuccess = ref<string | null>(null);
const uploadedFileName = ref<string | null>(null);
const dragActive = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const activeFeatures = computed(() => {
  const list = [feature1.value, feature2.value, feature3.value].filter(Boolean);
  return list.length > 0 ? list : ['Balcony with Sea Breeze', 'En-suite Rain Shower', 'Artisanal Mini Bar'];
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      error.value = null;
      uploadSuccess.value = null;
    }
  }
);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    handleFileUpload(target.files[0]);
  }
};

const handleDrop = (e: DragEvent) => {
  dragActive.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    handleFileUpload(e.dataTransfer.files[0]);
  }
};

const handleFileUpload = async (file: File) => {
  error.value = null;
  uploadSuccess.value = null;

  if (!file.type.startsWith('image/')) {
    error.value = 'Please upload an image file (JPG, PNG, WEBP, or GIF).';
    return;
  }

  uploadedFileName.value = file.name;
  isUploading.value = true;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'suites');

    const res = await request<{ success: boolean; data: any; message: string }>('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.success && res.data) {
      imageUrl.value = res.data.url;
      uploadSuccess.value = `Uploaded to Cloudflare R2: ${res.data.key}`;
    }
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    isUploading.value = false;
  }
};

const handleSubmit = async () => {
  if (!roomType.value.trim()) {
    error.value = 'Please provide a room or suite name.';
    return;
  }
  if (!ratePerNight.value || Number(ratePerNight.value) <= 0) {
    error.value = 'Please specify a valid nightly rate in ₱.';
    return;
  }
  if (!roomCapacity.value || Number(roomCapacity.value) <= 0) {
    error.value = 'Please specify guest capacity (e.g. 2).';
    return;
  }

  submitting.value = true;
  error.value = null;

  try {
    const payload = {
      room_type: roomType.value.trim(),
      rate_per_night: Number(ratePerNight.value),
      room_capacity: Number(roomCapacity.value),
      description: description.value.trim() || 'Curated luxury accommodation with bespoke appointments.',
      image_url: imageUrl.value.trim() || PHOTO_PRESETS[0].url,
      features: [feature1.value, feature2.value, feature3.value].filter(Boolean),
    };

    const res = await request<{ success: boolean; message: string; data: any }>('/api/room-types', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const createdName = payload.room_type;
    roomType.value = '';
    uploadedFileName.value = null;

    emit('success', createdName);
    emit('close');
  } catch (err) {
    error.value = (err as Error).message;
  } finally {
    submitting.value = false;
  }
};
</script>
