export type DetectedLanguageCode = 'en' | 'es' | 'other'

const SPANISH_MARKERS =
  /\b(el|la|los|las|un|una|unos|unas|del|al|que|y|por|con|para|como|pero|más|muy|qué|cómo|dónde|cuál|cuáles|también|esta|este|estos|estas|eso|esa|aquí|ahí|hola|gracias|por favor|imagen|guardar|misión|muestra|muéstrame|otra|hoy|dime|explícame|universo|espacio|planeta|estrella|galaxia|nasa|astronomía)\b/gi

const ENGLISH_MARKERS =
  /\b(the|and|is|are|was|were|what|how|where|when|which|this|that|these|those|with|for|from|have|has|you|your|please|thank|thanks|save|mission|picture|today|show|tell|another|space|planet|star|galaxy|nasa|astronomy|universe|explain|black|hole|holes|about|why|can|could|would|do|does|did|will|just|give|get|let|know|think|see|look|find|want|need|help|me)\b/gi

const SPANISH_CHARS = /[áéíóúñü¿¡]/i

function scoreSpanish(text: string): number {
  const markers = text.match(SPANISH_MARKERS)?.length ?? 0
  const chars = SPANISH_CHARS.test(text) ? 3 : 0
  return markers + chars
}

function scoreEnglish(text: string): number {
  return text.match(ENGLISH_MARKERS)?.length ?? 0
}

function getBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en-US'
  return navigator.languages?.[0] ?? navigator.language ?? 'en-US'
}

const SPANISH_REGIONAL_LANGS = new Set(['es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-PE', 'es-VE'])

export function getSpanishRecognitionLang(): string {
  const preferred = getBrowserLanguage()

  if (SPANISH_REGIONAL_LANGS.has(preferred)) return preferred
  if (preferred.startsWith('es-MX')) return 'es-MX'
  if (preferred.startsWith('es-ES')) return 'es-ES'
  if (preferred.startsWith('es-US')) return 'es-US'

  return getSpanishSynthesisLang()
}

function getSpanishSynthesisLang(): 'es-ES' | 'es-US' {
  const preferred = getBrowserLanguage()

  if (preferred.startsWith('es-US')) return 'es-US'
  if (preferred.startsWith('es-MX') || preferred.startsWith('es-AR') || preferred.startsWith('es-CO')) {
    return 'es-US'
  }

  return 'es-ES'
}

/**
 * Detect the likely language of user or assistant text.
 * Optimized for Spanish and English; falls back to browser locale for other languages.
 */
export function detectTextLanguage(text: string): DetectedLanguageCode {
  const trimmed = text.trim()
  if (!trimmed) return 'en'

  const spanishScore = scoreSpanish(trimmed)
  const englishScore = scoreEnglish(trimmed)

  if (spanishScore > englishScore && spanishScore >= 1) return 'es'
  if (englishScore > spanishScore && englishScore >= 1) return 'en'
  if (spanishScore > englishScore) return 'es'
  if (englishScore > spanishScore) return 'en'

  if (SPANISH_CHARS.test(trimmed)) return 'es'

  // Short Latin prompts without Spanish signals are usually English.
  if (/^[a-z0-9\s.,!?'"-]+$/i.test(trimmed)) return 'en'

  const browserLang = getBrowserLanguage().toLowerCase()
  if (browserLang.startsWith('es')) return 'es'
  if (browserLang.startsWith('en')) return 'en'

  return 'other'
}

export function getResponseLanguageLabel(code: DetectedLanguageCode): string {
  switch (code) {
    case 'en':
      return 'English'
    case 'es':
      return 'Spanish'
    default:
      return 'the same language as the user\'s latest message'
  }
}

export function getLanguageReplyHint(code: DetectedLanguageCode): string {
  switch (code) {
    case 'es':
      return '(Responde únicamente en español.)'
    case 'en':
      return '(Reply in English only.)'
    default:
      return '(Reply in the same language as my message.)'
  }
}

/**
 * Map detected language to a BCP-47 tag suitable for speech synthesis.
 */
export function getSpeechSynthesisLangForText(text: string): string {
  const detected = detectTextLanguage(text)

  if (detected === 'es') return getSpanishSynthesisLang()
  if (detected === 'en') return 'en-US'

  const browserLang = getBrowserLanguage()
  if (browserLang.trim()) return browserLang

  return 'en-US'
}

/**
 * Pick a BCP-47 tag for speech recognition based on message text.
 */
export function getSpeechRecognitionLangForText(text: string): string {
  const detected = detectTextLanguage(text)

  if (detected === 'es') return getSpanishRecognitionLang()
  if (detected === 'en') return 'en-US'

  const browserLang = getBrowserLanguage()
  if (browserLang.trim()) return browserLang

  return 'en-US'
}
