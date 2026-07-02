<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  icon: Component
}>()
</script>

<template>
  <button
    type="button"
    class="glass glass-hover flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-gray-300"
  >
    <component :is="icon" class="h-4 w-4 shrink-0 text-violet-400" />
    <span>{{ label }}</span>
  </button>
</template>
