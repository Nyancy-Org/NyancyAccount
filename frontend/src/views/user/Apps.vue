<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { OAuth2ClientInfo } from '@/types'
import { getMyOAuth2AppsApi } from '@/apis/oauth2'
import CopyTool from '@/components/CopyTool.vue'

const serverItems = ref<OAuth2ClientInfo[]>([])

const getAppList = async () => {
  const { data } = await getMyOAuth2AppsApi()
  serverItems.value = data
}

onMounted(async () => {
  await getAppList()
})
</script>

<template>
  <v-card-title class="d-flex align-center justify-space-between">
    总计 {{ serverItems.length }} 个应用
    <v-btn class="ml-4" variant="outlined" color="primary" prepend-icon="mdi-plus">添加</v-btn>
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
                >编辑</v-btn
              >
              <v-btn color="red" variant="tonal" prepend-icon="mdi-delete-outline">删除</v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card-text>
</template>
