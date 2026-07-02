import { computed } from 'vue'

import { useAssistant } from '@/composables/useAssistant'
import { useMicLanguage } from '@/composables/useMicLanguage'
import { useChatStore } from '@/store/chatStore'

export interface SubmitMessageOptions {
  fromVoice?: boolean
}

export function useChatSubmit() {
  const chatStore = useChatStore()
  const assistant = useAssistant()
  const { syncMicLanguageFromText } = useMicLanguage()

  const canSubmit = computed(() => chatStore.voiceState === 'idle')

  async function submitMessage(text: string, options?: SubmitMessageOptions): Promise<boolean> {
    const trimmed = text.trim()
    if (!trimmed) return false

    const voiceState = chatStore.voiceState
    const canSend = options?.fromVoice
      ? voiceState === 'listening' || voiceState === 'idle'
      : voiceState === 'idle'

    if (!canSend) return false

    if (options?.fromVoice && voiceState === 'listening') {
      chatStore.setVoiceState('idle')
    }

    syncMicLanguageFromText(trimmed)
    chatStore.addUserMessage(trimmed)
    await assistant.generateResponse()
    return true
  }

  return {
    canSubmit,
    submitMessage,
    cancelSpeaking: () => assistant.cancelSpeaking(),
  }
}
