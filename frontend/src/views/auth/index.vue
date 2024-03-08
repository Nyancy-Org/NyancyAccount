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
            :src="`https://s1.imlazy.ink:233/img/%E8%A1%A8%E6%83%85%E5%8C%85/%E7%8C%AB%E7%BE%BD%E9%9B%AB/${$route.meta.image}`"
          />
          <div class="my-4 text-h5 text-primary">{{ $route.meta.title }}</div>
        </v-card-title>
        <v-card-text>
          <v-slide-x-transition leave-absolute>
            <RouterView />
          </v-slide-x-transition>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
