<!-- 商家销量统计的横向柱状图 -->
<script setup>
import {ref, onMounted, onBeforeUnmount, inject, getCurrentInstance,onUnmounted } from 'vue'
// import request from '@/utils/request.js'

defineOptions({
    name: 'SellerCom'
})

let echarts = inject("echarts");
const seller_ref = ref()
let chartInstance = null
const allData = ref() // 服务器返回的数据
const currentPage = ref( 1 ) // 当前显示的页数
const totalPage = ref( 0 )  // 一共有多少页
const timerId = ref()  // 定时器 id

const { proxy } = getCurrentInstance()

// 初始化 echartInstance对象
const initChart = () => {
        chartInstance = echarts.init(seller_ref.value,'chalk')
        // 对图标初始化配置的控制
        const initOption = {
            title: {
                text: '⇲ 商家销售统计',
                left: 20,
                top: 20
            },
            grid: {
                top: '30%',
                left: '13%',
                right: '6%',
                bottom: '14%',
                containLable: true  // 距离包含坐标轴上的文字
            },
            xAxis:{
                type: 'value'
            },
            yAxis:{
                type: 'category',
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                    z: 0,
                    lineStyle: {
                        type: 'solid',
                        color: '#2c3442'
                    }
                },
            },
            series:[
                {
                    type: 'bar',
                    label: { 
                        show: true,  // 文字展示
                        position: 'right',  // 文字居右
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    itemStyle: {
                        // 指定颜色渐变的方向
                        // 指明不同百分比之下颜色的值
                        color: echarts.graphic.LinearGradient(0,0,1,0, [
                            // 0% 状态下的颜色值        
                            {
                                offset: 0,
                                color: '#5052EE'
                            },
                             // 100% 状态下的颜色值        
                             {
                                offset: 1,
                                color: '#AB6EE5'
                            }
                        ])
                    }
                 
                }
            ]
        }
        chartInstance.setOption(initOption)
        // 对图标对象进行鼠标事件的监听
        chartInstance.on('mouseover', () => {
            clearInterval(timerId.value)
        })
        chartInstance.on('mouseout', () => {
            startInterval()
        })
}

// 页面刷新定时器
const startInterval = () => {
        if(timerId.value){
            clearInterval(timerId.value)
        }
        timerId.value = setInterval(() => {
            // 页数 + 1
            currentPage.value++
            // 判断当前页数是否为末页
            if(currentPage.value > totalPage.value){
                currentPage.value = 1
            }
            // 更新图标
            updateChart()
        }, 3000)
}

// 获取服务器的数据
const getData = (ret) => {
        // 接口：http://127.0.0.1:8888/api/seller
        // const {data} = await request.get('seller')
        allData.value = ret
        // 将数据排序 => 从小到大
        allData.value.sort((a ,b) => a.value - b.value)
        // 每五个元素显示一页
        totalPage.value =  Math.ceil(allData.value.length / 5)
        updateChart()
        // 启动定时器
        startInterval()
}

// 更新图标
const updateChart = () => {
        const start = (currentPage.value - 1) * 5 
        const end = currentPage.value * 5
        const showData = allData.value.slice(start, end)
        const sellerNames = showData.map(item => item.name)
        const sellerValues = showData.map(item => item.value)
        const dataOption = {
            yAxis:{
                data: sellerNames
            },
            series:[
                {
                    data: sellerValues,
                }
            ]
        }
        chartInstance.setOption(dataOption)
}

// 屏幕适配
const screenAdapter = () => {
        const titleFontSize = seller_ref.value.offsetWidth / 100 * 3.6
        // 和分辨率大小相关的配置项 
        const adapterOption = {
            title: {
                textStyle: {
                    fontSize: titleFontSize * 1.5
                },
            },
            tooltip: {
                axisPointer: {
                    lineStyle: {
                        width: titleFontSize,
                    }
                },
            },
            series:[
                {
                    barWidth: titleFontSize ,// 柱的宽度           
                    itemStyle: {
                        borderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
                    }
                 
                }
            ]
        }
        chartInstance.setOption(adapterOption)
        // 手动调用图标对象的resize 才能产生效果 
        chartInstance.resize()
}

onMounted(() => {
    // getData()
    // 发送数据给服务器，告诉服务器现在需要数据
    proxy.$socket.send({
        action:'getData',
        socketType: 'sellerData',
        chartName:'seller',
        value:''
    })
    initChart(),
    window.addEventListener('resize', screenAdapter)
    screenAdapter()
})

onBeforeUnmount(() => {
    clearInterval(timerId.value)
    timerId.value = null
    // 在组件销毁时，将监听器取消掉
    window.removeEventListener('resize', screenAdapter)
})

// 在组件创建完成后，进行回调函数的注册
proxy.$socket.registerCallBack('sellerData', getData)


onUnmounted(() => {
    // 在组件销毁时，进行回调函数的取消
    proxy.$socket.unRegisterCallBack('sellerData')
})

defineExpose({
    screenAdapter
})
</script>

<template>
   <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
   </div>
</template>

<style lang='less' scoped>
</style>