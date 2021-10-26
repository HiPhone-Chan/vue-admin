import request from '@/utils/request'
import qs from 'qs'

export function getNavigations(query) {
  return request.get('/api/manager/navigations', { params: query, paramsSerializer: function(params) {
    const result = qs.stringify(params, { arrayFormat: 'repeat' })
    return result
  } })
}

export function getNavigationTrees() {
  return request.get('/api/navigation/trees')
}

export function createNavigation(navigationVM) {
  return request.post('/api/manager/navigation', navigationVM)
}

export function updateNavigation(navigationVM) {
  return request.put('/api/manager/navigation', navigationVM)
}

export function deleteNavigation(id) {
  return request.delete('/api/manager/navigation?id=' + id)
}
