<script setup lang="ts">
import { onMounted, ref } from 'vue'

import ChatWindow from '@/components/chat/ChatWindow.vue'
import TypingIndicator from '@/components/chat/TypingIndicator.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import RightPanel from '@/components/layout/RightPanel.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import { useChatSubmit } from '@/composables/useChatSubmit'
import { useMissionSave } from '@/composables/useMissionSave'
import { useVoiceInput } from '@/composables/useVoiceInput'
import type { MicLanguage } from '@/composables/useMicLanguage'
import { useAppStore } from '@/store/appStore'
import { useChatStore } from '@/store/chatStore'
import { useMissionStore } from '@/store/missionStore'
import MissionArchiveView from '@/views/MissionArchiveView.vue'

const sidebarOpen = ref(false)
const panelOpen = ref(false)

const appStore = useAppStore()
const chatStore = useChatStore()
const missionStore = useMissionStore()
const voiceInput = useVoiceInput()
const missionSave = useMissionSave()
const { canSubmit, submitMessage, cancelSpeaking } = useChatSubmit()

onMounted(() => {
  chatStore.hydrate()
  missionStore.hydrate()
})

function handleNavigate() {
  sidebarOpen.value = false
}

async function handleSaveCard(card: Parameters<typeof missionSave.saveCard>[0]) {
  await missionSave.saveCard(card)
}

async function handleSubmit(text: string) {
  await submitMessage(text)
}

function handleClearChat() {
  if (chatStore.voiceState === 'listening') {
    voiceInput.abortListening()
  }

  cancelSpeaking()
  chatStore.clearChat()
}

function handleMicLanguage(language: MicLanguage) {
  voiceInput.setMicLanguage(language)
}
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
      <Sidebar @navigate="handleNavigate" @close="sidebarOpen = false" />
    </template>

    <template #chat>
      <ChatWindow
        v-if="appStore.activeView === 'chat'"
        :messages="chatStore.messages"
        :voice-state="chatStore.voiceState"
        :interim-transcript="voiceInput.liveTranscript.value"
        :voice-error="voiceInput.errorMessage.value"
        :voice-disabled="!voiceInput.isSupported.value"
        :can-submit="canSubmit"
        :mic-language="voiceInput.micLanguage.value"
        @voice-toggle="voiceInput.toggleListening()"
        @cancel-speaking="cancelSpeaking()"
        @clear-chat="handleClearChat"
        @set-mic-language="handleMicLanguage"
        @submit="handleSubmit"
        @save-card="handleSaveCard"
      >
        <template #typing>
          <TypingIndicator v-if="chatStore.voiceState === 'thinking'" />
        </template>
      </ChatWindow>

      <MissionArchiveView v-else />
    </template>

    <template #panel>
      <RightPanel @close="panelOpen = false" />
    </template>
  </AppLayout>
</template>
