<script setup lang="ts">
import {
  Bookmark,
  Image,
  Moon,
  Orbit,
  Rocket,
  Telescope,
} from '@lucide/vue'

import MissionCard from '@/components/ui/MissionCard.vue'
import SuggestionCard from '@/components/ui/SuggestionCard.vue'
import { useChatSubmit } from '@/composables/useChatSubmit'
import { suggestions } from '@/data/mockData'
import { useAppStore } from '@/store/appStore'
import { MISSION_LOG_PREVIEW_LIMIT, useMissionStore } from '@/store/missionStore'

const emit = defineEmits<{
  close: []
}>()

const appStore = useAppStore()
const missionStore = useMissionStore()
const { canSubmit, submitMessage } = useChatSubmit()

missionStore.hydrate()

const suggestionIcons = [Rocket, Telescope, Image, Orbit, Moon]

function openMissionArchive() {
  appStore.setActiveView('missions')
  emit('close')
}

async function handleSuggestion(label: string) {
  appStore.setActiveView('chat')
  emit('close')
  await submitMessage(label)
}
</script>

<template>
  <div class="h-full overflow-y-auto p-4 lg:p-6">
    <!-- Try asking -->
    <section class="mb-8">
      <h2 class="mb-4 text-sm font-semibold text-gray-300">Try asking</h2>
      <div class="space-y-2">
        <SuggestionCard
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          :label="suggestion.label"
          :icon="suggestionIcons[index] ?? Rocket"
          :disabled="!canSubmit"
          @select="handleSuggestion(suggestion.label)"
        />
      </div>
    </section>

    <!-- Recent missions -->
    <section class="flex-1">
      <h2 class="mb-4 text-sm font-semibold text-gray-300">Mission Log</h2>

      <div
        v-if="missionStore.recentSavedMissions.length === 0"
        class="glass flex flex-col items-center rounded-xl px-4 py-8 text-center"
      >
        <div
          class="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10"
        >
          <Bookmark class="h-5 w-5 text-blue-400" />
        </div>
        <p class="text-sm font-medium text-gray-300">No missions saved yet</p>
        <p class="mt-1 max-w-[220px] text-xs leading-relaxed text-gray-500">
          Ask Andromeda to save a NASA image or discovery — it'll show up here.
        </p>
      </div>

      <template v-else>
        <div class="space-y-2">
          <MissionCard
            v-for="mission in missionStore.recentSavedMissions"
            :key="mission.id"
            :title="mission.title"
            :saved-at="mission.savedAt"
            :image-url="mission.imageUrl"
            :saved="mission.saved"
          />
        </div>

        <button
          v-if="missionStore.missions.length > MISSION_LOG_PREVIEW_LIMIT"
          type="button"
          class="mt-4 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          @click="openMissionArchive"
        >
          View all missions →
        </button>
      </template>
    </section>
  </div>
</template>
