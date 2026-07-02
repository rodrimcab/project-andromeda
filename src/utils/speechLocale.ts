const SPANISH_REGIONAL_LANGS = new Set(['es-MX', 'es-AR', 'es-CO', 'es-CL', 'es-PE', 'es-VE'])

export function getSpeechRecognitionLang(): string {
  const preferred = navigator.languages?.[0] ?? navigator.language ?? 'en-US'

  if (!preferred.startsWith('es')) return 'en-US'

  if (SPANISH_REGIONAL_LANGS.has(preferred)) return preferred
  if (preferred.startsWith('es-MX')) return 'es-MX'
  if (preferred.startsWith('es-ES')) return 'es-ES'

  return 'es-ES'
}
