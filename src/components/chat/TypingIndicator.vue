<script setup lang="ts">
import { Bot } from '@lucide/vue'
</script>

<template>
  <div class="flex gap-3">
    <div
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600"
    >
      <Bot class="h-4 w-4 text-white" />
    </div>
    <div class="glass rounded-2xl rounded-tl-md px-4 py-3">
      <div class="flex items-center gap-1">
        <span
          v-for="i in 3"
          :key="i"
          class="h-2 w-2 rounded-full bg-violet-400 animate-typing-dot"
          :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
        />
      </div>
    </div>
  </div>
</template>
