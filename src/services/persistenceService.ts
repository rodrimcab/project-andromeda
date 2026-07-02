import type {
  PersistedChatState,
  PersistedMission,
  PersistedMissionState,
} from '@/types/persistence'
import { PERSISTENCE_VERSION } from '@/types/persistence'
import type { ChatMessage } from '@/types/chat'

const CHAT_STORAGE_KEY = 'andromeda:chat:v1'
const MISSIONS_STORAGE_KEY = 'andromeda:missions:v1'

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return null
    }

    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[Andromeda] Failed to persist ${key}:`, error)
    }
  }
}

function isPersistedChatState(value: unknown): value is PersistedChatState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as PersistedChatState
  return record.version === PERSISTENCE_VERSION && Array.isArray(record.messages)
}

function isPersistedMissionState(value: unknown): value is PersistedMissionState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as PersistedMissionState
  return record.version === PERSISTENCE_VERSION && Array.isArray(record.missions)
}

export function loadChatMessages(): ChatMessage[] | null {
  const state = readJson<unknown>(CHAT_STORAGE_KEY)
  if (!isPersistedChatState(state)) {
    return null
  }

  return state.messages
}

export function saveChatMessages(messages: ChatMessage[]): void {
  const state: PersistedChatState = {
    version: PERSISTENCE_VERSION,
    messages,
  }

  writeJson(CHAT_STORAGE_KEY, state)
}

export function loadMissions(): PersistedMission[] | null {
  const state = readJson<unknown>(MISSIONS_STORAGE_KEY)
  if (!isPersistedMissionState(state)) {
    return null
  }

  return state.missions
}

export function saveMissions(missions: PersistedMission[]): void {
  const state: PersistedMissionState = {
    version: PERSISTENCE_VERSION,
    missions,
  }

  writeJson(MISSIONS_STORAGE_KEY, state)
}
