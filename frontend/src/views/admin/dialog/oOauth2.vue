<script lang="ts" setup>
import { ref } from 'vue'
import { indexStore } from '@/stores'
import { useDisplay } from 'vuetify'
import type { VForm } from 'vuetify/lib/components/index.mjs'
import _ from 'lodash'
import { updateOAuth2AppApi } from '@/apis/oauth2'
import { OAuth2ClientInfo } from '@/types'

const emit = defineEmits(['update'])
const { xs } = useDisplay()
const btnLoading = ref(false)
const { showMsg } = indexStore()
const form = ref<InstanceType<typeof VForm>>()
const formData = ref<OAuth2ClientInfo>({
  id: 0,
  userId: 0,
  name: '',
  secret: '',
  redirect: '',
  createdAt: new Date(),
  updatedAt: new Date()
})
const open = ref(false)

const openDialog = (appInfo: OAuth2ClientInfo) => {
  open.value = true
  formData.value = _.cloneDeep(appInfo)
}

const handleOk = async () => {
  try {
    if (!form.value) return
    const { valid } = await form.value.validate()
    if (!valid) return
    btnLoading.value = true
    // todo:  userId is number
    formData.value.userId = Number(formData.value.userId)
    const { msg } = await updateOAuth2AppApi(formData.value)
    showMsg(msg, 'green')
    emit('update')
    handleCancel()
  } finally {
    btnLoading.value = false
  }
}

const handleCancel = async () => {
  open.value = false
  form.value?.reset()
}

defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="open" max-width="500" persistent>
    <v-card title="编辑 OAuth2 应用" variant="flat">
      <v-card-text class="py-0 pt-5">
        <v-form ref="form" fast-fail @submit.prevent>
          <v-text-field
            v-model="formData.userId"
            :rules="[(v) => (v ? true : false)]"
            clearable
            label="所属用户ID"
            density="compact"
            type="number"
            :disabled="btnLoading"
          >
          </v-text-field>
          <v-text-field
            v-model="formData.name"
            :rules="[(v) => (v && v.length > 0 ? true : false)]"
            clearable
            label="名称"
            density="compact"
            :disabled="btnLoading"
          >
          </v-text-field>
          <v-text-field
            v-model="formData.secret"
            :rules="[(v) => (v && v.length > 0 ? true : false)]"
            clearable
            label="客户端 Secret"
            density="compact"
            :disabled="btnLoading"
          >
          </v-text-field>
          <v-text-field
            v-model="formData.redirect"
            :rules="[(v) => (v && v.length > 0 ? true : false)]"
            clearable
            label="回调 Url"
            density="compact"
            :disabled="btnLoading"
          >
          </v-text-field>
          <v-row :no-gutters="xs">
            <v-col cols="12" xs="12" sm="6">
              <v-text-field
                :model-value="new Date(formData.createdAt).toLocaleString()"
                readonly
                label="创建日期"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" xs="12" sm="6">
              <v-text-field
                :model-value="new Date(formData.updatedAt).toLocaleString()"
                readonly
                label="最后更新"
                density="compact"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="handleCancel"> 取消 </v-btn>

        <v-btn @click="handleOk" color="primary" :loading="btnLoading"> 确定 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
