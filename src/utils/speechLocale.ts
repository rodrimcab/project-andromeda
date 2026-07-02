import {
  getSpeechRecognitionLangForText,
  getSpeechSynthesisLangForText,
} from '@/utils/detectLanguage'

const SPANISH_REGIONAL_LANGS = new Set(['es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-PE', 'es-VE'])

export function getSpeechRecognitionLang(): string {
  const languages =
    typeof navigator !== 'undefined'
      ? [...(navigator.languages ?? []), navigator.language].filter(Boolean)
      : ['en-US']

  for (const preferred of languages) {
    if (preferred.startsWith('en')) return 'en-US'

    if (preferred.startsWith('es')) {
      if (SPANISH_REGIONAL_LANGS.has(preferred)) return preferred
      if (preferred.startsWith('es-MX')) return 'es-MX'
      if (preferred.startsWith('es-US')) return 'es-US'
      if (preferred.startsWith('es-ES')) return 'es-ES'
      return 'es-ES'
    }
  }

  return 'en-US'
}

/** @deprecated Use getSpeechSynthesisLangForText with the text to speak. */
export function getSpeechSynthesisLang(): string {
  return getSpeechRecognitionLang()
}

export { getSpeechRecognitionLangForText, getSpeechSynthesisLangForText }

function voiceMatchesLang(voice: SpeechSynthesisVoice, lang: string): boolean {
  const langPrefix = lang.split('-')[0] ?? lang
  return voice.lang === lang || voice.lang.startsWith(`${langPrefix}-`) || voice.lang === langPrefix
}

function isGoogleVoice(voice: SpeechSynthesisVoice): boolean {
  return /google/i.test(voice.name)
}

export function pickSpeechSynthesisVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null

  const matching = voices.filter((voice) => voiceMatchesLang(voice, lang))
  if (matching.length === 0) {
    const defaultVoice = voices.find((voice) => voice.default)
    return defaultVoice ?? voices[0] ?? null
  }

  const exactMatches = matching.filter((voice) => voice.lang === lang)
  const googleExact = exactMatches.find(isGoogleVoice)
  if (googleExact) return googleExact
  if (exactMatches.length > 0) return exactMatches[0] ?? null

  const googleMatch = matching.find(isGoogleVoice)
  if (googleMatch) return googleMatch

  return matching[0] ?? null
}
