<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  icon: Component
  disabled?: boolean
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    type="button"
    class="glass glass-hover flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-gray-300 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
    :disabled="disabled"
    @click="emit('select')"
  >
    <component :is="icon" class="h-4 w-4 shrink-0 text-violet-400" />
    <span>{{ label }}</span>
  </button>
</template>
