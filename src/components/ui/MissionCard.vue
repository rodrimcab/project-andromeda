<script setup lang="ts">
import { Bookmark, Image } from '@lucide/vue'
import { computed } from 'vue'

import { formatMissionSavedDate } from '@/utils/missionDate'

const props = defineProps<{
  title: string
  savedAt: string
  imageUrl?: string
  saved?: boolean
}>()

const displayDate = computed(() => formatMissionSavedDate(props.savedAt))
</script>

<template>
  <button
    type="button"
    class="glass glass-hover flex w-full items-center gap-3 rounded-xl p-3 text-left"
  >
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="title"
      class="h-12 w-12 shrink-0 rounded-lg object-cover"
      loading="lazy"
    />
    <div
      v-else
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-space-900 text-gray-500"
      aria-hidden="true"
    >
      <Image class="h-5 w-5" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-gray-200">{{ title }}</p>
      <p class="text-xs text-gray-500">{{ displayDate }}</p>
    </div>
    <Bookmark
      v-if="saved"
      class="h-4 w-4 shrink-0 fill-blue-400 text-blue-400"
    />
  </button>
</template>
