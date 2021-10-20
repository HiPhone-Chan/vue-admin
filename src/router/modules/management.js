import Layout from '@/layout'

const managementRouter = {
  path: '/management',
  component: Layout,
  // redirect: 'noredirect',
  meta: {
    title: 'management',
    icon: 'user',
    roles: ['ROLE_ADMIN', 'ROLE_MANAGER']
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/management/user'),
      name: 'user',
      meta: {
        title: 'user-management',
        icon: 'people',
        roles: ['ROLE_ADMIN'],
        noCache: true
      }
    },
    {
      path: 'operation-log',
      component: () => import('@/views/management/log'),
      name: 'operation-log',
      meta: {
        title: 'operation-log',
        icon: 'documentation',
        roles: ['ROLE_ADMIN'],
        noCache: true
      }
    },
    {
      path: 'menu',
      component: () => import('@/views/management/navigation'),
      name: 'menu',
      meta: {
        title: '菜单管理',
        icon: 'el-icon-menu',
        noCache: true
      }
    },
    {
      path: 'organization',
      component: () => import('@/views/management/organization'),
      name: 'organization',
      meta: {
        title: '组织管理',
        icon: 'el-icon-s-custom',
        noCache: true
      }
    },
    {
      path: 'staffRole',
      component: () => import('@/views/management/staffRole'),
      name: 'role',
      meta: {
        title: '角色管理',
        icon: 'el-icon-s-data',
        noCache: true
      }
    },
    {
      path: 'userRole',
      component: () => import('@/views/management/userRole'),
      name: 'userRole',
      meta: {
        title: '人员管理',
        icon: 'el-icon-user-solid',
        noCache: true
      }
    },
    {
      path: 'api',
      component: () => import('@/views/management/api'),
      name: 'api',
      meta: {
        title: 'Api管理',
        icon: 'el-icon-document',
        noCache: true
      }
    },
    {
      path: 'navigationApi',
      component: () => import('@/views/management/navigationApi'),
      name: 'navigationApi',
      hidden: true,
      meta: {
        title: '菜单Api管理',
        icon: 'el-icon-menu',
        noCache: true
      }
    },
    {
      path: 'organizationUser',
      component: () => import('@/views/management/organizationUser'),
      name: 'organizationUser',
      hidden: true,
      meta: {
        title: '组织人员管理',
        icon: 'el-icon-s-check',
        noCache: true
      }
    },
    {
      path: 'addressBook',
      component: () => import('@/views/management/addressBook'),
      name: 'addressBook',
      meta: {
        title: '通讯录',
        icon: 'el-icon-phone',
        noCache: true
      }
    }
  ]
}

export default managementRouter
