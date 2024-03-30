<script lang="ts" setup>
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import { indexStore } from '@/stores'
const { progressLinear } = indexStore()

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
</script>

<template>
  <v-row class="h-100" justify="center" align="center" no-gutters>
    <v-col xl="6" md="8" sm="10" xs="12" align-self="center">
      <v-card v-if="xs" class="mb-5" variant="text">
        <v-card-actions class="d-flex flex-wrap justify-space-between ga-4">
          <v-btn color="primary" variant="text" prepend-icon="mdi-arrow-left" to="/"
            >返回首页</v-btn
          >
          <v-btn color="warning" variant="text" append-icon="mdi-arrow-right">用户中心</v-btn>
        </v-card-actions>
      </v-card>

      <v-row :no-gutters="xs">
        <v-col md="5" sm="5" cols="12">
          <v-card
            variant="flat"
            :class="!xs && 'brightness'"
            :style="{ background: xs ? 'unset' : 'rgb(var(--v-theme-surface))' }"
          >
            <v-card-text class="text-center">
              <v-avatar
                :image="`https://s1.imlazy.ink:233/img/%E8%A1%A8%E6%83%85%E5%8C%85/%E7%8C%AB%E7%BE%BD%E9%9B%AB/${option.image || $route.meta.image}`"
                :size="xs ? '55vw' : '100%'"
                rounded="0"
              ></v-avatar>
              <p class="mt-4 my-3 text-h5 text-primary">{{ option.title || $route.meta.title }}</p>
              <div v-if="!xs" class="d-flex flex-wrap justify-center ga-3">
                <v-btn color="primary" variant="tonal" prepend-icon="mdi-home-outline" block to="/"
                  >返回首页</v-btn
                >
                <v-btn
                  color="warning"
                  variant="text"
                  prepend-icon="mdi-account-circle-outline"
                  block
                  to="/user/info"
                  >用户中心</v-btn
                >
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col md="7" sm="7" cols="12">
          <v-card variant="flat" class="brightness" :disabled="progressLinear > 0">
            <RouterView v-slot="{ Component }">
              <v-slide-x-transition leave-absolute>
                <component :is="Component" @update="update" @reset="reset" />
              </v-slide-x-transition>
            </RouterView>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
  <!-- <v-row class="h-100" justify="center" align="center" no-gutters>
    <v-col xl="3" md="4" sm="6" xs="12" align-self="center">
      <v-card>
        <v-btn prepend-icon="mdi-arrow-left" color="primary" variant="text" @click="$router.back()">
          上一页
        </v-btn>
        <v-card-title align="center">
          <v-img
            :width="200"
            :src="`https://s1.imlazy.ink:233/img/%E8%A1%A8%E6%83%85%E5%8C%85/%E7%8C%AB%E7%BE%BD%E9%9B%AB/${option.image || $route.meta.image}`"
          />
          <div class="my-4 text-h5 text-primary">{{ option.title || $route.meta.title }}</div>
        </v-card-title>
        <v-card-text>
          <RouterView v-slot="{ Component }">
            <v-slide-x-transition leave-absolute>
              <component :is="Component" @update="update" @reset="reset" />
            </v-slide-x-transition>
          </RouterView>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row> -->
</template>
