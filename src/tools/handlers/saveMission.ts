import type { ChatMessage, Mission } from '@/types/chat'
import { saveMissionToRequestBin } from '@/services/missionService'
import { MissionSaveError } from '@/types/mission'
import type { SaveMissionArgs, SaveMissionToolResult } from '@/types/tools'
import { findLastDiscovery } from '@/utils/discoveryContext'
import { isDuplicateMission } from '@/utils/missionDedupe'

export interface SaveMissionContext {
  messages: ChatMessage[]
  missions: Mission[]
}

function resolveSavePayload(args: SaveMissionArgs, context?: SaveMissionContext) {
  const lastDiscovery = context?.messages ? findLastDiscovery(context.messages) : null

  const title = args.title?.trim() || lastDiscovery?.title?.trim()
  if (!title) {
    throw new Error('No mission to save. Show a NASA image first or provide a title.')
  }

  const description = args.description?.trim() || lastDiscovery?.description
  const imageUrl =
    args.imageUrl?.trim() ||
    (lastDiscovery?.mediaType !== 'video' ? lastDiscovery?.imageUrl : undefined)
  const sourceUrl = lastDiscovery?.linkUrl

  return { title, description, imageUrl, sourceUrl }
}

export async function saveMission(
  args: SaveMissionArgs = {},
  context?: SaveMissionContext,
): Promise<SaveMissionToolResult> {
  const { title, description, imageUrl, sourceUrl } = resolveSavePayload(args, context)
  const existing = context?.missions
    ? isDuplicateMission(context.missions, { title, imageUrl })
    : null

  if (existing) {
    return {
      success: true,
      duplicate: true,
      title: existing.title,
      savedAt: existing.savedAt,
      remoteSaved: true,
      ...(existing.description && { description: existing.description }),
      ...(existing.imageUrl && { imageUrl: existing.imageUrl }),
      ...(existing.sourceUrl && { sourceUrl: existing.sourceUrl }),
    }
  }

  const savedAt = new Date().toISOString()

  let remoteSaved = true
  let warning: string | undefined

  try {
    await saveMissionToRequestBin({
      title,
      description,
      imageUrl,
      savedAt,
      source: 'project-andromeda',
    })
  } catch (error) {
    remoteSaved = false
    warning =
      error instanceof MissionSaveError
        ? error.message
        : 'Mission saved locally, but the cloud sync failed.'
  }

  return {
    success: true,
    title,
    savedAt,
    remoteSaved,
    ...(description && { description }),
    ...(imageUrl && { imageUrl }),
    ...(sourceUrl && { sourceUrl }),
    ...(warning && { warning }),
  }
}
