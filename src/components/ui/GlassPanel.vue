<script setup lang="ts">
defineProps<{
  as?: 'div' | 'section' | 'article'
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}>()
</script>

<template>
  <component
    :is="as ?? 'div'"
    class="glass rounded-2xl"
    :class="[
      padding === 'sm' && 'p-3',
      padding === 'md' && 'p-4',
      padding === 'lg' && 'p-6',
      !padding && 'p-4',
      hover && 'glass-hover cursor-pointer',
    ]"
  >
    <slot />
  </component>
</template>
