<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

import MessageBubble from '@/components/chat/MessageBubble.vue'
import VoiceButton from '@/components/chat/VoiceButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import type { ChatMessage, MediaCard, VoiceState } from '@/types/chat'

const props = defineProps<{
  messages: ChatMessage[]
  showTyping?: boolean
  voiceState?: VoiceState
  interimTranscript?: string
  voiceError?: string | null
  voiceDisabled?: boolean
  canSubmit?: boolean
}>()

const emit = defineEmits<{
  'voice-toggle': []
  'save-card': [card: MediaCard]
  submit: [text: string]
}>()

const messagesContainer = ref<HTMLElement | null>(null)
const isInitialScroll = ref(true)

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
      class="flex items-center justify-between border-b border-white/10 px-6 py-5"
    >
      <div>
        <h2 class="text-xl font-bold text-gray-100">
          Welcome, Commander
          <span class="text-gradient">✨</span>
        </h2>
        <p class="mt-0.5 text-sm text-gray-500">Ask me anything about the universe</p>
      </div>
      <StatusBadge />
    </header>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 space-y-6 overflow-y-auto px-6 py-6">
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
        @toggle="emit('voice-toggle')"
        @submit="emit('submit', $event)"
      />
    </div>
  </div>
</template>
