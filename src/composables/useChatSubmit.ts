import { computed } from 'vue'

import { useAssistant } from '@/composables/useAssistant'
import { useChatStore } from '@/store/chatStore'

export function useChatSubmit() {
  const chatStore = useChatStore()
  const assistant = useAssistant()

  const canSubmit = computed(() => chatStore.voiceState === 'idle')

  async function submitMessage(text: string): Promise<boolean> {
    const trimmed = text.trim()
    if (!trimmed || !canSubmit.value) {
      return false
    }

    chatStore.addUserMessage(trimmed)
    await assistant.generateResponse()
    return true
  }

  return {
    canSubmit,
    submitMessage,
  }
}
