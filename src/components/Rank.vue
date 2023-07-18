<!-- 地区销量排行榜竖向柱状图 -->
<script setup>
import {ref, onMounted, inject, onBeforeUnmount,getCurrentInstance,onUnmounted } from 'vue'
// import request from '@/utils/request.js'

defineOptions({
    name: 'RankCom'
})

let echarts = inject("echarts");
const rank_ref = ref()
let chartInstance = null
const allData = ref() // 服务器返回的数据
const startValue = ref(0)  //区域缩放的起点值
const endValue = ref(10)  // 区域缩放的终点值
const timerId = ref()  // 计时器id

const { proxy } = getCurrentInstance()
 
// 初始化 echartInstance对象
const initChart = async () => {
    chartInstance = echarts.init(rank_ref.value,'chalk')
    // 对图标初始化配置的控制
    const initOption = {
        title: {
            text: '⇲ 地区销售排行榜',
            left: 20,
            top: 20
        },
        grid: {
            top: '40%',
            left: '7%',
            right: '5%',
            bottom: '14%',
            containLable: true
        },
        tooltip:{
            show: true
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                type: 'bar'
            }
        ]
    }
    chartInstance.setOption(initOption)
    chartInstance.on('mouseover',() => {
        clearInterval(timerId.value)
    })
    chartInstance.on('mouseout',() => {
        startInterval()
    })
}

// 获取服务器的数据
const getData = (ret) => {
    // 接口：http://127.0.0.1:8888/api/rank
    // const res = await request.get('rank') 
    allData.value = ret
    // 对 allDate里面的每个元素进行排序
    allData.value.sort((a, b) => {
        return b.value - a.value
    })
    updateChart()
    startInterval()
}

// 更新图标
const updateChart = () => {
    const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
    ]
    // 所有省份形成的数据
    const provinceArr = allData.value.map(item => {
        return item.name
    })
    // 所有省份对应的销售金额
    const valueArr = allData.value.map(item => {
        return item.value
    })
    const dataOption = {
        xAxis: {
            data: provinceArr
        },
        dataZoom: {
            show: false,
            startValue: startValue.value,
            endValue: endValue.value
        },
        series: [
            {
                data: valueArr,
                itemStyle: {
                    color: (e) => {
                        let targetColorArr = null
                        if(e.value > 300 ){
                            targetColorArr = colorArr[0]
                        }else if(e.value > 200){
                            targetColorArr = colorArr[1]
                        }else{
                            targetColorArr = colorArr[2]
                        }
                        return new echarts.graphic.LinearGradient(0, 1, 0 ,0,[
                            {
                                offset: 0,
                                color: targetColorArr[0]
                            },
                            {
                                offset: 1,
                                color: targetColorArr[1]
                            }
                        ])
                        
                    }
                }
            }
        ]

    }
    chartInstance.setOption(dataOption)
}

// 屏幕适配
const screenAdapter = () => {
    const titleFontSize = rank_ref.value.offsetWidth / 100 * 3.6
    const adapterOption = {
        title: {
            textStyle: {
                fontSize: titleFontSize
            }
        },
        series: [
            {
                barWidth: titleFontSize,
                itemStyle: {
                    borderRadius: [titleFontSize / 2,titleFontSize / 2 ,0 ,0]
                }
            }
        ]
    }
    chartInstance.setOption(adapterOption)
    // 手动调用图标对象的resize 才能产生效果 
    chartInstance.resize()
}

// 计时器
const startInterval = () => {
    if(timerId.value){
        clearInterval(timerId.value)
    }
    timerId.value = setInterval(() => {
        startValue.value++
        endValue.value++
        if(endValue.value > allData.value.length - 1){
            startValue.value = 0
            endValue.value = 9
        }
        updateChart()
    },2000)
} 

onMounted(() => {
    // getData()
    // 发送数据给服务器，告诉服务器现在需要数据
    proxy.$socket.send({
        action:'getData',
        socketType: 'rankData',
        chartName:'rank',
        value:''
    })
    initChart()
    window.addEventListener('resize', screenAdapter)
    screenAdapter()
})

onBeforeUnmount(() => {
    clearInterval(timerId.value)
    timerId.value = null
})

// 在组件创建完成后，进行回调函数的注册
proxy.$socket.registerCallBack('rankData', getData)


onUnmounted(() => {
    // 在组件销毁时，进行回调函数的取消
    proxy.$socket.unRegisterCallBack('rankData')
})

defineExpose({
    screenAdapter
})
</script>

<template>
   <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
   </div>
</template>

<style lang='less' scoped>
</style>