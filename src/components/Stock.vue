<!-- 商家销量统计的横向柱状图 -->
<script setup>
import {ref, onMounted, inject,onBeforeUnmount, getCurrentInstance,onUnmounted } from 'vue'
// import request from '@/utils/request.js'

defineOptions({
    name: 'StockCom'
})

let echarts = inject("echarts");
const stock_ref = ref(null)
let chartInstance = null
const allData = ref() // 服务器返回的数据
// const titleFontSize = ref(0) //标题的字体大小
const currentIndex = ref(0)  // 当前所展示的页数
const totalPage = ref( 0 )  // 一共有多少页
const timerId = ref()  // 定时器 id

const { proxy } = getCurrentInstance()

// 初始化 echartInstance对象
const initChart = () => {
    chartInstance = echarts.init(stock_ref.value,'chalk')
    // 对图标初始化配置的控制
    const initOption = {
        title: {
            text: '⇲ 库存与销量分析',
            left: 20,
            top: 20
        },
        
    }
    chartInstance.setOption(initOption)
    // 对图标对象进行鼠标事件的监听
    chartInstance.on('mouseover',() => {
        clearInterval(timerId.value)
    })
    chartInstance.on('mouseout',() => {
        startInterval()
    })
}

// 获取服务器的数据
const getData = (ret) => {
    // 接口：http://127.0.0.1:8888/api/stock
    // const {data: ret} = await request.get('stock')
    allData.value = ret
    totalPage.value =  Math.ceil(allData.value.length / 5)
    updateChart()
    startInterval()
}

// 页面刷新定时器
const startInterval = () => {
    if(timerId.value){
        clearInterval(timerId.value)
    }
    timerId.value = setInterval(() => {
        // 页数 + 1
        currentIndex.value++
        // 判断当前页数是否为末页
        if(currentIndex.value > totalPage.value - 1){
            currentIndex.value = 0
        }
        // 更新图标
        updateChart()
    }, 3000)
}

// 更新图标
const updateChart = () => {
    // 图例数据
    const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
    ]
    const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
    ]
    const start = currentIndex.value * 5
    const end = (currentIndex.value + 1) * 5
    const showData = allData.value.slice(start, end)
    const seriesArr = showData.map((item, index) => {
        return {
            type: 'pie',
            center: centerArr[index],
            scale: false,  //关闭鼠标移入饼图时的动画效果
            labelLine: {
                show: false         // 设置隐藏指示线
            },
            label:{
                position: 'center',
                color: colorArr[index][0]
            },
            data: [
                {
                    value: item.sales,
                    itemStyle:{
                        color: new echarts.graphic.LinearGradient(0,1,0,0, [
                        // 0% 状态下的颜色值        
                        {
                            offset: 0,
                            color: colorArr[index][0]
                        },
                         // 100% 状态下的颜色值        
                         {
                            offset: 1,
                            color: colorArr[index][1]
                        }
                    ])
                    }
                },
                {
                    name: item.name + '\n\n' + item.sales,
                    value: item.stock,
                    itemStyle:{
                        color: '#333843',
                    },
                }
            ]
        }
    })
    const dataOption = {
        series: seriesArr
    }
    chartInstance.setOption(dataOption)
}

// 屏幕适配
const screenAdapter = () => {
    const titleFontSize = stock_ref.value.offsetWidth / 100 * 3.6
    const innerRadius = titleFontSize * 3.1 
    const outerRadius = titleFontSize * 2.4
    // 和分辨率大小相关的配置项 
    const adapterOption = {
        title: {
            textStyle: {
                fontSize: titleFontSize * 1.5
            }
        },
        series: [
            { 
                type:'pie',
                radius: [outerRadius ,innerRadius],
                label: {
                    fontSize: titleFontSize / 1.5
                }
            },
            { 
                type:'pie',
                radius: [outerRadius ,innerRadius],
                label: {
                    fontSize: titleFontSize / 1.5
                }
            },
            { 
                type:'pie',
                radius: [outerRadius ,innerRadius],
                label: {
                    fontSize: titleFontSize / 1.5
                }
            },
            { 
                type:'pie',
                radius: [outerRadius ,innerRadius],
                label: {
                    fontSize: titleFontSize / 1.5
                }
            },
            { 
                type:'pie',
                radius: [outerRadius ,innerRadius],
                label: {
                    fontSize: titleFontSize / 1.5
                }
            },
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
        socketType: 'stockData',
        chartName:'stock',
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
proxy.$socket.registerCallBack('stockData', getData)


onUnmounted(() => {
    // 在组件销毁时，进行回调函数的取消
    proxy.$socket.unRegisterCallBack('stockData')
})

defineExpose({
    screenAdapter
})
</script>

<template>
   <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
   </div>
</template>

<style lang='less' scoped>
</style>