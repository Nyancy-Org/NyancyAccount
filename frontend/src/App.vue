<script lang="ts" setup>
import { RouterView } from 'vue-router'
import Footer from './components/Footer.vue'
import Snackbar from './components/Snackbar.vue'
import FloatingMenu from './components/FloatingMenu.vue'
import ConfirmDialog from './components/ConfirmDialog.vue'

const GLOBAL_COMPONENTS = [Footer, Snackbar, FloatingMenu, ConfirmDialog]
</script>

<template>
  <v-app>
    <!-- <v-app-bar :elevation="1" title="NYANCY ACCOUNT">
      <template v-slot:prepend>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <v-navigation-drawer>
      <v-list>
        <v-list-item title="Navigation drawer"></v-list-item>
      </v-list>
    </v-navigation-drawer> -->
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
