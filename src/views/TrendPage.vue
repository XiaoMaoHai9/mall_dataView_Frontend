 <!-- 针对 /trendpage 这条路径而显示出来的
      在这个组件中，通过子组件注册的方式，要显示出Trend.vue 这个组件 -->
<script setup>
    import Trend from '@/components/Trend.vue'
</script>
  
<template>
    <div class="com-page">
        <Trend></Trend>
    </div>
</template>
  
<style lang='less' scoped></style>