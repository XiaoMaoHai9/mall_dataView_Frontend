import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 引入全局样式文件
import '@/assets/css/global.less'
import '@/assets/font/iconfont.css'

// 引入 echarts
import echarts from './utils/echarts'

import App from './App.vue'
import router from './router'
import SocketService from '@/utils/socket_service.js'
// 对服务端进行websocket的连接
SocketService.Instance.connect()


const app = createApp(App)
// 替他的组件 this.$socket
app.config.globalProperties.$socket = SocketService.Instance

// 挂载 echarts
app.config.globalProperties.$echarts = echarts

app.use(createPinia())
app.use(router)

app.mount('#app')
