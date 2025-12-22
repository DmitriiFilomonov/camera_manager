import {defineStore} from "pinia";
import {ref, computed} from "vue";

export const useAppStore
    = defineStore('app', () => {
        const mode = ref('online')
        const collapsedGroups = ref(({}))
        const collapsedDevices = ref({})
        const activeMenuDeviceId = ref(null)
        const searchQuery = ref('')
        const isOnlineMode = computed(() => mode.value === 'online')
        const isArchiveMode = computed(() => mode.value === 'archive')
        const toggleMode = () => {
            mode.value = mode.value === 'online' ? 'archive' : 'online'
        }
        const toggleGroup = (groupId) => {
            collapsedGroups.value[groupId] = !collapsedGroups.value[groupId]
        }
        const toggleDevice = (deviceId) => {
            collapsedDevices.value[deviceId] = !collapsedDevices.value[deviceId]
        }
        const openMenu = (deviceId) => {
            activeMenuDeviceId.value = deviceId
        }
        const closeMenu = () => {
            activeMenuDeviceId.value = null
        }
        return {

            mode,
            collapsedGroups,
            collapsedDevices,
            activeMenuDeviceId,
            searchQuery,

            isOnlineMode,
            isArchiveMode,

            toggleMode,
            toggleGroup,
            toggleDevice,
            openMenu,
            closeMenu,
        }
    })