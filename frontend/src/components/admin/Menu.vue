<script setup lang="ts">
import { ref } from 'vue'
import { userStore } from '@/stores/user'
import md5 from 'md5'

const { info } = userStore()

const menus = [
  {
    title: '仪表板',
    icon: 'view-dashboard-outline',
    color: 'primary',
    to: '/admin/dashboard'
  },
  {
    title: '用户管理',
    icon: 'account-multiple-outline',
    color: 'orange',
    to: '/admin/users'
  },
  {
    title: 'OAuth2 管理',
    icon: 'vector-link',
    color: 'teal',
    to: '/admin/oauth2'
  }
]
</script>

<template>
  <v-list>
    <v-list-item
      :prepend-avatar="`https://cdn.imlazy.ink:233/avatar/${md5(info?.email || '')}?s=300&r=R&d=`"
      :subtitle="info?.email"
      :title="`#${info?.id} ${info?.username}`"
    ></v-list-item>
  </v-list>
  <v-divider></v-divider>
  <v-list density="compact" nav>
    <v-list-item
      v-for="(item, i) in menus"
      :key="i"
      :prepend-icon="`mdi-${item.icon}`"
      :title="item.title"
      :to="item.to"
      :color="item.color"
    ></v-list-item>
  </v-list>
</template>
