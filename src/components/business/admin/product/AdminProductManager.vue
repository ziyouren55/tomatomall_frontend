<template>
  <ProductManager :isAdmin="true" />
</template>

<script>
import ProductManager from '../../product/ProductManager.vue';

export default {
  name: 'AdminProductManager',
  components: { ProductManager }
};
</script>

<style scoped>
/* Admin wrapper is a thin wrapper; styles live in ProductManager */
</style>


