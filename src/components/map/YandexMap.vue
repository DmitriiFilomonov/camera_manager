<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'
import { useDevicesStore } from '@/stores/useDevicesStore'
import { loadYandexMaps } from '@/services/yandexMaps'

let mapContainer
let mapInstance
const isLoading = ref(true)
const loadError = ref(false)
const appStore = useAppStore()
const devicesStore = useDevicesStore()
const activePlacemarkIds = ref(new Set())
const devicesForMap = computed(() => {
  return devicesStore.getDevicesForMapByMode(appStore.isOnlineMode)
})
const initializeMap = async () => {
  isLoading.value = true
  loadError.value = false
  const ymaps = await loadYandexMaps()
  if (!ymaps) {
    loadError.value = true
    isLoading.value = false
    return
  }
  mapInstance = new ymaps.Map(mapContainer, {
    center: [55.751244, 37.618423],
    zoom: 5,
    controls: ['zoomControl']
  })

  checkAndSyncPlacemarks()
  isLoading.value = false
}

const checkAndSyncPlacemarks = () => {
  const currentDeviceIds = new Set(devicesForMap.value.map(d => d.id))

  activePlacemarkIds.value.forEach(placemarkId => {
    if (!currentDeviceIds.has(placemarkId)) {
      removePlacemark(placemarkId)
      centerMap()
    }
  })

  devicesForMap.value.forEach(device => {
    if (!activePlacemarkIds.value.has(device.id)) {
      addPlacemark(device)
      centerMap()
    }
  })
}

const addPlacemark = (device) => {
  const placemark = new window.ymaps.Placemark(
      [device.lat, device.lon],
      {
        balloonContent: `
        <div style="padding: 10px; max-width: 250px;">
          <div style="font-weight: bold; margin-bottom: 5px;">${device.name}</div>
          <div><strong>ID:</strong> ${device.id}</div>
          <div><strong>Каналы:</strong> ${device.channels}</div>
          <div><strong>Время:</strong> ${device.timestamp}</div>
          <div><strong>Координаты:</strong> ${device.lat.toFixed(6)}, ${device.lon.toFixed(6)}</div>
          <div><strong>WiFi:</strong> ${device.wifi}/5</div>
          ${device.alarm ? '<div style="color: #ff0000; font-weight: bold;">ТРЕВОГА</div>' : ''}
        </div>
      `,
        hintContent: device.name
      }
  )

  mapInstance.geoObjects.add(placemark)
  activePlacemarkIds.value.add(device.id)

  savePlacemarkState(device.id, true)
}

const removePlacemark = (deviceId) => {
  if (!mapInstance) return

  const geoObjects = mapInstance.geoObjects
  const objectsToRemove = []

  geoObjects.each((geoObject) => {
    if (geoObject.properties && geoObject.properties.get) {
      const balloonContent = geoObject.properties.get('balloonContent')
      if (balloonContent && balloonContent.includes(`ID:</strong> ${deviceId}`)) {
        objectsToRemove.push(geoObject)
      }
    }
  })

  objectsToRemove.forEach(obj => {
    geoObjects.remove(obj)
  })

  activePlacemarkIds.value.delete(deviceId)
  savePlacemarkState(deviceId, false)
}
const savePlacemarkState = (deviceId, isActive) => {
  const storageKey = `placemark_${deviceId}`
  if (isActive) {
    localStorage.setItem(storageKey, 'true')
  } else {
    localStorage.removeItem(storageKey)
  }
}

const centerMap = () => {
  if (!mapInstance || activePlacemarkIds.value.size === 0) return

  const geoObjects = mapInstance.geoObjects
  const coordinates = []

  geoObjects.each((geoObject) => {
    if (geoObject.geometry && geoObject.geometry.getCoordinates) {
      const coords = geoObject.geometry.getCoordinates()
      if (coords && coords.length === 2) {
        coordinates.push(coords)
      }
    }
  })

  if (coordinates.length === 0) return

  if (coordinates.length === 1) {
    mapInstance.setCenter(coordinates[0], 12)
  } else {
    const lats = coordinates.map(c => c[0])
    const lons = coordinates.map(c => c[1])

    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)

    const centerLat = (minLat + maxLat) / 2
    const centerLon = (minLon + maxLon) / 2

    const latDiff = maxLat - minLat
    const lonDiff = maxLon - minLon
    const maxDiff = Math.max(latDiff, lonDiff)

    let zoom = 12
    if (maxDiff > 10) zoom = 5
    else if (maxDiff > 5) zoom = 6
    else if (maxDiff > 2) zoom = 8
    else if (maxDiff > 1) zoom = 9
    else if (maxDiff > 0.5) zoom = 10
    else if (maxDiff > 0.2) zoom = 11

    mapInstance.setCenter([centerLat, centerLon], zoom)
  }
}

watch(
    devicesForMap,
    () => {
      nextTick(() => {
        if (mapInstance) {
          checkAndSyncPlacemarks()
        }
      })
    },
    { deep: true }
)

watch(
    () => appStore.mode,
    () => {
      nextTick(() => {
        if (mapInstance) {
          checkAndSyncPlacemarks()
        }
      })
    }
)

onMounted(() => {
  initializeMap()
})

onUnmounted(() => {
  if (mapInstance && mapInstance.destroy) {
    mapInstance.destroy()
  }
})
</script>

<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>
    <div v-if="isLoading" class="map-overlay loading">
      <div class="spinner"></div>
      <div class="loading-text">Загрузка карты...</div>
    </div>
    <div v-if="loadError && !isLoading" class="map-overlay error">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h3>Ошибка загрузки карты</h3>
        <p>Проверьте подключение к интернету и API ключ</p>
        <button @click="initializeMap" class="retry-button">Повторить</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.map-overlay.loading {
  background: rgba(255, 255, 255, 0.95);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.map-overlay.error {
  background: rgba(255, 255, 255, 0.98);
}

.error-content {
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.error-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.error-content h3 {
  margin: 0 0 10px 0;
  color: #d32f2f;
}

.error-content p {
  margin: 0 0 20px 0;
  color: #666;
}

.retry-button {
  background: #1976d2;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
</style>