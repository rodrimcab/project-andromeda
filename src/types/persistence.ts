import type { ChatMessage } from '@/types/chat'

export const PERSISTENCE_VERSION = 1 as const

export interface PersistedChatState {
  version: typeof PERSISTENCE_VERSION
  messages: ChatMessage[]
}

export interface PersistedMission {
  id: string
  title: string
  savedAt: string
  imageUrl?: string
  description?: string
  sourceUrl?: string
}

export interface PersistedMissionState {
  version: typeof PERSISTENCE_VERSION
  missions: PersistedMission[]
}
