<script setup lang="ts">
import { ExternalLink, Play } from '@lucide/vue'

import type { MediaCard } from '@/types/chat'

defineProps<{
  card: MediaCard
}>()
</script>

<template>
  <div class="glass mt-3 overflow-hidden rounded-xl">
    <div class="flex flex-col sm:flex-row">
      <div class="relative h-36 w-full shrink-0 sm:h-auto sm:w-36">
        <img
          :src="card.imageUrl"
          :alt="card.title"
          class="h-full w-full object-cover"
          loading="lazy"
        />
        <div
          v-if="card.mediaType === 'video'"
          class="absolute inset-0 flex items-center justify-center bg-black/35"
          aria-hidden="true"
        >
          <div class="rounded-full bg-white/20 p-2 backdrop-blur-sm">
            <Play class="h-6 w-6 fill-white text-white" />
          </div>
        </div>
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
        <a
          :href="card.linkUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-3 inline-flex items-center gap-1.5 self-start rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-300 transition-colors hover:bg-blue-500/30"
        >
          {{ card.linkLabel }}
          <ExternalLink class="h-3 w-3" />
        </a>
      </div>
    </div>
  </div>
</template>
