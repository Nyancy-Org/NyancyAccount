<script lang="ts" setup>
import { ref } from 'vue'

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
    <v-col cols="12" md="6" sm="8" xs="12" align-self="center">
      <v-card>
        <v-btn
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
        </v-btn>
        <v-card-title align="center">
          <v-img
            :width="200"
            :src="`https://s1.imlazy.ink:233/img/%E8%A1%A8%E6%83%85%E5%8C%85/%E7%8C%AB%E7%BE%BD%E9%9B%AB/${option.image || $route.meta.image}`"
          />
          <div class="my-4 text-h5 text-primary">{{ option.title || $route.meta.title }}</div>
        </v-card-title>
        <v-card-text>
          <v-slide-x-transition leave-absolute>
            <RouterView @update="update" @reset="reset" />
          </v-slide-x-transition>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
