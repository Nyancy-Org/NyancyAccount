<script lang="ts" setup>
import { userStore } from '@/stores/user'
// import { userStatus } from '@/types/const'
const { info } = userStore()

const uInfo = [
  {
    title: 'UID',
    value: info?.id
  },
  {
    title: '邮箱',
    value: info?.email
  },
  // {
  //   title: '账号状态',
  //   value: userStatus[info?.status ?? -1]
  // },
  {
    title: '权限组',
    value: info?.role
  },
  {
    title: '上次登录IP',
    value: info?.lastLoginIp
  },
  {
    title: '注册时间',
    value: new Date(Number(info?.regTime) ?? 0).toLocaleString()
  },
  {
    title: '最后登录',
    value: new Date(info?.lastLoginTime ?? 0).toLocaleString()
  }
]
</script>

<template>
  <v-card-text>
    <v-row>
      <v-col v-for="(item, i) in uInfo" :key="i" cols="12" sm="12" md="6">
        <p class="text-subtitle-1 font-weight-medium">{{ item.title }}</p>
        <span class="text-body-2 text-medium-emphasis">{{ item.value }}</span>
      </v-col>
    </v-row>
  </v-card-text>
</template>
