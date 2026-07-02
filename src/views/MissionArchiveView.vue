<script setup lang="ts">
import { Bookmark } from '@lucide/vue'
import { ref } from 'vue'

import MissionArchiveCard from '@/components/ui/MissionArchiveCard.vue'
import MissionDetailDialog from '@/components/ui/MissionDetailDialog.vue'
import { MISSION_LOG_PREVIEW_LIMIT, useMissionStore } from '@/store/missionStore'
import type { Mission } from '@/types/chat'

const missionStore = useMissionStore()
const selectedMission = ref<Mission | null>(null)
const dialogOpen = ref(false)

missionStore.hydrate()

function openMission(mission: Mission) {
  selectedMission.value = mission
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  selectedMission.value = null
}
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto px-6 py-6">
    <header class="mb-6 border-b border-white/10 pb-5">
      <h2 class="text-xl font-bold text-gray-100">Missions Saved</h2>
      <p class="mt-0.5 text-sm text-gray-500">
        Tap a mission to view it larger — your bookmarked NASA discoveries
      </p>
    </header>

    <div
      v-if="missionStore.missions.length === 0"
      class="glass flex flex-1 flex-col items-center justify-center rounded-xl px-6 py-12 text-center"
    >
      <div class="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
        <Bookmark class="h-6 w-6 text-blue-400" />
      </div>
      <p class="text-sm font-medium text-gray-300">No missions saved yet</p>
      <p class="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
        Ask Andromeda for a NASA image, then say “save this mission” or use the
        save button on the card.
      </p>
    </div>

    <template v-else>
      <div class="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MissionArchiveCard
          v-for="mission in missionStore.missions"
          :key="mission.id"
          :mission="mission"
          @select="openMission(mission)"
        />
      </div>

      <p
        v-if="missionStore.missions.length > MISSION_LOG_PREVIEW_LIMIT"
        class="mt-6 text-center text-xs text-gray-500"
      >
        Showing all {{ missionStore.missions.length }} saved missions
      </p>
    </template>

    <MissionDetailDialog
      :mission="selectedMission"
      :open="dialogOpen"
      @close="closeDialog"
    />
  </div>
</template>
