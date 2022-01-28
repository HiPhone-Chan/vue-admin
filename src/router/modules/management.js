import Layout from '@/layout'

const managementRouter = {
  path: '/management',
  component: Layout,
  // redirect: 'noredirect',
  meta: {
    title: 'management',
    icon: 'user',
    roles: ['ROLE_ADMIN']
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/management/user'),
      name: 'user',
      meta: {
        title: 'user-management',
        icon: 'people',
        noCache: true
      }
    }, {
      path: 'operation-logs',
      component: () => import('@/views/management/operation-log'),
      name: 'operation-log',
      meta: {
        title: 'operation-log',
        icon: 'documentation',
        noCache: true
      }
    }, {
      path: 'logs',
      component: () => import('@/views/management/logs'),
      name: 'logs',
      meta: {
        title: 'logs',
        icon: 'documentation',
        noCache: true
      }
    }, {
      path: 'health',
      component: () => import('@/views/management/health'),
      name: 'health',
      meta: {
        title: 'health',
        icon: 'documentation',
        noCache: true
      }
    }, {
      path: 'configuration',
      component: () => import('@/views/management/configuration'),
      name: 'configuration',
      meta: {
        title: 'configuration',
        icon: 'documentation',
        noCache: true
      }
    }
  ]
}

export default managementRouter
