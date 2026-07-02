import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { createWelcomeMessage } from '@/models/chat/messageFactory'
import {
  createAssistantCardMessage,
  createAssistantSuccessMessage,
  createAssistantTextMessage,
  createUserTextMessage,
} from '@/models/chat/messageFactory'
import { loadChatMessages, saveChatMessages } from '@/services/persistenceService'
import type { ChatMessage, VoiceState } from '@/types/chat'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const voiceState = ref<VoiceState>('idle')
  const initialized = ref(false)

  function persistMessages() {
    if (!initialized.value) {
      return
    }

    saveChatMessages(messages.value)
  }

  function hydrate() {
    if (initialized.value) {
      return
    }

    const persisted = loadChatMessages()
    messages.value = persisted?.length ? persisted : [createWelcomeMessage()]
    initialized.value = true
  }

  function initialize(initialMessages?: ChatMessage[]) {
    if (initialized.value) {
      return
    }

    if (initialMessages?.length) {
      messages.value = initialMessages
    } else {
      hydrate()
    }

    initialized.value = true
  }

  function setVoiceState(state: VoiceState) {
    voiceState.value = state
  }

  function addMessage(message: ChatMessage) {
    messages.value = [...messages.value, message]
    persistMessages()
  }

  function reset(initialMessages: ChatMessage[]) {
    messages.value = initialMessages
    voiceState.value = 'idle'
    initialized.value = true
    persistMessages()
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
    if (!input.card) throw new Error('Assistant card message requires a card.')
    addMessage(createAssistantCardMessage({ content: input.content, card: input.card }))
  }

  watch(
    messages,
    () => {
      persistMessages()
    },
    { deep: true },
  )

  return {
    messages,
    voiceState,
    hydrate,
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
