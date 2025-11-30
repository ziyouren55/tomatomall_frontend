<template>
  <div class="search-container">
    <input 
      v-model="searchTerm"
      type="text"
      placeholder="搜索论坛名称..."
      class="search-input"
      @input="handleSearch"
    />
    <button class="search-button" @click="handleSearch">
      <i class="fas fa-search"></i>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SearchBar',
  emits: ['search'],
  data() {
    return {
      searchTerm: ''
    };
  },
  methods: {
    handleSearch(): void {
      this.$emit('search', this.searchTerm);
    }
  }
});
</script>

<style scoped>
.search-container {
  display: flex;
  max-width: 500px;
  margin: 20px auto;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #ddd;
  border-radius: 30px 0 0 30px;
  font-size: 16px;
  outline: none;
}

.search-button {
  padding: 12px 20px;
  background: #4e6ef2;
  color: white;
  border: none;
  border-radius: 0 30px 30px 0;
  cursor: pointer;
  transition: background 0.3s;
}

.search-button:hover {
  background: #3a56e0;
}
</style>