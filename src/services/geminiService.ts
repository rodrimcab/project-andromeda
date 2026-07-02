import { GoogleGenerativeAI, type Content } from '@google/generative-ai'

import { ANDROMEDA_SYSTEM_PROMPT } from '@/constants/andromedaPrompt'
import { env } from '@/config/env'
import type { LlmChatMessage } from '@/models/conversation/conversation'
import type { AiErrorCode } from '@/types/ai'

export class GeminiServiceError extends Error {
  readonly code: AiErrorCode

  constructor(message: string, code: AiErrorCode) {
    super(message)
    this.name = 'GeminiServiceError'
    this.code = code
  }
}

let client: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI {
  if (!env.geminiApiKey?.trim()) {
    throw new GeminiServiceError(
      'Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.',
      'missing_api_key',
    )
  }

  client ??= new GoogleGenerativeAI(env.geminiApiKey)
  return client
}

function toGeminiContents(messages: LlmChatMessage[]): Content[] {
  return messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.content }],
  }))
}

export async function sendChatMessage(messages: LlmChatMessage[]): Promise<string> {
  if (messages.length === 0) {
    throw new GeminiServiceError('No messages to send.', 'api_error')
  }

  const lastMessage = messages.at(-1)
  if (!lastMessage || lastMessage.role !== 'user') {
    throw new GeminiServiceError('The latest message must be from the user.', 'api_error')
  }

  const genAI = getClient()
  const model = genAI.getGenerativeModel({
    model: env.geminiModel,
    systemInstruction: ANDROMEDA_SYSTEM_PROMPT,
  })

  try {
    const result = await model.generateContent({
      contents: toGeminiContents(messages),
    })

    const text = result.response.text().trim()
    if (!text) {
      throw new GeminiServiceError('Gemini returned an empty response.', 'empty_response')
    }

    return text
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error

    const message = error instanceof Error ? error.message : 'Unknown Gemini API error'

    if (message.includes('429') || message.toLowerCase().includes('quota')) {
      throw new GeminiServiceError(message, 'quota_exceeded')
    }

    throw new GeminiServiceError(message, 'api_error')
  }
}
