<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'

const appStore = useAppStore()

const isOnlineMode = computed(() => appStore.isOnlineMode)
const isArchiveMode = computed(() => appStore.isArchiveMode)

const switchToOnline = () => {
  if (!isOnlineMode.value) {
    appStore.toggleMode()
  }
}

const switchToArchive = () => {
  if (!isArchiveMode.value) {
    appStore.toggleMode()
  }
}
</script>

<template>
  <div class="mode-switcher">
    <button
        class="mode-button"
        :class="{ active: isOnlineMode }"
        @click="switchToOnline"
    >
      Онлайн-режим
    </button>
    <button
        class="mode-button"
        :class="{ active: isArchiveMode }"
        @click="switchToArchive"
    >
      Архивный режим
    </button>
  </div>
</template>

<style scoped>
.mode-switcher {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 16px;
}

.mode-button {
  flex: 1;
  padding: 8px 16px;
  border: none;
  background: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.mode-button:hover {
  background: #f0f0f0;
}

.mode-button.active {
  background: #1976d2;
  color: white;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}
</style>