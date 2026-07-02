const SPANISH_REGIONAL_LANGS = new Set(['es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-PE', 'es-VE'])

function getPreferredSpeechLang(): string {
  return navigator.languages?.[0] ?? navigator.language ?? 'en-US'
}

export function getSpeechRecognitionLang(): string {
  const preferred = getPreferredSpeechLang()

  if (!preferred.startsWith('es')) return 'en-US'

  if (SPANISH_REGIONAL_LANGS.has(preferred)) return preferred
  if (preferred.startsWith('es-MX')) return 'es-MX'
  if (preferred.startsWith('es-ES')) return 'es-ES'

  return 'es-ES'
}

export function getSpeechSynthesisLang(): string {
  return getSpeechRecognitionLang()
}

export function pickSpeechSynthesisVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null

  const langPrefix = lang.split('-')[0] ?? lang

  const exactMatch = voices.find((voice) => voice.lang === lang)
  if (exactMatch) return exactMatch

  const prefixMatch = voices.find((voice) => voice.lang.startsWith(langPrefix))
  if (prefixMatch) return prefixMatch

  const defaultVoice = voices.find((voice) => voice.default)
  return defaultVoice ?? voices[0] ?? null
}
