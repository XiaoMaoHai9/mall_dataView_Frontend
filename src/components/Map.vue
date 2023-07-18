<!-- 商家销量统计的横向柱状图 -->
<script setup>
import {ref, onMounted, inject, getCurrentInstance,onUnmounted } from 'vue'
import request from '@/utils/request.js'
import { getProvinceMapInfo } from '@/utils/map_utils.js'

defineOptions({
    name: 'MapCom'
})

let echarts = inject("echarts");
const map_ref = ref()
let chartInstance = null
const allData = ref() // 服务器返回的数据
const mapData = ref({}) // 身份地图矢量数据缓存

const { proxy } = getCurrentInstance()
 
// 初始化 echartInstance对象
const initChart = async () => {
    chartInstance = echarts.init(map_ref.value,'chalk')
    // 获取中国地图矢量数据
    const res = await request.get('http://localhost:8999/static/map/china.json')
    echarts.registerMap('china',res.data)
    // 对图标初始化配置的控制
    const initOption = {
        title: {
            text: '⇲ 商家分布',
            left: 20,
            top: 20
        },
        geo: {
            type: 'map',
            map: 'china',
            top: '5%',
            bottom: '5%',
            itemStyle: {
                borderColor: '#333'
            },
        },
        legend: {
            left:'5%',
            bottom: '5%',
            orient: 'vertical'
        }
    }
    chartInstance.setOption(initOption)
    // 点击省份事件
    chartInstance.on('click',async(e) => {
        // e.name 得到所点击的省份，省份是中文
        const provinceInfo = getProvinceMapInfo(e.name);
        // console.log(provinceInfo);
        // 获取该省份的地图矢量数据
        // 判断点击的该省份是否有缓存
        if(!mapData.value[provinceInfo.key]){
            try{
                const res = await request.get(`http://localhost:8999/static/map/province/${provinceInfo.key}.json`)
                mapData.value[provinceInfo.key] = res.data
                echarts.registerMap(provinceInfo.key, res.data)
            }catch(error){
                return
            }
        }
       
        const changeOption = {
            geo: {
                map: provinceInfo.key
            }
        }
        chartInstance.setOption(changeOption)
    })
}

// 获取服务器的数据
const getData = (ret) => {
    // 接口：http://127.0.0.1:8888/api/seller
    // const {data} = await request.get('map')
    allData.value = ret   
    updateChart()
}

// 更新图标
const updateChart = () => {
    // 图例的数据
    const legendArr = allData.value.map(item => item.name) 
    const seriesArr = allData.value.map(item => {
        // 如果想在地图中显示散点的数据，我们需要给散点的图表增加一个配置，coordinateSystem: 'geo'
        return {
            type: 'effectScatter',
            rippleEffect: {
                scale: 5,
                brushType: 'stroke'
            },
            name: item.name,
            data: item.children,
            coordinateSystem: 'geo'
        }
    })
    const dataOption = {
        legend: {
            data:legendArr
        },
        series: seriesArr
    }
    chartInstance.setOption(dataOption)
}

// 屏幕适配
const screenAdapter = () => {
    // 和分辨率大小相关的配置项 
    const titleFontSize = map_ref.value.offsetWidth / 100 * 3.6
    const adapterOption = {
        title: {
            textStyle: {
                fontSize : titleFontSize * 1.1
            }
        },
        legend: {
            itemGap: titleFontSize / 3,
            itemWidth: titleFontSize / 1.4,
            itemHeight: titleFontSize  / 1.4,
            textStyle: {
                fontSize: titleFontSize / 1.7
            }
        }
    }
    chartInstance.setOption(adapterOption)
    // 手动调用图标对象的resize 才能产生效果 
    chartInstance.resize()
}

// 双击回到主地图
const reverMap = () => {
    const reverOption = {
        geo: {
            map: 'china'
        }
    }
    chartInstance.setOption(reverOption)
}

// 在组件创建完成后，进行回调函数的注册
proxy.$socket.registerCallBack('mapData', getData)

onMounted(() => {
    // getData()
    // 发送数据给服务器，告诉服务器现在需要数据
    proxy.$socket.send({
        action:'getData',
        socketType: 'mapData',
        chartName:'map',
        value:''
    })
    initChart()
    window.addEventListener('resize', screenAdapter)
    screenAdapter()
})

onUnmounted(() => {
    // 在组件销毁时，进行回调函数的取消
    proxy.$socket.unRegisterCallBack('mapData')
})
defineExpose({
    screenAdapter
})
</script>

<template>
   <div class="com-container" @dblclick="reverMap">
    <div class="com-chart" ref="map_ref"></div>
   </div>
</template>

<style lang='less' scoped>
</style>