<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { indexStore } from '@/stores'
import { useElementSize } from '@vueuse/core'
import { getStatisticApi } from '@/apis/site'
const { appTheme } = indexStore()

const c1 = ref<HTMLElement>()
const { height: c1_h } = useElementSize(c1)

const loading = ref(false)
const userCount = ref('0')
const OAuthClientCount = ref('0')
const dailyRegStatistics = ref({
  date: ['LOADING'],
  count: [0]
})

// 获取统计数据
const getStatistics = async () => {
  loading.value = true
  const { data } = await getStatisticApi()
  loading.value = false
  userCount.value = data.user
  OAuthClientCount.value = data.oauth_clients
  dailyRegStatistics.value = data.dailyRegStatistics
}

onMounted(async () => {
  await getStatistics()
})
</script>

<template>
  <div>
    <v-row>
      <v-col cols="12" xs="12" sm="6" md="4">
        <v-card variant="outlined" ref="c1" :loading="loading" :disabled="loading">
          <v-card-title> 注册用户 </v-card-title>

          <v-card-text class="py-0">
            <v-row align="center" no-gutters>
              <v-col class="text-h2 text-orange-lighten-2" cols="8">{{ userCount }} </v-col>

              <v-col class="text-right" cols="4">
                <v-icon
                  class="user-icon-shadow"
                  color="orange-lighten-3"
                  icon="mdi-human-cane"
                  size="88"
                ></v-icon>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn block color="orange" to="/admin/users"> 用户管理 </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" xs="12" sm="6" md="4">
        <v-card variant="outlined" :loading="loading" :disabled="loading">
          <v-card-title> OAuth2 应用数量 </v-card-title>

          <v-card-text class="py-0">
            <v-row align="center" no-gutters>
              <v-col class="text-h2 text-teal" cols="8">{{ OAuthClientCount }}</v-col>

              <v-col class="text-right" cols="4">
                <v-icon
                  class="oa-icon-shadow"
                  color="teal-lighten-3"
                  icon="mdi-vector-link"
                  size="88"
                ></v-icon>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn block color="teal" to="/admin/oauth2"> 应用管理 </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" xs="12" sm="12" md="4">
        <v-card variant="outlined" :disabled="loading">
          <v-img src="https://api.imlazy.ink/img/" cover :height="c1_h"></v-img>
        </v-card>
      </v-col>
    </v-row>
    <v-card class="mt-5" variant="outlined" :loading="loading" :disabled="loading">
      <v-card-title> 用户注册趋势 </v-card-title>
      <!-- BUG: 如果颜色模式为自动并且在神色模式下，label标签不可见 -->
      <v-sparkline
        :labels="dailyRegStatistics.date as any"
        :model-value="dailyRegStatistics.count"
        :radius="10"
        :line-width="1.5"
        :gradient="['#dfbbff', '#a9aaff', '#6da3c5']"
        :color="appTheme === 'dark' ? 'rgba(255, 255, 255, .5)' : 'rgba(0, 0, 0, .5)'"
        label-size="5"
        height="100"
        padding="20"
        smooth
      >
      </v-sparkline>
    </v-card>
  </div>
</template>

<style lang="scss" scoped>
.user-icon-shadow {
  text-shadow:
    -20px 0px 10px #e5b671,
    20px 0px 10px #db9b7d;
}

.oa-icon-shadow {
  text-shadow:
    -15px 15px 15px #a780cb,
    15px -15px 15px #73caff;
}
</style>
