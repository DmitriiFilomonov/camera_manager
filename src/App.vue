<script setup>
import Sidebar from '@/components/layout/Sidebar.vue'
import YandexMap from '@/components/map/YandexMap.vue'
import { useWebSocket } from '@/composables/useWebSoket.js'

const { isConnected } = useWebSocket()
</script>

<template>
  <div class="app">
  <Sidebar class="sidebar" />

  <main class="main-content">
    <YandexMap />
  </main>

  <div v-if="!isConnected" class="connection-notification">
    <div class="notification-content">
      <span class="notification-icon">⚠️</span>
      <span>Нет подключения к серверу устройств. Данные могут быть устаревшими.</span>
    </div>
  </div>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.sidebar {
  width: 400px;
  min-width: 350px;
  max-width: 450px;
  height: 100%;
  overflow-y: auto;
  border-right: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.main-content {
  flex: 1;
  height: 100%;
  position: relative;
}
.connection-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-width: 400px;
  animation: slideIn 0.3s ease;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #856404;
}

.notification-icon {
  font-size: 16px;
}

@keyframes slideIn {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>