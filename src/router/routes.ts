import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Login.vue'),
        children: [],
      },
      {
        path: '/index',
        component: () => import('pages/Index.vue'),
        children: [
          {
            path: '',
            name: 'index',
            component: () => import('pages/Chat.vue'),
            children: [],
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue'),
  },
];

export default routes;
