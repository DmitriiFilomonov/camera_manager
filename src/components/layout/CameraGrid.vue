<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'
import { useDevicesStore } from '@/stores/useDevicesStore'

const props = defineProps({
  deviceId: {
    type: Number,
    required: true
  }
})

const appStore = useAppStore()
const devicesStore = useDevicesStore()

const device = computed(() => devicesStore.devices[props.deviceId])
const cameraCount = computed(() => device.value?.channels || 0)

const cameraNumbers = computed(() => {
  return Array.from({ length: cameraCount.value }, (_, i) => i + 1)
})

const isDeviceSelected = computed(() => {
  return devicesStore.isDeviceSelected(props.deviceId, appStore.isOnlineMode)
})

const isCameraSelected = (cameraNumber) => {
  const selectedCameras = devicesStore.getSelectedCameras(
      props.deviceId,
      appStore.isOnlineMode
  )
  return selectedCameras.includes(cameraNumber)
}
const toggleCamera = (cameraNumber) => {
  if (isDeviceSelected.value) {
    devicesStore.toggleCameraSelection(
        props.deviceId,
        cameraNumber,
        appStore.isOnlineMode
    )
  }
}
</script>

<template>
  <div class="camera-grid">
    <div class="cameras-title">Камеры устройства</div>
    <div class="cameras-container">
      <button
          v-for="cameraNumber in cameraNumbers"
          :key="cameraNumber"
          class="camera-button"
          :class="{ active: isCameraSelected(cameraNumber) }"
          :disabled="!isDeviceSelected"
          @click="toggleCamera(cameraNumber)"
      >
        Камера {{ cameraNumber }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.camera-grid {
  width: 100%;
}

.cameras-title {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.cameras-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.camera-button {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  color: #333;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.camera-button:hover:not(:disabled) {
  border-color: #1976d2;
  color: #1976d2;
}

.camera-button.active {
  background: #1976d2;
  border-color: #1976d2;
  color: white;
}

.camera-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

@media (max-width: 400px) {
  .cameras-container {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>