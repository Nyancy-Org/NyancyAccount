<script lang="ts" setup>
import { ref } from 'vue'
import { indexStore } from '@/stores'
import type { VForm } from 'vuetify/lib/components/index.mjs'
import _ from 'lodash'
import { updateConfigApi } from '@/apis/site'
import { SiteOptions } from '@/types'

const emit = defineEmits(['update'])
const btnLoading = ref(false)
const { showMsg } = indexStore()
const form = ref<InstanceType<typeof VForm>>()
const formData = ref<SiteOptions>({
  id: 0,
  note: '',
  value: '',
  optionName: '',
  updatedAt: new Date()
})
const open = ref(false)

const openDialog = (config: SiteOptions) => {
  open.value = true
  formData.value = _.cloneDeep(config)
}

const handleOk = async () => {
  try {
    if (!form.value) return
    const { valid } = await form.value.validate()
    if (!valid) return
    btnLoading.value = true
    const { msg } = await updateConfigApi(formData.value)
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

defineExpose({
  openDialog
})
</script>

<template>
  <v-dialog v-model="open" max-width="500" persistent>
    <v-card title="编辑" variant="flat">
      <v-card-text class="py-0 pt-5">
        <v-form ref="form" fast-fail @submit.prevent>
          <v-text-field
            v-model="formData.note"
            :rules="[(v) => (v ? true : false)]"
            clearable
            label="备注"
            density="compact"
            :disabled="btnLoading"
          >
          </v-text-field>
          <v-text-field
            v-model="formData.value"
            :rules="[(v) => (v && v.length > 0 ? true : false)]"
            clearable
            label="值"
            density="compact"
            :disabled="btnLoading"
          >
          </v-text-field>
          <v-text-field
            :model-value="new Date(formData.updatedAt).toLocaleString()"
            readonly
            label="最后更新"
            density="compact"
          ></v-text-field>
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
