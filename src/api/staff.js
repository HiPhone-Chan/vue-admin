import request from '@/utils/request'

export function createStaff(staffVM) {
  return request.post('/api/manager/staff', staffVM)
}

export function updateStaff(staffVM) {
  return request.put('/api/manager/staff', staffVM)
}

export function deleteStaff(login) {
  return request.delete('/api/manager/staff?login=' + login)
}

export function getStaffs(query) {
  return request.get('/api/manager/staffs', { params: query })
}

export function changePassword(login, changePasswordVM) {
  return request.put('/api/manager/staff/change-password/' + login, changePasswordVM)
}
