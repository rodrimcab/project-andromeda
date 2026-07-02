<script setup lang="ts">
import { ExternalLink } from '@lucide/vue'

import type { MediaCard } from '@/types/chat'

defineProps<{
  card: MediaCard
}>()
</script>

<template>
  <div class="glass mt-3 overflow-hidden rounded-xl">
    <div class="flex flex-col sm:flex-row">
      <img
        :src="card.imageUrl"
        :alt="card.title"
        class="h-36 w-full object-cover sm:h-auto sm:w-36"
        loading="lazy"
      />
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
