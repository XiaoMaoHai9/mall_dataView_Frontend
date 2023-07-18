 <!-- 针对 /sellerpage 这条路径而显示出来的
      在这个组件中，通过子组件注册的方式，要显示出Seller.vue 这个组件 -->
 <script setup>
    import Seller from '@/components/Seller.vue'
</script>

 <template>
    <div  class="com-page">
        <Seller></Seller>
    </div>
 </template>

 <style lang='less' scoped></style>