<script lang="ts" setup>
import { ref } from 'vue'
import { indexStore } from '@/stores'
import { getUserListApi } from '@/apis/user'
import _ from 'lodash'
import { UserInfo } from '@/types'
import { userStatus } from '@/types/const'

const { showMsg } = indexStore()
const itemsPerPage = ref(10)
const search = ref('')

const headers = ref([
  { key: 'id', title: 'ID' },
  { key: 'username', title: '用户名' },
  { key: 'email', title: '绑定邮箱' },
  { key: 'role', title: '权限组' },
  { key: 'status', title: '状态' },
  { key: 'regTime', title: '注册时间' },
  { key: 'lastLoginTime', title: '上次登录' },
  { key: 'lastLoginIp', title: '最后登录IP' },
  { key: 'authDevice', title: '外部验证器' },
  { key: 'operate', title: '操作', sortable: false }
])

const serverItems = ref<UserInfo[]>([])
const totalItems = ref(10)
const currentPage = ref(1)
const _sortBy = ref<Array<{ key: string; order: string }>>([{ key: 'id', order: 'asc' }])
const loading = ref(false)

// 获取统计数据
const loadItems = _.throttle(
  async ({
    page,
    itemsPerPage,
    sortBy
  }: {
    page: number
    itemsPerPage: number
    sortBy: Array<{ key: string; order: string }>
  }) => {
    try {
      loading.value = true
      currentPage.value = page
      _sortBy.value = sortBy
      const { data } = await getUserListApi(
        page,
        itemsPerPage,
        sortBy.length > 0 ? sortBy[0].key : 'id',
        sortBy.length > 0 ? sortBy[0].order === 'desc' : false,
        search.value
      )
      loading.value = false
      serverItems.value = data.users
      totalItems.value = data.totalCount
    } catch (err: any) {
      loading.value = false
      console.error(err)
    }
  },
  1000
)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center ga-3">
      <div class="me-auto text-h6">
        用户管理 <small>( {{ totalItems }} )</small>
      </div>

      <div class="d-flex align-center">
        <v-text-field
          style="min-width: 30vw"
          v-model:model-value="search"
          label="搜索"
          clearable
          density="compact"
          append-inner-icon="mdi-magnify"
          hide-details
        ></v-text-field>
        <v-btn class="ml-4" variant="outlined" color="primary">添加</v-btn>
      </div>
    </div>
    <v-card class="mt-5" variant="outlined">
      <v-card-text>
        <v-data-table-server
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items-length="totalItems"
          :items="serverItems"
          :loading="loading"
          :search="search"
          hover
          color="transparent"
          @update:options="loadItems"
        >
          <template v-slot:[`item.status`]="{ item }">
            {{ userStatus[item.status ?? -1] }}
          </template>
          <template v-slot:[`item.regTime`]="{ item }">
            {{ new Date(Number(item.regTime)).toLocaleString() }}
          </template>
          <template v-slot:[`item.lastLoginTime`]="{ item }">
            {{ new Date(Number(item.lastLoginTime)).toLocaleString() }}
          </template>
          <template v-slot:[`item.authDevice`]="{ item }">
            <v-chip v-if="item.authDevice" color="green" prepend-icon="mdi-shield-lock-outline">
              已启用
            </v-chip>
            <v-chip v-else color="red" prepend-icon="mdi-shield-off-outline"> 已关闭 </v-chip>
          </template>
          <template v-slot:[`item.operate`]="{ item }">
            <v-btn
              class="mr-4"
              icon="mdi-pencil-outline"
              variant="text"
              size="small"
              color="primary"
              @click="item"
            ></v-btn>
            <v-btn icon="mdi-trash-can-outline" variant="text" size="small" color="red"></v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </div>
</template>
