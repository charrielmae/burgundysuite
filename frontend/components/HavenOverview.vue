<template>
  <section id="haven" class="py-24 bg-[#FBF5F5] text-[#1C1917] relative overflow-hidden scroll-mt-20 transition-all duration-500">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <!-- Left Column: Editorial & Story -->
        <div class="lg:col-span-5 flex flex-col items-start">
          <!-- Location Pill -->
          <div
            class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#5A1C2A]/10 border border-[#5A1C2A]/20 text-[#5A1C2A] text-xs font-bold tracking-widest uppercase mb-6"
          >
            <MapPin class="w-3.5 h-3.5 text-[#5A1C2A]" />
            <span>Prime District • Emerald Bay</span>
          </div>

          <!-- Headline -->
          <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#2B0E14] leading-[1.2] mb-6">
            A Private Haven Nestled Between Cliffside & Crystal Waters
          </h2>

          <!-- Paragraphs -->
          <p class="text-sm sm:text-base text-[#5C4047] leading-relaxed mb-4">
            Situated in the prestigious coastal enclave of
            <strong class="text-[#2B0E14] font-semibold">Burgundy Cliff, Emerald Bay</strong>, our estate
            combines absolute privacy with sweeping panoramic views of the sea and surrounding verdant
            hills.
          </p>
          <p class="text-sm sm:text-base text-[#5C4047] leading-relaxed mb-8">
            Whether you are looking for a peaceful getaway, a romantic retreat, or an executive
            sanctuary, Burgundy Suite offers unparalleled seclusion just 20 minutes from the
            international airport, backed by 24/7 dedicated concierge service.
          </p>

          <!-- 3 Quick Stat Cards -->
          <div class="grid grid-cols-3 gap-3 sm:gap-4 w-full pt-4">
            <div
              class="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white border border-[#5A1C2A]/10 shadow-sm hover:shadow-md transition-shadow"
            >
              <Plane class="w-5 h-5 text-[#5A1C2A] mb-2" />
              <span class="font-bold text-xs sm:text-sm text-[#2B0E14]">20 Mins</span>
              <span class="text-[10px] text-[#5C4047] mt-0.5">From Int'l Airport</span>
            </div>

            <div
              class="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white border border-[#5A1C2A]/10 shadow-sm hover:shadow-md transition-shadow"
            >
              <Waves class="w-5 h-5 text-[#5A1C2A] mb-2" />
              <span class="font-bold text-xs sm:text-sm text-[#2B0E14]">Private Beach</span>
              <span class="text-[10px] text-[#5C4047] mt-0.5">Exclusive Ocean Front</span>
            </div>

            <div
              class="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white border border-[#5A1C2A]/10 shadow-sm hover:shadow-md transition-shadow"
            >
              <BellRing class="w-5 h-5 text-[#5A1C2A] mb-2" />
              <span class="font-bold text-xs sm:text-sm text-[#2B0E14]">Butler Service</span>
              <span class="text-[10px] text-[#5C4047] mt-0.5">24/7 Personalized</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Staggered Bento Masonry -->
        <div class="lg:col-span-7 relative">
          <div class="grid grid-cols-2 gap-4 sm:gap-5 items-start">
            <div class="flex flex-col gap-4 sm:gap-5">
              <div
                class="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-xl transition-all duration-500 group bg-[#2B0E14]"
              >
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85"
                  alt="Velvet Lotus Spa Towel and Amenities"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-[#2B0E14]/30 via-transparent to-transparent pointer-events-none"
                />
              </div>

              <div
                class="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-500 group bg-[#2B0E14]"
              >
                <img
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=85"
                  alt="Resort Pool at Twilight"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-[#2B0E14]/30 via-transparent to-transparent pointer-events-none"
                />
              </div>
            </div>

            <div class="flex flex-col gap-4 sm:gap-5">
              <div
                class="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-500 group bg-[#2B0E14]"
              >
                <img
                  src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=85"
                  alt="Plush Suite Bedroom with Balcony View"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-[#2B0E14]/30 via-transparent to-transparent pointer-events-none"
                />
              </div>

              <div
                class="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-xl transition-all duration-500 group bg-[#2B0E14]"
              >
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85"
                  alt="Modern Sunlit Villa Pavilion"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-[#2B0E14]/30 via-transparent to-transparent pointer-events-none"
                />
              </div>
            </div>
          </div>

          <!-- Floating 5.0 Award Badge -->
          <div
            class="absolute -bottom-5 left-6 sm:left-10 bg-[#2B0E14] border border-[#E5C378]/40 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 z-10 backdrop-blur-md"
          >
            <span class="font-serif text-2xl font-bold text-[#E5C378] tracking-tight">5.0</span>
            <div class="flex flex-col">
              <div class="flex items-center gap-1 text-[#E5C378]">
                <Star v-for="i in 5" :key="i" class="w-3.5 h-3.5 fill-[#E5C378]" />
              </div>
              <span class="text-[11px] font-semibold text-white/95 tracking-wide mt-0.5">
                World Luxury Hotel Award Winner
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plane, Waves, BellRing, Star, MapPin } from 'lucide-vue-next';
</script>
