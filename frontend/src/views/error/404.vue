<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'
const errPath = useRouteQuery('errPath')
</script>

<template>
  <v-row class="h-100" justify="center" align="center" no-gutters>
    <v-col cols="12" md="8" sm="10" xs="12" align-self="center">
      <v-card align="center">
        <v-card-title>
          <v-img
            :width="200"
            src="https://cdn.imlazy.ink:233/img/%E8%A1%A8%E6%83%85%E5%8C%85/%E7%8C%AB%E7%BE%BD%E9%9B%AB/017.png"
          />
          <div class="text-h3 text-primary mt-2">{{ $route.meta.title }}</div>
        </v-card-title>
        <v-card-text>
          <div class="mt-4">
            <p class="my-5">
              你访问的路径
              <kbd class="text-red">
                {{ errPath }}
              </kbd>
              不存在，请检查你的 URL。
            </p>
            <v-btn prepend-icon="mdi-cat" color="primary" variant="tonal" size="large" to="/"
              >返回首页</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
