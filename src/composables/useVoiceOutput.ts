import { computed } from 'vue'

import { useSpeechSynthesis } from '@/composables/useSpeechSynthesis'
import { useChatStore } from '@/store/chatStore'
import { getSpeechSynthesisLangForText } from '@/utils/speechLocale'
import { toSpeakableText } from '@/utils/speechText'

export function useVoiceOutput() {
  const chatStore = useChatStore()

  const synthesis = useSpeechSynthesis({
    lang: 'en-US',
    rate: 1,
    pitch: 1,
    volume: 1,
  })

  const isSpeaking = computed(() => chatStore.voiceState === 'speaking')

  async function speak(text: string, speechLang?: string): Promise<void> {
    const speakableText = toSpeakableText(text)

    if (!speakableText || !synthesis.isSupported.value) {
      chatStore.setVoiceState('idle')
      return
    }

    chatStore.setVoiceState('speaking')

    const resolvedLang = speechLang ?? getSpeechSynthesisLangForText(speakableText)

    try {
      await synthesis.speak(speakableText, resolvedLang)
    } finally {
      if (chatStore.voiceState === 'speaking') {
        chatStore.setVoiceState('idle')
      }
    }
  }

  function cancel() {
    synthesis.cancel()

    if (chatStore.voiceState === 'speaking') {
      chatStore.setVoiceState('idle')
    }
  }

  return {
    isSupported: synthesis.isSupported,
    isSpeaking,
    speak,
    cancel,
  }
}
