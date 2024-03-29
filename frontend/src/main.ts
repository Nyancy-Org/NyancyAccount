import { createApp } from 'vue'
import { registerPlugins } from '@/plugins'
import '@/styles/shit.scss'
import App from './App.vue'

const app = createApp(App)

;(async function () {
  try {
    await registerPlugins(app)
  } catch (err) {
    console.error(err)
  } finally {
    app.mount('#app')
    ;(window as any).removePageLoading()
  }
})()
