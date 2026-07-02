import { ref } from 'vue'

import { detectTextLanguage, getSpanishRecognitionLang } from '@/utils/detectLanguage'
import { getSpeechRecognitionLang } from '@/utils/speechLocale'

export type MicLanguage = 'en' | 'es'

const STORAGE_KEY = 'andromeda-mic-language'

function getDefaultMicLanguage(): MicLanguage {
  return getSpeechRecognitionLang().startsWith('es') ? 'es' : 'en'
}

function loadMicLanguage(): MicLanguage {
  if (typeof sessionStorage === 'undefined') {
    return getDefaultMicLanguage()
  }

  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'es') {
    return stored
  }

  return getDefaultMicLanguage()
}

const micLanguage = ref<MicLanguage>(loadMicLanguage())

export function useMicLanguage() {
  function setMicLanguage(lang: MicLanguage) {
    micLanguage.value = lang

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, lang)
    }
  }

  function resolveRecognitionLang(): string {
    return micLanguage.value === 'es' ? getSpanishRecognitionLang() : 'en-US'
  }

  function syncMicLanguageFromText(text: string) {
    const detected = detectTextLanguage(text)
    if (detected === 'es') {
      setMicLanguage('es')
      return
    }
    if (detected === 'en') {
      setMicLanguage('en')
    }
  }

  return {
    micLanguage,
    setMicLanguage,
    syncMicLanguageFromText,
    resolveRecognitionLang,
  }
}
