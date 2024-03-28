import { createRouter, createWebHistory } from 'vue-router'
import { indexStore } from '@/stores'
import { userStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // index
    {
      path: '/',
      name: 'home',
      meta: {
        title: '首页'
      },
      component: () => import('../views/HomeView.vue')
    },

    // auth
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/auth/index.vue'),

      children: [
        {
          path: '',
          name: 'normal',
          component: () => import('../views/auth/Normal.vue'),
          meta: {
            title: '让我们开始吧~',
            image: '058.png'
          }
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('../views/auth/Login.vue'),
          meta: {
            title: '登录',
            image: '069.png'
          }
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../views/auth/Register.vue'),
          meta: {
            title: '注册',
            image: '054.png'
          }
        },
        {
          path: 'reset',
          name: 'reset',
          component: () => import('../views/auth/Reset.vue'),
          meta: {
            title: '重置密码',
            image: '041.png'
          }
        }
      ]
    },

    // user
    {
      path: '/user',
      name: 'user',
      meta: {
        needLogin: true
      },
      component: () => import('../views/user/index.vue'),

      children: [
        {
          path: '',
          name: 'userRedirect',
          redirect: '/user/info'
        },
        {
          path: 'info',
          name: 'info',
          meta: {
            title: '个人信息'
          },
          component: () => import('../views/user/Info.vue')
        },
        {
          path: 'security',
          name: 'security',
          meta: {
            title: '账号安全'
          },
          component: () => import('../views/user/Security.vue')
        },
        {
          path: 'apps',
          name: 'apps',
          meta: {
            title: 'OAuth2 应用'
          },
          component: () => import('../views/user/Apps.vue')
        }
      ]
    },

    // OAuth 2
    {
      path: '/oauth2',
      name: 'oauth2',
      // meta: {
      //   needLogin: true
      // },
      component: () => import('../views/oauth2/index.vue'),

      children: [
        {
          path: '',
          name: 'oauth2Redirect',
          redirect: '/404'
        },
        {
          path: 'authorize',
          name: 'authorize',
          meta: {
            title: 'Nyancy OAuth2 授权',
            image: '072.png'
          },
          component: () => import('../views/oauth2/Authorize.vue')
        }
      ]
    },

    // admin
    {
      path: '/admin',
      name: 'admin',
      meta: {
        needLogin: true,
        needAdmin: true
      },
      component: () => import('../views/admin/index.vue'),

      children: [
        {
          path: '',
          name: 'oauth2Redirect',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          meta: {
            title: '仪表板'
          },
          component: () => import('../views/admin/Dashboard.vue')
        }
      ]
    },

    // 403
    {
      path: '/403',
      name: '403',
      meta: {
        title: '403 Forbidden'
      },
      component: () => import('../views/error/403.vue')
    },

    // 404
    {
      path: '/404',
      name: '404',
      meta: {
        title: '404 Not Found'
      },
      component: () => import('../views/error/404.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const { isLogin, showMsg } = indexStore()
  const { info } = userStore()

  // 已登录的不能访问登录页面
  if (isLogin.value && to.path.startsWith('/auth')) return next('/')

  // 未登录的不能访问其他页面
  if (to.meta.needLogin && !isLogin.value) {
    showMsg('未授权的访问，请先登录', 'red')
    return next('/auth/login')
  }

  // 非管理员不可访问
  if (to.meta.needAdmin && info?.role !== 'admin') {
    showMsg('你无权访问该页面', 'red')
    return next({
      path: '/403',
      replace: true,
      query: {
        errPath: to.fullPath
      }
    })
  }
  if (!to.name)
    return next({
      path: '/404',
      replace: true,
      query: {
        errPath: to.fullPath
      }
    })

  document.title = (to.meta.title || '首页') + ' - Nyancy Account'

  next()
})

export default router
