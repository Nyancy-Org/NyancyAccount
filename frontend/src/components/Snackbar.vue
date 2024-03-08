<template>
  <v-snackbar
    v-model="store.snackbar.show"
    :timeout="store.snackbar.timeout"
    :color="store.snackbar.color"
    :location="(store.snackbar.location as any)"
  >
    {{ store.snackbar.text }}

    <template v-slot:actions>
      <v-btn
        :color="store.snackbar.color + '-accent'"
        variant="text"
        @click="store.snackbar.show = false"
      >
        关闭
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts" setup>
import { indexStore } from "@/stores";
const store = indexStore();
</script>
