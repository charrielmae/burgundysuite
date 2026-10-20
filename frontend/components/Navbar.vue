<template>
  <div>
    <header
      :class="[
        'sticky top-0 z-40 w-full transition-colors',
        isAdmin
          ? 'bg-white border-b border-slate-200 shadow-xs'
          : 'bg-[#381018]/95 backdrop-blur-md border-b border-[#5A1C2A]/60 shadow-lg',
      ]"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <!-- Brand Logo & Title -->
        <NuxtLink to="/" class="flex items-center gap-2.5 sm:gap-3.5 group">
          <div
            class="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#381018] border border-[#E5C378]/50 shadow-md group-hover:border-[#E5C378] group-hover:shadow-[#E5C378]/25 transition-all duration-300 shrink-0 p-1.5 flex items-center justify-center"
          >
            <img
              src="/burgundylogov2.png"
              alt="Burgundy Suite Logo"
              class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div class="flex flex-col">
            <span
              :class="[
                'font-serif tracking-[0.12em] sm:tracking-[0.18em] text-sm sm:text-lg font-bold uppercase leading-tight transition-colors',
                isAdmin ? 'text-slate-900 group-hover:text-[#741B2D]' : 'text-white group-hover:text-[#E5C378]',
              ]"
            >
              Burgundy Suite
            </span>
            <span
              :class="[
                'text-[9px] sm:text-[10px] tracking-[0.18em] sm:tracking-[0.25em] uppercase font-medium',
                isAdmin ? 'text-[#741B2D]' : 'text-[#E5C378]/80',
              ]"
            >
              Boutique Haven & Resort
            </span>
          </div>
        </NuxtLink>

        <!-- Center Navigation Links (Hidden on small screens) -->
        <nav
          v-if="!isAdmin"
          class="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wider text-[#F5EFEB]/80 uppercase"
        >
          <a
            href="#home"
            @click.prevent="scrollToSection('home')"
            class="hover:text-[#E5C378] transition-all duration-300 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#E5C378] after:transition-all after:duration-300"
          >
            Home
          </a>
          <a
            href="#haven"
            @click.prevent="scrollToSection('haven')"
            class="hover:text-[#E5C378] transition-all duration-300 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#E5C378] after:transition-all after:duration-300"
          >
            The Haven
          </a>
          <a
            href="#suites"
            @click.prevent="scrollToSection('suites')"
            class="hover:text-[#E5C378] transition-all duration-300 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#E5C378] after:transition-all after:duration-300"
          >
            Suites & Villa
          </a>
          <a
            href="#amenities"
            @click.prevent="scrollToSection('amenities')"
            class="hover:text-[#E5C378] transition-all duration-300 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#E5C378] after:transition-all after:duration-300"
          >
            Amenities
          </a>
          <button
            type="button"
            @click="$emit('open-my-bookings')"
            class="flex items-center gap-1.5 hover:text-[#E5C378] transition-colors cursor-pointer text-[#E5C378]"
            title="Verify your suite reservation with your email address"
          >
            <BookmarkCheck class="w-3.5 h-3.5" />
            <span>Verify Booking</span>
          </button>
        </nav>

        <!-- Right CTA Actions & Mobile Toggle Button -->
        <div class="flex items-center gap-2 sm:gap-3">
          <NuxtLink
            v-if="isAdmin"
            to="/"
            class="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300 transition-all duration-200"
          >
            <ShieldCheck class="w-3.5 h-3.5 text-[#741B2D]" />
            <span class="hidden sm:inline">Guest Portal</span>
          </NuxtLink>

          <!-- Reserve CTA -->
          <button
            v-if="!isAdmin"
            type="button"
            @click="$emit('open-booking')"
            class="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer whitespace-nowrap"
          >
            <Calendar class="w-3.5 h-3.5" />
            <span>Reserve Now</span>
          </button>

          <!-- Mobile Hamburger Toggle Button -->
          <button
            v-if="!isAdmin"
            type="button"
            @click="mobileMenuOpen = true"
            aria-label="Open navigation menu"
            class="md:hidden p-2 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white hover:text-[#E5C378] transition-colors cursor-pointer flex items-center justify-center shadow-xs ml-1"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Drawer Overlay & Panel -->
    <Teleport to="body">
      <div v-if="!isAdmin">
        <!-- Backdrop -->
        <div
          :class="[
            'md:hidden fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm transition-opacity duration-300',
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
          ]"
          @click="mobileMenuOpen = false"
        />

        <!-- Sliding Panel -->
        <div
          :class="[
            'md:hidden fixed top-0 right-0 z-[9999] h-full w-72 bg-[#2B0E14] border-l border-[#5A1C2A]/60 shadow-2xl transition-transform duration-300 ease-in-out',
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
          ]"
        >
          <div class="flex items-center justify-between px-5 h-20 border-b border-[#5A1C2A]/60">
            <span class="font-serif text-sm font-bold tracking-[0.15em] uppercase text-white">Menu</span>
            <button
              type="button"
              @click="mobileMenuOpen = false"
              aria-label="Close menu"
              class="p-2 rounded-xl bg-[#381018] border border-[#5A1C2A] text-white hover:text-[#E5C378] transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <nav class="flex flex-col px-5 py-6 space-y-1">
            <a
              href="#home"
              @click.prevent="scrollToSection('home')"
              class="flex items-center justify-between py-3 text-sm font-semibold tracking-wider text-[#F5EFEB] hover:text-[#E5C378] border-b border-[#5A1C2A]/40 transition-colors uppercase"
            >
              <span>Home</span>
              <span class="text-[#E5C378]/50 text-xs">01</span>
            </a>
            <a
              href="#haven"
              @click.prevent="scrollToSection('haven')"
              class="flex items-center justify-between py-3 text-sm font-semibold tracking-wider text-[#F5EFEB] hover:text-[#E5C378] border-b border-[#5A1C2A]/40 transition-colors uppercase"
            >
              <span>The Haven</span>
              <span class="text-[#E5C378]/50 text-xs">02</span>
            </a>
            <a
              href="#suites"
              @click.prevent="scrollToSection('suites')"
              class="flex items-center justify-between py-3 text-sm font-semibold tracking-wider text-[#F5EFEB] hover:text-[#E5C378] border-b border-[#5A1C2A]/40 transition-colors uppercase"
            >
              <span>Suites & Villa</span>
              <span class="text-[#E5C378]/50 text-xs">03</span>
            </a>
            <a
              href="#amenities"
              @click.prevent="scrollToSection('amenities')"
              class="flex items-center justify-between py-3 text-sm font-semibold tracking-wider text-[#F5EFEB] hover:text-[#E5C378] border-b border-[#5A1C2A]/40 transition-colors uppercase"
            >
              <span>Amenities</span>
              <span class="text-[#E5C378]/50 text-xs">04</span>
            </a>

            <button
              type="button"
              @click="
                mobileMenuOpen = false;
                $emit('open-my-bookings');
              "
              class="flex items-center justify-between py-3 text-sm font-semibold tracking-wider text-[#E5C378] hover:text-white border-b border-[#5A1C2A]/40 transition-colors uppercase text-left w-full cursor-pointer"
            >
              <span class="flex items-center gap-2">
                <BookmarkCheck class="w-4 h-4 text-[#E5C378]" />
                Verify Booking
              </span>
              <span
                class="text-[10px] px-2 py-0.5 rounded-full bg-[#5A1C2A] text-[#E5C378] border border-[#E5C378]/30"
              >
                Guest
              </span>
            </button>

            <div class="pt-4">
              <button
                type="button"
                @click="
                  mobileMenuOpen = false;
                  $emit('open-booking');
                "
                class="w-full py-3 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-[#D4AF37] to-[#E5C378] text-[#2B0E14] shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <Calendar class="w-4 h-4" />
                <span>Reserve Now</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Calendar, ShieldCheck, BookmarkCheck, Menu, X } from 'lucide-vue-next';

defineEmits<{
  (e: 'open-booking', suiteTypeId?: number): void;
  (e: 'open-my-bookings'): void;
}>();

const mobileMenuOpen = ref(false);
const route = useRoute();
const router = useRouter();
const isAdmin = computed(() => route.path.startsWith('/admin'));

const scrollToSection = (id: string) => {
  mobileMenuOpen.value = false;
  if (route.path !== '/') {
    router.push({ path: '/', hash: `#${id}` });
    return;
  }

  const el = document.getElementById(id);
  if (el) {
    const navbarHeight = 80;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });

    if (history.pushState) {
      history.pushState(null, '', `#${id}`);
    }
  }
};
</script>
