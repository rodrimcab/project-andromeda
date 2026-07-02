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
  return `Card: ${card.title}${desc}${link}\nImage: ${card.imageUrl}`
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
 * Generic LLM-friendly history representation.
 * Gemini integration (and function calling schemas) should be layered on top in later phases.
 */
export function toLlmChatMessages(messages: ChatMessage[]): LlmChatMessage[] {
  return chatMessagesToConversationHistory(messages).map((turn) => {
    const content = turn.parts.map(partToText).filter(Boolean).join('\n\n')
    return {
      role: turn.role === 'user' ? 'user' : 'model',
      content,
    }
  })
}

