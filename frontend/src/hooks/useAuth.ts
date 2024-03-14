import { checkUNameApi } from '@/apis/auth'

export function useAuth() {
  const checkUName = async (v: string) => {
    if (v.length === 0) return false
    if (!/^[a-zA-Z0-9_-]{4,16}$/.test(v)) return '用户名必须为 4-16 位之间'
    const { code } = await checkUNameApi({ username: v })
    return code === 200 ? true : false
  }

  const checkPwd = (v: string) => {
    return /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|\\:;"'<>,.?/~`]{6,20}$/.test(v)
      ? true
      : '密码必须为6-20位之间'
  }

  return {
    checkUName,
    checkPwd
  }
}
