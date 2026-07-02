import { onUnmounted, ref, shallowRef } from 'vue'

import type { SpeechSynthesisErrorCode } from '@/types/speech'
import { pickSpeechSynthesisVoice } from '@/utils/speechLocale'

export interface UseSpeechSynthesisOptions {
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: (code: SpeechSynthesisErrorCode, message: string) => void
}

const VOICES_TIMEOUT_MS = 1_000

function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function mapSynthesisError(error: string): SpeechSynthesisErrorCode {
  switch (error) {
    case 'canceled':
      return 'canceled'
    case 'interrupted':
      return 'interrupted'
    case 'synthesis-failed':
      return 'synthesis-failed'
    default:
      return 'unknown'
  }
}

function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSynthesisSupported()) return Promise.resolve([])

  const existing = window.speechSynthesis.getVoices()
  if (existing.length > 0) return Promise.resolve(existing)

  return new Promise((resolve) => {
    const finish = (voices: SpeechSynthesisVoice[]) => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleChange)
      resolve(voices)
    }

    const handleChange = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) finish(voices)
    }

    window.speechSynthesis.addEventListener('voiceschanged', handleChange)
    window.setTimeout(() => finish(window.speechSynthesis.getVoices()), VOICES_TIMEOUT_MS)
  })
}

export function useSpeechSynthesis(options: UseSpeechSynthesisOptions = {}) {
  const {
    lang = 'en-US',
    rate = 1,
    pitch = 1,
    volume = 1,
    onStart,
    onEnd,
    onError,
  } = options

  const isSupported = ref(isSpeechSynthesisSupported())
  const isSpeaking = ref(false)
  const error = ref<SpeechSynthesisErrorCode | null>(null)

  const utterance = shallowRef<SpeechSynthesisUtterance | null>(null)

  function cancel() {
    if (!isSpeechSynthesisSupported()) return

    window.speechSynthesis.cancel()
    utterance.value = null
    isSpeaking.value = false
  }

  async function speak(text: string, langOverride?: string): Promise<void> {
    const trimmed = text.trim()
    if (!trimmed) return

    if (!isSpeechSynthesisSupported()) {
      error.value = 'not-supported'
      onError?.('not-supported', 'Speech synthesis is not supported in this browser.')
      return
    }

    cancel()
    error.value = null

    const speechLang = langOverride ?? lang
    const voices = await waitForVoices()
    const voice = pickSpeechSynthesisVoice(voices, speechLang)

    return new Promise((resolve) => {
      const instance = new SpeechSynthesisUtterance(trimmed)
      instance.lang = speechLang
      instance.rate = rate
      instance.pitch = pitch
      instance.volume = volume
      if (voice) instance.voice = voice

      instance.onstart = () => {
        isSpeaking.value = true
        onStart?.()
      }

      instance.onend = () => {
        isSpeaking.value = false
        utterance.value = null
        onEnd?.()
        resolve()
      }

      instance.onerror = (event: SpeechSynthesisErrorEvent) => {
        const code = mapSynthesisError(event.error)
        error.value = code
        isSpeaking.value = false
        utterance.value = null
        onError?.(code, `Speech synthesis error: ${event.error}`)
        resolve()
      }

      utterance.value = instance
      window.speechSynthesis.speak(instance)

      // Chrome can pause the synthesis queue until resumed.
      window.speechSynthesis.resume()
    })
  }

  onUnmounted(() => {
    cancel()
  })

  return {
    isSupported,
    isSpeaking,
    error,
    speak,
    cancel,
  }
}
