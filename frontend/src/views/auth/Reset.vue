<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { indexStore } from '@/stores'
import { RegForm } from '@/types'
import type { VForm } from 'vuetify/lib/components/index.mjs'
import { sendEmailLinkApi, resetPwdApi } from '@/apis/auth'
import { useAuth } from '@/hooks/useAuth'
import { useRouteQuery } from '@vueuse/router'
import { onMounted } from 'vue'

const emit = defineEmits<{
  update: [type: 'title' | 'image', arg: string]
  reset: []
}>()
const { showMsg, openConfirmDialog } = indexStore()
const { checkPwd } = useAuth()

const form = ref<InstanceType<typeof VForm>>()
const formData = ref<RegForm>({
  email: '',
  username: '',
  password: '',
  code: ''
})
const confirmPwd = ref('')
const timer = ref<NodeJS.Timeout>()
const num = ref(0)
const sendStatus = ref('')
const btnLoading = ref(false)
const token = useRouteQuery('token')

const sendEmailLink = async () => {
  if (timer.value) clearInterval(timer.value)
  num.value = -1
  const { data, retryAfter } = await sendEmailLinkApi({
    email: formData.value.email,
    type: 'resetPwd'
  })
  if (data.code !== 200) {
    sendStatus.value = data.msg
    showMsg(data.msg, 'red')
    emit('update', 'image', '035.png')
  } else {
    sendStatus.value = ''
    showMsg(data.msg, 'green')
    emit('update', 'image', '041.png')
    openConfirmDialog(
      '注意',
      `我们已向你的邮箱 ${formData.value.email} 发送了一封电子邮件，请前往邮箱内点击验证地址以继续。`,
      'warning'
    )
  }
  num.value = retryAfter
  timer.value = setInterval(() => {
    num.value--
    if (num.value <= 0) {
      clearInterval(timer.value)
      emit('update', 'image', '041.png')
    }
  }, 1000)
}

const step = ref<Step>(1)
enum Step {
  EMAIL = 1,
  CODE,
  SUCCESS
}

const STEP_ACTION = {
  [Step.EMAIL]: async () => {
    if (!form.value) return
    const { valid } = await form.value.validate()
    if (!valid) return
    try {
      btnLoading.value = true
      await sendEmailLink()
    } finally {
      btnLoading.value = false
    }
  },
  [Step.CODE]: async () => {
    if (!form.value) return
    const { valid } = await form.value.validate()
    if (!valid) return
    try {
      btnLoading.value = true
      formData.value.code = token.value as string
      const { msg } = await resetPwdApi(formData.value)
      emit('update', 'title', msg)
      emit('update', 'image', '022.png')
      step.value++
    } finally {
      btnLoading.value = false
    }
  },
  [Step.SUCCESS]: async () => {}
}

const nextStep = async () => await STEP_ACTION[step.value]()

onUnmounted(() => emit('reset'))
onMounted(() => {
  if (token.value) step.value++
})
</script>

<template>
  <v-form ref="form" fast-fail @submit.prevent>
    <v-slide-y-reverse-transition leave-absolute>
      <div
        v-if="step <= Step.EMAIL && step < Step.SUCCESS && formData.email"
        class="mt-n3 d-flex flex-wrap justify-center ga-3"
        :class="{ 'my-4': step !== Step.CODE }"
      >
        <v-chip
          v-if="num > 0 && sendStatus !== ''"
          prepend-icon="mdi-robot-angry-outline"
          color="error"
        >
          请等待 {{ num }} 秒后重试
        </v-chip>
        <v-chip v-else-if="num > 0" prepend-icon="mdi-robot-happy-outline" color="success">
          已发送验证码，{{ num }} 秒后可重新发送
        </v-chip>
        <v-chip v-if="num === -1" prepend-icon="mdi-robot-outline" color="warning">
          验证码发送中...
        </v-chip>
      </div>
    </v-slide-y-reverse-transition>

    <v-slide-x-transition group leave-absolute>
      <v-text-field
        v-if="step === Step.EMAIL"
        v-model="formData.email"
        autofocus
        clearable
        :rules="[(v) => (v.length === 0 ? false : true)]"
        label="你的邮箱"
        type="email"
      ></v-text-field>

      <div v-if="step === Step.CODE">
        <v-text-field
          v-model="formData.password"
          autofocus
          clearable
          :rules="[(v) => checkPwd(v)]"
          label="新的密码"
          type="password"
        ></v-text-field>

        <v-text-field
          v-model="confirmPwd"
          :rules="[(v) => (v === formData.password ? true : '两次密码不一致')]"
          clearable
          label="确认密码"
          type="password"
        ></v-text-field>
      </div>

      <div v-if="step === Step.SUCCESS" class="d-flex justify-center">
        <v-btn to="/auth/login" color="primary" variant="tonal"> 返回登录 </v-btn>
      </div>
    </v-slide-x-transition>

    <v-row v-if="step === 1">
      <v-col cols="12" sm="6">
        <v-btn size="large" variant="text" color="warning" block to="/auth/login"
          >我又想起来了</v-btn
        >
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
    <v-btn
      v-else-if="step < Step.SUCCESS"
      size="large"
      color="primary"
      type="submit"
      block
      :loading="btnLoading"
      @click="nextStep"
      >下一步</v-btn
    >
  </v-form>
</template>
