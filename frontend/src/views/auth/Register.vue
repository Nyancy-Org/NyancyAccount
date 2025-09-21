<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import md5 from 'md5'
import { useDisplay } from 'vuetify'
import { indexStore } from '@/stores'
import { RegForm } from '@/types'
import type { VForm } from 'vuetify/lib/components/index.mjs'
import { checkEmailApi, sendEmailCodeApi, regApi, loginApi } from '@/apis/auth'
import { useAuth } from '@/hooks/useAuth'

const emit = defineEmits<{
  update: [type: 'title' | 'image', arg: string]
  reset: []
}>()
const { xs } = useDisplay()
const { showMsg } = indexStore()
const { checkUName, checkPwd } = useAuth()

const form = ref<InstanceType<typeof VForm>>()
const formData = ref<RegForm>({
  email: '',
  username: '',
  password: '',
  code: ''
})
const confirmPwd = ref('')
const timer = ref<NodeJS.Timeout>()
const num = ref(-1)
const sendStatus = ref('')
const btnLoading = ref(false)

const sendEmailCode = async () => {
  if (timer.value) clearInterval(timer.value)
  num.value = -1
  btnLoading.value = true
  const { data, retryAfter } = await sendEmailCodeApi({
    email: formData.value.email,
    type: 'reg'
  })
  btnLoading.value = false
  if (data.code !== 200) {
    sendStatus.value = data.msg
    showMsg(data.msg, 'red')
    emit('update', 'image', '035.png')
  } else {
    sendStatus.value = ''
    showMsg(data.msg, 'green')
    emit('update', 'image', '020.png')
  }
  num.value = retryAfter
  timer.value = setInterval(() => {
    num.value--
    if (num.value <= 0) {
      clearInterval(timer.value)
      emit('update', 'image', '020.png')
    }
  }, 1000)
}

const step = ref<Step>(1)
enum Step {
  UNAME = 1,
  EMAIL,
  CODE,
  SUCCESS
}

const STEP_ACTION = {
  [Step.UNAME]: async () => {
    if (!formData.value.username) return
    try {
      btnLoading.value = true
      if (!form.value) return
      const { valid } = await form.value.validate()
      if (!valid) return
      step.value++
      emit('update', 'image', '015.png')
    } finally {
      btnLoading.value = false
    }
  },
  [Step.EMAIL]: async () => {
    if (!formData.value.email) return
    try {
      btnLoading.value = true
      await checkEmailApi(formData.value)
      step.value++
      sendEmailCode()
      emit('update', 'image', '020.png')
    } finally {
      btnLoading.value = false
    }
  },
  [Step.CODE]: async () => {
    if (formData.value.code.length !== 6) return
    try {
      btnLoading.value = true
      const { msg } = await regApi(formData.value)
      emit('update', 'title', msg)
      emit('update', 'image', '079.png')
      step.value++
    } finally {
      btnLoading.value = false
    }
  },
  [Step.SUCCESS]: async () => {}
}

const nextStep = async () => await STEP_ACTION[step.value]()

const toUserCenter = async () => {
  btnLoading.value = true
  try {
    await loginApi({
      username: formData.value.username,
      password: formData.value.password
    })
    // 登录后相关操作
    window.location.href = '/user/info'
  } finally {
    btnLoading.value = false
  }
}

onUnmounted(() => emit('reset'))
</script>

<template>
  <v-form ref="form" fast-fail @submit.prevent>
    <v-slide-y-reverse-transition leave-absolute>
      <div
        v-if="step > Step.UNAME && step < Step.SUCCESS && formData.email"
        class="mt-n3 d-flex flex-wrap justify-center ga-3"
        :class="{ 'my-4': step !== Step.CODE }"
      >
        <v-chip prepend-icon="mdi-account-circle-outline" color="primary">
          {{ formData.email }} {{ formData.username && `(${formData.username})` }}
        </v-chip>

        <v-chip
          v-if="step === Step.CODE && num > 0 && sendStatus !== ''"
          prepend-icon="mdi-robot-angry-outline"
          color="error"
        >
          你的操作太快了，请等待 {{ num }} 秒后重试
        </v-chip>
        <v-chip
          v-else-if="step === Step.CODE && num > 0"
          prepend-icon="mdi-robot-happy-outline"
          color="success"
        >
          已发送验证码，{{ num }} 秒后可重新发送
        </v-chip>
        <v-chip
          v-if="step === Step.CODE && num === -1"
          prepend-icon="mdi-robot-outline"
          color="warning"
        >
          验证码发送中...
        </v-chip>
      </div>
    </v-slide-y-reverse-transition>

    <v-slide-x-transition group leave-absolute>
      <div v-if="step === Step.UNAME">
        <v-text-field
          v-model="formData.username"
          autofocus
          :rules="[(v) => checkUName(v)]"
          label="用户名"
          clearable
          validate-on="blur"
        ></v-text-field>
        <v-row :no-gutters="xs">
          <v-col :sm="6" :cols="12">
            <v-text-field
              v-model="formData.password"
              :rules="[(v) => checkPwd(v)]"
              clearable
              label="密码"
              type="password"
            ></v-text-field>
          </v-col>
          <v-col :sm="6" :cols="12">
            <v-text-field
              v-model="confirmPwd"
              :rules="[(v) => (v === formData.password ? true : '两次密码不一致')]"
              clearable
              label="确认密码"
              type="password"
            ></v-text-field>
          </v-col>
        </v-row>
      </div>

      <v-text-field
        v-if="step === Step.EMAIL"
        v-model="formData.email"
        autofocus
        :rules="[(v) => (v && v.length > 0 ? true : false)]"
        label="一个能用的邮箱"
        type="email"
      ></v-text-field>

      <div v-if="step === Step.CODE">
        <v-otp-input
          v-model="formData.code"
          autofocus
          class="mb-1"
          :disabled="btnLoading"
          @finish="nextStep"
        ></v-otp-input>
      </div>

      <div v-if="step === Step.SUCCESS">
        <v-card class="mx-auto" max-width="400" color="primary" variant="tonal">
          <v-card-text>
            <v-list-item class="w-100">
              <v-list-item-title>{{ formData.username }}</v-list-item-title>

              <v-list-item-subtitle>{{ formData.email }}</v-list-item-subtitle>

              <template v-slot:append>
                <v-avatar
                  :image="`https://cdn.imlazy.ink:233/avatar/${md5(formData.email)}?s=100&r=R&d=`"
                ></v-avatar>
              </template>
            </v-list-item>
          </v-card-text>
          <v-card-actions class="d-flex justify-center">
            <v-btn @click="toUserCenter" :loading="btnLoading"> 前往用户中心 </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </v-slide-x-transition>

    <v-btn
      v-if="step === 1"
      size="large"
      color="primary"
      type="submit"
      block
      :loading="btnLoading"
      @click="nextStep"
      >下一步</v-btn
    >
    <v-row v-else-if="step < Step.SUCCESS">
      <v-col cols="12" sm="6">
        <v-row>
          <v-col cols="12" sm="6">
            <v-btn size="large" variant="text" color="warning" block @click="step--">上一步</v-btn>
          </v-col>
          <v-col cols="12" sm="6" v-if="step === Step.CODE && num === 0">
            <v-btn size="large" variant="text" color="primary" block @click="sendEmailCode"
              >重新发送</v-btn
            >
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn
          size="large"
          color="primary"
          type="submit"
          block
          :loading="btnLoading"
          @click="nextStep"
          >下一步</v-btn
        >
      </v-col>
    </v-row>
  </v-form>
</template>
