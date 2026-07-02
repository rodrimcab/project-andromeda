<script setup lang="ts">
import { Bookmark, Image } from '@lucide/vue'
import { computed } from 'vue'

import type { Mission } from '@/types/chat'
import { formatMissionSavedDate } from '@/utils/missionDate'

const props = defineProps<{
  mission: Mission
}>()

const emit = defineEmits<{
  select: []
}>()

const displayDate = computed(() => formatMissionSavedDate(props.mission.savedAt))
</script>

<template>
  <button
    type="button"
    class="glass glass-hover group flex h-full min-h-[17.5rem] flex-col overflow-hidden rounded-2xl text-left transition-all"
    @click="emit('select')"
  >
    <div class="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-space-900">
      <img
        v-if="mission.imageUrl"
        :src="mission.imageUrl"
        :alt="mission.title"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center text-gray-500"
        aria-hidden="true"
      >
        <Image class="h-10 w-10" />
      </div>
      <Bookmark
        class="absolute top-3 right-3 h-4 w-4 fill-blue-400 text-blue-400"
        aria-hidden="true"
      />
    </div>

    <div class="flex min-h-0 flex-1 flex-col gap-1.5 p-4">
      <h3 class="line-clamp-2 text-sm font-semibold leading-snug text-gray-100">
        {{ mission.title }}
      </h3>
      <p class="shrink-0 text-xs text-gray-500">{{ displayDate }}</p>
      <p
        v-if="mission.description"
        class="line-clamp-3 min-h-0 flex-1 text-sm leading-relaxed text-gray-400"
      >
        {{ mission.description }}
      </p>
      <p v-else class="text-xs text-gray-500">Tap to view details</p>
    </div>
  </button>
</template>
