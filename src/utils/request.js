import axios from 'axios'

// 创建 axios实例，防止污染原始 axios实例
const instance = axios.create({
    // 配置基地址
    baseURL: 'http://127.0.0.1:8888/api/',
  })
  
// 导出配置完的实例
export default instance