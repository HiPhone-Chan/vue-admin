import Layout from '@/layout'

const accountRouter = {
  path: '/account',
  component: Layout,
  redirect: 'noredirect',
  meta: {
    title: 'account',
    icon: 'user'
  },
  children: [
    {
      path: 'change-password',
      component: () => import('@/views/account/changePassword'),
      name: 'changePassword',
      meta: {
        title: 'changePassword',
        icon: 'lock',
        noCache: true
      }
    }
  ]
}
export default accountRouter
