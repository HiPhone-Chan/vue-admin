import request from '@/utils/request'

export function getUserRoles(query) {
  return request.get('/api/manager/user-roles', { params: query })
}

export function updateUserRole(userRoleVM) {
  return request.put('/api/manager/user-role', userRoleVM)
}

