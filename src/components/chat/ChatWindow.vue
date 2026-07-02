<script setup lang="ts">
import MessageBubble from '@/components/chat/MessageBubble.vue'
import VoiceButton from '@/components/chat/VoiceButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import type { ChatMessage, VoiceState } from '@/types/chat'

defineProps<{
  messages: ChatMessage[]
  showTyping?: boolean
  voiceState?: VoiceState
  interimTranscript?: string
  voiceError?: string | null
  voiceDisabled?: boolean
}>()

const emit = defineEmits<{
  'voice-toggle': []
}>()
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
    <div class="flex-1 space-y-6 overflow-y-auto px-6 py-6">
      <MessageBubble
        v-for="message in messages"
        :key="message.id"
        :message="message"
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
        @toggle="emit('voice-toggle')"
      />
    </div>
  </div>
</template>
