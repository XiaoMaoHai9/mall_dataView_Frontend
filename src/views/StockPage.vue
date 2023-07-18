 <!-- 针对 /rankpage 这条路径而显示出来的
      在这个组件中，通过子组件注册的方式，要显示出Rank.vue 这个组件 -->
<script setup>
import Stock from '@/components/Stock.vue'
</script>
    
<template>
    <div class="com-page">
       <Stock></Stock>
    </div>
  </template>
    
<style lang='less' scoped></style>