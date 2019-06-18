import Layout from '@/layout'

const managementRouter = {
  path: '/management',
  component: Layout,
  redirect: 'noredirect',
  meta: {
    title: 'managerment',
    icon: 'user'
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/management/user'),
      name: 'user',
      meta: {
        title: 'user-managerment',
        icon: 'people',
        noCache: true,
        roles: ['ROLE_ADMIN']
      }
    }
  ]
}

export default managementRouter
