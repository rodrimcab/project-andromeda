<script setup lang="ts">
import { Bookmark, ExternalLink, Image, X } from '@lucide/vue'
import { computed, onUnmounted, watch } from 'vue'

import type { Mission } from '@/types/chat'
import { formatMissionSavedDate } from '@/utils/missionDate'

const props = defineProps<{
  mission: Mission | null
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const displayDate = computed(() =>
  props.mission ? formatMissionSavedDate(props.mission.savedAt) : '',
)

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
        v-if="open && mission"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-label="mission.title"
      >
        <button
          type="button"
          class="absolute inset-0 bg-black/75 backdrop-blur-sm"
          aria-label="Close mission detail"
          @click="emit('close')"
        />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="open && mission"
            class="glass relative z-10 flex max-h-[min(90vh,820px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl shadow-2xl shadow-black/40"
          >
            <div class="relative shrink-0 overflow-hidden bg-space-900">
              <img
                v-if="mission.imageUrl"
                :src="mission.imageUrl"
                :alt="mission.title"
                class="max-h-[min(50vh,440px)] w-full object-cover"
              />
              <div
                v-else
                class="flex h-56 w-full items-center justify-center text-gray-500"
              >
                <Image class="h-12 w-12" />
              </div>

              <button
                type="button"
                class="absolute top-3 right-3 rounded-full bg-black/55 p-2 text-gray-100 backdrop-blur-sm transition-colors hover:bg-black/75"
                aria-label="Close"
                @click="emit('close')"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <div class="overflow-y-auto p-5 sm:p-6">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="text-xl font-semibold text-gray-100">{{ mission.title }}</h3>
                  <p class="mt-1 text-sm text-gray-500">{{ displayDate }}</p>
                </div>
                <Bookmark class="h-5 w-5 shrink-0 fill-blue-400 text-blue-400" />
              </div>

              <p
                v-if="mission.description"
                class="mt-4 text-sm leading-relaxed text-gray-300"
              >
                {{ mission.description }}
              </p>

              <a
                v-if="mission.sourceUrl"
                :href="mission.sourceUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/30"
              >
                View on NASA APOD
                <ExternalLink class="h-4 w-4" />
              </a>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
