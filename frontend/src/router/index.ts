import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/auth/index.vue'),

      children: [
        {
          path: '',
          component: () => import('../views/auth/Normal.vue'),
          meta: {
            title: '让我们开始吧~',
            image: '058.png'
          }
        },
        {
          path: 'login',
          component: () => import('../views/auth/Login.vue'),
          meta: {
            title: '登录',
            image: '069.png'
          }
        }
      ]
    }
  ]
})

export default router
