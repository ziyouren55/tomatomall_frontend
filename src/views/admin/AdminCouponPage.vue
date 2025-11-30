<template>
  <div>
    <NavigationBar />
    <div class="container mt-4">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationBar from '@/components/common/NavigationBar.vue';

export default defineComponent({
  name: 'AdminCouponPage',
  components: {
    NavigationBar
  }
});
</script>