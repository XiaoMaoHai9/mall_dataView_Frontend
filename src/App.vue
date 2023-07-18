<script setup>
import * as echarts from "echarts";
import { provide } from "vue";
provide("echarts", echarts);
</script>

<template>
  <!-- 路由占位符 -->
  <router-view></router-view>
</template>

<style lang='less'>
</style>
