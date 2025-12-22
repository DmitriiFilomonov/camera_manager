import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
    const mapInstance = ref(null)
    const objectManager = ref(null)
    const center = ref([55.751244, 37.618423]) // Москва
    const zoom = ref(10)
    const bounds = ref(null)
    const setMapInstance = (instance) => {
        mapInstance.value = instance
    }
    const setObjectManager = (manager) => {
        objectManager.value = manager
    }
    const setBounds = (newBounds) => {
        bounds.value = newBounds
    }
    const fitToDevices = (devices) => {
        if (!mapInstance.value || !devices.length) return
        if (devices.length === 1) {
            const device = devices[0]
            center.value = [device.lat, device.lon]
            zoom.value = 15
            if (mapInstance.value) {
                mapInstance.value.setCenter([device.lat, device.lon], 15)
            }
        } else {
            const latitudes = devices.map(d => d.lat)
            const longitudes = devices.map(d => d.lon)
            const minLat = Math.min(...latitudes)
            const maxLat = Math.max(...latitudes)
            const minLon = Math.min(...longitudes)
            const maxLon = Math.max(...longitudes)
            bounds.value = [[minLat, minLon], [maxLat, maxLon]]
            if (mapInstance.value) {
                mapInstance.value.setBounds([[minLat, minLon], [maxLat, maxLon]], {
                    checkZoomRange: true
                })
            }
        }
    }
    const clearAllPlacemarks = () => {
        if (objectManager.value) {
            objectManager.value.removeAll()
        }
    }
    const addDevicePlacemarks = (devices) => {
        if (!objectManager.value) return
        clearAllPlacemarks()
        devices.forEach(device => {
            const isAlarm = device.alarm
            objectManager.value.add({
                type: 'Feature',
                id: device.id,
                geometry: {
                    type: 'Point',
                    coordinates: [device.lon, device.lat]
                },
                properties: {
                    hintContent: `
            <div class="map-balloon">
              <strong>${device.name}</strong><br>
              ID: ${device.id}<br>
              Каналов: ${device.channels}<br>
              Время: ${device.timestamp}<br>
              Координаты: ${device.lat.toFixed(6)}, ${device.lon.toFixed(6)}
            </div>
          `,
                    iconContent: isAlarm ? '🔴' : '🔵'
                }
            })
        })
    }
    return {

        mapInstance,
        objectManager,
        center,
        zoom,
        bounds,

        setMapInstance,
        setObjectManager,
        setBounds,
        fitToDevices,
        clearAllPlacemarks,
        addDevicePlacemarks,
    }
})