<script setup>
import { ref } from 'vue'
import { useAppStore } from '@/stores/useAppStore'
import { useDevicesStore } from '@/stores/useDevicesStore'

const props = defineProps({
  deviceId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete'])

const appStore = useAppStore()
const devicesStore = useDevicesStore()
const isOpen = ref(false)

const toggle = () => {
  if (isOpen.value) {
    close()
  } else {
    isOpen.value = true
    appStore.openMenu(props.deviceId)
  }
}

const close = () => {
  isOpen.value = false
  appStore.closeMenu()
}

const edit = () => {
  alert(`Редактировать ID: ${props.deviceId}`)
  emit('edit', props.deviceId)
  close()
}

const remove = () => {
  if (confirm(`Удалить устройство ${props.deviceId}?`)) {
    devicesStore.removeDevice(props.deviceId)
    emit('delete', props.deviceId)
  }
  close()
}

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!el.contains(event.target)) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<template>
  <div class="dropdown-container" v-click-outside="close">
    <button class="menu-button" @click="toggle">
      ⋮
    </button>

    <div v-if="isOpen" class="dropdown-menu">
      <button class="menu-item" @click="edit">
        Редактировать
      </button>
      <button class="menu-item delete" @click="remove">
        Удалить
      </button>
    </div>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: relative;
  display: inline-block;
}

.menu-button {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-button:hover {
  background: #f0f0f0;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 150px;
  z-index: 1000;
  margin-top: 4px;
}

.menu-item {
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background: #f5f5f5;
}

.menu-item.delete {
  color: #d32f2f;
}

.menu-item.delete:hover {
  background: #ffebee;
}
</style>