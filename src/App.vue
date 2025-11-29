<template>
  <div class="app-container">
    <NavigationBar />
    <main class="main-content">
      <router-view></router-view>
    </main>
    <footer class="footer">
      <p>&copy; {{ currentYear }} 商城系统. 保留所有权利.</p>
    </footer>
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue';

export default {
  name: 'App',
  components: {
    NavigationBar
  },
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
};
</script>

<style>
/* 导入基础样式 */
@import './assets/base.css';
@import './assets/main.css';

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.footer {
  background-color: #f5f5f5;
  text-align: center;
  padding: 1.5rem;
  margin-top: 2rem;
  color: #666;
}
</style>