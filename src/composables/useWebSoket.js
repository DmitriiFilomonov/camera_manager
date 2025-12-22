import { onMounted, onUnmounted, ref } from 'vue'
import { useDevicesStore } from '@/stores/useDevicesStore'
import { createWebSocketMock } from '@/services/websocket'

export function useWebSocket() {
    const devicesStore = useDevicesStore()
    const isConnected = ref(false)
    const ws = ref(null)

    const connect = () => {
        ws.value = createWebSocketMock()
        ws.value.on('open', () => {
            console.log('WebSocket connected')
            isConnected.value = true
        })

        ws.value.on('message', (event) => {
            try {
                const data = JSON.parse(event.data)
                handleWebSocketMessage(data)
            } catch (error) {
                console.error('Error parsing WebSocket message:', error)
            }
        })

        ws.value.on('close', () => {
            console.log('WebSocket disconnected')
            isConnected.value = false
        })
    }

    const handleWebSocketMessage = (data) => {
        if (data.type === 'INITIAL_DATA') {
            devicesStore.setDevicesData(data.payload.devices, data.payload.groups)
        }
    }

    const disconnect = () => {
        if (ws.value && ws.value.close) {
            ws.value.close()
        }
        ws.value = null
    }

    onMounted(() => {
        connect()
    })

    onUnmounted(() => {
        disconnect()
    })

    return {
        isConnected,
        connect,
        disconnect
    }
}