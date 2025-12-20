<template>
  <div class="merchant-store-edit">
    <div class="container">
      <h2>{{ isEdit ? '编辑店铺' : '新建店铺' }}</h2>
      <form @submit.prevent="onSubmit">
        <div>
          <label>名称</label>
          <input v-model="form.name" required />
        </div>
        <div>
          <label>描述</label>
          <textarea v-model="form.description" />
        </div>
        <div>
          <label>状态</label>
          <select v-model="form.status">
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
        <div style="margin-top:12px">
          <button type="submit">保存</button>
          <router-link to="/merchant/stores" style="margin-left:8px">取消</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import storeApi from '@/api/modules/store'
import type { Store } from '@/api/modules/store'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const id = route.params.id ? Number(route.params.id) : null
const isEdit = !!id

const form = ref<Store>({ name: '', description: '', status: 'ACTIVE' })

const load = async () => {
  if (!isEdit) return
  try {
    const res = await storeApi.getStoreById(id as number)
    if (res && res.data) form.value = res.data
  } catch (e: any) {
    ElMessage({ type: 'error', message: e?.message || String(e) })
    router.push('/merchant/stores')
  }
}

const onSubmit = async () => {
  try {
    if (isEdit && id) {
      await storeApi.updateStore(id, form.value)
      ElMessage({ type: 'success', message: '更新成功' })
    } else {
      await storeApi.createStore(form.value)
      ElMessage({ type: 'success', message: '创建成功' })
    }
    router.push('/merchant/stores')
  } catch (e: any) {
    ElMessage({ type: 'error', message: e?.message || String(e) })
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.merchant-store-edit form > div {
  margin-bottom: 8px;
}
</style>


