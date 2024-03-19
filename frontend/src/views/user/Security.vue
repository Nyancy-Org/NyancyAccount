<script lang="ts" setup>
import { ref } from 'vue'
import { userStore } from '@/stores/user'
import { userStatus } from '@/types/const'

// dialogs
import changeUName from './dialog/changeUName.vue'

const changeUNameDialog = ref<InstanceType<typeof changeUName>>()

const { info } = userStore()

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
    click: () => {}
  },
  {
    title: '更改密码',
    icon: 'lock-reset',
    color: '',
    click: () => {}
  }
]
</script>

<template>
  <v-card-text>
    <v-list lines="one" class="pt-0">
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
</template>
