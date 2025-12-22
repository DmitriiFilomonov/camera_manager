<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useAppStore } from '@/stores/useAppStore'
import { useDevicesStore } from '@/stores/useDevicesStore'
import { useMapStore } from '@/stores/useMapStore'
import { loadYandexMaps } from '@/services/yandexMaps'

const mapContainer = ref(null)
const isLoading = ref(true)
const loadError = ref(false)
const map = ref(null)
const objectManager = ref(null)

const appStore = useAppStore()
const devicesStore = useDevicesStore()
const mapStore = useMapStore()
const devicesForMap = computed(() => {
  return devicesStore.getDevicesForMapByMode(appStore.isOnlineMode)
})

const initMap = async () => {
  try {
    isLoading.value = true
    loadError.value = false
    await loadYandexMaps()
    await new Promise(resolve => setTimeout(resolve, 100))
    if (!mapContainer.value) return
    const { ymaps } = window
    map.value = new ymaps.Map(mapContainer.value, {
      center: [55.751244, 37.618423], // Москва по умолчанию
      zoom: 10,
      controls: ['zoomControl', 'fullscreenControl']
    })
    objectManager.value = new ymaps.ObjectManager({
      clusterize: false,
      gridSize: 64,
      clusterDisableClickZoom: true
    })
    objectManager.value.objects.options.set({
      iconLayout: 'default#image',
      iconImageSize: [32, 32],
      iconImageOffset: [-16, -32],
      balloonOffset: [0, -20],
      balloonCloseButton: true,
      hideIconOnBalloonOpen: false
    })
    objectManager.value.objects.options.set('preset', 'islands#circleIcon')
    map.value.geoObjects.add(objectManager.value)
    mapStore.setMapInstance(map.value)
    mapStore.setObjectManager(objectManager.value)
    updateMapMarkers()

    isLoading.value = false

  } catch (error) {
    console.error('Error loading Yandex Maps:', error)
    isLoading.value = false
    loadError.value = true
  }
}

const updateMapMarkers = () => {
  if (!objectManager.value) return
  objectManager.value.removeAll()
  if (devicesForMap.value.length === 0) return
  const features = devicesForMap.value.map(device => ({
    type: 'Feature',
    id: device.id,
    geometry: {
      type: 'Point',
      coordinates: [device.lon, device.lat]
    },
    properties: {
      balloonContent: getBalloonContent(device),
      hintContent: device.name,
      // Цвет метки: красный для тревоги в онлайн режиме, синий в остальных случаях
      iconColor: device.alarm && appStore.isOnlineMode ? '#ff4444' : '#1976d2'
    }
  }))
  objectManager.value.add(features)
  mapStore.fitToDevices(devicesForMap.value)
}

const getBalloonContent = (device) => {
  return `
    <div class="map-balloon">
      <div class="balloon-header">
        <strong>${device.name}</strong>
        ${device.alarm && appStore.isOnlineMode ? '<span class="alarm-badge">ТРЕВОГА</span>' : ''}
      </div>
      <div class="balloon-content">
        <div><strong>ID:</strong> ${device.id}</div>
        <div><strong>Каналов:</strong> ${device.channels}</div>
        <div><strong>Время:</strong> ${device.timestamp}</div>
        <div><strong>Координаты:</strong> ${device.lat.toFixed(6)}, ${device.lon.toFixed(6)}</div>
        ${device.selectedCameras.length > 0 ?
      `<div><strong>Выбранные камеры:</strong> ${device.selectedCameras.join(', ')}</div>` :
      ''
  }
      </div>
    </div>
  `
}


watch(
    () => devicesForMap.value,
    (newDevices, oldDevices) => {
      // Сравниваем по ID, чтобы не обновлять при одинаковых устройствах
      const oldIds = oldDevices?.map(d => d.id) || []
      const newIds = newDevices.map(d => d.id)

      if (JSON.stringify(oldIds.sort()) !== JSON.stringify(newIds.sort())) {
        updateMapMarkers()
      }
    },
    { deep: true }
)
watch(
    () => appStore.mode,
    () => {
      updateMapMarkers()
    }
)
onMounted(() => {
  initMap()
})
onUnmounted(() => {
  if (map.value) {
    map.value.destroy()
  }
})
</script>

<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>

    <div v-if="isLoading" class="loading-indicator">
      Загрузка карты...
    </div>

    <div v-if="loadError" class="error-message">
      Ошибка загрузки Яндекс.Карт. Проверьте API ключ.
    </div>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 20px 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.error-message {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffebee;
  color: #d32f2f;
  padding: 20px 30px;
  border-radius: 8px;
  border: 1px solid #ffcdd2;
  text-align: center;
  max-width: 80%;
  z-index: 1000;
}
</style>

<style>
.map-balloon {
  padding: 10px;
  max-width: 300px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.balloon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.balloon-header strong {
  font-size: 16px;
  color: #333;
}

.alarm-badge {
  background: #ff4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  animation: pulse 1s infinite;
}

.balloon-content {
  font-size: 14px;
  color: #555;
}

.balloon-content div {
  margin-bottom: 6px;
}

.balloon-content strong {
  color: #333;
  margin-right: 5px;
}
.ymaps-2-1-79-placemark-overlay {
  cursor: pointer !important;
}
.ymaps-2-1-79-balloon__content {
  padding: 0 !important;
  margin: 0 !important;
}
.ymaps-2-1-79-balloon {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-radius: 8px !important;
}
</style>