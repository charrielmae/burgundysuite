<template>
  <div
    :class="[
      'rounded-xl border border-[#5A1C2A] bg-[#381018]/90 text-[#F5EFEB] shadow-sm',
      $attrs.class,
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
</script>
