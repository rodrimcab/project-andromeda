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
  maxListenMs?: number
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (code: SpeechRecognitionErrorCode, message: string) => void
  onEnd?: () => void
}

const DEFAULT_MAX_LISTEN_MS = 15_000

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

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    lang = 'en-US',
    continuous = false,
    interimResults = true,
    maxListenMs = DEFAULT_MAX_LISTEN_MS,
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

  let sessionId = 0
  let sessionFinalTranscript = ''
  let listenTimeoutId: number | null = null
  let endedWithError = false

  function clearListenTimeout() {
    if (listenTimeoutId !== null) {
      window.clearTimeout(listenTimeoutId)
      listenTimeoutId = null
    }
  }

  function scheduleListenTimeout(instance: SpeechRecognition, activeSessionId: number) {
    clearListenTimeout()
    listenTimeoutId = window.setTimeout(() => {
      if (activeSessionId !== sessionId || !isListening.value) return
      try {
        instance.stop()
      } catch {
        finishSession(activeSessionId)
      }
    }, maxListenMs)
  }

  function finishSession(activeSessionId: number) {
    if (activeSessionId !== sessionId) return
    clearListenTimeout()
    isListening.value = false
    recognition.value = null
  }

  function detachActiveRecognition() {
    clearListenTimeout()
    const active = recognition.value
    if (!active) return

    active.onend = null
    active.onresult = null
    active.onerror = null
    active.onstart = null

    try {
      active.abort()
    } catch {
      // Recognition may already be inactive.
    }

    recognition.value = null
    isListening.value = false
  }

  function createRecognition(langOverride: string | undefined, activeSessionId: number): SpeechRecognition | null {
    if (!SpeechRecognitionCtor) return null

    const instance = new SpeechRecognitionCtor()
    instance.lang = langOverride ?? lang
    instance.continuous = continuous
    instance.interimResults = interimResults
    instance.maxAlternatives = 1

    instance.onstart = () => {
      if (activeSessionId !== sessionId) return
      isListening.value = true
      error.value = null
      scheduleListenTimeout(instance, activeSessionId)
    }

    instance.onresult = (event: SpeechRecognitionEvent) => {
      if (activeSessionId !== sessionId) return

      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result) continue

        const chunk = result[0]?.transcript ?? ''
        if (result.isFinal) {
          sessionFinalTranscript += chunk
        } else {
          interim += chunk
        }
      }

      transcript.value = sessionFinalTranscript.trim()
      interimTranscript.value = interim.trim()

      const combined = `${sessionFinalTranscript}${interim}`.trim()
      const lastResult = event.results[event.results.length - 1]
      const isFinal = lastResult?.isFinal ?? false

      onResult?.({ transcript: combined, isFinal })

      if (isFinal && combined) {
        window.setTimeout(() => {
          if (activeSessionId !== sessionId || recognition.value !== instance) return
          try {
            instance.stop()
          } catch {
            // stop() can throw if recognition already ended.
          }
        }, 80)
      }
    }

    instance.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (activeSessionId !== sessionId) return

      endedWithError = true
      const code = mapRecognitionError(event.error)
      error.value = code
      finishSession(activeSessionId)
      onError?.(code, event.message)
    }

    instance.onend = () => {
      if (activeSessionId !== sessionId) return

      finishSession(activeSessionId)

      if (endedWithError) {
        endedWithError = false
        return
      }

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
    sessionFinalTranscript = ''
    transcript.value = ''
    interimTranscript.value = ''
    error.value = null
  }

  function start(langOverride?: string) {
    if (!SpeechRecognitionCtor) {
      error.value = 'not-supported'
      onError?.('not-supported', 'Speech recognition is not supported in this browser.')
      return
    }

    detachActiveRecognition()
    sessionId += 1
    const activeSessionId = sessionId
    endedWithError = false
    reset()

    const instance = createRecognition(langOverride, activeSessionId)
    if (!instance) return

    recognition.value = instance

    try {
      instance.start()
    } catch (err) {
      finishSession(activeSessionId)
      const message = err instanceof Error ? err.message : 'Failed to start speech recognition.'
      error.value = 'unknown'
      onError?.('unknown', message)
    }
  }

  function stop() {
    const active = recognition.value
    if (!active) return

    try {
      active.stop()
    } catch {
      finishSession(sessionId)
    }
  }

  function abort() {
    detachActiveRecognition()
    sessionId += 1
  }

  onUnmounted(() => {
    abort()
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
