<script setup lang="ts">
import {
  Earth,
  Image,
  Orbit,
  Rocket,
  Telescope,
} from '@lucide/vue'

import MissionCard from '@/components/ui/MissionCard.vue'
import SuggestionCard from '@/components/ui/SuggestionCard.vue'
import { recentMissions, suggestions } from '@/data/mockData'

const suggestionIcons = [Rocket, Telescope, Image, Orbit, Earth]
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto p-4 lg:p-6">
    <!-- Try asking -->
    <section class="mb-8">
      <h2 class="mb-4 text-sm font-semibold text-gray-300">Try asking</h2>
      <div class="space-y-2">
        <SuggestionCard
          v-for="(suggestion, index) in suggestions"
          :key="suggestion.id"
          :label="suggestion.label"
          :icon="suggestionIcons[index] ?? Rocket"
        />
      </div>
    </section>

    <!-- Recent missions -->
    <section class="flex-1">
      <h2 class="mb-4 text-sm font-semibold text-gray-300">Recent Missions</h2>
      <div class="space-y-2">
        <MissionCard
          v-for="mission in recentMissions"
          :key="mission.id"
          :title="mission.title"
          :date="mission.date"
          :image-url="mission.imageUrl"
          :saved="mission.saved"
        />
      </div>

      <button
        type="button"
        class="mt-4 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        View all missions →
      </button>
    </section>
  </div>
</template>
