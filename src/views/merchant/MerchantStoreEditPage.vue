<template>
  <div class="merchant-store-edit">
    <div class="warehouse-container">
      <div class="page-header">
        <div class="header-content">
          <div class="header-title">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
              <path d="M7 7v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"></path>
            </svg>
            <h1>{{ isEdit ? '编辑店铺' : '新建店铺' }}</h1>
          </div>
          <p class="header-subtitle">为您的商店设置名称、描述与状态</p>
        </div>
      </div>

      <div class="tab-content">
        <div class="content-card">
          <form class="store-form" @submit.prevent="onSubmit">
            <div class="form-row">
              <label class="form-label">名称</label>
              <input class="form-input" v-model="form.name" required />
            </div>
            <div class="form-row">
              <label class="form-label">描述</label>
              <textarea class="form-textarea" v-model="form.description" />
            </div>
            <div class="form-row">
              <label class="form-label">状态</label>
              <select class="form-select" v-model="form.status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="submit" class="primary-btn">{{ isEdit ? '保存修改' : '创建店铺' }}</button>
              <router-link to="/merchant/stores" class="secondary-btn">取消</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import storeApi from '@/api/modules/store'
import type { Store } from '@/types/api'
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
    await router.push('/merchant/stores')
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
    await router.push('/merchant/stores')
  } catch (e: any) {
    ElMessage({ type: 'error', message: e?.message || String(e) })
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.warehouse-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(229, 83, 54, 0.15);
}
.header-title {
  display: flex;
  gap: 12px;
  align-items: center;
}
.header-icon {
  width: 28px;
  height: 28px;
  stroke-width: 2;
}
.store-form .form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}
.form-label {
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
}
.form-input, .form-textarea, .form-select {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
}
.form-textarea {
  min-height: 120px;
  resize: vertical;
}
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
.primary-btn {
  padding: 10px 18px;
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: white;
  border-radius: 8px;
  font-weight: 700;
  border: none;
  text-decoration: none;
}
.secondary-btn {
  padding: 10px 18px;
  background: #f5f5f5;
  color: #333;
  border-radius: 8px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>


