<template>
  <div class="store-manager">
    <div class="header">
      <h3>店铺列表</h3>
      <button @click="openCreate" class="btn btn-primary">新增店铺</button>
    </div>

    <div class="table merchant-like">
      <StoreListCore :stores="stores" :loading="loading" @delete="removeStore">
        <template #name="{ item }">
          <div class="name-cell">
            <router-link :to="`/admin/stores/${item.id}`" class="store-name">{{ item.name }}</router-link>
            <div class="store-meta">ID: {{ item.id }} · 商家ID: {{ item.merchantId || '-' }}</div>
          </div>
        </template>
        <template #actions="{ item }">
          <div class="actions-cell">
            <button @click="editStore(item)" class="action-link">编辑</button>
            <button @click="removeStore(item.id)" class="action-delete">删除</button>
          </div>
        </template>
      </StoreListCore>
    </div>

    <!-- 与商家页对齐：单页展示（不显示翻页控件） -->

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
import storeApi, { Store } from '@/api/modules/store.ts'
import StoreListCore from '@/components/business/store/StoreListCore.vue'

const stores = ref<Store[]>([])
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
    // 与商家页对齐：固定请求第一页（page=0）且一次拉取 50 条
    const res = await storeApi.getAllStores(0, 50)
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

// 管理员列表采用单页机制（与商家页一致），因此移除了翻页函数

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

<style scoped>
/* 从商家页面借用的样式，局部用于管理员页面美化 */
.actions-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}
.action-link {
  color: #ff6b35;
  text-decoration: none;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(255,107,53,0.06);
  border: none;
  cursor: pointer;
}
.action-link:hover { background: rgba(255,107,53,0.12); }
.action-delete {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}
.action-delete:hover { opacity: 0.95; }
.store-name { font-weight:700; color:#333; text-decoration:none; font-size:1rem; }
.store-meta { font-size:12px; color:#999; margin-top:6px; }
.name-cell { display:flex; flex-direction:column; }
</style>


