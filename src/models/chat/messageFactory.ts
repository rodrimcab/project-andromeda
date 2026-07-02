import type { ChatMessage, MediaCard } from '@/types/chat'

function createMessageId(): string {
  // Browser-supported in modern environments.
  return crypto.randomUUID()
}

function createTimestamp(): string {
  // Keep it human-readable for the UI (and good enough for this MVP).
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function createMessage(input: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
  return {
    ...input,
    id: createMessageId(),
    timestamp: createTimestamp(),
  }
}

export function createUserTextMessage(text: string): ChatMessage {
  return createMessage({
    role: 'user',
    type: 'text',
    content: text,
  })
}

export function createAssistantTextMessage(text: string): ChatMessage {
  return createMessage({
    role: 'assistant',
    type: 'text',
    content: text,
  })
}

export function createAssistantSuccessMessage(text: string): ChatMessage {
  return createMessage({
    role: 'assistant',
    type: 'success',
    content: text,
  })
}

export function createAssistantCardMessage(input: {
  content?: string
  card: MediaCard
}): ChatMessage {
  return createMessage({
    role: 'assistant',
    type: 'card',
    content: input.content,
    card: input.card,
  })
}

