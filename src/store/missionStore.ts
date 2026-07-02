import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { loadMissions, saveMissions } from '@/services/persistenceService'
import type { Mission } from '@/types/chat'
import type { PersistedMission } from '@/types/persistence'
import { dedupeMissions, isDuplicateMission, type MissionDedupeInput } from '@/utils/missionDedupe'

export const MISSION_LOG_PREVIEW_LIMIT = 4

export interface SavedMissionInput {
  title: string
  savedAt: string
  imageUrl?: string
  description?: string
  sourceUrl?: string
}

export type AddMissionResult =
  | { status: 'added'; mission: Mission }
  | { status: 'duplicate'; mission: Mission }

function toPersistedMission(mission: Mission): PersistedMission {
  return {
    id: mission.id,
    title: mission.title,
    savedAt: mission.savedAt,
    ...(mission.imageUrl && { imageUrl: mission.imageUrl }),
    ...(mission.description && { description: mission.description }),
    ...(mission.sourceUrl && { sourceUrl: mission.sourceUrl }),
  }
}

export const useMissionStore = defineStore('mission', () => {
  const missions = ref<Mission[]>([])
  const hydrated = ref(false)

  const recentSavedMissions = computed(() => missions.value.slice(0, MISSION_LOG_PREVIEW_LIMIT))

  function hydrate() {
    if (hydrated.value) {
      return
    }

    const persisted = loadMissions()
    missions.value = dedupeMissions(
      (persisted ?? []).map((mission) => ({
        ...mission,
        saved: true,
      })),
    )
    hydrated.value = true
    persistMissions()
  }

  function persistMissions() {
    if (!hydrated.value) {
      return
    }

    saveMissions(missions.value.map(toPersistedMission))
  }

  function findDuplicate(input: MissionDedupeInput): Mission | null {
    hydrate()
    return isDuplicateMission(missions.value, input)
  }

  function addMission(input: SavedMissionInput): AddMissionResult {
    hydrate()

    const duplicate = isDuplicateMission(missions.value, input)
    if (duplicate) {
      return { status: 'duplicate', mission: duplicate }
    }

    const mission: Mission = {
      id: crypto.randomUUID(),
      title: input.title,
      savedAt: input.savedAt,
      ...(input.imageUrl?.trim() && { imageUrl: input.imageUrl.trim() }),
      ...(input.description?.trim() && { description: input.description.trim() }),
      ...(input.sourceUrl?.trim() && { sourceUrl: input.sourceUrl.trim() }),
      saved: true,
    }

    missions.value = [mission, ...missions.value]
    persistMissions()

    return { status: 'added', mission }
  }

  watch(
    missions,
    () => {
      persistMissions()
    },
    { deep: true },
  )

  return {
    missions,
    recentSavedMissions,
    hydrate,
    findDuplicate,
    addMission,
  }
})
