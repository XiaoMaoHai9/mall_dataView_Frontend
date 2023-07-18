 <!-- 针对 /hotpage 这条路径而显示出来的
      在这个组件中，通过子组件注册的方式，要显示出Hot.vue 这个组件 -->
<script setup>
import Hot from '@/components/Hot.vue'
</script>
    
<template>
    <div class="com-page">
       <Hot></Hot>
    </div>
  </template>
    
<style lang='less' scoped></style>