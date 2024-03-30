<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { OAuth2ClientInfo } from '@/types'
import { getMyOAuth2AppsApi, delMyOAuth2AppApi } from '@/apis/oauth2'
import CopyTool from '@/components/CopyTool.vue'
import oOauth2 from './dialog/oOauth2.vue'
import { indexStore } from '@/stores'

const { showMsg, openConfirmDialog } = indexStore()
const serverItems = ref<OAuth2ClientInfo[]>([])
const oOauth2Dialog = ref<InstanceType<typeof oOauth2>>()
const cardLoading = ref(false)

const getAppList = async () => {
  cardLoading.value = true
  const { data } = await getMyOAuth2AppsApi()
  serverItems.value = data
  cardLoading.value = false
}

const toDelete = async (item: OAuth2ClientInfo) => {
  const flag = await openConfirmDialog('警告', '你确定要删除这个 OAuth2 应用吗？此操作不可逆转！')
  if (!flag) return
  cardLoading.value = true
  const { msg } = await delMyOAuth2AppApi(item)
  await getAppList()
  return showMsg(msg, 'green')
}

onMounted(async () => {
  await getAppList()
})
</script>

<template>
  <div>
    <v-progress-linear indeterminate v-if="cardLoading"></v-progress-linear>
    <v-card-title class="d-flex align-center justify-space-between">
      总计 {{ serverItems.length }} 个应用
      <v-btn
        class="ml-4"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-plus"
        @click="oOauth2Dialog?.openDialog()"
        >添加</v-btn
      >
    </v-card-title>

    <v-card-text>
      <v-expansion-panels flat class="pa-0" variant="accordion">
        <v-expansion-panel v-for="(item, i) in serverItems" :key="i" :title="item.name">
          <v-expansion-panel-text>
            <v-row align="center">
              <v-col cols="12" sm="12" md="6">
                <p class="text-subtitle-1 font-weight-medium">ID</p>
                <span class="text-body-2 text-medium-emphasis">{{ item.id }}</span>
              </v-col>
              <v-col cols="12" sm="12" md="6">
                <p class="text-subtitle-1 font-weight-medium">客户端 Secret</p>
                <CopyTool :text="item.secret">
                  <template #default="{ copy, style, act }">
                    <span
                      v-bind="act"
                      @click="copy"
                      :style="style"
                      class="text-body-2 text-medium-emphasis"
                      >{{ item.secret }}</span
                    >
                  </template>
                </CopyTool>
              </v-col>
              <v-col cols="12" sm="12" md="6">
                <p class="text-subtitle-1 font-weight-medium">回调 Url</p>
                <CopyTool :text="item.redirect">
                  <template #default="{ copy, style, act }">
                    <span
                      v-bind="act"
                      @click="copy"
                      :style="style"
                      class="text-body-2 text-medium-emphasis"
                      >{{ item.redirect }}</span
                    >
                  </template>
                </CopyTool>
              </v-col>
              <v-col cols="12" sm="12" md="6">
                <v-btn
                  color="primary"
                  class="mr-4"
                  variant="outlined"
                  prepend-icon="mdi-pencil-outline"
                  @click="oOauth2Dialog?.openDialog(item)"
                  >编辑</v-btn
                >
                <v-btn
                  color="red"
                  variant="tonal"
                  prepend-icon="mdi-delete-outline"
                  @click="toDelete(item)"
                  >删除</v-btn
                >
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>

    <oOauth2 ref="oOauth2Dialog" @update="getAppList" />
  </div>
</template>
