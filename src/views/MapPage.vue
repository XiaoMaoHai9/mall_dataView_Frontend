 <!-- 针对 /mappage 这条路径而显示出来的
      在这个组件中，通过子组件注册的方式，要显示出Map.vue 这个组件 -->
<script setup>
    import Map from '@/components/Map.vue'
</script>
    
<template>
      <div class="com-page">
        <Map></Map>
    </div>
</template>
    
<style lang='less' scoped></style>