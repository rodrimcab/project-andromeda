import type { ChatMessage, MediaCard, MessageRole } from '@/types/chat'

export type ConversationPart =
  | { kind: 'text'; text: string }
  | { kind: 'card'; card: MediaCard }
  | { kind: 'success'; text: string }

export interface ConversationTurn {
  messageId: string
  role: MessageRole
  timestamp: string
  parts: ConversationPart[]
}

export interface LlmChatMessage {
  role: 'user' | 'model'
  content: string
}

function formatCardAsText(card: MediaCard): string {
  const desc = card.description ? `\nDescription: ${card.description}` : ''
  const link = card.linkUrl ? `\nLink: ${card.linkLabel} (${card.linkUrl})` : ''

  let media = ''
  if (card.mediaType === 'video') {
    media = `\nMedia: video${card.videoUrl ? ` (${card.videoUrl})` : ''}`
    if (card.videoUnavailable) {
      media += ' — preview unavailable on card'
    }
  } else if (card.imageUrl) {
    media = `\nImage: ${card.imageUrl}`
  }

  return `Card: ${card.title}${desc}${link}${media}`
}

function chatMessageToParts(message: ChatMessage): ConversationPart[] {
  if (message.type === 'card' && message.card) {
    const parts: ConversationPart[] = []
    if (message.content) {
      parts.push({ kind: 'text', text: message.content })
    }
    parts.push({ kind: 'card', card: message.card })
    return parts
  }

  if (message.type === 'success') {
    return [{ kind: 'success', text: message.content ?? '' }]
  }

  return [{ kind: 'text', text: message.content ?? '' }]
}

export function chatMessagesToConversationHistory(messages: ChatMessage[]): ConversationTurn[] {
  return messages.map((message) => ({
    messageId: message.id,
    role: message.role,
    timestamp: message.timestamp,
    parts: chatMessageToParts(message),
  }))
}

function partToText(part: ConversationPart): string {
  switch (part.kind) {
    case 'text':
      return part.text
    case 'success':
      return part.text
    case 'card':
      return formatCardAsText(part.card)
  }
}

/**
 * Prepare chat history for Gemini.
 * - Excludes seed/demo messages from the UI
 * - Drops leading assistant turns (Gemini requires user-first history)
 * - Merges consecutive turns with the same role
 */
export function toLlmChatMessages(messages: ChatMessage[]): LlmChatMessage[] {
  const liveMessages = messages.filter((message) => !message.isSeed)

  const raw = chatMessagesToConversationHistory(liveMessages).map((turn) => ({
    role: turn.role === 'user' ? ('user' as const) : ('model' as const),
    content: turn.parts.map(partToText).filter(Boolean).join('\n\n'),
  }))

  return sanitizeGeminiHistory(raw)
}

function sanitizeGeminiHistory(messages: LlmChatMessage[]): LlmChatMessage[] {
  let sanitized = messages.filter((message) => message.content.trim())

  while (sanitized[0]?.role === 'model') {
    sanitized = sanitized.slice(1)
  }

  const merged: LlmChatMessage[] = []

  for (const message of sanitized) {
    const last = merged.at(-1)
    if (last && last.role === message.role) {
      last.content = `${last.content}\n\n${message.content}`
      continue
    }
    merged.push({ ...message })
  }

  return merged
}

