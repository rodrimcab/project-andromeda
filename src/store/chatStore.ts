import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { ChatMessage, VoiceState } from '@/types/chat'
import {
  createAssistantCardMessage,
  createAssistantSuccessMessage,
  createAssistantTextMessage,
  createUserTextMessage,
} from '@/models/chat/messageFactory'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const voiceState = ref<VoiceState>('idle')
  const initialized = ref(false)

  function initialize(initialMessages: ChatMessage[]) {
    if (initialized.value) return
    messages.value = initialMessages
    initialized.value = true
  }

  function setVoiceState(state: VoiceState) {
    voiceState.value = state
  }

  function addMessage(message: ChatMessage) {
    messages.value = [...messages.value, message]
  }

  function reset(initialMessages: ChatMessage[]) {
    messages.value = initialMessages
    voiceState.value = 'idle'
    initialized.value = true
  }

  function addUserMessage(text: string) {
    addMessage(createUserTextMessage(text))
  }

  function addAssistantTextMessage(text: string) {
    addMessage(createAssistantTextMessage(text))
  }

  function addAssistantSuccessMessage(text: string) {
    addMessage(createAssistantSuccessMessage(text))
  }

  function addAssistantCardMessage(input: { content?: string; card: ChatMessage['card'] }) {
    // Note: `ChatMessage['card']` is `MediaCard | undefined`; we enforce it here at runtime.
    if (!input.card) throw new Error('Assistant card message requires a card.')
    addMessage(createAssistantCardMessage({ content: input.content, card: input.card }))
  }

  return {
    messages,
    voiceState,
    initialize,
    reset,
    setVoiceState,
    addMessage,
    addUserMessage,
    addAssistantTextMessage,
    addAssistantSuccessMessage,
    addAssistantCardMessage,
  }
})

