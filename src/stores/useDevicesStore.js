import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDevicesStore = defineStore('devices', () => {
    const devices = ref({})
    const groups = ref([])
    const ungroupedDeviceIds = ref([]) // ID устройств без групп
    const onlineSelectedDevices = ref({}) // { deviceId: { cameras: [1,2,3] } }
    const archiveSelectedDevices = ref({}) // { deviceId: { cameras: [1,2,3] } }
    const getSelectedDevices = (isOnlineMode) => {
        return isOnlineMode ? onlineSelectedDevices.value : archiveSelectedDevices.value
    }
    const getSelectedDeviceIds = (isOnlineMode) => {
        const selectedDevices = getSelectedDevices(isOnlineMode)
        return Object.keys(selectedDevices).map(id => parseInt(id))
    }
    const archiveSelectedDeviceId = computed(() => {
        const ids = Object.keys(archiveSelectedDevices.value)
        return ids.length > 0 ? parseInt(ids[0]) : null
    })
    const isDeviceSelected = (deviceId, isOnlineMode) => {
        const selectedIds = getSelectedDeviceIds(isOnlineMode)
        return selectedIds.includes(deviceId)
    }
    const getSelectedCameras = (deviceId, isOnlineMode) => {
        const selectedDevices = getSelectedDevices(isOnlineMode)
        return selectedDevices[deviceId]?.cameras || []
    }
    const getDevicesForMap = computed(() => {
        return []
    })
    const setDevicesData = (newDevices, newGroups) => {
        devices.value = newDevices
        groups.value = newGroups
        const allDeviceIds = new Set(Object.keys(newDevices).map(Number))
        const groupedDeviceIds = new Set(newGroups.flatMap(g => g.deviceIds))
        ungroupedDeviceIds.value = Array.from(allDeviceIds).filter(id => !groupedDeviceIds.has(id))
    }
    const toggleDeviceSelection = (deviceId, isOnlineMode) => {
        if (!isOnlineMode) {
            if (archiveSelectedDeviceId.value === deviceId) {
                delete archiveSelectedDevices.value[deviceId]
            } else {
                archiveSelectedDevices.value = {
                    [deviceId]: {
                        cameras: archiveSelectedDevices.value[archiveSelectedDeviceId.value]?.cameras || []
                    }
                }
            }
        } else {
            if (onlineSelectedDevices.value[deviceId]) {
                delete onlineSelectedDevices.value[deviceId]
            } else {
                onlineSelectedDevices.value[deviceId] = {
                    cameras: onlineSelectedDevices.value[deviceId]?.cameras || []
                }
            }
        }
    }
    const toggleCameraSelection = (deviceId, cameraNumber, isOnlineMode) => {
        const selectedDevices = getSelectedDevices(isOnlineMode)
        const deviceSelection = selectedDevices[deviceId]

        if (!deviceSelection) return

        const currentCameras = deviceSelection.cameras || []

        if (currentCameras.includes(cameraNumber)) {
            deviceSelection.cameras = currentCameras.filter(c => c !== cameraNumber)
        } else {
            deviceSelection.cameras = [...currentCameras, cameraNumber].sort((a, b) => a - b)
        }
    }

    const removeDevice = (deviceId) => {
        delete devices.value[deviceId]
        delete onlineSelectedDevices.value[deviceId]
        delete archiveSelectedDevices.value[deviceId]
        groups.value = groups.value.map(group => ({
            ...group,
            deviceIds: group.deviceIds.filter(id => id !== deviceId)
        }))
        ungroupedDeviceIds.value = ungroupedDeviceIds.value.filter(id => id !== deviceId)
    }
    const updateDevice = (deviceId, updates) => {
        if (devices.value[deviceId]) {
            devices.value[deviceId] = {
                ...devices.value[deviceId],
                ...updates
            }
        }
    }
    const clearOnlineSelection = () => {
        onlineSelectedDevices.value = {}
    }

    const clearArchiveSelection = () => {
        archiveSelectedDevices.value = {}
    }

    const getDevicesForMapByMode = (isOnlineMode) => {
        const selectedIds = getSelectedDeviceIds(isOnlineMode)

        return selectedIds.map(id => {
            const device = devices.value[id]
            if (!device) return null

            return {
                ...device,
                alarm: isOnlineMode ? device.alarm : false,
                selectedCameras: getSelectedCameras(id, isOnlineMode)
            }
        }).filter(Boolean)
    }

    return {
        devices,
        groups,
        ungroupedDeviceIds,
        onlineSelectedDevices,
        archiveSelectedDevices,

        archiveSelectedDeviceId,

        getSelectedDevices,
        getSelectedDeviceIds,
        getDevicesForMapByMode,
        isDeviceSelected,
        getSelectedCameras,

        setDevicesData,
        toggleDeviceSelection,
        toggleCameraSelection,
        removeDevice,
        updateDevice,
        clearOnlineSelection,
        clearArchiveSelection,
    }
})