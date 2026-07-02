<script setup lang="ts">
import { Bot } from '@lucide/vue'

import MediaCard from '@/components/ui/MediaCard.vue'
import type { ChatMessage } from '@/types/chat'

defineProps<{
  message: ChatMessage
}>()
</script>

<template>
  <!-- User message -->
  <div v-if="message.role === 'user'" class="flex justify-end">
    <div class="max-w-[80%]">
      <div
        class="rounded-2xl rounded-br-md bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-3 text-sm text-white shadow-lg shadow-blue-900/30"
      >
        {{ message.content }}
      </div>
      <p class="mt-1 text-right text-xs text-gray-600">{{ message.timestamp }}</p>
    </div>
  </div>

  <!-- Assistant message -->
  <div v-else class="flex gap-3">
    <div
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600"
    >
      <Bot class="h-4 w-4 text-white" />
    </div>

    <div class="max-w-[85%] min-w-0">
      <p class="mb-1 text-xs font-medium text-violet-400">Andromeda</p>

      <!-- Success message -->
      <div
        v-if="message.type === 'success'"
        class="inline-flex rounded-xl bg-green-500/15 px-4 py-2 text-sm text-green-400 ring-1 ring-green-500/20"
      >
        {{ message.content }}
      </div>

      <!-- Text or card message -->
      <div v-else>
        <div class="glass rounded-2xl rounded-tl-md px-4 py-3 text-sm text-gray-300">
          {{ message.content }}
        </div>
        <MediaCard v-if="message.card" :card="message.card" />
      </div>

      <p class="mt-1 text-xs text-gray-600">{{ message.timestamp }}</p>
    </div>
  </div>
</template>
