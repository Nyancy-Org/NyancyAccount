<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { getWebAuthnRegOptionApi, verifyWebAuthnApi, deleteWebAuthnApi } from '@/apis/user'
import { indexStore } from '@/stores'
import { userStore } from '@/stores/user'
import type { RegistrationResponseJSON } from '@simplewebauthn/types'
import { browserSupportsWebAuthn, startRegistration } from '@simplewebauthn/browser'

const open = ref(false)
const openDialog = () => {
  open.value = true
}

const { showMsg, openConfirmDialog } = indexStore()
const { getUserInfo } = userStore()
const { info } = storeToRefs(userStore())
const btnLoading = ref(false)

const getRegOption = async () => {
  if (!browserSupportsWebAuthn()) return showMsg('你的浏览器不支持 WebAuthn', 'red')
  const { data: option } = await getWebAuthnRegOptionApi()
  let rRes: RegistrationResponseJSON
  try {
    rRes = await startRegistration(option)
    console.log(rRes)
  } catch (err: any) {
    if (err.name === 'InvalidStateError') {
      showMsg('Authenticator was probably already registered by user', 'red')
    } else {
      console.error(err)
      showMsg(err.message, 'red')
    }
  }
  await verifyWebAuthnApi(rRes!)
  showMsg('绑定成功', 'green')
  handleOk()
}

const deleteAuthDevice = async () => {
  const s = await openConfirmDialog('警告', '确定要解除绑定吗？此操作不可逆转！', 'red')
  if (!s) return
  const { msg } = await deleteWebAuthnApi()
  showMsg(msg, 'green')
  handleOk()
}

const handleOk = async () => {
  try {
    btnLoading.value = true
    await getUserInfo()
    handleCancel()
  } finally {
    btnLoading.value = false
  }
}

const handleCancel = async () => {
  open.value = false
}

defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="open" max-width="400" persistent>
    <v-card title="绑定外部验证器" variant="flat">
      <v-card-text class="py-0 pt-5">
        {{ info?.authDevice }}
        <v-btn v-if="!info?.authDevice" @click="getRegOption">点击开始绑定</v-btn>
        <span v-else>你已绑定外部验证器</span>
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="info?.authDevice" color="red" @click="deleteAuthDevice"> 解除绑定 </v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="handleCancel"> 取消 </v-btn>

        <v-btn @click="handleOk" color="primary" :loading="btnLoading"> 确定 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
