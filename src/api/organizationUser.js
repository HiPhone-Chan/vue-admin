import request from '@/utils/request'

export function getOrganizationUsers(query) {
  return request.get('/api/manager/organization-users', { params: query })
}

export function saveOrganizationUser(query) {
  return request.post('/api/manager/organization-user', query)
}

export function deleteOrganizationUser(query) {
  return request.delete('/api/manager/organization-user', { params: query })
}

