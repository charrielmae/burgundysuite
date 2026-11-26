<template>
  <section class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h3 class="font-serif text-2xl font-bold text-white tracking-wide flex items-center gap-2.5">
          <Users class="w-6 h-6 text-[#E5C378]" />
          <span>Team Presence (Admins & Staff)</span>
        </h3>
        <p class="text-xs text-white/60 mt-1">
          Live online/offline status powered by Cloudflare Durable Objects • Green = Online, Grey = Offline
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs">
        <div class="flex items-center p-1 rounded-xl bg-[#240A10] border border-[#5A1C2A]">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            @click="filter = tab.key"
            :class="[
              'px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
              filter === tab.key
                ? 'bg-[#5A1C2A] text-[#E5C378] font-bold shadow-md'
                : 'text-white/70 hover:text-white',
            ]"
          >
            {{ tab.label }} ({{ tab.count }})
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="member in filteredMembers"
        :key="member.user_id"
        :class="[
          'p-4 rounded-2xl bg-[#381018]/90 border transition-all flex items-center justify-between gap-3 shadow-lg',
          member.is_online ? 'border-emerald-500/40' : 'border-zinc-600/40',
        ]"
      >
        <div class="flex items-center gap-3 min-w-0">
          <div class="relative shrink-0">
            <div class="w-10 h-10 rounded-full bg-[#240A10] border border-[#5A1C2A] flex items-center justify-center font-serif font-bold text-[#E5C378] text-sm">
              {{ member.first_name?.[0] || member.user_name?.[0] || 'U' }}
            </div>
            <!-- Online (Green) / Offline (Grey) Status Dot -->
            <span
              :title="member.is_online ? 'Online' : 'Offline'"
              :class="[
                'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#381018]',
                member.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500',
              ]"
            />
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="font-serif font-bold text-sm text-white truncate">
                {{ member.first_name }} {{ member.last_name }}
              </h4>
              <span
                :class="[
                  'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0',
                  member.user_role === 'admin'
                    ? 'bg-amber-950/90 text-amber-300 border border-amber-700/60'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-600/60',
                ]"
              >
                {{ member.user_role }}
              </span>
            </div>
            <p class="text-[11px] text-white/60 truncate mt-0.5">
              {{ member.position }} • <span class="font-mono text-white/75">{{ member.user_name }}</span>
            </p>
          </div>
        </div>

        <span
          :class="[
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 border',
            member.is_online
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              : 'bg-zinc-800/80 text-zinc-400 border-zinc-600/40',
          ]"
        >
          <span
            :class="[
              'w-2 h-2 rounded-full',
              member.is_online ? 'bg-emerald-400' : 'bg-zinc-400',
            ]"
          />
          <span>{{ member.is_online ? 'Online' : 'Offline' }}</span>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Users } from 'lucide-vue-next';

const props = defineProps<{
  members: any[];
}>();

const filter = ref<'all' | 'online' | 'offline' | 'admin' | 'staff'>('all');

const onlineCount = computed(() => props.members.filter((m) => m.is_online).length);
const offlineCount = computed(() => props.members.filter((m) => !m.is_online).length);
const adminCount = computed(() => props.members.filter((m) => m.user_role === 'admin').length);
const staffCount = computed(() => props.members.filter((m) => m.user_role === 'staff').length);

const tabs = computed(() => [
  { key: 'all' as const, label: 'All', count: props.members.length },
  { key: 'online' as const, label: 'Online', count: onlineCount.value },
  { key: 'offline' as const, label: 'Offline', count: offlineCount.value },
  { key: 'admin' as const, label: 'Admin', count: adminCount.value },
  { key: 'staff' as const, label: 'Staff', count: staffCount.value },
]);

const filteredMembers = computed(() => {
  if (filter.value === 'online') return props.members.filter((m) => m.is_online);
  if (filter.value === 'offline') return props.members.filter((m) => !m.is_online);
  if (filter.value === 'admin') return props.members.filter((m) => m.user_role === 'admin');
  if (filter.value === 'staff') return props.members.filter((m) => m.user_role === 'staff');
  return props.members;
});
</script>
