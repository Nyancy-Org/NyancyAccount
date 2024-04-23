<script lang="ts" setup>
import { ref } from 'vue'
import { indexStore } from '@/stores'
import { getOAuth2AppsApi, delOAuth2AppApi } from '@/apis/oauth2'
import _ from 'lodash'
import { OAuth2ClientInfo } from '@/types'
import oOauth2 from './dialog/oOauth2.vue'

const oOauth2Dialog = ref<InstanceType<typeof oOauth2>>()
const { showMsg, openConfirmDialog } = indexStore()
const itemsPerPage = ref(10)
const search = ref('')

const headers = ref([
  { key: 'id', title: 'ID' },
  { key: 'userId', title: '用户ID', width: '110px' },
  { key: 'name', title: '应用名称', width: '180px' },
  { key: 'secret', title: '客户端 Secret', width: '120px' },
  { key: 'redirect', title: '回调地址', width: '200px' },
  { key: 'createdAt', title: '创建时间', width: '150px' },
  { key: 'updatedAt', title: '最后更新', width: '150px' },
  { key: 'operate', title: '操作', sortable: false, width: '160px' }
])

const serverItems = ref<OAuth2ClientInfo[]>([])
const totalItems = ref(10)
const currentPage = ref(1)
const _sortBy = ref<Array<{ key: string; order: string }>>([{ key: 'id', order: 'asc' }])
const loading = ref(false)

// 获取数据
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
      const { data } = await getOAuth2AppsApi(
        page,
        itemsPerPage,
        sortBy.length > 0 ? sortBy[0].key : 'id',
        sortBy.length > 0 ? sortBy[0].order === 'desc' : false,
        search.value
      )
      loading.value = false
      serverItems.value = data.clients
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

const toDelete = async (item: OAuth2ClientInfo) => {
  const flag = await openConfirmDialog('警告', `你确定要删除应用 ${item.name} ？此操作不可逆转！`)
  if (!flag) return
  const { msg } = await delOAuth2AppApi(item)
  refreshItems()
  return showMsg(msg, 'green')
}
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center ga-3">
      <div class="me-auto text-h6">
        OAuth2 应用管理 <small>( {{ totalItems }} )</small>
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
          <template v-slot:[`item.secret`]="{ item }">
            <CopyTool :text="item.secret">
              <template #default="{ copy, style, act }">
                <span v-bind="act" @click="copy" :style="style" class="truncate d-block">{{
                  item.secret
                }}</span>
              </template>
            </CopyTool>
          </template>
          <template v-slot:[`item.redirect`]="{ item }">
            <CopyTool :text="item.redirect">
              <template #default="{ copy, style, act }">
                <span v-bind="act" @click="copy" :style="style" class="truncate d-block">{{
                  item.redirect
                }}</span>
              </template>
            </CopyTool>
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">
            {{ new Date(item.createdAt).toLocaleString() }}
          </template>
          <template v-slot:[`item.updatedAt`]="{ item }">
            {{ new Date(item.updatedAt).toLocaleString() }}
          </template>
          <template v-slot:[`item.operate`]="{ item }">
            <v-btn
              class="mr-4"
              icon="mdi-pencil-outline"
              variant="text"
              size="small"
              color="primary"
              @click="oOauth2Dialog?.openDialog(item)"
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

    <oOauth2 ref="oOauth2Dialog" @update="refreshItems" />
  </div>
</template>
