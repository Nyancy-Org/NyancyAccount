import { ref } from 'vue'
import { defineStore } from 'pinia'
import { UserInfo } from '@/types'
import { getUserInfoApi } from '@/apis/user'
import { AxiosError } from 'axios'
import { indexStore } from '.'

const { isLogin } = indexStore()

export const userStore = defineStore('userStore', () => {
  const info = ref<UserInfo>()

  const isAdmin = () => info.value?.role === 'admin'

  const getUserInfo = async () => {
    try {
      const { data } = await getUserInfoApi()
      info.value = data
      isLogin.value = true
      console.log(isLogin.value)
    } catch (e: any) {
      const err: AxiosError = e
      console.error(err.response)
    }
  }

  return {
    info,
    getUserInfo,
    isAdmin
  }
})
