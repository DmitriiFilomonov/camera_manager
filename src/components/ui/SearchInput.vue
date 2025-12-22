<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'

const appStore = useAppStore()

const searchQuery = computed({
  get: () => appStore.searchQuery,
  set: (value) => {
    appStore.searchQuery = value
  }
})
</script>

<template>
  <div class="search-container">
    <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск устройств..."
        class="search-input"
    />
    <div class="search-icon">
      🔍
    </div>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  margin: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
</style>