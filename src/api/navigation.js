import request from '@/utils/request'

export function getNavigations(query) {
  return request.get('/api/manager/navigations', { params: query })
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
