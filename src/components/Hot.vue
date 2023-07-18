<!-- 商家销量统计的横向柱状图 -->
<script setup>
import {ref, onMounted, onBeforeUnmount, inject, computed,getCurrentInstance, onUnmounted } from 'vue'
// import request from '@/utils/request.js'

defineOptions({
    name: 'HotCom'
})

let echarts = inject("echarts");
const hot_ref = ref()
let chartInstance = null
const allData = ref() // 服务器hot
const currentIndex = ref(0)  // 当前所展示的一级数据
const titleFontSize = ref()  // 字体适配

const { proxy } = getCurrentInstance()

// 初始化 echartInstance对象
const initChart = () => {
    chartInstance = echarts.init(hot_ref.value,'chalk')
    // 对图标初始化配置的控制
    const initOption = {
        title: {
            text: '⇲ 热销商品的占比',
            left: 20,
            top: 20
        },
        tooltip: {
            show: true,
            formatter: (e) => {
                const thirdCategory = e.data.children
                // 计算出所有的三级分类数据总和
                const total = thirdCategory.reduce((sum,item) => sum + item.value,0)
                let resStr = thirdCategory.map(item => {
                    return `${item.name}: ${(item.value / total * 100).toFixed(2)}%`
                }).join('<br/>')
                return resStr
            }
        },
        legend: {
            top: '20%',
            icon: 'circle'
        },
        series: [
            {
                type: 'pie',
                label: {
                    show: false
                },
                // 高亮状态下
                emphasis: {
                    label: {
                        show: true
                    },
                    labelLine: {
                        show: false
                    }
                }
            }
        ]
    }
    chartInstance.setOption(initOption)
}

// 获取服务器的数据
const getData = (ret) => {
    // 接口：http://127.0.0.1:8888/api/seller
    // const {data} = await request.get('hotproduct')
    // console.log(data);
    allData.value = ret
    updateChart()
}

// 更新图标
const updateChart = () => {  
    const legendData = allData.value[currentIndex.value].children.map(item => {
        return item.name
    })
    const seriesData = allData.value[currentIndex.value].children.map(item => {
        return {
            name: item.name,
            value: item.value,
            children: item.children
        }
    })
    const dataOption = {
        legend: {
            data: legendData
        },
        series: [
            {
                data: seriesData
            }
        ]
    }
    chartInstance.setOption(dataOption)
}

// 屏幕适配
const screenAdapter = () => {
    titleFontSize.value = hot_ref.value.offsetWidth / 100 * 3.6
    // 和分辨率大小相关的配置项 
    const adapterOption = {
        title: {
            textStyle: {
                fontSize: titleFontSize.value  * 1.5
            }
        },
        legend: {
            itemWidth: titleFontSize.value,
            itemHeight: titleFontSize.value,
            itemGap: titleFontSize.value / 3,
            textStyle: {
                fontSize: titleFontSize.value / 1.2
            }
        },
        series: {
            radius: titleFontSize.value * 4,
            center: ['50%','60%']
        }
    }
    chartInstance.setOption(adapterOption)
    // 手动调用图标对象的resize 才能产生效果 
    chartInstance.resize()
}

const toLeft = () => {
    currentIndex.value = currentIndex.value <= 0 ? allData.value.length - 1 : currentIndex.value - 1
    updateChart()
}

const toRight = () => {
    currentIndex.value = currentIndex.value >= allData.value.length - 1 ? 0 : currentIndex.value + 1
    updateChart()
}

const catName = computed(() => {
    if(!allData.value){
        return ''
    }else{
        return allData.value[currentIndex.value].name
    }
})

const comStyle = computed(() => {
    return {
        fontSize: titleFontSize.value * 1.5 + 'px'
    }
})

onMounted(() => {
    // getData()
    // 发送数据给服务器，告诉服务器现在需要数据
    proxy.$socket.send({
        action:'getData',
        socketType: 'hotData',
        chartName:'hotproduct',
        value:''
    })
    initChart(),
    window.addEventListener('resize', screenAdapter)
    screenAdapter()
})

// 在组件创建完成后，进行回调函数的注册
proxy.$socket.registerCallBack('hotData', getData)

onBeforeUnmount(() => {
    // clearInterval(timerId.value)
    // timerId.value = null
    // 在组件销毁时，将监听器取消掉
    window.removeEventListener('resize', screenAdapter)
})

onUnmounted(() => {
    // 在组件销毁时，进行回调函数的取消
    proxy.$socket.unRegisterCallBack('hotData')
})

defineExpose({
    screenAdapter
})
</script>

<template>
   <div class="com-container">
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
   </div>
</template>

<style lang='less' scoped>
.arr-left{
    position: absolute;
    left: 10%;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #fff;
}

.arr-right{
    position: absolute;
    right: 10%;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: #fff;
}

.cat-name{
    position: absolute;
    left: 70%;
    bottom: 30px;
    color:#fff;
    z-index: 10;
}
</style>