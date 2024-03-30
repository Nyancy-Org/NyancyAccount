import axios_, { AxiosResponse } from 'axios'
import { indexStore } from '@/stores'

const { showMsg } = indexStore()

const baseURL = '/v1'
const axios = axios_.create({
  baseURL: baseURL,
  timeout: 0
})

axios.interceptors.response.use(
  (response: AxiosResponse) => response,
  (err: any) => {
    !(err.config.baseURL + err.config.url).startsWith(baseURL + '/user/info') &&
      showMsg(err.response?.data.msg || err.message, 'red')
    return Promise.reject(err)
  }
)

export { axios, baseURL }
