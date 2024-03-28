<script lang="ts" setup>
import { ref } from 'vue'
import { indexStore } from '@/stores'
import { getUserListApi, delUserApi } from '@/apis/user'
import _ from 'lodash'
import { UserInfo, UserStatus } from '@/types'
import { userStatus } from '@/types/const'
import CopyTool from '@/components/CopyTool.vue'
import oUser from './dialog/oUser.vue'

const oUserDialog = ref<InstanceType<typeof oUser>>()
const { showMsg, openConfirmDialog } = indexStore()
const itemsPerPage = ref(10)
const search = ref('')

const headers = ref([
  { key: 'id', title: 'ID' },
  { key: 'username', title: '用户名', width: '120px' },
  { key: 'email', title: '绑定邮箱', width: '180px' },
  { key: 'role', title: '权限组', width: '100px' },
  { key: 'status', title: '状态', width: '100px' },
  { key: 'regTime', title: '注册时间', width: '120px' },
  { key: 'lastLoginTime', title: '上次登录', width: '120px' },
  { key: 'lastLoginIp', title: '最后登录IP' },
  { key: 'authDevice', title: '外部验证器', width: '130px' },
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

const refreshItems = () =>
  loadItems({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
    sortBy: _sortBy.value
  })

const toDelete = async (item: UserInfo) => {
  const flag = await openConfirmDialog(
    '警告',
    `你确定要删除用户 ${item.username} ？此操作不可逆转！`
  )
  if (!flag) return
  const { msg } = await delUserApi(item)
  refreshItems()
  return showMsg(msg, 'green')
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center ga-3">
      <div class="me-auto text-h6">
        用户管理 <small>( {{ totalItems }} )</small>
      </div>

      <div class="d-flex align-center ga-4">
        <v-text-field
          style="min-width: 30vw"
          v-model:model-value="search"
          label="搜索"
          clearable
          density="compact"
          append-inner-icon="mdi-magnify"
          hide-details
          :disabled="search.length === 0 && loading"
        ></v-text-field>
        <v-btn
          @click="refreshItems"
          :loading="loading"
          prepend-icon="mdi-refresh"
          variant="outlined"
          color="primary"
          >刷新</v-btn
        >
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
          <template v-slot:[`item.email`]="{ item }">
            <CopyTool :text="item.email">
              <template #default="{ copy, style, act }">
                <span v-bind="act" @click="copy" :style="style">{{ item.email }}</span>
              </template>
            </CopyTool>
          </template>
          <template v-slot:[`item.role`]="{ item }">
            <span :class="item.role === 'admin' ? 'text-orange' : ''">
              {{ item.role }}
            </span>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip :color="item.status === UserStatus.NORMAL ? 'green' : 'red'">
              {{ userStatus[item.status ?? -1] }}
            </v-chip>
          </template>
          <template v-slot:[`item.regTime`]="{ item }">
            {{ new Date(Number(item.regTime)).toLocaleString() }}
          </template>
          <template v-slot:[`item.lastLoginTime`]="{ item }">
            {{ new Date(Number(item.lastLoginTime)).toLocaleString() }}
          </template>
          <template v-slot:[`item.lastLoginIp`]="{ item }">
            <CopyTool :text="item.lastLoginIp">
              <template #default="{ copy, style, act }">
                <span v-bind="act" @click="copy" :style="style">{{ item.lastLoginIp }}</span>
              </template>
            </CopyTool>
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
              @click="oUserDialog?.openDialog(item)"
            ></v-btn>
            <v-btn
              icon="mdi-trash-can-outline"
              variant="text"
              size="small"
              color="red"
              @click="toDelete(item)"
            ></v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <oUser ref="oUserDialog" @update="refreshItems" />
  </div>
</template>
