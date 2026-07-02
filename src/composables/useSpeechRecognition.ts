import { onUnmounted, ref, shallowRef } from 'vue'

import type {
  SpeechPermissionState,
  SpeechRecognitionErrorCode,
  SpeechRecognitionResult,
} from '@/types/speech'

export interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (code: SpeechRecognitionErrorCode, message: string) => void
  onEnd?: () => void
}

function getSpeechRecognitionConstructor(): typeof SpeechRecognition | null {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

function mapRecognitionError(error: string): SpeechRecognitionErrorCode {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'not-allowed'
    case 'no-speech':
      return 'no-speech'
    case 'audio-capture':
      return 'audio-capture'
    case 'network':
      return 'network'
    case 'aborted':
      return 'aborted'
    default:
      return 'unknown'
  }
}

function collectTranscript(results: SpeechRecognitionResultList): {
  transcript: string
  isFinal: boolean
} {
  let transcript = ''
  let isFinal = false

  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (!result) continue
    transcript += result[0]?.transcript ?? ''
    if (result.isFinal) isFinal = true
  }

  return { transcript: transcript.trim(), isFinal }
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    lang = 'en-US',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
    onEnd,
  } = options

  const SpeechRecognitionCtor = getSpeechRecognitionConstructor()

  const isSupported = ref(SpeechRecognitionCtor !== null)
  const isListening = ref(false)
  const transcript = ref('')
  const interimTranscript = ref('')
  const error = ref<SpeechRecognitionErrorCode | null>(null)
  const permissionState = ref<SpeechPermissionState>('unknown')

  const recognition = shallowRef<SpeechRecognition | null>(null)

  function createRecognition(): SpeechRecognition | null {
    if (!SpeechRecognitionCtor) return null

    const instance = new SpeechRecognitionCtor()
    instance.lang = lang
    instance.continuous = continuous
    instance.interimResults = interimResults

    instance.onstart = () => {
      isListening.value = true
      error.value = null
    }

    instance.onresult = (event: SpeechRecognitionEvent) => {
      const { transcript: text, isFinal } = collectTranscript(event.results)

      if (isFinal) {
        transcript.value = text
        interimTranscript.value = ''
      } else {
        interimTranscript.value = text
      }

      onResult?.({ transcript: text, isFinal })
    }

    instance.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = mapRecognitionError(event.error)
      error.value = code
      onError?.(code, event.message)
    }

    instance.onend = () => {
      isListening.value = false
      onEnd?.()
    }

    return instance
  }

  async function checkMicrophonePermission(): Promise<SpeechPermissionState> {
    if (!navigator.permissions?.query) {
      permissionState.value = 'unknown'
      return 'unknown'
    }

    try {
      const status = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      })
      const state = status.state as SpeechPermissionState
      permissionState.value = state
      return state
    } catch {
      permissionState.value = 'unknown'
      return 'unknown'
    }
  }

  function reset() {
    transcript.value = ''
    interimTranscript.value = ''
    error.value = null
  }

  function start() {
    if (!SpeechRecognitionCtor) {
      error.value = 'not-supported'
      onError?.('not-supported', 'Speech recognition is not supported in this browser.')
      return
    }

    if (isListening.value) return

    reset()

    const instance = createRecognition()
    if (!instance) return

    recognition.value = instance

    try {
      instance.start()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start speech recognition.'
      error.value = 'unknown'
      onError?.('unknown', message)
    }
  }

  function stop() {
    recognition.value?.stop()
  }

  function abort() {
    recognition.value?.abort()
    isListening.value = false
  }

  onUnmounted(() => {
    abort()
    recognition.value = null
  })

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    permissionState,
    checkMicrophonePermission,
    start,
    stop,
    abort,
    reset,
  }
}
