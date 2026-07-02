<script setup lang="ts">
import { Bookmark, ExternalLink, Play } from '@lucide/vue'

import type { MediaCard } from '@/types/chat'

defineProps<{
  card: MediaCard
  saveable?: boolean
  alreadySaved?: boolean
}>()

const emit = defineEmits<{
  save: []
}>()
</script>

<template>
  <div class="glass mt-3 overflow-hidden rounded-xl">
    <div class="flex flex-col sm:flex-row">
      <div class="relative h-36 w-full shrink-0 sm:h-auto sm:w-36">
        <div
          v-if="card.videoUnavailable"
          class="flex h-full w-full flex-col items-center justify-center gap-2 bg-space-900 px-3 text-center"
        >
          <div class="rounded-full bg-white/10 p-2">
            <Play class="h-5 w-5 text-gray-300" />
          </div>
          <p class="text-[11px] leading-snug text-gray-400">
            Video preview unavailable
          </p>
        </div>
        <template v-else>
          <img
            v-if="card.imageUrl"
            :src="card.imageUrl"
            :alt="card.title"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-space-900 text-xs text-gray-500"
          >
            No preview
          </div>
          <div
            v-if="card.mediaType === 'video' && card.imageUrl"
            class="absolute inset-0 flex items-center justify-center bg-black/35"
            aria-hidden="true"
          >
            <div class="rounded-full bg-white/20 p-2 backdrop-blur-sm">
              <Play class="h-6 w-6 fill-white text-white" />
            </div>
          </div>
        </template>
        <span
          v-if="card.mediaType === 'video'"
          class="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase"
        >
          Video
        </span>
      </div>
      <div class="flex flex-1 flex-col justify-between p-4">
        <div>
          <h4 class="font-semibold text-gray-100">{{ card.title }}</h4>
          <p class="mt-1 text-sm leading-relaxed text-gray-400">
            {{ card.description }}
          </p>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <a
            :href="card.linkUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-500/30"
          >
            {{ card.linkLabel }}
            <ExternalLink class="h-3 w-3" />
          </a>
          <button
            v-if="saveable && alreadySaved"
            type="button"
            disabled
            class="inline-flex cursor-default items-center gap-1.5 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 ring-1 ring-green-500/20"
          >
            <Bookmark class="h-3 w-3 fill-current" />
            Saved
          </button>
          <button
            v-else-if="saveable"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/25"
            @click="emit('save')"
          >
            <Bookmark class="h-3 w-3" />
            Save mission
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
