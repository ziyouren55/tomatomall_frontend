<template>
  <StockpileManager :storeId="storeId" />
</template>

<script>
import StockpileManager from '../stockpile/StockPileManager.vue';

export default {
  name: 'ShopStockpileManager',
  components: { StockpileManager },
  props: {
    storeId: {
      type: [String, Number],
      default: null
    }
  }
};
</script>

<style scoped>
/* Shop wrapper passes storeId to the core component */
</style>


