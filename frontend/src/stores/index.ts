import { ref } from 'vue'
import { createGlobalState, useStorage } from '@vueuse/core'
type AppTheme = 'light' | 'dark' | 'auto'

export const indexStore = createGlobalState(() => {
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

  const isLogin = ref(false)

  return {
    appTheme,
    snackbar,
    showMsg,
    isLogin
  }
})
