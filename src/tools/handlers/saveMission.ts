import { saveMissionToPipedream } from '@/services/missionService'
import type { SaveMissionArgs, SaveMissionToolResult } from '@/types/tools'

export async function saveMission(args: SaveMissionArgs): Promise<SaveMissionToolResult> {
  const title = args.title.trim()
  if (!title) {
    throw new Error('Mission title is required.')
  }

  const description = args.description?.trim() || undefined
  const imageUrl = args.imageUrl?.trim() || undefined
  const savedAt = new Date().toISOString()

  await saveMissionToPipedream({
    title,
    description,
    imageUrl,
    savedAt,
    source: 'project-andromeda',
  })

  return {
    success: true,
    title,
    savedAt,
    ...(imageUrl && { imageUrl }),
  }
}
