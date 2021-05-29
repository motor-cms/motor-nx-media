import { RouteRecordRaw } from 'vue-router'
import checkAuth from '@/router/checkAuth'

const routes: Array<RouteRecordRaw> = [
  /**
   * Files
   */
  {
    path: '/admin/motor-media/files',
    name: 'admin.motor-media.files',
    meta: {
      layout: 'AdminLayout', // we add new meta layout here to use it later
      title: 'motor-media.files.files',
    },
    beforeEnter: checkAuth,
    component: () => import('motor-media/views/admin/files/index.vue'),
  },
  {
    path: '/admin/motor-media/files/create',
    name: 'admin.motor-media.files.create',
    meta: {
      title: 'motor-media.files.files',
      breadcrumbs: [
        {
          route: 'admin.motor-media.files',
          name: 'motor-media.files.files',
        },
        {
          name: 'motor-media.files.new',
        },
      ],
    },
    beforeEnter: checkAuth,
    component: () => import('motor-media/views/admin/files/edit.vue'),
  },
  {
    path: '/admin/motor-media/files/edit/:id',
    name: 'admin.motor-media.files.edit',
    meta: {
      title: 'motor-media.files.files',
      breadcrumbs: [
        {
          route: 'admin.motor-media.files',
          name: 'motor-media.files.files',
        },
        {
          name: 'motor-media.files.edit',
        },
      ],
    },
    beforeEnter: checkAuth,
    component: () => import('motor-media/views/admin/files/edit.vue'),
  },
]

export default routes
