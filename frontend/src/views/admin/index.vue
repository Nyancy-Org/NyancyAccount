<script lang="ts" setup>
import { ref } from 'vue'
import { indexStore } from '@/stores'
import { useAuth } from '@/hooks/useAuth'
import Menu from '@/components/admin/Menu.vue'

const option = ref({
  title: '',
  image: ''
})

const update = (type: keyof typeof option.value, arg: string) => (option.value[type] = arg)

const reset = () =>
  (option.value = {
    title: '',
    image: ''
  })

const rail = ref(false)
const { openConfirmDialog } = indexStore()
const { logout } = useAuth()
const btnLoading = ref(false)
const toLogout = async () => {
  try {
    await openConfirmDialog('警告', '你真的要登出吗？', 'warning')
    btnLoading.value = true
    await logout()
  } catch (err: any) {
    console.error(err)
  } finally {
    btnLoading.value = false
  }
}
</script>

<template>
  <v-app-bar :elevation="1" title="NYANCY ACCOUNT">
    <template #prepend>
      <v-app-bar-nav-icon @click="rail = !rail"></v-app-bar-nav-icon>
    </template>
  </v-app-bar>

  <v-navigation-drawer :rail="rail">
    <Menu />
    <template v-slot:append>
      <v-divider></v-divider>
      <div class="pa-2">
        <v-btn
          block
          color="red"
          prepend-icon="mdi-logout"
          variant="tonal"
          @click="toLogout"
          :loading="btnLoading"
        >
          退出登录
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
  <RouterView v-slot="{ Component }">
    <v-fade-transition leave-absolute>
      <component :is="Component" @update="update" @reset="reset" />
    </v-fade-transition>
  </RouterView>
</template>
