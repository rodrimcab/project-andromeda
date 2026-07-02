import { computed, ref } from 'vue'

import { useVoiceOutput } from '@/composables/useVoiceOutput'
import { toLlmChatMessages } from '@/models/conversation/conversation'
import { GeminiServiceError, sendChatMessage } from '@/services/geminiService'
import { useChatStore } from '@/store/chatStore'
import { useMissionStore } from '@/store/missionStore'
import type { AiError, AssistantResponse } from '@/types/ai'

const USER_FACING_ERRORS: Record<string, string> = {
  missing_api_key:
    'Mission Control is offline — the Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file and restart the dev server.',
  quota_exceeded:
    'Mission Control is at capacity right now — Gemini free-tier quota reached. Wait a minute and try again, or switch to gemini-2.0-flash in your .env.',
  api_error:
    'I lost contact with Mission Control. Please check your connection and try again.',
  empty_response: 'I received an empty signal from Mission Control. Please try again.',
  unknown: 'Something went wrong on my end. Please try again.',
}

function toAiError(error: unknown): AiError {
  if (error instanceof GeminiServiceError) {
    return { code: error.code, message: error.message }
  }

  const message = error instanceof Error ? error.message : 'Unknown error'
  return { code: 'unknown', message }
}

export function useAssistant() {
  const chatStore = useChatStore()
  const missionStore = useMissionStore()
  const voiceOutput = useVoiceOutput()
  const error = ref<AiError | null>(null)
  const isGenerating = computed(() => chatStore.voiceState === 'thinking')

  function clearError() {
    error.value = null
  }

  function addAssistantResponse(response: AssistantResponse) {
    const cardEffect = response.effects.find((effect) => effect.type === 'card')
    const savedEffect = response.effects.find((effect) => effect.type === 'mission_saved')

    if (cardEffect?.card) {
      chatStore.addAssistantCardMessage({
        content: response.text,
        card: cardEffect.card,
      })
      return
    }

    if (savedEffect) {
      missionStore.addMission({
        title: savedEffect.title,
        savedAt: savedEffect.savedAt,
        ...(savedEffect.imageUrl && { imageUrl: savedEffect.imageUrl }),
      })
      chatStore.addAssistantSuccessMessage(response.text)
      return
    }

    chatStore.addAssistantTextMessage(response.text)
  }

  async function generateResponse(): Promise<void> {
    if (isGenerating.value) return

    clearError()
    chatStore.setVoiceState('thinking')

    let responseText = ''

    try {
      const history = toLlmChatMessages(chatStore.messages)
      const response = await sendChatMessage(history)
      responseText = response.text
      addAssistantResponse(response)
    } catch (caught) {
      const aiError = toAiError(caught)
      error.value = aiError

      if (import.meta.env.DEV) {
        console.error('[Andromeda] Gemini request failed:', aiError.message)
      }

      responseText =
        USER_FACING_ERRORS[aiError.code] ?? USER_FACING_ERRORS.unknown ?? 'Something went wrong.'
      chatStore.addAssistantTextMessage(responseText)
    }

    await voiceOutput.speak(responseText)
  }

  return {
    error,
    isGenerating,
    clearError,
    generateResponse,
  }
}
