<script setup lang="ts">
import { Trash2 } from '@lucide/vue'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

import MessageBubble from '@/components/chat/MessageBubble.vue'
import VoiceButton from '@/components/chat/VoiceButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import type { MicLanguage } from '@/composables/useMicLanguage'
import type { ChatMessage, MediaCard, VoiceState } from '@/types/chat'

const props = defineProps<{
  messages: ChatMessage[]
  showTyping?: boolean
  voiceState?: VoiceState
  interimTranscript?: string
  voiceError?: string | null
  voiceDisabled?: boolean
  canSubmit?: boolean
  micLanguage?: MicLanguage
}>()

const emit = defineEmits<{
  'voice-toggle': []
  'cancel-speaking': []
  'clear-chat': []
  'set-mic-language': [language: MicLanguage]
  'save-card': [card: MediaCard]
  submit: [text: string]
}>()

const messagesContainer = ref<HTMLElement | null>(null)
const isInitialScroll = ref(true)

const canClearChat = computed(() => props.voiceState === 'idle')

async function scrollToBottom(instant = false) {
  await nextTick()
  const container = messagesContainer.value
  if (!container) {
    return
  }

  container.scrollTo({
    top: container.scrollHeight,
    behavior: instant ? 'auto' : 'smooth',
  })
}

onMounted(() => {
  void scrollToBottom(true)
})

watch(
  () => props.messages.length,
  () => {
    void scrollToBottom(isInitialScroll.value)
    if (props.messages.length > 0) {
      isInitialScroll.value = false
    }
  },
  { immediate: true },
)

watch(
  () => props.voiceState,
  () => {
    void scrollToBottom(false)
  },
)
</script>

<template>
  <div class="flex h-full flex-col">
    <!-- Header -->
    <header
      class="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5"
    >
      <div class="min-w-0">
        <h2 class="text-lg font-bold text-gray-100 sm:text-xl">Welcome, Commander</h2>
        <p class="mt-0.5 text-sm text-gray-500">Ask me anything about the universe</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="glass glass-hover flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-gray-400 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!canClearChat"
          aria-label="Clear chat"
          @click="emit('clear-chat')"
        >
          <Trash2 class="h-4 w-4" />
          <span class="hidden sm:inline">Clear chat</span>
        </button>
        <StatusBadge />
      </div>
    </header>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
        @save-card="emit('save-card', $event)"
      />
      <slot name="typing" />
    </div>

    <!-- Voice input -->
    <div class="border-t border-white/10">
      <VoiceButton
        :state="voiceState"
        :interim-transcript="interimTranscript"
        :error-message="voiceError"
        :disabled="voiceDisabled"
        :can-submit="canSubmit"
        :mic-language="micLanguage"
        @toggle="emit('voice-toggle')"
        @cancel-speaking="emit('cancel-speaking')"
        @set-mic-language="emit('set-mic-language', $event)"
        @submit="emit('submit', $event)"
      />
    </div>
  </div>
</template>
