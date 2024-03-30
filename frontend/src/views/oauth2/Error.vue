<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouteQuery } from '@vueuse/router'
import router from '@/router'
import { indexStore } from '@/stores'

const emit = defineEmits<{
  update: [type: 'title' | 'image', arg: string]
  reset: []
}>()
const { isLogin } = indexStore()

const errMsg = useRouteQuery('msg')

onMounted(() => {
  if (!isLogin.value) {
    router.replace({
      path: '/auth/login'
    })
  }
})

onUnmounted(() => emit('reset'))
</script>

<template>
  <v-card variant="tonal" color="red">
    <v-card-title>呜呜呜，发生错误了（；´д｀）ゞ</v-card-title>
    <v-card-text> {{ errMsg }} </v-card-text>
  </v-card>
</template>
