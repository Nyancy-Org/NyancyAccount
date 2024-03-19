import { UserStatus } from '.'
export const userStatus: Record<UserStatus, string> = {
  [UserStatus.BANNED]: '封禁',
  [UserStatus.NORMAL]: '正常'
}
