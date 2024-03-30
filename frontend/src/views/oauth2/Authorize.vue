<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouteHash, useRouteQuery } from '@vueuse/router'
import router from '@/router'
import { indexStore } from '@/stores'
import { getOAuth2AppInfoApi, getCodeApi } from '@/apis/oauth2'
import { useDisplay } from 'vuetify'

const emit = defineEmits<{
  update: [type: 'title' | 'image', arg: string]
  reset: []
}>()
const { xs } = useDisplay()
const { isLogin, showMsg } = indexStore()
const client_id = useRouteQuery('client_id')
const response_type = useRouteQuery('response_type')
const redirect_uri = useRouteQuery('redirect_uri')
const urlHash = useRouteHash()
const state2 = useRouteQuery('state')
const checked = ref(false)
const cardLoading = ref(false)
const btnLoading = ref(false)
const clientInfo = ref<{
  id: number
  createdAt: Date
  name: string
}>()

const toErr = (msg: string, img = '044.png') => {
  emit('update', 'image', img)
  router.replace({
    path: '/oauth2/error',
    query: { msg }
  })
}

const checkQuery = () => {
  if (!isLogin.value) {
    const thisUrl = encodeURIComponent(window.location.href)
    router.replace({
      path: '/auth/login',
      query: { redirect: thisUrl }
    })
  }
  if (!client_id.value) return toErr('无效的客户端 ID')
  if (response_type.value !== 'code') return toErr('不支持的响应类型')
  if (!redirect_uri.value) return toErr('无效的重定向 Url')
  checked.value = true
  init()
}

const init = async () => {
  cardLoading.value = true
  const { msg, data } = await getOAuth2AppInfoApi(client_id.value as string)
  if (data) clientInfo.value = data
  else toErr(msg)

  cardLoading.value = false
}

const authorize = async () => {
  btnLoading.value = true
  const _ru = (redirect_uri.value as string) ?? ''
  const _uh = (urlHash.value as string) ?? ''
  const rU = encodeURIComponent(_ru + _uh)
  try {
    const { data } = await getCodeApi(client_id.value as string, state2.value as string, rU)
    const { code, state } = data
    if (state !== state2.value) {
      btnLoading.value = false
      return showMsg('state 不匹配，可能遭受到了攻击', 'red')
    }
    emit('update', 'image', '086.png')
    emit('update', 'title', '授权成功，正在重定向...')
    setTimeout(() => {
      window.location.href = _ru + _uh + '?code=' + code + '&state=' + state
    }, 2000)
  } finally {
    btnLoading.value = false
  }
}

onMounted(() => {
  checkQuery()
})

onUnmounted(() => emit('reset'))
</script>

<template>
  <v-card :disabled="!checked" variant="flat" class="brightness" :loading="cardLoading">
    <v-card-text class="pb-0">
      <p class="text-body-1">第三方应用 {{ clientInfo?.name }} 正在向您请求获取权限</p>
      <v-card color="primary" variant="tonal" class="my-4">
        <v-card-title class="text-body-1"> 应用信息 </v-card-title>
        <v-card-text>
          <v-row v-if="!xs">
            <v-col cols="6" sm="12" md="6">
              <p class="text-subtitle-1 font-weight-medium">ID</p>
              <span class="text-body-2 text-medium-emphasis">{{ clientInfo?.id }}</span>
            </v-col>
            <v-col cols="6" sm="12" md="6">
              <p class="text-subtitle-1 font-weight-medium">创建时间</p>
              <span class="text-body-2 text-medium-emphasis">{{
                new Date(clientInfo?.createdAt ?? '').toLocaleString()
              }}</span>
            </v-col>
          </v-row>
          <v-list v-else density="compact" base-color="primary">
            <v-list-item title="ID" :subtitle="clientInfo?.id" prepend-icon="mdi-id-card">
            </v-list-item>
            <v-list-item
              title="创建时间"
              :subtitle="new Date(clientInfo?.createdAt ?? '').toLocaleString()"
              prepend-icon="mdi-clock-time-four-outline"
            >
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
      <v-card color="warning" variant="tonal">
        <v-card-title class="text-body-1"> 授权信息 </v-card-title>
        <v-card-text class="pb-0">
          <v-list density="compact" base-color="orange-darken-2">
            <v-list-item title="UID" prepend-icon="mdi-id-card"> </v-list-item>
            <v-list-item title="用户名" prepend-icon="mdi-account-circle-outline"> </v-list-item>
            <v-list-item title="邮箱" prepend-icon="mdi-email-outline"> </v-list-item>
            <v-list-item title="注册时间" prepend-icon="mdi-clock-time-four-outline"> </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-card-text>
    <v-card-actions class="d-flex justify-space-around">
      <v-btn to="/"> 取消 </v-btn>

      <v-btn color="primary" variant="outlined" @click="authorize" :loading="btnLoading">
        授权
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
