import request from '@/utils/request'

export function getOrganizations(query) {
  return request.get('/api/manager/organizations', { params: query })
}

export function createOrganization(organizationVM) {
  return request.post('/api/manager/organization', organizationVM)
}

export function updateOrganization(organizationVM) {
  return request.put('/api/manager/organizations', organizationVM)
}

export function deleteOrganization(id) {
  return request.delete('/api/manager/organization?id=' + id)
}
