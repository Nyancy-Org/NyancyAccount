/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify'
import router from '../router'
import { createPinia } from 'pinia'

// Types
import type { App } from 'vue'

// Stores
import { userStore } from '@/stores/user'

export async function registerPlugins(app: App) {
  app.use(vuetify).use(createPinia())
  const { getUserInfo } = userStore()
  await getUserInfo()
  app.use(router)
}
