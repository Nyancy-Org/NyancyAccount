<script lang="ts" setup>
import { ref } from 'vue'
import { indexStore } from '@/stores'
import _ from 'lodash'
import { getUserLoginLogsApi } from '@/apis/user'
import type { LoginIP, SortItem } from '@/types'
import { useDisplay } from 'Vuetify'

const open = ref(false)
const openDialog = () => {
  open.value = true
}

const { xs } = useDisplay()
const { showMsg } = indexStore()
const cardLoading = ref(false)

const headers = ref([
  { key: 'id', title: 'ID', order: 'desc' },
  { key: 'ip', title: 'IP 地址' },
  { key: 'location', title: '位置' },
  { key: 'device', title: '设备' },
  { key: 'time', title: '登录时间' }
])

const serverItems = ref<LoginIP[]>([])
const totalItems = ref(0)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const search = ref('')
const _sortBy = ref<SortItem[]>([{ key: 'id', order: 'desc' }])
const loading = ref(false)

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
        false,
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

const handleCancel = async () => {
  open.value = false
}

defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="open" fullscreen hide-overlay transition="dialog-bottom-transition" persistent>
    <v-card variant="flat" :loading="cardLoading" :disabled="cardLoading">
      <v-toolbar color="primary">
        <v-btn icon="mdi-close" @click="handleCancel"></v-btn>

        <v-toolbar-title>登录日志</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-text-field
          v-if="!xs"
          v-model:model-value="search"
          label="搜索"
          clearable
          density="compact"
          append-inner-icon="mdi-magnify"
          hide-details
          single-line
          :disabled="!!search && search.length === 0 && loading"
        ></v-text-field>
        <v-btn
          class="ml-2"
          icon="mdi-refresh"
          variant="text"
          :loading="loading"
          @click="refreshItems"
        ></v-btn>
      </v-toolbar>
      <v-card-text>
        <div v-if="xs">
          <v-text-field
            v-model:model-value="search"
            label="搜索"
            clearable
            density="compact"
            append-inner-icon="mdi-magnify"
            hide-details
            single-line
            :disabled="!!search && search.length === 0 && loading"
          ></v-text-field>
        </div>
        <v-data-table-server
          v-model:sort-by="_sortBy"
          v-model:items-per-page="itemsPerPage"
          :headers="headers"
          :items-length="totalItems"
          :items="serverItems"
          :loading="loading"
          :search="search"
          fixed-header
          hover
          height="75vh"
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
  </v-dialog>
</template>
