import request from '@/utils/request'

export function getRoleApis(query) {
  return request.get('/api/manager/role-api/apis', { params: query })
}

export function saveRoleApi(roleApiVM) {
  return request.put('/api/manager/role-api', roleApiVM)
}
