import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const indexStore = defineStore('indexStore', () => {
  const isDarkMode = useStorage<boolean>('isDarkMode', localStorage.isDarkMode === 'true')

  const snackbar = ref({
    show: false,
    text: '',
    timeout: 2000,
    color: '',
    location: 'top center'
  })

  const showMsg = (msg: string, color = '', location = 'top center', timeout = 2000) => {
    snackbar.value = {
      show: true,
      text: msg,
      timeout,
      color,
      location
    }
  }

  return {
    isDarkMode,
    snackbar,
    showMsg
  }
})
