<script setup lang="ts">
import { nextTick, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [text: string]
}>()

const inputValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    submit()
  }
}

function submit() {
  const text = inputValue.value.trim()
  if (!text) {
    return
  }

  emit('submit', text)
  inputValue.value = ''
  emit('close')
}

function handleBackdropKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      inputValue.value = ''
      document.body.style.overflow = 'hidden'
      await nextTick()
      inputRef.value?.focus()
      return
    }

    document.body.style.overflow = ''
  },
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-label="Type a message"
        @keydown="handleBackdropKeydown"
      >
        <button
          type="button"
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-label="Close"
          @click="emit('close')"
        />

        <div class="glass relative z-10 w-full max-w-md rounded-2xl p-4 shadow-xl">
          <label class="mb-2 block text-sm font-medium text-gray-300" for="chat-text-input">
            Type your message
          </label>
          <input
            id="chat-text-input"
            ref="inputRef"
            v-model="inputValue"
            type="text"
            class="w-full rounded-xl border border-white/10 bg-space-900/80 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Ask about space, NASA images, missions..."
            @keydown="handleKeydown"
          />
          <p class="mt-2 text-xs text-gray-500">Press Enter to send · Esc to cancel</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
