<script setup lang="ts">
import { ref } from 'vue'

import ChatWindow from '@/components/chat/ChatWindow.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import RightPanel from '@/components/layout/RightPanel.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import { initialMessages } from '@/data/mockData'

const sidebarOpen = ref(false)
const panelOpen = ref(false)
</script>

<template>
  <AppLayout
    :sidebar-open="sidebarOpen"
    :panel-open="panelOpen"
    @toggle-sidebar="sidebarOpen = !sidebarOpen"
    @toggle-panel="panelOpen = !panelOpen"
    @close-sidebar="sidebarOpen = false"
    @close-panel="panelOpen = false"
  >
    <template #sidebar>
      <Sidebar />
    </template>

    <template #chat>
      <ChatWindow :messages="initialMessages" />
    </template>

    <template #panel>
      <RightPanel />
    </template>
  </AppLayout>
</template>
