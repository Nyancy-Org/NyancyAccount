<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { indexStore } from '@/stores'
import { useTheme } from 'vuetify'
import { usePreferredDark } from '@vueuse/core'
import router from '@/router'
const vFab = ref()
const theme = useTheme()
const { appTheme, progressLinear } = indexStore()
const isPreferredDark = usePreferredDark()

const setAppTheme = () =>
  (theme.global.name.value =
    appTheme.value === 'dark'
      ? 'dark'
      : appTheme.value === 'light'
        ? 'light'
        : isPreferredDark.value
          ? 'dark'
          : 'light')

const btns = [
  {
    icon: 'arrow-up',
    click: () => window.scrollTo(0, 0)
  },
  {
    icon: 'home-outline',
    click: () => router.replace('/')
  },
  {
    icon: 'weather-sunny',
    click: () => (appTheme.value = theme.global.name.value = 'light')
  },
  {
    icon: 'weather-night',
    click: () => (appTheme.value = theme.global.name.value = 'dark')
  },
  {
    icon: 'theme-light-dark',
    click: () => {
      appTheme.value = 'auto'
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
  <div style="position: fixed; right: 30px; bottom: 50px">
    <v-btn
      ref="vFab"
      size="large"
      color="primary"
      icon="mdi-cat"
      variant="tonal"
      aria-label="浮动菜单"
      :loading="progressLinear > 0"
    ></v-btn>
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
