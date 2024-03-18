<template>
  <v-snackbar
    v-model="snackbar.show"
    :timeout="snackbar.timeout"
    :color="snackbar.color"
    :location="snackbar.location as any"
  >
    {{ snackbar.text }}

    <template v-slot:actions>
      <v-btn :color="snackbar.color + '-accent'" variant="text" @click="snackbar.show = false">
        关闭
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
import { indexStore } from '@/stores'
const { snackbar } = indexStore()
</script>
