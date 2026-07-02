import { computed, ref } from 'vue'

import { useMissionSave } from '@/composables/useMissionSave'
import { useVoiceOutput } from '@/composables/useVoiceOutput'
import { toLlmChatMessages } from '@/models/conversation/conversation'
import { GeminiServiceError, sendChatMessage } from '@/services/geminiService'
import { useChatStore } from '@/store/chatStore'
import { useMissionStore } from '@/store/missionStore'
import type { AiError, AssistantResponse } from '@/types/ai'
import type { ChatMessage } from '@/types/chat'
import { detectSaveIntent } from '@/utils/saveIntent'
import { detectTextLanguage, getSpeechSynthesisLangForText } from '@/utils/detectLanguage'

const USER_FACING_ERRORS: Record<string, string> = {
  missing_api_key:
    'Mission Control is offline — the Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file and restart the dev server.',
  api_error:
    'I lost contact with Mission Control. Please check your connection and try again.',
  empty_response: 'I received an empty signal from Mission Control. Please try again.',
  unknown: 'Something went wrong on my end. Please try again.',
}

const QUOTA_EXCEEDED_MESSAGES = {
  en: 'Mission Control is temporarily unavailable due to high demand. Please wait a moment and try again. Your mission is still on course. 🚀',
  es: 'Mission Control está experimentando una alta demanda en este momento. Espera unos instantes e inténtalo de nuevo. Tu misión sigue en curso. 🚀',
} as const

function getUserFacingError(code: string, lastUserMessage: string): string {
  if (code === 'quota_exceeded') {
    return detectTextLanguage(lastUserMessage) === 'es'
      ? QUOTA_EXCEEDED_MESSAGES.es
      : QUOTA_EXCEEDED_MESSAGES.en
  }

  return USER_FACING_ERRORS[code] ?? USER_FACING_ERRORS.unknown ?? 'Something went wrong.'
}

function toAiError(error: unknown): AiError {
  if (error instanceof GeminiServiceError) {
    return { code: error.code, message: error.message }
  }

  const message = error instanceof Error ? error.message : 'Unknown error'
  return { code: 'unknown', message }
}

function getLastUserMessage(messages: ChatMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (message?.role === 'user' && message.content?.trim()) {
      return message.content.trim()
    }
  }

  return ''
}

function hasMissionSavedEffect(response: AssistantResponse): boolean {
  return response.effects.some((effect) => effect.type === 'mission_saved')
}

export function useAssistant() {
  const chatStore = useChatStore()
  const missionStore = useMissionStore()
  const missionSave = useMissionSave()
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
      if (savedEffect.duplicate) {
        chatStore.addAssistantSuccessMessage(
          `"${savedEffect.title}" is already in your mission log.`,
        )
        return
      }

      missionStore.addMission({
        title: savedEffect.title,
        savedAt: savedEffect.savedAt,
        ...(savedEffect.description && { description: savedEffect.description }),
        ...(savedEffect.imageUrl && { imageUrl: savedEffect.imageUrl }),
        ...(savedEffect.sourceUrl && { sourceUrl: savedEffect.sourceUrl }),
      })

      const successText = savedEffect.remoteSaved
        ? response.text
        : savedEffect.warning
          ? `${response.text} (${savedEffect.warning})`
          : `${response.text} (Saved locally — cloud sync unavailable.)`

      chatStore.addAssistantSuccessMessage(successText)
      return
    }

    chatStore.addAssistantTextMessage(response.text)
  }

  async function generateResponse(): Promise<void> {
    if (isGenerating.value) return

    clearError()
    chatStore.setVoiceState('thinking')
    missionStore.hydrate()

    const lastUserMessage = getLastUserMessage(chatStore.messages)
    const saveIntent = detectSaveIntent(lastUserMessage)
    const speechLang = getSpeechSynthesisLangForText(lastUserMessage)

    let responseText = ''

    try {
      const history = toLlmChatMessages(chatStore.messages)
      const response = await sendChatMessage(history, {
        messages: chatStore.messages,
        missions: missionStore.missions,
      })

      if (saveIntent && !hasMissionSavedEffect(response)) {
        const fallback = await missionSave.saveLastDiscovery()
        if (fallback.handled) {
          chatStore.addAssistantSuccessMessage(fallback.message)
          responseText = fallback.message
          await voiceOutput.speak(responseText, speechLang)
          return
        }
      }

      responseText = response.text
      addAssistantResponse(response)
    } catch (caught) {
      const aiError = toAiError(caught)
      error.value = aiError

      if (import.meta.env.DEV) {
        console.error('[Andromeda] Gemini request failed:', aiError.message)
      }

      responseText = getUserFacingError(aiError.code, lastUserMessage)
      chatStore.addAssistantTextMessage(responseText)
    }

    await voiceOutput.speak(responseText, speechLang)
  }

  function cancelSpeaking() {
    voiceOutput.cancel()
  }

  return {
    error,
    isGenerating,
    clearError,
    generateResponse,
    cancelSpeaking,
  }
}
