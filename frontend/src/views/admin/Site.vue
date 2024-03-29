<script lang="ts" setup>
import { ref } from 'vue'
import { getConfigApi } from '@/apis/site'
import _ from 'lodash'
import { SiteOptions } from '@/types'
import oSite from './dialog/oSite.vue'

const oSiteDialog = ref<InstanceType<typeof oSite>>()

const headers = ref([
  { key: 'id', title: 'ID' },
  { key: 'optionName', title: '配置项' },
  { key: 'note', title: '备注' },
  { key: 'value', title: '值' },
  { key: 'operate', title: '操作', sortable: false }
])

const serverItems = ref<SiteOptions[]>([])
const totalItems = ref(0)
const loading = ref(false)

// 获取数据
const loadItems = _.throttle(async () => {
  try {
    loading.value = true
    const { data } = await getConfigApi()
    loading.value = false
    serverItems.value = data
    totalItems.value = data.length
  } catch (err: any) {
    loading.value = false
    console.error(err)
  }
}, 1000)

const refreshItems = () => loadItems()
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center ga-3">
      <div class="me-auto text-h6">站点配置</div>

      <div class="d-flex align-center ga-4">
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
          :headers="headers"
          :items-length="totalItems"
          :items="serverItems"
          :loading="loading"
          hover
          color="transparent"
          @update:options="loadItems"
        >
          <template v-slot:[`item.operate`]="{ item }">
            <v-btn
              class="mr-4"
              icon="mdi-pencil-outline"
              variant="text"
              size="small"
              color="primary"
              @click="oSiteDialog?.openDialog(item)"
            ></v-btn>
          </template>
        </v-data-table-server>
      </v-card-text>
    </v-card>

    <oSite ref="oSiteDialog" @update="refreshItems" />
  </div>
</template>
