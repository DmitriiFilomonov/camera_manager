import { groups, devices } from './dataMock.js'

export function createWebSocketMock() {
    const listeners = {
        open: [],
        message: [],
        close: [],
        error: []
    }

    let connected = false

    setTimeout(() => {
        connected = true
        emit('open', {})
        sendInitialData()
    }, 1000)

    function sendInitialData() {
        const initialData = {
            type: 'INITIAL_DATA',
            payload: { groups, devices }
        }

        setTimeout(() => {
            emit('message', { data: JSON.stringify(initialData) })
        }, 100)
    }

    function on(event, callback) {
        if (listeners[event]) {
            listeners[event].push(callback)
        }
    }

    function emit(event, data) {
        if (listeners[event]) {
            listeners[event].forEach(callback => callback(data))
        }
    }

    function send(data) {
        console.log('WebSocket send (mock):', data)
    }

    function close() {
        connected = false
        emit('close', {})
    }

    return {
        on,
        send,
        close
    }
}

export const wsMock = createWebSocketMock()

export const simpleWebSocket = {
    on: (event, callback) => {
        if (event === 'open') {
            setTimeout(() => callback({}), 1000)
        }
        if (event === 'message') {
            setTimeout(() => {
                callback({
                    data: JSON.stringify({
                        type: 'INITIAL_DATA',
                        payload: { groups, devices }
                    })
                })
            }, 1100)
        }
    },
    send: (data) => console.log('WS send:', data),
    close: () => console.log('WS closed')
}

