import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
type AppTheme = 'light' | 'dark' | 'auto'

export const indexStore = defineStore('indexStore', () => {
  const appTheme = useStorage<AppTheme>('AppTheme', 'auto')
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
    appTheme,
    snackbar,
    showMsg
  }
})
