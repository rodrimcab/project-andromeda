import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import earthImg from '@/assets/earth.png'
import type { Mission } from '@/types/chat'
import { formatMissionSavedDate } from '@/utils/missionDate'

export const DEFAULT_MISSION_IMAGE = earthImg

export interface SavedMissionInput {
  title: string
  imageUrl?: string
  savedAt: string
}

export const useMissionStore = defineStore('mission', () => {
  const missions = ref<Mission[]>([])

  const recentSavedMissions = computed(() => missions.value.slice(0, 5))

  function addMission(input: SavedMissionInput) {
    const mission: Mission = {
      id: crypto.randomUUID(),
      title: input.title,
      date: formatMissionSavedDate(input.savedAt),
      imageUrl: input.imageUrl?.trim() || DEFAULT_MISSION_IMAGE,
      saved: true,
    }

    missions.value = [mission, ...missions.value]
  }

  return {
    missions,
    recentSavedMissions,
    addMission,
  }
})
