<script setup lang="ts">
import { onMounted, ref } from 'vue'

import ChatWindow from '@/components/chat/ChatWindow.vue'
import TypingIndicator from '@/components/chat/TypingIndicator.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import RightPanel from '@/components/layout/RightPanel.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import { useVoiceInput } from '@/composables/useVoiceInput'
import { createWelcomeMessage } from '@/models/chat/messageFactory'
import { useChatStore } from '@/store/chatStore'

const sidebarOpen = ref(false)
const panelOpen = ref(false)

const chatStore = useChatStore()
const voiceInput = useVoiceInput()

onMounted(() => {
  chatStore.initialize([createWelcomeMessage()])
})
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
      <ChatWindow
        :messages="chatStore.messages"
        :voice-state="chatStore.voiceState"
        :interim-transcript="voiceInput.liveTranscript.value"
        :voice-error="voiceInput.errorMessage.value"
        :voice-disabled="!voiceInput.isSupported.value"
        @voice-toggle="voiceInput.toggleListening()"
      >
        <template #typing>
          <TypingIndicator v-if="chatStore.voiceState === 'thinking'" />
        </template>
      </ChatWindow>
    </template>

    <template #panel>
      <RightPanel />
    </template>
  </AppLayout>
</template>
