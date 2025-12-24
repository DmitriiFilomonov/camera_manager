<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'
import { useDevicesStore } from '@/stores/useDevicesStore'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import CameraGrid from './CameraGrid.vue'

const props = defineProps({
  deviceId: {
    type: Number,
    required: true
  }
})

const appStore = useAppStore()
const devicesStore = useDevicesStore()
const device = computed(() => devicesStore.devices[props.deviceId])
const isArchiveMode = computed(() => appStore.isArchiveMode)
const isOnlineMode = computed(() => appStore.isOnlineMode)
const isSelected = computed(() =>
    devicesStore.isDeviceSelected(props.deviceId, isOnlineMode.value)
)
const archiveSelectedDeviceId = computed(() => devicesStore.archiveSelectedDeviceId)
const isCollapsed = computed(() => {
  return appStore.collapsedDevices[props.deviceId]
})

const getWifiBarStyle = (barNumber) => {
  const active = barNumber <= device.value.wifi
  if (!active) return { background: '#e0e0e0' }

  const colors = ['#ff4444', '#ff8844', '#ffcc44', '#aadd44', '#66cc44']
  return { background: colors[barNumber - 1] }
}

const toggleDeviceCollapse = () => {
  if (isSelected.value) {
    appStore.toggleDevice(props.deviceId)
  }
}

const toggleSelection = () => {
  devicesStore.toggleDeviceSelection(props.deviceId, isOnlineMode.value)

  if (!isSelected.value && !isCollapsed.value) {
    appStore.collapsedDevices[props.deviceId] = false
  }
}
</script>
<template>
  <div class="device-item" :class="{ 'in-archive-mode': isArchiveMode }">
    <div class="device-row">
      <button class="collapse-button" @click="toggleDeviceCollapse">
        <span class="arrow" :class="{ rotated: !isCollapsed }">▶</span>
      </button>
      <input
          type="checkbox"
          :checked="isSelected"
          :disabled="isArchiveMode && archiveSelectedDeviceId !== null && archiveSelectedDeviceId !== device.id"
          @change="toggleSelection"
          class="device-checkbox"
      />
      <div class="device-icon" v-if="!isArchiveMode">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15C15 3.9 14.1 3 13 3H11C9.9 3 9 3.9 9 5H6.5C5.84 5 5.29 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5C5 13.67 5.67 13 6.5 13C7.33 13 8 13.67 8 14.5C8 15.33 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5C16 13.67 16.67 13 17.5 13C18.33 13 19 13.67 19 14.5C19 15.33 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="#666"/>
        </svg>
      </div>
      <div class="device-info">
        <div class="device-name">{{ device.name }}</div>
        <div class="device-id">ID: {{ device.id }}</div>
      </div>
      <div class="alarm-icon" v-if="!isArchiveMode && device.alarm">
        <div class="alarm-triangle pulse"></div>
      </div>
      <div class="wifi-status" v-if="!isArchiveMode">
        <div class="wifi-bars">
          <div v-for="n in 5"
               :key="n"
               class="wifi-bar"
               :class="{ active: n <= device.wifi }"
               :style="getWifiBarStyle(n)">
          </div>
        </div>
      </div>
      <DropdownMenu :device-id="device.id" />
    </div>
    <div v-if="!isCollapsed && isSelected" class="device-cameras">
      <CameraGrid :device-id="device.id" />
    </div>
  </div>
</template>

<style scoped>
.device-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 8px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.device-item:hover {
  border-color: #c0c0c0;
}

.device-row {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 8px;
}

.collapse-button {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

.collapse-button:hover {
  opacity: 1;
}

.collapse-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.arrow {
  font-size: 10px;
  transition: transform 0.2s ease;
  color: #666;
}

.arrow.rotated {
  transform: rotate(90deg);
}

.device-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.device-checkbox:disabled {
  cursor: not-allowed;
}

.device-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.device-info {
  flex: 1;
  min-width: 0;
}

.device-name {
  font-weight: 500;
  color: #000000;
  overflow: hidden;
  text-overflow: ellipsis;
}

.device-id {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.wifi-status {
  margin-left: auto;
  padding: 0 8px;
}

.wifi-bars {
  display: flex;
  align-items: flex-end;
  height: 24px;
  gap: 2px;
}

.wifi-bar {
  width: 4px;
  border-radius: 1px;
  transition: background-color 0.3s ease;
}

.wifi-bar:nth-child(1) { height: 6px; }
.wifi-bar:nth-child(2) { height: 9px; }
.wifi-bar:nth-child(3) { height: 12px; }
.wifi-bar:nth-child(4) { height: 15px; }
.wifi-bar:nth-child(5) { height: 18px; }

.alarm-icon {
  margin-left: 4px;
}

.alarm-triangle {
  width: 20px;
  height: 20px;
  background: #ff4444;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  position: relative;
}

.alarm-triangle::after {
  content: '!';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 12px;
}
.device-cameras {
  padding: 12px;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
}
</style>