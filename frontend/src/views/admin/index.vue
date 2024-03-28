<script lang="ts" setup>
import { ref } from 'vue'
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
</script>

<template>
  <v-app-bar :elevation="1" title="NYANCY ACCOUNT">
    <template #prepend>
      <v-app-bar-nav-icon @click="rail = !rail"></v-app-bar-nav-icon>
    </template>
  </v-app-bar>

  <v-navigation-drawer :rail="rail">
    <Menu />
  </v-navigation-drawer>
  <RouterView v-slot="{ Component }">
    <v-slide-x-transition leave-absolute>
      <component :is="Component" @update="update" @reset="reset" />
    </v-slide-x-transition>
  </RouterView>
</template>
