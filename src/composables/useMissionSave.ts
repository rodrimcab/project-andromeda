import { saveMissionToRequestBin } from '@/services/missionService'
import { useChatStore } from '@/store/chatStore'
import { useMissionStore } from '@/store/missionStore'
import { MissionSaveError } from '@/types/mission'
import type { MediaCard } from '@/types/chat'
import { findLastDiscovery } from '@/utils/discoveryContext'

export interface SaveDiscoveryInput {
  title: string
  description?: string
  imageUrl?: string
  sourceUrl?: string
}

export interface SaveDiscoveryResult {
  handled: boolean
  saved: boolean
  duplicate: boolean
  title?: string
  message: string
}

function buildSuccessMessage(title: string, remoteSaved: boolean, warning?: string): string {
  if (remoteSaved) {
    return `Mission saved: ${title}`
  }

  if (warning) {
    return `Saved locally: ${title}. ${warning}`
  }

  return `Saved locally: ${title}. Cloud sync is unavailable right now.`
}

export function useMissionSave() {
  const chatStore = useChatStore()
  const missionStore = useMissionStore()

  async function performSave(input: SaveDiscoveryInput): Promise<SaveDiscoveryResult> {
    missionStore.hydrate()

    const title = input.title.trim()
    if (!title) {
      return { handled: false, saved: false, duplicate: false, message: '' }
    }

    const payload = {
      title,
      ...(input.description?.trim() && { description: input.description.trim() }),
      ...(input.imageUrl?.trim() && { imageUrl: input.imageUrl.trim() }),
      ...(input.sourceUrl?.trim() && { sourceUrl: input.sourceUrl.trim() }),
    }

    const duplicate = missionStore.findDuplicate(payload)
    if (duplicate) {
      return {
        handled: true,
        saved: false,
        duplicate: true,
        title: duplicate.title,
        message: `"${duplicate.title}" is already in your mission log.`,
      }
    }

    const savedAt = new Date().toISOString()

    let remoteSaved = true
    let warning: string | undefined

    try {
      await saveMissionToRequestBin({
        title: payload.title,
        description: payload.description,
        imageUrl: payload.imageUrl,
        savedAt,
        source: 'project-andromeda',
      })
    } catch (error) {
      remoteSaved = false
      warning =
        error instanceof MissionSaveError
          ? error.message
          : 'Cloud sync failed — check your RequestBin URL.'
    }

    missionStore.addMission({
      ...payload,
      savedAt,
    })

    return {
      handled: true,
      saved: true,
      duplicate: false,
      title,
      message: buildSuccessMessage(title, remoteSaved, warning),
    }
  }

  async function saveDiscovery(input: SaveDiscoveryInput): Promise<SaveDiscoveryResult> {
    const result = await performSave(input)
    if (result.handled && result.message) {
      chatStore.addAssistantSuccessMessage(result.message)
    }
    return result
  }

  async function saveLastDiscovery(): Promise<SaveDiscoveryResult> {
    const lastDiscovery = findLastDiscovery(chatStore.messages)
    if (!lastDiscovery) {
      return {
        handled: true,
        saved: false,
        duplicate: false,
        message: 'No NASA image to save yet — ask me for one first!',
      }
    }

    return performSave({
      title: lastDiscovery.title,
      description: lastDiscovery.description,
      sourceUrl: lastDiscovery.linkUrl,
      ...(lastDiscovery.mediaType !== 'video' &&
        lastDiscovery.imageUrl && { imageUrl: lastDiscovery.imageUrl }),
    })
  }

  async function saveCard(card: MediaCard): Promise<SaveDiscoveryResult> {
    return saveDiscovery({
      title: card.title,
      description: card.description,
      sourceUrl: card.linkUrl,
      ...(card.mediaType !== 'video' && card.imageUrl && { imageUrl: card.imageUrl }),
    })
  }

  function isCardSaved(card: MediaCard): boolean {
    missionStore.hydrate()
    return Boolean(
      missionStore.findDuplicate({
        title: card.title,
        ...(card.mediaType !== 'video' && card.imageUrl && { imageUrl: card.imageUrl }),
      }),
    )
  }

  return {
    saveDiscovery,
    saveLastDiscovery,
    saveCard,
    isCardSaved,
  }
}
