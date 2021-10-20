import { asyncRoutes, constantRoutes } from '@/router'
import Layout from '@/layout'
import { getNavigationTrees } from '@/api/navigation'

function generateStaffRoutes(router, tree) {
  router.path = tree.path
  router.component = Layout
  router.meta = {
    title: tree.title,
    icon: tree.icon,
    id: tree.id
  }

  if (tree.children[0]) {
    const children = []
    for (const child of tree.children) {
      const childRouter = {}
      children.push(generateStaffRoutes(childRouter, child))
      childRouter.component = resolve => require(['@/views' + child.path], resolve)
    }
    router.children = children
  } else {
    router.children = []
    router.path = '/'
    router.children.push(
      {
        path: tree.path,
        component: resolve => require(['@/views' + tree.path], resolve),
        meta: {
          title: tree.title,
          icon: tree.icon,
          id: tree.id
        }
      }
    )
  }
  return router
}

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      let accessedRoutes
      if (roles.includes('ROLE_ADMIN')) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      if (roles.includes('ROLE_STAFF')) {
        getNavigationTrees().then(res => {
          const { data } = res
          for (const item of data) {
            const router = {}
            generateStaffRoutes(router, item)
            accessedRoutes.push(router)
          }
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        })
      } else {
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
