<script setup>
import Trend from '@/components/Trend.vue'
import Seller from '@/components/Seller.vue'
import Map from '@/components/Map.vue'
import Rank from '@/components/Rank.vue'
import Hot from '@/components/Hot.vue'
import Stock from '@/components/Stock.vue'
import { ref, getCurrentInstance, onBeforeUnmount, onUnmounted, onMounted,  nextTick} from 'vue'

const { proxy } = getCurrentInstance()
const timeNow = ref(null)
const timeId = ref(null)

const timeResh = () => {
  if(timeId.value){
    clearInterval(timeId.value)
    timeId.value = null
  }
  timeId.value = setInterval(() => {
    let now = new Date().toLocaleString()
    timeNow.value = now
  }, 1000)
}

onMounted(() => {
  timeResh()
})

onBeforeUnmount(() => {
    clearInterval(timeId.value)
    timeId.value = null
})

onUnmounted(() => {
  proxy.$socket.unRegisterCallBack('fullScreen')
  // proxy.$socket.unRegisterCallBack('themeChange')
})

let fullScreenStatus = ref({
  // 定义每一个图表的全屏状态
  trend: false,
  seller: false,
  map: false,
  rank: false,
  hot: false,
  stock: false
})

const changeSize = (chartName) =>{
  // fullScreenStatus.value[charName] = !fullScreenStatus.value[charName]
  // nextTick(() => { proxy.$refs[charName].screenAdapter()})
  // 将数据发送给服务端
  const targetValue = !fullScreenStatus.value[chartName]
  proxy.$socket.send({
        action: 'fullScreen',
        socketType: 'fullScreen',
        chartName: chartName,
        value: targetValue
      })
}

// 接收到全屏数据之后的处理
const recvData = (data) =>  {
  // 取出是哪一个图表需要进行切换
  const chartName = data.chartName
  // 取出, 切换成什么状态
  const targetValue = data.value
  fullScreenStatus.value[chartName] = targetValue
  nextTick(() => { proxy.$refs[chartName].screenAdapter()})
}

// 注册接收到数据的回调函数
proxy.$socket.registerCallBack('fullScreen', recvData)
// proxy.$socket.registerCallBack('themeChange', this.recvThemeChange)
</script>

<template>
  <div ref='div' class="screen-container">
    <header class="screen-header">
    <div>
      <img src="/static/img/header_border_dark.png" alt="">
    </div>
    <span class="title">电商平台实时监控系统</span>
    <div class="title-right">
      <span class="datetime">{{timeNow}}</span>
    </div>
    </header>

    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top" :class="[ fullScreenStatus.trend ? 'fullscreen' : '' ]">
          <!-- 销量趋势图表 -->
          <Trend ref='trend'></Trend>
          <div class="resize">
            <span @click="changeSize('trend')" :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
        <div id="left-bottom" :class="[ fullScreenStatus.seller ? 'fullscreen' : '' ]">
          <!-- 商家销售金额图表 -->
          <Seller ref='seller'></Seller>
          <div class="resize">
            <span @click="changeSize('seller')"  :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
        </div>
      </section>

    <section class="screen-middle">
      <div id="middle-top" :class="[ fullScreenStatus.map ? 'fullscreen' : '' ]">
        <!-- 商家分布图表 -->
        <Map ref='map'></Map>
        <div class="resize">
            <span @click="changeSize('map')"  :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
      </div>
      <div id="middle-bottom" :class="[ fullScreenStatus.rank ? 'fullscreen' : '' ]">
        <!-- 地区销量排行图表 -->
        <Rank ref='rank'></Rank>
        <div class="resize">
            <span @click="changeSize('rank')"  :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
      </div>
    </section>

    <section class="screen-right">
      <div id="right-top" :class="[ fullScreenStatus.hot ? 'fullscreen' : '' ]">
        <!-- 热销商品占比图表 -->
        <Hot ref="hot"></Hot>
        <div class="resize">
            <span @click="changeSize('hot')" :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
      </div>
      <div id="right-bottom" :class="[ fullScreenStatus.stock ? 'fullscreen' : '' ]">
        <!-- 库存销量分析图表 -->
        <Stock  ref='stock'></Stock>
        <div class="resize">
            <span @click="changeSize('stock')" :class="['iconfont', fullScreenStatus.trend ? 'icon-compress-alt' : 'icon-expand-alt']"></span>
          </div>
      </div>
    </section>
    </div>
  </div>
  </template>

<style lang="less" scoped>
// 全屏样式的定义
.fullscreen {
  position: fixed!important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  z-index: 100;
}

.screen-container {
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #161522;
  color: #fff;
  box-sizing: border-box;
}
.screen-header {
  width: 100%;
  height: 64px;
  font-size: 20px;
  position: relative;
  > div {
      img {
        width: 100%;
      }
    }
  .title {
    position: absolute;
    left: 50%;
    top: 50%;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
  .title-right {
    display: flex;
    align-items: center;
    position:absolute;
    right: 0px;
    top: 50%;
    transform: translateY(-80%);
  }
  .qiehuan {
    width: 28px;
    height: 21px;
    cursor: pointer;
  }
  .datetime {
    font-size: 15px;
    margin-left: 10px;
  }
  .logo {
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-80%);
    img {
      height: 35px;
      width: 128px;
    }
  }
}
.screen-body {
  width: 100%;
  height: 100%;
  display: flex;
  margin-top: 10px;
  .screen-left {
    height: 100%;
    width: 27.6%;
    #left-top {
      height: 53%;
      position: relative;
    }
    #left-bottom {
      height: 31%;
      margin-top: 25px;
      position: relative;
    }
  }
  .screen-middle {
    height: 100%;
    width: 41.5%;
    margin-left: 1.6%;
    margin-right: 1.6%;
    #middle-top {
      width: 100%;
      height: 56%;
      position: relative;
    }
    #middle-bottom {
      margin-top: 25px;
      width: 100%;
      height: 28%;
      position: relative;
    }
  }
  .screen-right {
    height: 100%;
    width: 27.6%;
    #right-top {
      height: 46%;
      position: relative;
    }
    #right-bottom {
      height: 38%;
      margin-top: 25px;
      position: relative;
    }
  }
}
.resize {
  position: absolute;
  right: 20px;
  top: 20px;
  cursor: pointer;
}
</style>
