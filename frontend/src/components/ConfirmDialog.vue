<script lang="ts" setup>
import { indexStore } from '@/stores'

const { confirmDialog } = indexStore()

const handleOk = async () => {
  confirmDialog.value.show = false
  confirmDialog.value.resolve(true)
}

const handleCancel = async () => {
  confirmDialog.value.show = false
  confirmDialog.value.reject(new Error('[Confirm Dialog] 用户取消操作'))
}
</script>

<template>
  <v-dialog v-model="confirmDialog.show" max-width="400" persistent>
    <v-card
      :text="confirmDialog.content"
      :title="confirmDialog.title"
      variant="flat"
      :color="confirmDialog.color"
    >
      <template v-slot:actions>
        <v-spacer></v-spacer>

        <v-btn @click="handleCancel"> 取消 </v-btn>

        <v-btn @click="handleOk"> 确定 </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
