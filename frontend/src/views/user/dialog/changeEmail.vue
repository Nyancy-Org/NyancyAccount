<script lang="ts" setup>
import { ref } from 'vue'
import { updateUInfoApi } from '@/apis/user'
import { checkEmailApi, sendEmailCodeApi } from '@/apis/auth'
import { indexStore } from '@/stores'
import { userStore } from '@/stores/user'
import type { VForm } from 'vuetify/lib/components/index.mjs'

const open = ref(false)
const openDialog = () => {
  open.value = true
}

const btnLoading = ref(false)
const eBtnLoading = ref(false)
const { showMsg } = indexStore()
const { getUserInfo, info } = userStore()
const timer = ref<NodeJS.Timeout>()
const num = ref(0)
const form = ref<InstanceType<typeof VForm>>()
const formData = ref({
  email: '',
  code: ''
})
const sendStatus = ref('')

const sendEmailCode = async () => {
  if (!form.value) return
  const { valid } = await form.value.validate()
  if (!valid) return

  // 后端判断的位置不太理想，所以前端先判断
  if (formData.value.email === info?.email) return showMsg('不可与原邮箱一致', 'warning')
  await checkEmailApi({
    email: formData.value.email
  })

  if (timer.value) clearInterval(timer.value)
  num.value = -1
  eBtnLoading.value = true
  const { data, retryAfter } = await sendEmailCodeApi({
    email: formData.value.email,
    type: 'changeEmail'
  })
  eBtnLoading.value = false
  if (data.code !== 200) {
    sendStatus.value = data.msg
    showMsg(data.msg, 'red')
  } else {
    sendStatus.value = ''
    showMsg(data.msg, 'green')
  }
  num.value = retryAfter
  timer.value = setInterval(() => {
    num.value--
    if (num.value <= 0) {
      clearInterval(timer.value)
    }
  }, 1000)
}

const handleOk = async () => {
  try {
    if (!form.value) return
    const { valid } = await form.value.validate()
    if (!valid) return
    btnLoading.value = true
    const { msg } = await updateUInfoApi('email', formData.value)
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
    <v-card title="更改邮箱" variant="flat">
      <v-card-text class="py-0 pt-5">
        <v-slide-y-reverse-transition leave-absolute>
          <div class="mt-n3 mb-2 d-flex flex-wrap justify-center">
            <v-chip
              v-if="num > 0 && sendStatus !== ''"
              prepend-icon="mdi-robot-angry-outline"
              color="error"
            >
              请等待 {{ num }} 秒后重试
            </v-chip>
            <v-chip v-else-if="num > 0" prepend-icon="mdi-robot-happy-outline" color="success">
              已发送验证码，{{ num }} 秒后可重新发送
            </v-chip>
            <v-chip v-if="num === -1" prepend-icon="mdi-robot-outline" color="warning">
              验证码发送中...
            </v-chip>
          </div>
        </v-slide-y-reverse-transition>
        <v-form ref="form" fast-fail @submit.prevent>
          <v-text-field
            v-model="formData.email"
            :rules="[(v) => (v && v.length > 0 ? true : false)]"
            autofocus
            clearable
            hide-details
            label="新的邮箱地址"
            type="email"
            :disabled="btnLoading"
          >
          </v-text-field>
          <v-otp-input v-model="formData.code" :disabled="btnLoading"></v-otp-input>
        </v-form>
        <small><b>注意：</b>更改后，原绑定的PassKey将会被删除，需要重新绑定！</small>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="num === 0" color="primary" :loading="eBtnLoading" @click="sendEmailCode"
          >发送验证码</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn @click="handleCancel"> 取消 </v-btn>

        <v-btn @click="handleOk" color="primary" :loading="btnLoading"> 确定 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
