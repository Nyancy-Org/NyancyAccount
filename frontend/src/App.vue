<script lang="ts" setup>
import { RouterView } from 'vue-router'
import Footer from './components/Footer.vue'
import Snackbar from './components/Snackbar.vue'
import FloatingMenu from './components/FloatingMenu.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'
import { indexStore } from './stores'

const { progressLinear } = indexStore()
const GLOBAL_COMPONENTS = [Footer, Snackbar, FloatingMenu, ConfirmDialog]
</script>

<template>
  <v-app>
    <v-progress-linear
      v-if="progressLinear > 0"
      color="primary"
      :model-value="progressLinear"
      style="z-index: 9999"
    ></v-progress-linear>
    <v-main>
      <v-container class="h-100">
        <RouterView v-slot="{ Component }">
          <v-fade-transition>
            <component :is="Component" />
          </v-fade-transition>
        </RouterView>
      </v-container>
    </v-main>

    <component v-for="(c, i) in GLOBAL_COMPONENTS" :key="i" :is="c" />
  </v-app>
</template>
