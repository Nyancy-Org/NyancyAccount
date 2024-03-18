import axios_ from 'axios'
import { indexStore } from '@/stores'

const { showMsg } = indexStore()

const baseURL = '/v1'
const axios = axios_.create({
  baseURL: baseURL,
  timeout: 5000
})

const defaultInterceptor = axios.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response
  },
  function (err) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    showMsg(err.response.data.msg || err.message, 'red')
    return Promise.reject(err)
  }
)

export { axios, defaultInterceptor, baseURL }
