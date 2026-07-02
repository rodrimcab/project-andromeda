<script setup lang="ts">
import { HelpCircle, Keyboard, Mic, Square } from '@lucide/vue'
import { computed, ref } from 'vue'

import TextPromptDialog from '@/components/chat/TextPromptDialog.vue'
import VoiceHelpDialog from '@/components/chat/VoiceHelpDialog.vue'
import type { MicLanguage } from '@/composables/useMicLanguage'
import type { VoiceState } from '@/types/chat'

const props = withDefaults(
  defineProps<{
    state?: VoiceState
    interimTranscript?: string
    errorMessage?: string | null
    disabled?: boolean
    canSubmit?: boolean
    micLanguage?: MicLanguage
  }>(),
  {
    state: 'idle',
    interimTranscript: '',
    errorMessage: null,
    disabled: false,
    canSubmit: true,
    micLanguage: 'en',
  },
)

const emit = defineEmits<{
  toggle: []
  submit: [text: string]
  'cancel-speaking': []
  'set-mic-language': [language: MicLanguage]
}>()

const textDialogOpen = ref(false)
const helpDialogOpen = ref(false)

const stateLabel = computed(() => {
  const labels: Record<VoiceState, string> = {
    idle: 'Tap to speak',
    listening: 'Listening...',
    thinking: 'Thinking...',
    speaking: 'Tap to stop',
  }
  return labels[props.state]
})

const isActive = computed(() => props.state === 'listening' || props.state === 'speaking')
const isMicDisabled = computed(
  () =>
    props.disabled ||
    (props.state !== 'idle' && props.state !== 'listening' && props.state !== 'speaking'),
)
const isKeyboardDisabled = computed(() => !props.canSubmit || props.state !== 'idle')
const canChangeMicLanguage = computed(() => props.state === 'idle' && !props.disabled)

const micLanguages: MicLanguage[] = ['en', 'es']

function openTextDialog() {
  if (isKeyboardDisabled.value) {
    return
  }

  textDialogOpen.value = true
}

function handleTextSubmit(text: string) {
  emit('submit', text)
}

function handleMicClick() {
  if (props.state === 'speaking') {
    emit('cancel-speaking')
    return
  }

  emit('toggle')
}
</script>

<template>
  <div class="relative flex items-center justify-center gap-3 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6">
    <button
      type="button"
      class="glass glass-hover rounded-full p-3 text-gray-400 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="isKeyboardDisabled"
      aria-label="Type a message"
      @click="openTextDialog"
    >
      <Keyboard class="h-5 w-5" />
    </button>

    <div class="flex flex-col items-center">
      <div
        class="mb-3 flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1"
        role="group"
        aria-label="Microphone language"
      >
        <button
          v-for="language in micLanguages"
          :key="language"
          type="button"
          class="rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide transition-colors"
          :class="
            micLanguage === language
              ? 'bg-blue-500/90 text-white'
              : 'text-gray-400 hover:text-gray-200'
          "
          :disabled="!canChangeMicLanguage"
          :aria-pressed="micLanguage === language"
          @click="emit('set-mic-language', language)"
        >
          {{ language }}
        </button>
      </div>

      <div class="relative flex h-24 w-36 items-center justify-center">
        <div
          v-if="isActive"
          class="pointer-events-none absolute left-0 flex h-12 items-center gap-0.5"
          aria-hidden="true"
        >
          <span
            v-for="i in 6"
            :key="`l-${i}`"
            class="w-0.5 rounded-full bg-gradient-to-t from-blue-500/80 to-violet-400/80 animate-waveform"
            :style="{
              height: `${10 + (i % 3) * 6}px`,
              animationDelay: `${i * 0.12}s`,
            }"
          />
        </div>

        <div
          v-if="isActive"
          class="pointer-events-none absolute right-0 flex h-12 items-center gap-0.5"
          aria-hidden="true"
        >
          <span
            v-for="i in 6"
            :key="`r-${i}`"
            class="w-0.5 rounded-full bg-gradient-to-t from-blue-500/80 to-violet-400/80 animate-waveform"
            :style="{
              height: `${10 + (i % 3) * 6}px`,
              animationDelay: `${(6 - i) * 0.12}s`,
            }"
          />
        </div>

        <div
          class="pointer-events-none absolute flex h-20 w-20 items-center justify-center"
          aria-hidden="true"
        >
          <div
            v-if="isActive"
            class="absolute h-full w-full rounded-full border border-blue-400/25 animate-pulse-ring"
          />
          <div
            v-if="isActive"
            class="absolute h-full w-full rounded-full border border-violet-400/15 animate-pulse-ring"
            style="animation-delay: 0.6s"
          />
        </div>

        <button
          type="button"
          class="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          :class="
            isActive
              ? 'glow-blue-strong scale-100'
              : 'glow-blue hover:scale-105 active:scale-95'
          "
          :disabled="isMicDisabled"
          :aria-pressed="state === 'listening' || state === 'speaking'"
          :aria-label="state === 'speaking' ? 'Stop speaking' : 'Voice input'"
          @click="handleMicClick"
        >
          <Square v-if="state === 'speaking'" class="h-6 w-6 fill-white text-white" />
          <Mic v-else class="h-7 w-7 text-white" />
        </button>
      </div>

      <p class="mt-3 text-xs text-gray-500">{{ stateLabel }}</p>
      <p
        v-if="interimTranscript && state === 'listening'"
        class="mt-1 max-w-xs truncate text-center text-sm text-blue-300/80"
        aria-live="polite"
      >
        {{ interimTranscript }}
      </p>
      <p
        v-if="errorMessage"
        class="mt-1 max-w-xs text-center text-xs text-red-400"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </div>

    <button
      type="button"
      class="glass glass-hover rounded-full p-3 text-gray-400"
      aria-label="Help"
      @click="helpDialogOpen = true"
    >
      <HelpCircle class="h-5 w-5" />
    </button>

    <TextPromptDialog
      :open="textDialogOpen"
      @close="textDialogOpen = false"
      @submit="handleTextSubmit"
    />

    <VoiceHelpDialog :open="helpDialogOpen" @close="helpDialogOpen = false" />
  </div>
</template>
