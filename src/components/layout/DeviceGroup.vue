<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore.js'
import DeviceItem from './DeviceItem.vue'

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
})

const appStore = useAppStore()

const isCollapsed = computed(() => {
  return !appStore.collapsedGroups[props.group.id]
})

const toggleGroup = () => {
  appStore.toggleGroup(props.group.id)
}
</script>

<template>
  <div class="device-group">
    <div class="group-header" @click="toggleGroup">
      <div class="group-title">
        <span class="arrow" :class="{ rotated: !isCollapsed }">▶</span>
        {{ group.name }}
        <span class="device-count">({{ group.deviceIds.length }})</span>
      </div>
    </div>
    <div v-if="!isCollapsed" class="group-devices">
      <DeviceItem
          v-for="deviceId in group.deviceIds"
          :key="deviceId"
          :device-id="deviceId"
      />
    </div>
  </div>
</template>

<style scoped>
.device-group {
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  overflow: hidden;
}

.group-header {
  padding: 12px 16px;
  background: #f8f9fa;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #e0e0e0;
  transition: background-color 0.2s ease;
}

.group-header:hover {
  background: #f0f0f0;
}

.group-title {
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.arrow {
  font-size: 12px;
  transition: transform 0.2s ease;
  color: #666;
}

.arrow.rotated {
  transform: rotate(90deg);
}

.device-count {
  font-size: 12px;
  color: #666;
  font-weight: normal;
}

.group-devices {
  padding: 8px;
}
</style>