<template>
  <div>
    <NavigationBar />
    <div class="container mt-4">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import NavigationBar from '@/components/NavigationBar.vue';

export default {
  components: {
    NavigationBar
  }
};
</script>