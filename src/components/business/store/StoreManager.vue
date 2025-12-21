<template>
  <div class="store-manager">
    <div class="header">
      <h3>店铺列表</h3>
      <button @click="openCreate" class="btn btn-primary">新增店铺</button>
    </div>

    <div class="table">
      <StoreListCore :stores="stores" :loading="loading" @delete="removeStore">
        <template #name="{ item }">
          <div>{{ item.name }}</div>
        </template>
        <template #actions="{ item }">
          <button @click="editStore(item)" class="btn btn-sm">编辑</button>
          <button @click="removeStore(item.id)" class="btn btn-sm btn-danger">删除</button>
        </template>
      </StoreListCore>
    </div>

    <!-- 分页（简化） -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page===0">上一页</button>
      <span>第 {{ page + 1 }} 页</span>
      <button @click="nextPage">下一页</button>
    </div>

    <!-- 创建/编辑弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <h4>{{ editing ? '编辑店铺' : '创建店铺' }}</h4>
        <form @submit.prevent="submit">
          <div class="form-row">
            <label>名称</label>
            <input v-model="form.name" required />
          </div>
          <div class="form-row">
            <label>商家ID</label>
            <input v-model.number="form.merchantId" :disabled="!isAdminCreating" required />
          </div>
          <div class="form-row">
            <label>描述</label>
            <input v-model="form.description" />
          </div>
          <div class="form-row actions">
            <button type="button" @click="closeModal">取消</button>
            <button type="submit">{{ submitting ? '提交中...' : (editing ? '更新' : '创建') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import storeApi, { Store } from '@/api/modules/store'
import StoreListCore from '@/components/business/store/StoreListCore.vue'

const stores = ref<Store[]>([])
const page = ref(0)
const pageSize = ref(20)
const loading = ref(false)

const showModal = ref(false)
const editing = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)

const form = ref<Partial<Store>>({
  name: '',
  merchantId: undefined,
  description: ''
})

// 根据本地 userInfo 判断是否为管理员，只有管理员可以编辑 merchantId
const isAdminCreating = computed(() => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (!userInfoStr) return false
  try {
    const userInfo = JSON.parse(userInfoStr)
    return userInfo.role === 'ADMIN' || userInfo.role === 'ADMINISTRATOR'
  } catch {
    return false
  }
})

const parseStoresFromResponse = (res: any): Store[] => {
  const payload = res?.data
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.content)) return payload.content
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.list)) return payload.list
  return []
}

const fetchStores = async () => {
  loading.value = true
  try {
    // 管理员可能希望一次看到所有店铺，若为管理员则请求更大的 pageSize
    const requestedPageSize = isAdminCreating.value ? 1000 : pageSize.value
    const res = await storeApi.getAllStores(page.value, requestedPageSize)
    stores.value = parseStoresFromResponse(res)
  } catch (e) {
    console.error('fetch stores error', e)
    stores.value = []
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editing.value = false
  editingId.value = null
  form.value = { name: '', merchantId: undefined, description: '' }
  showModal.value = true
}

const editStore = (s: Store) => {
  editing.value = true
  editingId.value = s.id ?? null
  form.value = { name: s.name, merchantId: s.merchantId, description: s.description }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submit = async () => {
  submitting.value = true
  try {
    if (editing.value && editingId.value != null) {
      await storeApi.updateStore(editingId.value, form.value as Partial<Store>)
      alert('更新成功')
    } else {
      await storeApi.createStore(form.value as Store)
      alert('创建成功')
    }
    await fetchStores()
    closeModal()
  } catch (e: any) {
    console.error('submit error', e)
    // 尝试从后端错误对象中读取提示
    const msg = e?.response?.data?.message || e?.message || '操作失败'
    alert(msg)
  } finally {
    submitting.value = false
  }
}

const removeStore = async (id?: number) => {
  if (id == null) return
  if (!confirm('确定删除该店铺吗？')) return
  try {
    await storeApi.deleteStore(id)
    alert('删除成功')
    await fetchStores()
  } catch (e: any) {
    console.error('delete error', e)
    const msg = e?.response?.data?.message || e?.message || '删除失败'
    alert(msg)
  }
}

const prevPage = () => {
  if (page.value > 0) {
    page.value--
    fetchStores()
  }
}
const nextPage = () => {
  page.value++
  fetchStores()
}

onMounted(() => {
  fetchStores()
})
</script>

<style scoped>
.store-manager { padding: 20px; background: #fff; border-radius: 8px; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
.table { border:1px solid #eee; border-radius:6px; overflow:hidden; }
.row { display:grid; grid-template-columns: 60px 1fr 100px 2fr 80px 160px; padding:8px 12px; align-items:center; border-bottom:1px solid #f2f2f2; }
.header-row { background:#fafafa; font-weight:600; }
.btn { padding:6px 10px; border-radius:4px; cursor:pointer; }
.btn-danger { background:#dc3545; color:#fff; border:none; }
.btn-sm { padding:4px 8px; margin-right:6px; }
.pagination { margin-top:12px; display:flex; gap:8px; align-items:center; }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; }
.modal { background:#fff; padding:16px; width:420px; border-radius:8px; }
.form-row { margin-bottom:8px; display:flex; flex-direction:column; }
.form-row input { padding:8px; border:1px solid #ddd; border-radius:4px; }
.actions { display:flex; justify-content:flex-end; gap:8px; }
</style>


