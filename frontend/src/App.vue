<script setup lang="ts">
import { RouterView } from 'vue-router'
import Footer from './components/Footer.vue'
import Snackbar from './components/Snackbar.vue'
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
        <v-fade-transition>
          <RouterView />
        </v-fade-transition>
      </v-container>
    </v-main>

    <Footer></Footer>
    <Snackbar />
  </v-app>
</template>
