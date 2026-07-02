<script setup lang="ts">
defineProps<{
  sidebarOpen?: boolean
  panelOpen?: boolean
}>()

defineEmits<{
  'toggle-sidebar': []
  'toggle-panel': []
  'close-sidebar': []
  'close-panel': []
}>()
</script>

<template>
  <div class="relative flex h-dvh flex-col overflow-hidden bg-space-950">
    <!-- Starfield background -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        class="absolute inset-0 bg-gradient-to-br from-space-950 via-space-900 to-[#0d1230]"
      />
      <div
        v-for="i in 60"
        :key="i"
        class="absolute rounded-full bg-white animate-star-twinkle"
        :class="i % 3 === 0 ? 'h-1 w-1' : 'h-0.5 w-0.5'"
        :style="{
          top: `${(i * 17 + 7) % 100}%`,
          left: `${(i * 23 + 11) % 100}%`,
          animationDelay: `${(i * 0.3) % 3}s`,
          opacity: 0.3 + (i % 5) * 0.1,
        }"
      />
    </div>

    <!-- Mobile header -->
    <header
      class="relative z-20 flex items-center justify-between border-b border-white/10 bg-space-900/80 px-4 py-3 backdrop-blur-xl lg:hidden"
    >
      <div class="flex items-center gap-2">
        <span class="text-lg">🌌</span>
        <span class="font-semibold text-gray-100">Project Andromeda</span>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="glass rounded-lg p-2 text-gray-400"
          aria-label="Open navigation"
          @click="$emit('toggle-sidebar')"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <button
          type="button"
          class="glass rounded-lg p-2 text-gray-400"
          aria-label="Open panel"
          @click="$emit('toggle-panel')"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </header>

    <div class="relative z-10 flex min-h-0 flex-1">
      <!-- Left sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-30 w-72 -translate-x-full overflow-hidden border-r border-white/10 bg-space-900/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:overflow-visible lg:bg-transparent"
        :class="{ 'translate-x-0': sidebarOpen }"
      >
        <slot name="sidebar" />
      </aside>

      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black/60 lg:hidden"
        @click="$emit('close-sidebar')"
      />

      <!-- Main chat -->
      <main class="flex min-w-0 flex-1 flex-col">
        <slot name="chat" />
      </main>

      <!-- Right panel -->
      <aside
        class="fixed inset-y-0 right-0 z-30 w-80 translate-x-full border-l border-white/10 bg-space-900/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-auto lg:w-80 lg:translate-x-0 lg:bg-transparent xl:w-96"
        :class="{ 'translate-x-0': panelOpen }"
      >
        <slot name="panel" />
      </aside>

      <div
        v-if="panelOpen"
        class="fixed inset-0 z-20 bg-black/60 lg:hidden"
        @click="$emit('close-panel')"
      />
    </div>
  </div>
</template>
