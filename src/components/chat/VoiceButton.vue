<script setup lang="ts">
import { HelpCircle, Keyboard, Mic } from '@lucide/vue'
import { computed } from 'vue'

import type { VoiceState } from '@/types/chat'

const props = withDefaults(
  defineProps<{
    state?: VoiceState
  }>(),
  { state: 'idle' },
)

const stateLabel = computed(() => {
  const labels: Record<VoiceState, string> = {
    idle: 'Tap to speak',
    listening: 'Listening...',
    thinking: 'Thinking...',
    speaking: 'Speaking...',
  }
  return labels[props.state]
})

const isActive = computed(() => props.state === 'listening' || props.state === 'speaking')
</script>

<template>
  <div class="relative flex items-center justify-center gap-6 px-4 py-6">
  <button
    type="button"
    class="glass glass-hover rounded-full p-3 text-gray-400"
    aria-label="Keyboard input"
  >
    <Keyboard class="h-5 w-5" />
  </button>

  <div class="relative flex flex-col items-center">
    <!-- Waveform bars -->
    <div
      class="absolute flex h-16 items-center gap-1"
      :class="isActive ? 'opacity-100' : 'opacity-40'"
    >
      <span
        v-for="i in 12"
        :key="i"
        class="w-0.5 rounded-full bg-gradient-to-t from-blue-500 to-violet-400"
        :class="isActive ? 'animate-waveform' : ''"
        :style="{
          height: `${12 + (i % 4) * 8}px`,
          animationDelay: `${i * 0.1}s`,
        }"
      />
    </div>

    <!-- Pulse rings -->
    <div
      v-if="isActive"
      class="absolute h-20 w-20 rounded-full border border-blue-400/30 animate-pulse-ring"
    />
    <div
      v-if="isActive"
      class="absolute h-20 w-20 rounded-full border border-violet-400/20 animate-pulse-ring"
      style="animation-delay: 0.5s"
    />

    <!-- Main button -->
    <button
      type="button"
      class="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 transition-transform hover:scale-105 active:scale-95"
      :class="isActive ? 'glow-blue-strong' : 'glow-blue'"
      aria-label="Voice input"
    >
      <Mic class="h-7 w-7 text-white" />
    </button>

    <p class="mt-3 text-xs text-gray-500">{{ stateLabel }}</p>
  </div>

  <button
    type="button"
    class="glass glass-hover rounded-full p-3 text-gray-400"
    aria-label="Help"
  >
    <HelpCircle class="h-5 w-5" />
  </button>
  </div>
</template>
