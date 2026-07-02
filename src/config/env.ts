const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
const geminiModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'
const nasaApiKey = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY'
const requestBinUrl =
  import.meta.env.VITE_REQUESTBIN_URL || import.meta.env.VITE_PIPEDREAM_WEBHOOK_URL

export const env = {
  geminiApiKey,
  geminiModel,
  nasaApiKey,
  requestBinUrl,
  /** @deprecated Use requestBinUrl */
  pipedreamWebhookUrl: requestBinUrl,
} as const

export function isGeminiConfigured(): boolean {
  return Boolean(geminiApiKey?.trim())
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
