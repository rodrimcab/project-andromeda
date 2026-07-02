import type { MediaCard } from '@/types/chat'

export type AiErrorCode =
  | 'missing_api_key'
  | 'quota_exceeded'
  | 'api_error'
  | 'empty_response'
  | 'unknown'

export interface AiError {
  code: AiErrorCode
  message: string
}

export type AssistantEffect =
  | { type: 'card'; card: MediaCard }
  | {
      type: 'mission_saved'
      title: string
      savedAt: string
      remoteSaved: boolean
      duplicate?: boolean
      imageUrl?: string
      description?: string
      sourceUrl?: string
      warning?: string
    }

export interface AssistantResponse {
  text: string
  effects: AssistantEffect[]
}
