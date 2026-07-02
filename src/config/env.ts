const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
const geminiModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash'

export const env = {
  geminiApiKey,
  geminiModel,
} as const

export function isGeminiConfigured(): boolean {
  return Boolean(geminiApiKey?.trim())
}
