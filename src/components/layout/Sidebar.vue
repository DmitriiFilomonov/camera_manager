<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'
import { useDevicesStore } from '@/stores/useDevicesStore'
import ModeSwitcher from '@/components/ui/ModeSwitcher.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import DeviceGroup from '@/components/layout/DeviceGroup.vue'
import DeviceItem from '@/components/layout/DeviceItem.vue'

const appStore = useAppStore()
const devicesStore = useDevicesStore()
const filteredGroups = computed(() => {
  const query = appStore.searchQuery.toLowerCase()

  if (!query) return devicesStore.groups

  return devicesStore.groups.map(group => ({
    ...group,
    deviceIds: group.deviceIds.filter(deviceId => {
      const device = devicesStore.devices[deviceId]
      return device && (
          device.name.toLowerCase().includes(query) ||
          device.id.toString().includes(query)
      )
    })
  })).filter(group => group.deviceIds.length > 0)
})

const filteredUngroupedDevices = computed(() => {
  const query = appStore.searchQuery.toLowerCase()

  if (!query) return devicesStore.ungroupedDeviceIds

  return devicesStore.ungroupedDeviceIds.filter(deviceId => {
    const device = devicesStore.devices[deviceId]
    return device && (
        device.name.toLowerCase().includes(query) ||
        device.id.toString().includes(query)
    )
  })
})
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h2>Управление устройствами</h2>
      <ModeSwitcher />
    </div>

    <SearchInput />

    <div class="devices-list">
      <DeviceGroup
          v-for="group in filteredGroups"
          :key="group.id"
          :group="group"
      />

      <div v-if="filteredUngroupedDevices.length > 0" class="ungrouped-section">
        <h3 class="ungrouped-title">Устройства без группы</h3>
        <DeviceItem
            v-for="deviceId in filteredUngroupedDevices"
            :key="deviceId"
            :device-id="deviceId"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 16px 16px 0;
}

.sidebar-header h2 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.devices-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.ungrouped-section {
  margin-top: 24px;
}

.ungrouped-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}
</style>