import Vue from 'vue'
import VueRouter from 'vue-router'
import Files from './views/Files.vue'
import Rev from './views/TodayRev.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Files,
  },
  {
    path: '/files',
    component: Files,
  },
  {
    path: '/rev',
    component: Rev,
  },
  {
    path: '/setting',
    component: () => import('./views/Setting.vue')
  },
  {
    path: '/statistic',
    component: () => import('./views/Statistic.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
