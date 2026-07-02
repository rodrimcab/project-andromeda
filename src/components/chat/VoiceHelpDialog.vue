<script setup lang="ts">
import { X } from '@lucide/vue'
import { onUnmounted, watch } from 'vue'

import { suggestions } from '@/data/mockData'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeydown)
      return
    }

    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown)
  },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Voice assistant help"
      >
        <button
          type="button"
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-label="Close help"
          @click="emit('close')"
        />

        <div class="glass relative z-10 w-full max-w-md rounded-2xl p-5 shadow-xl">
          <div class="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-gray-100">How to use Andromeda</h3>
              <p class="mt-1 text-sm text-gray-500">Your voice-first Mission Control assistant</p>
            </div>
            <button
              type="button"
              class="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-gray-200"
              aria-label="Close"
              @click="emit('close')"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <ul class="space-y-3 text-sm text-gray-300">
            <li class="flex gap-2">
              <span class="text-violet-400">🎙</span>
              <span>Tap the microphone and speak your question.</span>
            </li>
            <li class="flex gap-2">
              <span class="text-violet-400">⌨️</span>
              <span>Use the keyboard button to type a prompt instead.</span>
            </li>
            <li class="flex gap-2">
              <span class="text-violet-400">💡</span>
              <span>Try the suggestions in the right panel to get started quickly.</span>
            </li>
          </ul>

          <div class="mt-5">
            <p class="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Example prompts
            </p>
            <ul class="space-y-1.5 text-sm text-gray-400">
              <li v-for="suggestion in suggestions" :key="suggestion.id">
                “{{ suggestion.label }}”
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
