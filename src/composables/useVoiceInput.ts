import { computed, ref } from 'vue'

import { useChatSubmit } from '@/composables/useChatSubmit'
import { useMicLanguage } from '@/composables/useMicLanguage'
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
  const { submitMessage } = useChatSubmit()
  const { micLanguage, setMicLanguage, resolveRecognitionLang } = useMicLanguage()
  const errorMessage = ref<string | null>(null)

  const speech = useSpeechRecognition({
    lang: getSpeechRecognitionLang(),
    continuous: false,
    interimResults: true,
    maxListenMs: 15_000,
    onEnd: handleRecognitionEnd,
    onError: handleRecognitionError,
  })

  const isListening = computed(() => chatStore.voiceState === 'listening')
  const liveTranscript = computed(() => {
    const finalText = speech.transcript.value
    const interimText = speech.interimTranscript.value
    return interimText ? `${finalText} ${interimText}`.trim() : finalText
  })

  function clearError() {
    errorMessage.value = null
  }

  function handleRecognitionError(code: SpeechRecognitionErrorCode) {
    if (code === 'aborted') return

    errorMessage.value = ERROR_MESSAGES[code]
    chatStore.setVoiceState('idle')
  }

  async function handleRecognitionEnd() {
    const text = liveTranscript.value.trim()

    if (!text) {
      speech.reset()
      chatStore.setVoiceState('idle')
      return
    }

    speech.reset()
    const sent = await submitMessage(text, { fromVoice: true })
    if (!sent) {
      chatStore.setVoiceState('idle')
    }
  }

  function abortListening() {
    speech.abort()
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
    speech.start(resolveRecognitionLang())
  }

  return {
    isSupported: speech.isSupported,
    liveTranscript,
    errorMessage,
    micLanguage,
    setMicLanguage,
    toggleListening,
    abortListening,
  }
}
