<script lang="ts" setup>
import { ref } from 'vue'
import { indexStore } from '@/stores'
import { getUserLoginLogsApi } from '@/apis/user'
import _ from 'lodash'
import type { LoginIP, SortItem } from '@/types'

const { showMsg } = indexStore()

const headers = ref([
  { key: 'id', title: 'ID', order: 'desc' },
  { key: 'uid', title: '用户 ID' },
  { key: 'ip', title: 'IP 地址' },
  { key: 'location', title: '位置' },
  { key: 'time', title: '登录时间' }
])

const serverItems = ref<LoginIP[]>([])
const totalItems = ref(10)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const search = ref('')
const _sortBy = ref<SortItem[]>([{ key: 'id', order: 'desc' }])
// const _sortBy = ref<Array<{ key: string; order: string }>>([{ key: 'id', order: 'desc' }])
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
    sortBy: SortItem[]
  }) => {
    try {
      loading.value = true
      currentPage.value = page
      _sortBy.value = sortBy
      const { data } = await getUserLoginLogsApi(
        true,
        page,
        itemsPerPage,
        sortBy.length > 0 ? sortBy[0].key : 'id',
        sortBy.length > 0 ? sortBy[0].order === 'desc' : false,
        search.value
      )
      loading.value = false
      serverItems.value = data.records
      totalItems.value = data.totalCount
    } catch (err: any) {
      loading.value = false
      console.error(err)
      showMsg(err.message, 'red')
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
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center ga-3">
      <div class="me-auto text-h6">
        登录日志 <small>( {{ totalItems }} )</small>
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
          :disabled="!!search && search.length === 0 && loading"
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
          v-model:sort-by="_sortBy"
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
          <template v-slot:[`item.ip`]="{ item }">
            <CopyTool :text="item.ip" location="left">
              <template #default="{ copy, style, act }">
                <span v-bind="act" @click="copy" :style="style" class="truncate d-block">{{
                  item.ip
                }}</span>
              </template>
            </CopyTool>
          </template>
          <template v-slot:[`item.time`]="{ item }">
            {{ new Date(item.time).toLocaleString() }}
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>
  </div>
</template>
