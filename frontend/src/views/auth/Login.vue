<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { indexStore } from '@/stores'
import { LoginForm } from '@/types'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { loginApi, getWebAuthnAuthOptionApi, verifyWebAuthnApi } from '@/apis/auth'
import { userStore } from '@/stores/user'
import router from '@/router'
import type { AuthenticationResponseJSON } from '@simplewebauthn/types'
import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser'
import { useDisplay } from 'vuetify'

const { xs } = useDisplay()
const { showMsg, isLogin } = indexStore()
const { info } = storeToRefs(userStore())
const form = ref<InstanceType<typeof VForm>>()
const formData = ref<LoginForm>({
  username: '',
  password: ''
})

const step = ref(1)
const btnLoading = ref(false)
const wBtnLoading = ref(false)

const nextStep = () => formData.value.username && step.value++

const login = async () => {
  try {
    if (!form.value) return
    const { valid } = await form.value.validate()
    if (!valid) return
    btnLoading.value = true
    const { msg, data } = await loginApi(formData.value)
    showMsg(msg, 'green')
    info.value = data
    isLogin.value = true
    router.replace('/user/info')
  } finally {
    btnLoading.value = false
  }
}

const getAuthOption = async () => {
  if (!form.value) return
  const { valid } = await form.value.validate()
  if (!valid) return
  if (!browserSupportsWebAuthn()) return showMsg('你的浏览器不支持 WebAuthn', 'red')
  let aRes: AuthenticationResponseJSON
  try {
    wBtnLoading.value = true
    const { data: option } = await getWebAuthnAuthOptionApi(formData.value)
    aRes = await startAuthentication(option)
  } catch (err: any) {
    if (err.name === 'InvalidStateError') {
      showMsg('Authenticator was probably already registered by user', 'red')
    } else {
      console.error(err)
      showMsg(err.message, 'red')
    }
  } finally {
    wBtnLoading.value = false
  }
  const { msg, data } = await verifyWebAuthnApi(aRes!)
  showMsg(msg, 'green')
  info.value = data
  isLogin.value = true
  router.replace('/user/info')
}
</script>

<template>
  <v-form ref="form" fast-fail @submit.prevent>
    <v-slide-y-reverse-transition leave-absolute>
      <div v-if="step === 2 && formData.username" class="text-center mt-n3 my-4">
        <v-chip prepend-icon="mdi-account-circle-outline" color="primary">
          {{ formData.username }}
        </v-chip>
      </div>
    </v-slide-y-reverse-transition>
    <v-slide-x-transition leave-absolute>
      <v-text-field
        v-if="step === 1"
        autofocus
        v-model="formData.username"
        :rules="[(v) => (v.length === 0 ? false : true)]"
        label="用户名或邮箱"
      ></v-text-field>
      <v-text-field
        v-if="step === 2"
        autofocus
        v-model="formData.password"
        :rules="[(v) => (v.length === 0 ? false : true)]"
        label="密码"
        type="password"
      ></v-text-field>
    </v-slide-x-transition>

    <v-row v-if="step === 1">
      <v-col cols="12" sm="7">
        <v-row>
          <v-col cols="12" sm="6">
            <v-btn size="large" variant="text" color="primary" block to="/auth/reset"
              >忘记密码</v-btn
            >
          </v-col>
          <v-col v-if="browserSupportsWebAuthn()" cols="12" sm="6">
            <v-btn
              size="large"
              variant="tonal"
              color="green"
              block
              @click="getAuthOption"
              :loading="wBtnLoading"
              >使用外部验证器</v-btn
            >
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" sm="5">
        <v-btn size="large" color="primary" type="submit" block @click="nextStep">下一步</v-btn>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" sm="6">
        <v-row>
          <v-col cols="12" sm="6">
            <v-btn size="large" variant="text" color="warning" block @click="step--">上一步</v-btn>
          </v-col>
          <v-col v-if="!xs" cols="12" sm="6"> </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn
          size="large"
          color="primary"
          type="submit"
          block
          @click="login"
          :loading="btnLoading"
        >
          登录
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>
