<script lang="ts" setup>
import { ref } from 'vue'
import { useAuth } from '@/hooks/useAuth'
import { updateUInfoApi } from '@/apis/user'
import { indexStore } from '@/stores'
import { userStore } from '@/stores/user'

const open = ref(false)
const openDialog = () => {
  open.value = true
}

const { showMsg } = indexStore()
const { getUserInfo } = userStore()
const btnLoading = ref(false)
const { checkUName } = useAuth()
const username = ref('')

const handleOk = async () => {
  try {
    btnLoading.value = true
    const { msg } = await updateUInfoApi('name', { username: username.value })
    await getUserInfo()
    showMsg(msg, 'green')
    username.value = ''
    handleCancel()
  } finally {
    btnLoading.value = false
  }
}

const handleCancel = async () => {
  username.value = ''
  open.value = false
}

defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="open" max-width="400" persistent>
    <v-card title="更改用户名" variant="flat">
      <v-card-text class="py-0 pt-5">
        <v-text-field
          v-model="username"
          :rules="[(v) => checkUName(v)]"
          autofocus
          clearable
          label="新的用户名"
          validate-on="blur"
        ></v-text-field>
        <small><b>注意：</b>更改后，原绑定的PassKey将会被删除，需要重新绑定！</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="handleCancel"> 取消 </v-btn>

        <v-btn @click="handleOk" color="primary" :loading="btnLoading"> 确定 </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
