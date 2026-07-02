import type { ChatMessage } from '@/types/chat'

export interface LastDiscovery {
  title: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  mediaType?: 'image' | 'video'
}

export function findLastDiscovery(messages: ChatMessage[]): LastDiscovery | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (!message || message.role !== 'assistant' || message.type !== 'card' || !message.card) {
      continue
    }

    const { card } = message
    return {
      title: card.title,
      description: card.description,
      ...(card.imageUrl && { imageUrl: card.imageUrl }),
      linkUrl: card.linkUrl,
      mediaType: card.mediaType,
    }
  }

  return null
}
