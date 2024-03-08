<template>
  <v-footer app>
    <div class="text-center w-100 text-disabled">
      &copy; Copyright {{ new Date().getFullYear() }} <strong class="text-primary">Lazy</strong> All
      Right Reserved
    </div>
  </v-footer>
</template>

<style lang="scss" scoped>
footer {
  background: transparent;
  backdrop-filter: blur(10px);
  strong {
    opacity: 0.7;
  }
}
</style>
