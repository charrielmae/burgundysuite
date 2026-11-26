<template>
  <div class="min-h-screen bg-[#1B1014] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-[#F5EFEB]">
    <!-- Background Photography -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
      style="background-image: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85');"
    />

    <!-- Distinct Staff Operations Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-[#170D11]/92 via-[#241319]/88 to-[#12080B] backdrop-blur-[2px]" />
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-zinc-700/20 blur-[130px] rounded-full pointer-events-none" />

    <!-- Top Navigation -->
    <div class="w-full max-w-md mb-6 flex justify-between items-center relative z-10">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-zinc-300 hover:text-white transition-colors"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>Return to Guest Haven</span>
      </NuxtLink>
      <span class="text-[11px] text-zinc-300/80 tracking-widest uppercase font-semibold">
        Staff Portal
      </span>
    </div>

    <!-- Main Staff Login Card -->
    <div class="w-full max-w-md bg-[#241319]/95 border border-zinc-500/30 text-white rounded-3xl shadow-2xl p-8 relative z-10 backdrop-blur-md">
      <div class="text-center space-y-3 pb-6 border-b border-white/10">
        <div class="relative w-20 h-20 rounded-full overflow-hidden bg-[#170D11] border-2 border-zinc-400/50 mx-auto shadow-2xl p-3 flex items-center justify-center">
          <img
            src="/burgundylogov2.png"
            alt="Burgundy Suite Logo"
            class="w-full h-full object-contain"
          />
        </div>
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-zinc-800/90 text-zinc-300 border border-zinc-500/40 mb-2">
            Front Desk & Housekeeping
          </span>
          <h2 class="font-serif text-2xl font-bold text-white tracking-wide">
            Staff Operations Login
          </h2>
        </div>
      </div>

      <div v-if="error" class="my-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-medium">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 pt-5">
        <div>
          <label class="block text-[11px] font-bold tracking-widest uppercase text-white/70 mb-1.5">
            Staff Username or Email
          </label>
          <div class="relative">
            <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300/80" />
            <input
              type="text"
              required
              v-model="username"
              placeholder="e.g. staff_vincent"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#170D11] border border-white/15 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold tracking-widest uppercase text-white/70 mb-1.5">
            Password
          </label>
          <div class="relative">
            <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300/80" />
            <input
              type="password"
              required
              v-model="password"
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#170D11] border border-white/15 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full mt-2 py-3 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white border border-zinc-400/40 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
        >
          <span v-if="loading">Signing in...</span>
          <template v-else>
            <KeyRound class="w-4 h-4" />
            <span>Sign In to Staff Desk</span>
            <ArrowRight class="w-4 h-4" />
          </template>
        </button>

        <div class="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
          <span>Demo staff account?</span>
          <button
            type="button"
            @click="fillDemoCredentials"
            class="text-zinc-300 hover:text-zinc-200 underline cursor-pointer font-medium transition-colors"
          >
            Autofill Staff Login
          </button>
        </div>

        <div class="pt-2 text-center">
          <NuxtLink
            to="/admin"
            class="text-[11px] text-white/60 hover:text-[#E5C378] transition-colors font-medium"
          >
            Administrator? Sign in at Admin Portal →
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Lock, User, ArrowRight, ArrowLeft, KeyRound } from 'lucide-vue-next';
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
  username.value = 'staff_vincent';
  password.value = 'staff123';
  error.value = null;
};

const handleSubmit = async () => {
  if (!username.value || !password.value) return;
  loading.value = true;
  error.value = null;

  const result = await login(username.value, password.value, undefined, 'staff');
  if (result.success && result.user) {
    emit('login-success', result.user);
  } else {
    error.value = result.error || 'Authentication failed. Please verify staff credentials.';
  }
  loading.value = false;
};
</script>
