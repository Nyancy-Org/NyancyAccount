<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { indexStore } from '@/stores'
import { useTheme } from 'vuetify'
import { usePreferredDark } from '@vueuse/core'
const vFab = ref()
const theme = useTheme()
const { appTheme } = indexStore()
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
