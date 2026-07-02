<script setup lang="ts">
import { Bookmark, MessageCircle, X } from '@lucide/vue'

import earthImg from '@/assets/earth.png'
import galaxyImg from '@/assets/galaxy.png'
import SidebarItem from '@/components/ui/SidebarItem.vue'
import { navItems } from '@/data/mockData'
import { useAppStore, type AppView } from '@/store/appStore'

defineOptions({ name: 'AppSidebar' })

const emit = defineEmits<{
  navigate: [view: AppView]
  close: []
}>()

const appStore = useAppStore()

const iconMap = {
  chat: MessageCircle,
  missions: Bookmark,
} as const

function isActive(id: string): boolean {
  return id === 'missions'
    ? appStore.activeView === 'missions'
    : appStore.activeView === 'chat'
}

function handleNavigate(id: string) {
  const view: AppView = id === 'missions' ? 'missions' : 'chat'
  appStore.setActiveView(view)
  emit('navigate', view)
  emit('close')
}
</script>

<template>
  <div class="relative flex h-full min-h-0 flex-col">
    <!-- Mobile drawer header -->
    <div
      class="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 lg:hidden"
    >
      <div class="flex items-center gap-2.5">
        <img
          :src="galaxyImg"
          alt=""
          class="h-9 w-9 shrink-0 object-contain"
          aria-hidden="true"
        />
        <div>
          <p class="text-sm font-semibold text-gray-100">Project Andromeda</p>
          <p class="text-xs text-gray-500">Navigation</p>
        </div>
      </div>
      <button
        type="button"
        class="glass rounded-lg p-2 text-gray-400"
        aria-label="Close navigation"
        @click="emit('close')"
      >
        <X class="h-5 w-5" />
      </button>
    </div>

    <!-- Brand (desktop) -->
    <div class="relative z-10 hidden border-b border-white/10 p-6 lg:block">
      <div class="flex items-center gap-3">
        <img
          :src="galaxyImg"
          alt=""
          class="h-14 w-14 shrink-0 object-contain"
          aria-hidden="true"
        />
        <div>
          <h1 class="font-bold text-gray-100">Project Andromeda</h1>
          <p class="text-xs text-gray-500">AI Space Assistant</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="relative z-10 flex-1 space-y-1 overflow-y-auto p-4">
      <SidebarItem
        v-for="item in navItems"
        :key="item.id"
        :label="item.label"
        :icon="iconMap[item.id as keyof typeof iconMap]"
        :active="isActive(item.id)"
        @click="handleNavigate(item.id)"
      />
    </nav>

    <!-- Earth decoration -->
    <img
      :src="earthImg"
      alt=""
      class="pointer-events-none absolute bottom-0 -left-6 z-0 w-[27rem] max-w-none"
      aria-hidden="true"
    />
  </div>
</template>
