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
    },
    {
      path: 'operation-log',
      component: () => import('@/views/management/log'),
      name: 'operation-log',
      meta: {
        title: 'operation-log',
        icon: 'documentation',
        noCache: true
      }
    }
  ]
}

export default managementRouter
