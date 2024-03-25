<script lang="ts" setup>
import { ref } from 'vue'
import { useAuth } from '@/hooks/useAuth'
import { updateUInfoApi } from '@/apis/user'
import { indexStore } from '@/stores'
import { userStore } from '@/stores/user'
import type { VForm } from 'vuetify/lib/components/index.mjs'

const open = ref(false)
const openDialog = () => {
  open.value = true
}

const btnLoading = ref(false)
const { showMsg } = indexStore()
const { getUserInfo } = userStore()
const { checkPwd } = useAuth()

const form = ref<InstanceType<typeof VForm>>()
const formData = ref({
  password: {
    old: '',
    new: '',
    new2: ''
  }
})

const handleOk = async () => {
  try {
    if (!form.value) return
    const { valid } = await form.value.validate()
    if (!valid) return
    btnLoading.value = true
    const { msg } = await updateUInfoApi('password', formData.value as any)
    await getUserInfo()
    showMsg(msg, 'green')
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
    <v-card title="更改密码" variant="flat">
      <v-card-text class="py-0 pt-5">
        <v-form ref="form" fast-fail @submit.prevent>
          <v-text-field
            v-model="formData.password.old"
            :rules="[(v) => checkPwd(v)]"
            autofocus
            clearable
            label="旧密码"
            :disabled="btnLoading"
          >
          </v-text-field>
          <v-text-field
            v-model="formData.password.new"
            :rules="[(v) => checkPwd(v)]"
            clearable
            label="新密码"
            type="password"
            :disabled="btnLoading"
          >
          </v-text-field>
          <v-text-field
            v-model="formData.password.new2"
            :rules="[(v) => (v === formData.password.new ? true : '两次密码不一致')]"
            clearable
            label="确认新密码"
            type="password"
            :disabled="btnLoading"
          >
          </v-text-field>
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
