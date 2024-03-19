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

  const confirmDialog = ref({
    title: '',
    content: '',
    color: '',
    show: false,
    resolve: (value: unknown) => {},
    reject: (value: unknown) => {}
  })

  const openConfirmDialog = (title: string, content: string, color = 'warning') => {
    confirmDialog.value.title = title
    confirmDialog.value.content = content
    confirmDialog.value.color = color
    confirmDialog.value.show = true
    return new Promise((resolve, reject) => {
      confirmDialog.value.resolve = resolve
      confirmDialog.value.reject = reject
    })
  }

  return {
    appTheme,
    snackbar,
    showMsg,
    isLogin,
    confirmDialog,
    openConfirmDialog
  }
})
