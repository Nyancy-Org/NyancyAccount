<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { indexStore } from '@/stores'

const props = defineProps<{
  text: string
}>()
const { showMsg } = indexStore()
const { copy, copied, isSupported } = useClipboard()

const toCopy = async () => {
  if (!isSupported.value) return showMsg('你的浏览器不支持 Clipboard API', 'red')
  try {
    await copy(props.text ?? '')
    if (copied.value) return showMsg('复制成功', 'green', 'bottom center')
  } catch (err: any) {
    showMsg(err.message, 'red')
  }
}
</script>

<template>
  <v-tooltip text="点击复制">
    <template v-slot:activator="{ props: act }">
      <slot :act="act" :copy="toCopy" style="cursor: pointer"> </slot>
    </template>
  </v-tooltip>
</template>
