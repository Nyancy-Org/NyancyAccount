<script lang="ts" setup>
import { ref } from 'vue'
import { arrayFilter } from '@/utils'
import { browserSupportsWebAuthn } from '@simplewebauthn/browser'

// dialogs
import ChangeUName from './dialog/changeUName.vue'
import ChangeEmail from './dialog/changeEmail.vue'
import ChangePwd from './dialog/changePwd.vue'
import BindAN from './dialog/bindAN.vue'
import LoginLogs from './dialog/loginLogs.vue'

const changeUNameDialog = ref<InstanceType<typeof ChangeUName>>()
const changeEmailDialog = ref<InstanceType<typeof ChangeEmail>>()
const changePwdDialog = ref<InstanceType<typeof ChangePwd>>()
const bindANDialog = ref<InstanceType<typeof BindAN>>()
const LoginLogsDialog = ref<InstanceType<typeof LoginLogs>>()

const btns = arrayFilter([
  {
    title: '更改用户名',
    icon: 'account-edit',
    color: '',
    click: () => changeUNameDialog.value?.openDialog()
  },
  {
    title: '更改邮箱',
    icon: 'email-edit-outline',
    color: '',
    click: () => changeEmailDialog.value?.openDialog()
  },
  {
    title: '更改密码',
    icon: 'lock-reset',
    color: '',
    click: () => changePwdDialog.value?.openDialog()
  },
  {
    title: '外部验证器',
    icon: 'fingerprint',
    color: '',
    click: () => bindANDialog.value?.openDialog(),
    condition: () => browserSupportsWebAuthn()
  },
  {
    title: '登录日志',
    icon: 'script-text-key-outline',
    color: '',
    click: () => LoginLogsDialog.value?.openDialog()
  }
])
</script>

<template>
  <div>
    <v-card-text>
      <v-list lines="one" class="pa-0">
        <v-list-item
          v-for="(item, i) in btns"
          :key="i"
          v-ripple
          :title="item.title"
          :color="item.color"
          @click="item.click"
        >
          <template #prepend>
            <v-icon variant="text">mdi-{{ item.icon }}</v-icon>
          </template>
          <template #append>
            <v-icon>mdi-arrow-right</v-icon>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>

    <ChangeUName ref="changeUNameDialog" />
    <ChangeEmail ref="changeEmailDialog" />
    <ChangePwd ref="changePwdDialog" />
    <BindAN ref="bindANDialog" />
    <LoginLogs ref="LoginLogsDialog" />
  </div>
</template>
