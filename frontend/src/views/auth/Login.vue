<script setup lang="ts">
import { ref } from 'vue'
import { indexStore } from '@/stores'
import { LoginForm } from '@/types'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { loginApi } from '@/apis/auth'

const { showMsg } = indexStore()

const form = ref<InstanceType<typeof VForm>>()
const formData = ref<LoginForm>({
  username: '',
  password: ''
})

const step = ref(1)
const btnLoading = ref(false)

const nextStep = () => formData.value.username && step.value++

const login = async () => {
  try {
    if (!form.value) return
    const { valid } = await form.value.validate()
    if (!valid) return
    btnLoading.value = true
    const data = await loginApi(formData.value)
    showMsg(data.msg, 'green')
  } finally {
    btnLoading.value = false
  }
}
</script>

<template>
  <v-form ref="form" fast-fail @submit.prevent>
    <v-slide-x-transition leave-absolute>
      <v-text-field
        v-if="step === 1"
        v-model="formData.username"
        :rules="[(v) => (v.length === 0 ? false : true)]"
        label="用户名或邮箱"
      ></v-text-field>
      <v-text-field
        v-if="step === 2"
        v-model="formData.password"
        :rules="[(v) => (v.length === 0 ? '请输入密码' : true)]"
        label="密码"
        type="password"
      ></v-text-field>
    </v-slide-x-transition>

    <v-btn v-if="step === 1" size="large" color="primary" type="submit" block @click="nextStep"
      >下一步</v-btn
    >
    <v-row v-else>
      <v-col cols="12" sm="6">
        <v-row>
          <v-col cols="12" sm="6">
            <v-btn size="large" variant="text" color="warning" block @click="step--">上一步</v-btn>
          </v-col>
          <v-col cols="12" sm="6">
            <v-btn size="large" variant="text" color="primary" block>忘记密码</v-btn>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn size="large" color="primary" type="submit" block @click="login" :loading="btnLoading"
          >登录</v-btn
        >
      </v-col>
    </v-row>
  </v-form>
</template>
