import { createRouter, createWebHashHistory } from 'vue-router'
import ScreenPage from '@/views/ScreenPage.vue'

const router = createRouter({
  // history 模式的实现。为了简单起见，我们在这里使用 hash 模式
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: ScreenPage
    },
    {
      path: '/screen',
      component: ScreenPage
    }
  ]
})

export default router
