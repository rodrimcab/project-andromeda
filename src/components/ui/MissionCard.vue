<script setup lang="ts">
import { Bookmark } from '@lucide/vue'

defineProps<{
  title: string
  date: string
  imageUrl: string
  saved?: boolean
}>()
</script>

<template>
  <button
    type="button"
    class="glass glass-hover flex w-full items-center gap-3 rounded-xl p-3 text-left"
  >
    <img
      :src="imageUrl"
      :alt="title"
      class="h-12 w-12 shrink-0 rounded-lg object-cover"
      loading="lazy"
    />
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-gray-200">{{ title }}</p>
      <p class="text-xs text-gray-500">{{ date }}</p>
    </div>
    <Bookmark
      v-if="saved"
      class="h-4 w-4 shrink-0 fill-blue-400 text-blue-400"
    />
  </button>
</template>
