<script setup lang="ts">
defineProps<{
  label?: string
  showLabel?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="relative flex h-2 w-2">
      <span
        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"
      />
      <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
    </span>
    <span v-if="showLabel !== false" class="text-sm text-green-400">
      {{ label ?? 'Online' }}
    </span>
  </div>
</template>
