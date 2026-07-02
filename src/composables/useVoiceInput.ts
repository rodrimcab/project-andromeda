import { computed, ref } from 'vue'

import { useSpeechRecognition } from '@/composables/useSpeechRecognition'
import { useChatStore } from '@/store/chatStore'
import type { SpeechRecognitionErrorCode } from '@/types/speech'
import { getSpeechRecognitionLang } from '@/utils/speechLocale'

const ERROR_MESSAGES: Record<SpeechRecognitionErrorCode, string> = {
  'not-supported':
    'Speech recognition is not supported in this browser. Try Chrome or Edge.',
  'not-allowed':
    'Microphone access was denied. Allow microphone permissions in your browser settings.',
  'no-speech': 'No speech detected. Tap the mic and try again.',
  'audio-capture': 'No microphone found. Connect a microphone and try again.',
  network: 'Network error during speech recognition. Check your connection.',
  aborted: '',
  unknown: 'Something went wrong with speech recognition. Please try again.',
}

export function useVoiceInput() {
  const chatStore = useChatStore()
  const errorMessage = ref<string | null>(null)

  const speech = useSpeechRecognition({
    lang: getSpeechRecognitionLang(),
    continuous: false,
    interimResults: true,
    onEnd: handleRecognitionEnd,
    onError: handleRecognitionError,
  })

  const isListening = computed(() => chatStore.voiceState === 'listening')
  const liveTranscript = computed(
    () => speech.interimTranscript.value || speech.transcript.value,
  )

  function clearError() {
    errorMessage.value = null
  }

  function handleRecognitionError(code: SpeechRecognitionErrorCode) {
    if (code === 'aborted') return

    errorMessage.value = ERROR_MESSAGES[code]
    chatStore.setVoiceState('idle')
  }

  function handleRecognitionEnd() {
    const text = (speech.transcript.value || speech.interimTranscript.value).trim()

    if (text) {
      chatStore.addUserMessage(text)
    }

    speech.reset()
    chatStore.setVoiceState('idle')
  }

  async function toggleListening() {
    clearError()

    if (isListening.value) {
      speech.stop()
      return
    }

    if (!speech.isSupported.value) {
      errorMessage.value = ERROR_MESSAGES['not-supported']
      return
    }

    if (chatStore.voiceState !== 'idle') return

    await speech.checkMicrophonePermission()
    chatStore.setVoiceState('listening')
    speech.start()
  }

  return {
    isSupported: speech.isSupported,
    liveTranscript,
    errorMessage,
    toggleListening,
  }
}
