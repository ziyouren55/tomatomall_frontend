<template>
  <div class="app-container">
    <NavigationBar />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationBar from './components/business/NavigationBar.vue'

export default defineComponent({
  name: 'App',
  components: {
    NavigationBar
  },
  computed: {
    currentYear(): number {
      return new Date().getFullYear()
    }
  }
});
</script>

<style>
/* 导入基础样式 */
@import './assets/styles/base.css';
@import './assets/styles/main.css';

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 0;
  margin-top: 64px; /* 为导航栏留出空间 */
  min-height: calc(100vh - 64px);
}

.footer {
  background-color: #f5f5f5;
  text-align: center;
  padding: 1.5rem;
  margin-top: 2rem;
  color: #666;
}
</style>

