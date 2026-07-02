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

const MAX_TOOL_ROUNDS = 5

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

function getGenerativeModel() {
  const genAI = getClient()
  return genAI.getGenerativeModel({
    model: env.geminiModel,
    systemInstruction: ANDROMEDA_SYSTEM_PROMPT,
    tools: ANDROMEDA_TOOLS,
  })
}

function mapGeminiError(error: unknown): never {
  if (error instanceof GeminiServiceError) throw error

  const message = error instanceof Error ? error.message : 'Unknown Gemini API error'

  if (message.includes('429') || message.toLowerCase().includes('quota')) {
    throw new GeminiServiceError(message, 'quota_exceeded')
  }

  throw new GeminiServiceError(message, 'api_error')
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

  const model = getGenerativeModel()
  const contents: Content[] = toGeminiContents(messages)
  const effects: AssistantEffect[] = []

  try {
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
  } catch (error) {
    return mapGeminiError(error)
  }
}
