import request from '@/utils/request'

export function getRoles(query) {
  return request.get('/api/manager/roles', { params: query })
}

export function createRole(roleVM) {
  return request.post('/api/manager/role', roleVM)
}

export function updateRole(roleVM) {
  return request.put('/api/manager/role', roleVM)
}

export function deleteRole(id) {
  return request.delete('/api/manager/role?id=' + id)
}
