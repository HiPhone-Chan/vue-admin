import request from '@/utils/request'

export function login(data) {
  return request({ url: '/api/authenticate', method: 'post', data })
}

export function getInfo() {
  return request({ url: '/api/account', method: 'get' })
}

export function logout() {
  // return request({url: '/login/logout', method: 'post'})
  return Promise.resolve()
}
