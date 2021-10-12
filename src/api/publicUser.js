import request from '@/utils/request'

export function getAuthorities() {
  return request.get('/api/authorities')
}

export function getAllPublicUsers(publicUserVM) {
  return request.get('/api/users', publicUserVM)
}
