import request from '@/utils/request'

export function getApiInfos(query) {
  return request.get('/api/manager/api-infos', { params: query })
}

export function createApiInfo(apiVM) {
  return request.post('/api/manager/api-info', apiVM)
}

export function updateApiInfo(apiVM) {
  return request.put('/api/manager/api-info', apiVM)
}

export function deleteApiInfo(id) {
  return request.delete('/api/manager/api-info?id=' + id)
}
