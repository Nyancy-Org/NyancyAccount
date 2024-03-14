<script setup lang="ts">
import { ref } from 'vue'
import { indexStore } from '@/stores'
import { RegForm } from '@/types'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { checkEmailApi, sendEmailCodeApi, regApi } from '@/apis/auth'
import { useAuth } from '@/hooks/useAuth'

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
  const { data, retryAfter } = await sendEmailCodeApi({
    email: formData.value.email,
    type: 'reg'
  })
  if (data.code !== 200) {
    sendStatus.value = data.msg
    showMsg(data.msg, 'red')
  } else {
    sendStatus.value = ''
    showMsg(data.msg, 'green')
  }
  num.value = retryAfter
  timer.value = setInterval(() => {
    num.value--
    if (num.value <= 0) {
      clearInterval(timer.value)
    }
  }, 1000)
}

const step = ref<Step>(4)
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
    } finally {
      btnLoading.value = false
    }
  },
  [Step.CODE]: async () => {
    if (formData.value.code.length !== 6) return
    try {
      btnLoading.value = true
      const { msg } = await regApi(formData.value)
      showMsg(msg, 'green')
      step.value++
    } finally {
      btnLoading.value = false
    }
  },
  [Step.SUCCESS]: async () => {}
}

const nextStep = async () => await STEP_ACTION[step.value]()
</script>

<template>
  <v-form ref="form" fast-fail @submit.prevent>
    <v-slide-y-reverse-transition leave-absolute>
      <div
        v-if="step > Step.UNAME && formData.email"
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
          :rules="[(v) => checkUName(v)]"
          label="用户名"
          clearable
          validate-on="blur"
        ></v-text-field>
        <v-row>
          <v-col :sm="6" :cols="12">
            <v-text-field
              v-model="formData.password"
              :rules="[(v) => checkPwd(v)]"
              label="密码"
              type="password"
            ></v-text-field>
          </v-col>
          <v-col :sm="6" :cols="12">
            <v-text-field
              v-model="confirmPwd"
              :rules="[(v) => (v === formData.password ? true : '两次密码不一致')]"
              label="确认密码"
              type="password"
            ></v-text-field>
          </v-col>
        </v-row>
      </div>

      <v-text-field
        v-if="step === Step.EMAIL"
        v-model="formData.email"
        :rules="[(v) => (v.length === 0 ? false : true)]"
        label="一个能用的邮箱"
        type="email"
      ></v-text-field>

      <div v-if="step === Step.CODE">
        <v-otp-input v-model="formData.code" @finish="nextStep"></v-otp-input>
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
          <v-col cols="12" sm="6">
            <v-btn
              v-if="step === Step.CODE && num === 0"
              size="large"
              variant="text"
              color="primary"
              block
              @click="sendEmailCode"
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
