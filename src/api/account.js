import request from '@/utils/request'

export function changePassword(changePasswordVM) {
  return request.post('/api/account/change-password', changePasswordVM)
}
