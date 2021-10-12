import request from '@/utils/request'

export function getNavigationApis(query) {
  return request.get('/api/manager/navigation-api/apis', { params: query })
}

export function getStaffNavigationApis(query) {
  return request.get('/api/navigation-api/apis', { params: query })
}

export function createNavigationApi(data) {
  return request.post('/api/manager/navigation-api', data)
}
export function deleteNavigationApi(query) {
  return request.delete('/api/manager/navigation-api', { params: query })
}
