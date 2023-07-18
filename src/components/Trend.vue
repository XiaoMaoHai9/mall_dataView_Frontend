<!-- 商家销量统计的横向柱状图 -->
<script setup>
import {ref, onMounted, inject, computed, getCurrentInstance,onUnmounted} from 'vue'
// import request from '@/utils/request.js'

defineOptions({
    name: 'TrendCom'
})

const choiseType = ref('map')    
const options = computed(() => {
    if(!allData.value){
        return []
    }else{
        return allData.value.type
    }
})
const chowTitle = computed(() => {
    if(!allData.value){
        return ''
    }else{
        return allData.value[choiseType.value].title
    }
})

const { proxy } = getCurrentInstance()

let echarts = inject("echarts");
const trend_ref = ref()
let chartInstance = null
const allData = ref() // 服务器返回的数据
const titleFontSize = ref(0) //标题的字体大小

// 初始化 echartInstance对象
const initChart = () => {
        chartInstance = echarts.init(trend_ref.value,'chalk')
        // 对图标初始化配置的控制
        const initOption = {
            grid: {
                top: '30%',
                left: '13%',
                right: '6%',
                bottom: '10%',
                containLable: true  // 距离包含坐标轴上的文字
            },
            tooltip: {
                trigger: 'axis',
            },
            legend: {
                left: 60,
                top: '18%',
                icon: 'circle'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
            },
            yAxis: {
                type: 'value'
            }
        }
        chartInstance.setOption(initOption)
        // 对图标对象进行鼠标事件的监听
}

// 获取服务器的数据
// ret 就是服务端发送给客服端图标的数据
const getData = (ret) => {
    // 接口：http://127.0.0.1:8888/api/trend
    // const {data: ret} = await request.get('trend')
    allData.value = ret
    updateChart()
}

// 更新图标
const updateChart = () => {
        // 半透明的颜色值
        const colorArr1 = [
          'rgba(11, 168, 44, 0.5)',
          'rgba(44, 110, 255, 0.5)',
          'rgba(22, 242, 217, 0.5)',
          'rgba(254, 33, 30, 0.5)',
          'rgba(250, 105, 0, 0.5)'
        ]
        // 全透明的颜色值
        const colorArr2 = [
          'rgba(11, 168, 44, 0)',
          'rgba(44, 110, 255, 0)',
          'rgba(22, 242, 217, 0)',
          'rgba(254, 33, 30, 0)',
          'rgba(250, 105, 0, 0)'
        ]
        // x轴数据
        const timeArr = allData.value.common.month
        // y轴数据
        const valueArr = allData.value[choiseType.value].data
        const seriesArr = valueArr.map((item, index) => {
            return {
                name: item.name,
                type: 'line',
                data: item.data,
                stack: choiseType.value,
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0,1,0,0, [
                        // 0% 状态下的颜色值        
                        {
                            offset: 0,
                            color: colorArr1[index]
                        },
                         // 100% 状态下的颜色值        
                         {
                            offset: 1,
                            color: colorArr2[index]
                        }
                    ])
                }
            }
        })
        // 图例数据
        const legendArr = valueArr.map(item => item.name)
        const dataOption = {
            xAxis: {
                data: timeArr
            },
            legend: {
                data: legendArr
            },
            series: seriesArr,
        }
        chartInstance.setOption(dataOption)
}

// 更换选择类型
const handleSelect = (value) => {
    choiseType.value = value
    updateChart()
}

// 屏幕适配
const screenAdapter = () => {
    titleFontSize.value = trend_ref.value.offsetWidth / 100 * 3.6
    // 和分辨率大小相关的配置项 
    const adapterOption = {
        legend: {
            itemWidth: titleFontSize.value,
            itemHeight: titleFontSize.value,
            itemGap: titleFontSize.value,
            textStyle: {
                fontSize: titleFontSize.value / 1.2
            }
        }
    }
    chartInstance.setOption(adapterOption)
    // 手动调用图标对象的resize 才能产生效果 
    chartInstance.resize()
}

const marginStyle = computed(() => {
    return {
        marginLeft: titleFontSize.value + 'px'
    }
})

onMounted(() => {
    // getData()
    // 发送数据给服务器，告诉服务器现在需要数据
    proxy.$socket.send({
        action:'getData',
        socketType: 'trendData',
        chartName:'trend',
        value:''
    })
    initChart(),
    window.addEventListener('resize', screenAdapter)
    screenAdapter()
})


// 在组件创建完成后，进行回调函数的注册
proxy.$socket.registerCallBack('trendData', getData)


onUnmounted(() => {
    // 在组件销毁时，进行回调函数的取消
    proxy.$socket.unRegisterCallBack('trendData')
})

defineExpose({
    screenAdapter
})
</script>

<template>
   <div class="com-container">
    <el-select v-model="chowTitle" class="m-2" placeholder="Select" size="large" :style="marginStyle">
        <el-option
          v-for="item in options"
          :key="item.key"
          :value="item.text"
          @click="handleSelect(item.key)"
        />
    </el-select>
    <div class="com-chart" ref="trend_ref"></div>
   </div>
</template>

<style lang='less' scoped>
.m-2{
    position: absolute;
    z-index: 10;
    left: 10px;
    top: 20px;
}
</style>