import type { Mission } from '@/types/chat'

export interface MissionDedupeInput {
  title: string
  imageUrl?: string
}

export function getMissionDedupeKey(input: MissionDedupeInput): string {
  const imageUrl = input.imageUrl?.trim()
  if (imageUrl) {
    try {
      const url = new URL(imageUrl)
      return `img:${url.origin}${url.pathname}`
    } catch {
      return `img:${imageUrl}`
    }
  }

  return `title:${input.title.trim().toLowerCase()}`
}

export function isDuplicateMission(
  missions: Mission[],
  input: MissionDedupeInput,
): Mission | null {
  const key = getMissionDedupeKey(input)
  return missions.find((mission) => getMissionDedupeKey(mission) === key) ?? null
}

export function dedupeMissions(missions: Mission[]): Mission[] {
  const seen = new Set<string>()
  const unique: Mission[] = []

  for (const mission of missions) {
    const key = getMissionDedupeKey(mission)
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    unique.push(mission)
  }

  return unique
}
