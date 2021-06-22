import request from '../utils/request'

export function createUser(userVM) {
  return request.post('/api/user', userVM)
}

export function updateUser(userVM) {
  return request.put('/api/user', userVM)
}

export function deleteUser(login) {
  return request.delete('/api/user/' + login)
}

export function getUsers(query) {
  return request.get('/api/users', { params: query })
}

export function checkUserLogin(login) {
  return request.get('/openapi/user/check/' + login)
}

export function getUserAuthorities() {
  return request.get('/api/user/authorities')
}

export function changePassword(login, changePasswordVM) {
  return request.post('/api/user/change-password/' + login, changePasswordVM)
}

