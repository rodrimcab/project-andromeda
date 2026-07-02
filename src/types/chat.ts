export type MessageRole = 'user' | 'assistant'

export type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface MediaCard {
  imageUrl?: string
  title: string
  description: string
  linkLabel: string
  linkUrl: string
  mediaType?: 'image' | 'video'
  videoUrl?: string
  videoUnavailable?: boolean
}

export interface ChatMessage {
  id: string
  role: MessageRole
  timestamp: string
  type: 'text' | 'card' | 'success'
  content?: string
  card?: MediaCard
  /** Demo/seed messages shown in UI but excluded from LLM context */
  isSeed?: boolean
}

export interface NavItem {
  id: string
  label: string
  active?: boolean
}

export interface Suggestion {
  id: string
  label: string
}

export interface Mission {
  id: string
  title: string
  savedAt: string
  imageUrl?: string
  description?: string
  sourceUrl?: string
  saved?: boolean
}
