<template>
  <v-row>
    <v-col align="center">
      <v-btn
        prepend-icon="mdi-emoticon-cry-outline"
        size="large"
        color="warning"
        variant="tonal"
        stacked
        to="/auth/register"
        >我还未拥有账号</v-btn
      >
    </v-col>
    <v-col align="center">
      <v-btn
        prepend-icon="mdi-emoticon-excited-outline"
        size="large"
        color="primary"
        variant="tonal"
        stacked
        to="/auth/login"
        >我已经注册了~</v-btn
      >
    </v-col>
  </v-row>
</template>
