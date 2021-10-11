import request from '@/utils/request'

export function getRoleNavigations(roleId) {
  return request.get('/api/manager/navigation-role/navigations?roleId=' + roleId)
}

export function updateNavigationRole(navigationRoleVM) {
  return request.put('/api/manager/navigation-role', navigationRoleVM)
}
