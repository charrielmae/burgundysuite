<template>
  <footer class="bg-[#1a080c] text-white border-t border-[#5A1C2A]/60 pt-16 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#5A1C2A]/40">
        <!-- Brand Info -->
        <div class="space-y-4 md:col-span-1">
          <div class="flex items-center gap-3">
            <div
              class="relative w-10 h-10 rounded-full overflow-hidden bg-[#381018] border border-[#E5C378]/40 shadow-sm shrink-0 p-1.5 flex items-center justify-center"
            >
              <img
                src="/burgundylogov2.png"
                alt="Burgundy Suite Logo"
                class="w-full h-full object-contain"
              />
            </div>
            <div class="flex flex-col">
              <span class="font-serif tracking-wider text-white text-base font-bold uppercase">
                Burgundy Suite
              </span>
              <span class="text-[9px] tracking-widest text-[#E5C378]/70 uppercase">
                Boutique Haven & Spa
              </span>
            </div>
          </div>
          <p class="text-xs text-[#F5EFEB]/70 leading-relaxed">
            A private coastal haven in Emerald Bay where world-class hospitality, fine dining, and
            secluded architectural suites converge.
          </p>
          <div class="flex items-center gap-3 pt-2 text-[#E5C378]">
            <Globe class="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
            <Share2 class="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
            <Compass class="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-3">
          <h4 class="font-serif text-sm font-bold text-[#E5C378] uppercase tracking-wider">
            Navigation
          </h4>
          <ul class="space-y-2 text-xs text-[#F5EFEB]/75">
            <li>
              <a href="#home" @click.prevent="scrollToSection('home')" class="hover:text-[#E5C378] transition-colors cursor-pointer">Home Sanctuary</a>
            </li>
            <li>
              <a href="#haven" @click.prevent="scrollToSection('haven')" class="hover:text-[#E5C378] transition-colors cursor-pointer">The Haven & Estate</a>
            </li>
            <li>
              <a href="#suites" @click.prevent="scrollToSection('suites')" class="hover:text-[#E5C378] transition-colors cursor-pointer">Suites & Private Villas</a>
            </li>
            <li>
              <a href="#amenities" @click.prevent="scrollToSection('amenities')" class="hover:text-[#E5C378] transition-colors cursor-pointer">Curated Indulgences</a>
            </li>
            <li>
              <NuxtLink
                to="/admin"
                class="hover:text-[#E5C378] transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck class="w-3 h-3 text-[#E5C378]" />
                <span>Admin Portal</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Suites Showcase -->
        <div class="space-y-3">
          <h4 class="font-serif text-sm font-bold text-[#E5C378] uppercase tracking-wider">
            Accommodations
          </h4>
          <ul class="space-y-2 text-xs text-[#F5EFEB]/75">
            <li>Deluxe Suite — From ₱18,500/nt</li>
            <li>Executive King — From ₱28,000/nt</li>
            <li>Presidential Suite — From ₱55,000/nt</li>
            <li>Penthouse Haven — From ₱95,000/nt</li>
            <li class="text-[11px] text-[#E5C378] pt-1">
              ★ 24/7 Butler & Helipad Transfer
            </li>
          </ul>
        </div>

        <!-- Contact & Concierge -->
        <div class="space-y-3">
          <h4 class="font-serif text-sm font-bold text-[#E5C378] uppercase tracking-wider">
            Concierge & Arrival
          </h4>
          <div class="space-y-2.5 text-xs text-[#F5EFEB]/75">
            <div class="flex items-start gap-2">
              <MapPin class="w-4 h-4 text-[#E5C378] shrink-0 mt-0.5" />
              <span>Burgundy Cliff, Emerald Bay Enclave, Sapphire Coast</span>
            </div>
            <div class="flex items-center gap-2">
              <Phone class="w-4 h-4 text-[#E5C378] shrink-0" />
              <span>+63 917 888 2874 / (02) 8555-BURG</span>
            </div>
            <div class="flex items-center gap-2">
              <Mail class="w-4 h-4 text-[#E5C378] shrink-0" />
              <span>concierge@burgundysuite.com</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar with Admin Portal Pill -->
      <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
        <p>© 2026 Burgundy Suite & Resort. All rights reserved.</p>
        <div class="flex flex-wrap items-center gap-5">
          <span class="hover:text-white cursor-pointer">Privacy Policy</span>
          <span class="hover:text-white cursor-pointer">Terms of Hospitality</span>
          <span class="hover:text-white cursor-pointer">Concierge Protocols</span>
          <NuxtLink
            to="/admin"
            class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2B0E14] border border-[#5A1C2A] text-[#E5C378] hover:text-white hover:border-[#E5C378] transition-all cursor-pointer shadow-xs ml-1"
          >
            <ShieldCheck class="w-3.5 h-3.5 text-[#E5C378]" />
            <span class="font-semibold text-[11px]">Admin Portal</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { MapPin, Phone, Mail, Globe, Share2, Compass, ShieldCheck } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const scrollToSection = (id: string) => {
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
