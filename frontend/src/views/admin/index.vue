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
const drawer = ref(true)
const { openConfirmDialog } = indexStore()
const { logout } = useAuth()
const btnLoading = ref(false)

const toggleDrawer = () => {
  rail.value = false
  drawer.value = !drawer.value
}

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
  <v-app-bar :elevation="1" class="app-bar">
    <template #prepend>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>
    </template>
    <v-app-bar-title class="app-bar-title">
      <lazy-t>NYANCY ACCOUNT</lazy-t>
    </v-app-bar-title>
    <v-spacer></v-spacer>

    <img
      title="Meow?"
      class="img-meow"
      src="https://s1.imlazy.ink:233/img/%E8%A1%A8%E6%83%85%E5%8C%85/%E7%8C%AB%E7%BE%BD%E9%9B%AB/015.png"
    />
  </v-app-bar>

  <v-navigation-drawer :rail="rail" v-model="drawer">
    <Menu @updateRail="rail = !rail" />
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

<style lang="scss">
.app-bar-title {
  div {
    overflow: unset !important;
    lazy-t {
      text-shadow: 0 0 10px #aaa;
      transition: all 0.5s;
      &:hover {
        color: transparent;
        background: linear-gradient(to right, #00ecff, #008fd4, #ff6afc);
        background-clip: text;
        -webkit-background-clip: text;
      }
    }
  }
}
</style>
