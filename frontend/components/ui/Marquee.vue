<template>
  <div
    :class="[
      'flex overflow-hidden p-2 [--duration:20s] [--gap:1rem] [gap:var(--gap)]',
      vertical ? 'flex-col' : 'flex-row',
      pauseOnHover ? 'marquee-group' : '',
      $attrs.class,
    ]"
  >
    <div
      v-for="i in repeat"
      :key="i"
      :class="[
        'flex shrink-0 justify-around [gap:var(--gap)]',
        vertical
          ? 'animate-marquee-vertical flex-col'
          : reverse
          ? 'animate-marquee-reverse flex-row'
          : 'animate-marquee flex-row',
      ]"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

withDefaults(
  defineProps<{
    reverse?: boolean;
    pauseOnHover?: boolean;
    vertical?: boolean;
    repeat?: number;
  }>(),
  {
    reverse: false,
    pauseOnHover: false,
    vertical: false,
    repeat: 4,
  }
);
</script>
