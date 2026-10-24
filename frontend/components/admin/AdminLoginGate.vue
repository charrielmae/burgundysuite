<template>
  <div class="min-h-screen bg-[#2B0E14] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-[#F5EFEB]">
    <!-- Background Photography -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
      style="background-image: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85');"
    />

    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-[#2B0E14]/90 via-[#381018]/85 to-[#170509] backdrop-blur-[2px]" />
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#5A1C2A]/40 blur-[130px] rounded-full pointer-events-none" />

    <!-- Back to Guest Portal Link -->
    <div class="w-full max-w-md mb-6 flex justify-between items-center relative z-10">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#E5C378] hover:text-white transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Return to Guest Haven</span>
      </NuxtLink>
      <span class="text-[11px] text-[#E5C378]/60 tracking-widest uppercase font-semibold">
        Admin Portal
      </span>
    </div>

    <!-- Main Login Card -->
    <div class="w-full max-w-md bg-[#381018]/95 border border-[#5A1C2A] text-white rounded-3xl shadow-2xl p-8 relative z-10 backdrop-blur-md">
      <!-- Emblem & Title -->
      <div class="text-center space-y-3 pb-6 border-b border-[#5A1C2A]/70">
        <div class="relative w-20 h-20 rounded-full overflow-hidden bg-[#240A10] border-2 border-[#E5C378]/50 mx-auto shadow-2xl p-3 flex items-center justify-center">
          <img
            src="/burgundylogov2.png"
            alt="Burgundy Suite Logo"
            class="w-full h-full object-contain"
          />
        </div>
        <div>
          <h2 class="font-serif text-2xl font-bold text-white tracking-wide">
            Admin Login
          </h2>
        </div>
      </div>

      <!-- Error notification -->
      <div v-if="error" class="my-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-medium">
        {{ error }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4 pt-5">
        <div>
          <label class="block text-[11px] font-bold tracking-widest uppercase text-white/70 mb-1.5">
            Email or Username
          </label>
          <div class="relative">
            <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E5C378]/70" />
            <input
              type="text"
              required
              v-model="username"
              placeholder="e.g. admin@burgundysuite.com"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#E5C378] transition-colors"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold tracking-widest uppercase text-white/70 mb-1.5">
            Password
          </label>
          <div class="relative">
            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E5C378]/70" />
            <input
              type="password"
              required
              v-model="password"
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#240A10] border border-[#5A1C2A] text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#E5C378] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full mt-2 py-3 rounded-xl bg-[#5A1C2A] hover:bg-[#6D2233] text-[#E5C378] border border-[#E5C378]/30 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
        >
          <span v-if="loading">Signing in...</span>
          <template v-else>
            <KeyRound class="w-4 h-4" />
            <span>Sign In</span>
            <ArrowRight class="w-4 h-4" />
          </template>
        </button>

        <!-- Quick Demo Credentials Helper -->
        <div class="pt-4 border-t border-[#5A1C2A]/60 flex items-center justify-between text-xs text-white/50">
          <span>Need demo access?</span>
          <button
            type="button"
            @click="fillDemoCredentials"
            class="text-[#E5C378] hover:text-[#D4AF37] underline cursor-pointer font-medium transition-colors"
          >
            Autofill Demo Login
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  KeyRound,
} from 'lucide-vue-next';
import { useAuth } from '../../composables/useAuth';

const emit = defineEmits<{
  (e: 'login-success', user: any): void;
}>();

const { login } = useAuth();
const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

const fillDemoCredentials = () => {
  username.value = 'admin@burgundysuite.com';
  password.value = 'admin123password';
  error.value = null;
};

const handleSubmit = async () => {
  if (!username.value || !password.value) return;
  loading.value = true;
  error.value = null;

  const result = await login(username.value, password.value);
  if (result.success && result.user) {
    emit('login-success', result.user);
  } else {
    error.value = result.error || 'Authentication failed. Please verify credentials.';
  }
  loading.value = false;
};
</script>
