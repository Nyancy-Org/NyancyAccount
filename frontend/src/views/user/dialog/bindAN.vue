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
const addBtnLoading = ref(false)
const delBtnLoading = ref(false)
const cardLoading = ref(false)

const getRegOption = async () => {
  if (!browserSupportsWebAuthn()) return showMsg('你的浏览器不支持 WebAuthn', 'red')

  let rRes: RegistrationResponseJSON
  try {
    addBtnLoading.value = true
    const { data: option } = await getWebAuthnRegOptionApi()
    rRes = await startRegistration(option)
    console.log(rRes)
    await verifyWebAuthnApi(rRes)
  } catch (err: any) {
    if (err.name === 'InvalidStateError') {
      showMsg('Authenticator was probably already registered by user', 'red')
    } else {
      console.error(err)
      return showMsg(err.message, 'red')
    }
  } finally {
    addBtnLoading.value = false
  }
  showMsg('绑定成功', 'green')

  handleOk()
}

const deleteAuthDevice = async (id: string) => {
  const s = await openConfirmDialog('警告', '确定要解除绑定吗？此操作不可逆转！', 'red')
  if (!s) return
  delBtnLoading.value = true
  const { msg } = await deleteWebAuthnApi(id)
  showMsg(msg, 'green')
  delBtnLoading.value = false
  handleOk()
}

const handleOk = async () => {
  try {
    cardLoading.value = true
    await getUserInfo()
  } catch (err: any) {
    console.error(err)
    showMsg(err.message, 'red')
  } finally {
    cardLoading.value = false
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
  <v-dialog v-model="open" max-width="600" persistent>
    <v-card
      :title="info?.authDevice ? '已绑定的外部验证器' : '绑定外部验证器'"
      variant="flat"
      :loading="cardLoading"
      :disabled="cardLoading"
    >
      <v-card-text>
        <v-list lines="one">
          <v-list-item
            v-for="(item, i) in info?.authDevice"
            :key="i"
            :title="item.credentialID.slice(0, 10)"
          >
            <template #prepend> # {{ i }} -&nbsp;</template>
            <template #append>
              <!-- <v-icon></v-icon> -->
              <v-btn
                color="red"
                variant="text"
                prepend-icon="mdi-repeat-off"
                @click="deleteAuthDevice(item.credentialID)"
                :loading="delBtnLoading"
              >
                解除绑定
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="getRegOption" color="green" :loading="addBtnLoading">添加新的验证器</v-btn>
        <v-spacer></v-spacer>

        <v-btn @click="handleCancel"> 关闭 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
