<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  icon: Component
  active?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200"
    :class="
      active
        ? 'border-l-2 border-blue-500 bg-blue-500/15 text-blue-300'
        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
    "
    @click="$emit('click')"
  >
    <component
      :is="icon"
      class="h-5 w-5 shrink-0 transition-colors"
      :class="active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'"
    />
    <span>{{ label }}</span>
  </button>
</template>
