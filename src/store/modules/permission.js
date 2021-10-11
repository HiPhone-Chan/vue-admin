import { asyncRoutes, constantRoutes } from '@/router'
import Layout from '@/layout'
import { getNavigationTrees } from '@/api/navigation'

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
      console.log(roles)
      if (roles.includes('ROLE_STAFF')) {
        getNavigationTrees().then(res => {
          console.log(res)
          const { data } = res
          for (let i = 0; i < data.length; i++) {
            accessedRoutes.push(
              {
                path: '/management',
                component: Layout,
                redirect: data[i].path,
                children: [
                  { component: () => import('@/views' + data[i].path),
                    path: data[i].path,
                    name: data[i].title,
                    meta: { title: data[i].title, noCache: true, icon: data[i].icon, id: data[i].id },
                    children: data[i].children
                  }
                ]
              }
            )
          }
          commit('SET_ROUTES', accessedRoutes)
          resolve(accessedRoutes)
        })
        // getNavigations().then(async response => {
        //   const { data } = response
        //   for (let i = 0; i < data.length; i++) {
        //     await getChildrenData(data[i])
        //     accessedRoutes.push(
        //       {
        //         path: data[i].path,
        //         component: () => import('@/views/error-page/401'),
        //         name: data[i].title,
        //         meta: { title: data[i].title, noCache: true, icon: data[i].icon },
        //         children: data[i].children
        //       }
        //     )
        //   }
        //   commit('SET_ROUTES', accessedRoutes)
        //   resolve(accessedRoutes)
        // })
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
