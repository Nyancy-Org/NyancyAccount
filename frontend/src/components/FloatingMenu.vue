<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { indexStore } from '@/stores'
import { useTheme } from 'vuetify'
import { useMediaQuery } from '@vueuse/core'
const vFab = ref()
const theme = useTheme()
const store = indexStore()
const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)')

const setAppTheme = () =>
  (theme.global.name.value =
    store.appTheme === 'dark'
      ? 'dark'
      : store.appTheme === 'light'
        ? 'light'
        : isPreferredDark.value
          ? 'dark'
          : 'light')

const btns = [
  {
    icon: 'arrow-up',
    click: () => {}
  },
  {
    icon: 'weather-sunny',
    click: () => (store.appTheme = theme.global.name.value = 'light')
  },
  {
    icon: 'weather-night',
    click: () => (store.appTheme = theme.global.name.value = 'dark')
  },
  {
    icon: 'theme-light-dark',
    click: () => {
      store.appTheme = 'auto'
      setAppTheme()
    }
  }
]

watch(
  () => isPreferredDark.value,
  () => setAppTheme()
)

onMounted(() => {
  setAppTheme()
})
</script>

<template>
  <div style="position: fixed; right: 50px; bottom: 50px">
    <v-btn ref="vFab" size="large" color="primary" icon="mdi-cat" variant="tonal"></v-btn>
    <v-speed-dial :activator="vFab" location="top center" transition="slide-y-reverse-transition">
      <v-btn
        v-for="(item, i) in btns"
        :key="i"
        :icon="'mdi-' + item.icon"
        @click="item.click"
      ></v-btn>
    </v-speed-dial>
  </div>
</template>
