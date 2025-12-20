<template>
  <div class="merchant-store-list">
    <div class="container">
      <h2>我的店铺</h2>
      <div class="actions">
        <router-link to="/merchant/stores/new">新建店铺</router-link>
      </div>
      <div v-if="loading">加载中...</div>
      <div v-else-if="error">{{ error }}</div>
      <table v-else class="store-table">
        <thead>
          <tr><th>ID</th><th>名称</th><th>描述</th><th>状态</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="s in stores" :key="s.id">
            <td>{{ s.id }}</td>
            <td><router-link :to="`/merchant/stores/${s.id}`">{{ s.name }}</router-link></td>
            <td>{{ s.description }}</td>
            <td>{{ s.status }}</td>
            <td>
              <router-link :to="`/merchant/stores/${s.id}/edit`">编辑</router-link>
              <button @click="onDelete(s.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import storeApi from '@/api/modules/store'
import type { Store } from '@/api/modules/store'
import { ElMessage } from 'element-plus'

const stores = ref<Store[]>([])
const loading = ref(false)
const error = ref('')

const fetchStores = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await storeApi.getMerchantStores(0, 50)
    if (res && res.data) {
      // 支持后端两种分页/数组格式
      if (Array.isArray(res.data)) stores.value = res.data
      else stores.value = res.data.content || res.data
    } else {
      stores.value = []
    }
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    loading.value = false
  }
}

const onDelete = async (id?: number) => {
  if (!id) return
  if (!confirm('确认删除？')) return
  try {
    await storeApi.deleteStore(id)
    ElMessage({ type: 'success', message: '删除成功' })
    stores.value = stores.value.filter(s => s.id !== id)
  } catch (e: any) {
    ElMessage({ type: 'error', message: e?.message || String(e) })
  }
}

onMounted(() => {
  fetchStores()
})
</script>

<style scoped>
.store-table {
  width: 100%;
  border-collapse: collapse;
}
.store-table th, .store-table td {
  padding: 8px;
  border: 1px solid #eee;
}
</style>


