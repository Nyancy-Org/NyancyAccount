<script lang="ts" setup>
import { ref } from 'vue'

// dialogs
import changeUName from './dialog/changeUName.vue'
import changeEmail from './dialog/changeEmail.vue'
import changePwd from './dialog/changePwd.vue'
import bindAN from './dialog/bindAN.vue'

const changeUNameDialog = ref<InstanceType<typeof changeUName>>()
const changeEmailDialog = ref<InstanceType<typeof changeEmail>>()
const changePwdDialog = ref<InstanceType<typeof changePwd>>()
const bindANDialog = ref<InstanceType<typeof bindAN>>()

const btns = [
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
    click: () => bindANDialog.value?.openDialog()
  }
]
</script>

<template>
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

  <changeUName ref="changeUNameDialog" />
  <changeEmail ref="changeEmailDialog" />
  <changePwd ref="changePwdDialog" />
  <bindAN ref="bindANDialog" />
</template>
