<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import md5 from 'md5'
import { useDisplay } from 'vuetify'
import { indexStore } from '@/stores'
import { userStore } from '@/stores/user'
import { useAuth } from '@/hooks/useAuth'

const { xs } = useDisplay()

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

const menus = [
  { name: '个人信息', icon: 'account-circle-outline', path: 'info' },
  { name: '账号安全', icon: 'shield-key-outline', path: 'security' },
  { name: 'OAuth2 应用', icon: 'apps', path: 'apps' }
]

const { info } = storeToRefs(userStore())
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
  <v-row class="h-100" justify="center" align="center" no-gutters>
    <v-col xl="6" md="8" sm="10" xs="12" align-self="center">
      <v-card v-if="xs" class="mb-5" variant="text">
        <v-card-actions class="d-flex flex-wrap justify-space-between ga-4">
          <v-btn color="primary" variant="text" prepend-icon="mdi-arrow-left" to="/"
            >返回首页</v-btn
          >
          <v-btn
            color="red"
            variant="text"
            append-icon="mdi-arrow-right"
            @click="logout"
            :loading="btnLoading"
            >退出登录</v-btn
          >
        </v-card-actions>
      </v-card>
      <v-row>
        <v-col lg="3" md="4" sm="4" cols="12">
          <v-card
            variant="flat"
            :class="!xs && 'brightness'"
            :style="{ background: xs ? 'unset' : 'rgb(var(--v-theme-surface))' }"
          >
            <v-card-text class="text-center">
              <v-avatar
                :image="`https://cdn.imlazy.ink:233/avatar/${md5(info?.email || '')}?s=300&r=R&d=`"
                :size="xs ? '100' : '80%'"
              ></v-avatar>
              <p class="mt-4 my-3 text-h5">{{ info?.username }}</p>
              <div v-if="!xs" class="d-flex flex-wrap justify-center ga-4">
                <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-left" block to="/"
                  >返回首页</v-btn
                >
                <v-btn
                  color="red"
                  variant="tonal"
                  prepend-icon="mdi-logout"
                  block
                  @click="toLogout"
                  :loading="btnLoading"
                  >退出登录</v-btn
                >
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col lg="9" md="8" sm="8" cols="12">
          <v-card variant="flat" class="mb-5 brightness">
            <v-tabs color="primary">
              <v-tab v-for="(item, i) in menus" :key="i" :to="item.path">
                <v-icon start> mdi-{{ item.icon }} </v-icon>
                {{ item.name }}
              </v-tab>
            </v-tabs>
          </v-card>
          <v-card variant="flat" class="brightness">
            <RouterView v-slot="{ Component }">
              <v-slide-x-transition leave-absolute>
                <component :is="Component" @update="update" @reset="reset" />
              </v-slide-x-transition>
            </RouterView>
          </v-card>
        </v-col>
      </v-row>

      <!-- <v-card variant="flat"> -->
      <!-- <v-btn
          v-if="$route.path === '/auth'"
          prepend-icon="mdi-arrow-left"
          color="primary"
          variant="text"
          to="/"
        >
          返回首页
        </v-btn>
        <v-btn
          v-else
          prepend-icon="mdi-arrow-left"
          color="primary"
          variant="text"
          @click="$router.back()"
        >
          上一页
        </v-btn> -->
      <!-- <v-card-title>
          <div class="text-primary">{{ option.title || $route.meta.title }}</div>
        </v-card-title>
        <v-card-text>
          
        </v-card-text> -->
      <!-- </v-card> -->
    </v-col>
  </v-row>
</template>
