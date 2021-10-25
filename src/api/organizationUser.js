import request from '@/utils/request'

export function getOrganizationUsers(query) {
  return request.get('/api/organization-users', { params: query })
}

export function saveOrganizationUser(query) {
  return request.post('/api/manager/organization-user', query)
}

export function deleteOrganizationUser(query) {
  return request.delete('/api/organization-user', { params: query })
}

