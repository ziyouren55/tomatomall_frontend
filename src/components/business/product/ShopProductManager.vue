<template>
  <ProductManager :storeId="storeId" :isAdmin="false" />
</template>

<script>
import ProductManager from './ProductManager.vue';

export default {
  name: 'ShopProductManager',
  components: { ProductManager },
  props: {
    storeId: {
      type: [String, Number],
      default: null
    }
  }
};
</script>

<style scoped>
/* wrapper has no extra styles */
</style>


