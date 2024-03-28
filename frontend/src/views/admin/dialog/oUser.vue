<script lang="ts" setup>
import { ref } from 'vue'
import { indexStore } from '@/stores'
import { useDisplay } from 'vuetify'
import type { VForm } from 'vuetify/lib/components/index.mjs'
import _ from 'lodash'
import { updateUserInfoApi } from '@/apis/user'
import { UserInfo } from '@/types'
import { UserStatus } from '@/types'

const emit = defineEmits(['update'])
const { xs } = useDisplay()
const btnLoading = ref(false)
const { showMsg } = indexStore()
const form = ref<InstanceType<typeof VForm>>()
const formData = ref<UserInfo>({
  id: 0,
  username: '',
  password: '',
  status: 0,
  role: '',
  email: '',
  regTime: '',
  lastLoginTime: '',
  lastLoginIp: '',
  apikey: '',
  verifyToken: '',
  authDevice: ''
})
const open = ref(false)

const openDialog = (userInfo: UserInfo) => {
  open.value = true
  formData.value = _.cloneDeep(userInfo)
  formData.value.password = ''
}

const handleOk = async () => {
  try {
    if (!form.value) return
    const { valid } = await form.value.validate()
    if (!valid) return
    btnLoading.value = true
    const { msg } = await updateUserInfoApi(formData.value)
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

const checkUName = (v: string) => {
  if (v && v.length === 0) return false
  if (!/^[a-zA-Z0-9_-]{4,16}$/.test(v)) return '用户名必须为 4-16 位之间'
  return true
}

defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="open" max-width="600" persistent>
    <v-card :title="`编辑用户 ${formData.username}`" variant="flat">
      <v-card-text class="py-0 pt-5">
        <v-form ref="form" fast-fail @submit.prevent>
          <v-row :no-gutters="xs">
            <v-col cols="12" xs="12" sm="6">
              <v-text-field
                v-model="formData.username"
                :rules="[(v) => checkUName(v)]"
                clearable
                density="compact"
                label="用户名"
                :disabled="btnLoading"
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" xs="12" sm="6">
              <v-text-field
                v-model="formData.email"
                :rules="[(v) => (v && v.length > 0 ? true : false)]"
                clearable
                density="compact"
                label="绑定邮箱"
                type="email"
                :disabled="btnLoading"
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" xs="12" sm="6">
              <v-text-field
                v-model="formData.password"
                clearable
                density="compact"
                label="密码"
                placeholder="（未更改）"
                :disabled="btnLoading"
              >
              </v-text-field>
            </v-col>
            <v-col cols="12" xs="12" sm="6">
              <v-select
                v-model="formData.status"
                :items="[
                  { text: '正常', value: UserStatus.NORMAL },
                  { text: '封禁', value: UserStatus.BANNED }
                ]"
                item-title="text"
                item-value="value"
                density="compact"
                label="状态"
                variant="outlined"
                persistent-hint
              ></v-select>
            </v-col>
            <v-col cols="12" xs="12" sm="6">
              <v-select
                v-model="formData.role"
                :items="[
                  { text: '普通', value: 'default' },
                  { text: '管理员', value: 'admin' }
                ]"
                item-title="text"
                item-value="value"
                density="compact"
                label="权限组"
                variant="outlined"
              ></v-select>
            </v-col>
            <v-col cols="12" xs="12" sm="6">
              <v-text-field
                v-model="formData.apikey"
                clearable
                density="compact"
                label="APIKEY"
                placeholder="暂时没啥用"
                :disabled="btnLoading"
              >
              </v-text-field>
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
