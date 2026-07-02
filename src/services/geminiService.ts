import {
  GoogleGenerativeAI,
  type Content,
  type Part,
} from '@google/generative-ai'

import { ANDROMEDA_SYSTEM_PROMPT } from '@/constants/andromedaPrompt'
import { env } from '@/config/env'
import type { LlmChatMessage } from '@/models/conversation/conversation'
import { ANDROMEDA_TOOLS } from '@/tools/definitions'
import { executeToolCall, type ToolExecutionContext } from '@/tools/executor'
import type { AiErrorCode, AssistantEffect, AssistantResponse } from '@/types/ai'
import {
  detectTextLanguage,
  getLanguageReplyHint,
  getResponseLanguageLabel,
  type DetectedLanguageCode,
} from '@/utils/detectLanguage'

const MAX_TOOL_ROUNDS = 5

export class GeminiServiceError extends Error {
  readonly code: AiErrorCode

  constructor(message: string, code: AiErrorCode) {
    super(message)
    this.name = 'GeminiServiceError'
    this.code = code
  }
}

function assertGeminiConfigured(): void {
  if (env.geminiApiKeys.length === 0) {
    throw new GeminiServiceError(
      'Gemini API key is not configured. Add VITE_GEMINI_API_KEY to your .env file.',
      'missing_api_key',
    )
  }
}

function toGeminiContents(
  messages: LlmChatMessage[],
  responseLanguage?: DetectedLanguageCode,
): Content[] {
  const contents = messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.content }],
  }))

  if (!responseLanguage) return contents

  const last = contents.at(-1)
  const lastPart = last?.parts?.[0]
  if (last?.role !== 'user' || !lastPart || !('text' in lastPart)) return contents

  const hint = getLanguageReplyHint(responseLanguage)
  contents[contents.length - 1] = {
    role: 'user',
    parts: [{ text: `${lastPart.text}\n\n${hint}` }],
  }

  return contents
}

function getGenerativeModel(apiKey: string, responseLanguage?: DetectedLanguageCode) {
  const genAI = new GoogleGenerativeAI(apiKey)

  let systemInstruction = ANDROMEDA_SYSTEM_PROMPT
  if (responseLanguage) {
    const languageLabel = getResponseLanguageLabel(responseLanguage)
    systemInstruction += `\n\nCRITICAL LANGUAGE RULE: The user's latest message is in ${languageLabel}. You MUST write your entire response in ${languageLabel} only — including tool summaries and follow-ups. Ignore the language of earlier messages in this conversation.`
  }

  return genAI.getGenerativeModel({
    model: env.geminiModel,
    systemInstruction,
    tools: ANDROMEDA_TOOLS,
  })
}

function toGeminiServiceError(error: unknown): GeminiServiceError {
  if (error instanceof GeminiServiceError) return error

  const message = error instanceof Error ? error.message : 'Unknown Gemini API error'

  if (message.includes('429') || message.toLowerCase().includes('quota')) {
    return new GeminiServiceError(message, 'quota_exceeded')
  }

  return new GeminiServiceError(message, 'api_error')
}

function isQuotaError(error: GeminiServiceError): boolean {
  return error.code === 'quota_exceeded'
}

async function sendChatMessageWithKey(
  apiKey: string,
  messages: LlmChatMessage[],
  context: ToolExecutionContext,
  responseLanguage: DetectedLanguageCode,
): Promise<AssistantResponse> {
  const model = getGenerativeModel(apiKey, responseLanguage)
  const contents: Content[] = toGeminiContents(messages, responseLanguage)
  const effects: AssistantEffect[] = []

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const result = await model.generateContent({ contents })
    const response = result.response
    const functionCalls = response.functionCalls()

    if (!functionCalls?.length) {
      const text = response.text().trim()
      if (!text) {
        throw new GeminiServiceError('Gemini returned an empty response.', 'empty_response')
      }

      return { text, effects }
    }

    contents.push({
      role: 'model',
      parts: functionCalls.map((functionCall) => ({ functionCall })),
    })

    const functionResponseParts: Part[] = []

    for (const functionCall of functionCalls) {
      const outcome = await executeToolCall(functionCall, context)

      if (outcome.effect) {
        effects.push(outcome.effect)
      }

      functionResponseParts.push({
        functionResponse: {
          name: functionCall.name,
          response: outcome.response,
        },
      })
    }

    contents.push({
      role: 'user',
      parts: functionResponseParts,
    })
  }

  throw new GeminiServiceError(
    'Gemini exceeded the maximum number of tool calls for a single turn.',
    'api_error',
  )
}

export async function sendChatMessage(
  messages: LlmChatMessage[],
  context: ToolExecutionContext = { messages: [], missions: [] },
): Promise<AssistantResponse> {
  if (messages.length === 0) {
    throw new GeminiServiceError('No messages to send.', 'api_error')
  }

  const lastMessage = messages.at(-1)
  if (!lastMessage || lastMessage.role !== 'user') {
    throw new GeminiServiceError('The latest message must be from the user.', 'api_error')
  }

  assertGeminiConfigured()

  const responseLanguage = detectTextLanguage(lastMessage.content)
  const apiKeys = env.geminiApiKeys
  let lastQuotaError: GeminiServiceError | null = null

  for (let index = 0; index < apiKeys.length; index++) {
    const apiKey = apiKeys[index]
    if (!apiKey) continue

    try {
      return await sendChatMessageWithKey(apiKey, messages, context, responseLanguage)
    } catch (error) {
      const geminiError = toGeminiServiceError(error)

      if (isQuotaError(geminiError) && index < apiKeys.length - 1) {
        console.warn(
          `[Andromeda] Gemini API key ${index + 1} quota exceeded, falling back to key ${index + 2}.`,
        )
        lastQuotaError = geminiError
        continue
      }

      throw geminiError
    }
  }

  throw lastQuotaError ?? new GeminiServiceError('No Gemini API keys available.', 'missing_api_key')
}
