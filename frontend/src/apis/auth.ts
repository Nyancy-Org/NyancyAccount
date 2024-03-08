import { LoginForm, UserInfoRes } from '@/types'
import axios from '@/utils/request'

export const loginApi = async (formData: LoginForm) => {
  const { data }: { data: UserInfoRes } = await axios.post('/auth/login?t_=' + Date.now(), formData)
  return data
}
