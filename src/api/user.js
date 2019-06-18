import request from '../utils/request'

export default {
  createUser: (userVM) => {
    return request.post('/api/user', userVM)
  },
  updateUser: (userVM) => {
    return request.put('/api/user', userVM)
  },
  deleteUser: (login) => {
    return request.delete('/api/user/' + login)
  },
  getUsers: (query) => {
    return request.get('/api/users', { params: query })
  },
  checkUserLogin: (login) => {
    return request.get('/openapi/user/check/' + login)
  },
  getUserAuthorities: () => {
    return request.get('/api/user/authorities')
  },
  changePassword: (login, changePasswordVM) => {
    return request.post('/api/user/change-password/' + login, changePasswordVM)
  }
}
