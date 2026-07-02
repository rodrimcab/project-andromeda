const geminiApiKeys = [
  import.meta.env.VITE_GEMINI_API_KEY,
  import.meta.env.VITE_GEMINI_API_KEY_2,
]
  .map((key) => key?.trim())
  .filter((key): key is string => Boolean(key))

const geminiModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'
const nasaApiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
const requestBinUrl =
  import.meta.env.VITE_REQUESTBIN_URL || import.meta.env.VITE_PIPEDREAM_WEBHOOK_URL

export const env = {
  geminiApiKeys,
  geminiModel,
  nasaApiKey,
  requestBinUrl,
  /** @deprecated Use requestBinUrl */
  pipedreamWebhookUrl: requestBinUrl,
} as const

export function isGeminiConfigured(): boolean {
  return geminiApiKeys.length > 0
}

export function isNasaConfigured(): boolean {
  return Boolean(nasaApiKey?.trim())
}

export function isRequestBinConfigured(): boolean {
  return Boolean(requestBinUrl?.trim())
}

/** @deprecated Use isRequestBinConfigured */
export function isPipedreamConfigured(): boolean {
  return isRequestBinConfigured()
}
