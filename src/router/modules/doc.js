import Layout from '@/layout'

export default {
  path: '/doc',
  component: Layout,
  // redirect: 'noredirect',
  meta: {
    title: 'doc',
    icon: 'documentation'
  },
  children: [
    {
      path: 'api',
      component: () => import('@/views/doc/api'),
      name: 'api',
      meta: {
        title: 'api',
        icon: 'documentation',
        noCache: true
      }
    }
  ]
}
