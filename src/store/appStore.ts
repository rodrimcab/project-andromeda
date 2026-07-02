import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AppView = 'chat' | 'missions'

export const useAppStore = defineStore('app', () => {
  const activeView = ref<AppView>('chat')

  function setActiveView(view: AppView) {
    activeView.value = view
  }

  return {
    activeView,
    setActiveView,
  }
})
