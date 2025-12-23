<template>
  <div class="admin-schools">
  <div class="header">
      <h2>学校管理</h2>
      <div class="controls">
        <input v-model="q" placeholder="搜索学校名" @keyup.enter="fetchPage" />
        <button @click="fetchPage">搜索</button>
        <input type="file" ref="fileInput" @change="handleImportFile" accept=".csv" />
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else>
      <div v-if="items.length === 0" class="empty">暂无记录</div>
      <div v-else class="list">
        <div v-for="s in items" :key="s.code" class="row">
          <div class="left">
            <div class="title">{{ s.name }}</div>
            <div class="meta">{{ s.province_name || s.provinceCode }} · {{ s.city_name || s.cityCode }}</div>
          </div>
          <div class="actions">
            <button @click="edit(s)">编辑</button>
            <button @click="remove(s)">删除</button>
          </div>
        </div>
      </div>
      <div class="pager">
        <button @click="prev" :disabled="page===0">上一页</button>
        <span>第 {{ page + 1 }} 页</span>
        <button @click="next" :disabled="items.length < size">下一页</button>
      </div>
    </div>

    <!-- 简易编辑弹窗 -->
    <div v-if="showEdit" class="modal-overlay" @click="closeEdit">
      <div class="modal" @click.stop>
        <h3>编辑学校</h3>
        <div class="form">
          <label>学校名称</label>
          <input v-model="editModel.name" />
          <label>城市代码</label>
          <input v-model="editModel.city_code" />
        </div>
        <div class="footer">
          <button @click="closeEdit">取消</button>
          <button @click="saveEdit">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'
import type { School } from '@/types/api'

const items = ref<School[]>([])
const loading = ref(false)
const page = ref(0)
const size = ref(20)
const q = ref('')
// const filterCity removed: global school search
const showEdit = ref(false)
const editModel = ref<any>({})
// fileInput ref removed (not used in script)

async function fetchPage() {
  loading.value = true
  try {
    const res: any = await api.location.adminPageSchools(page.value, size.value, q.value || undefined)
    if (res && res.code === '200') {
      const dat = res.data
      if (Array.isArray(dat)) {
        items.value = dat
      } else if (dat && Array.isArray(dat.content)) {
        items.value = dat.content
      } else {
        items.value = []
      }
    } else {
      items.value = []
    }
  } finally {
    loading.value = false
  }
}

function prev() { if (page.value>0) { page.value--; fetchPage() } }
function next() { page.value++; fetchPage() }

function edit(s: School) {
  editModel.value = { ...s }
  showEdit.value = true
}
function closeEdit() { showEdit.value = false; editModel.value = {} }
async function saveEdit() {
  try {
    await api.location.adminUpdateSchool(editModel.value.code, editModel.value)
    closeEdit()
    fetchPage()
  } catch (e) { alert('保存失败') }
}

async function remove(s: School) {
  if (!confirm('确认删除？')) return
  await api.location.adminDeleteSchool(s.code)
  fetchPage()
}

async function handleImportFile(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return
  const f = target.files[0]
  const fd = new FormData()
  fd.append('file', f)
  const res: any = await api.location.adminImportSchools(fd)
  if (res && res.code === '200') {
    alert('导入完成: ' + (res.data?.success || 0) + ' 条')
    fetchPage()
  } else {
    alert('导入失败')
  }
}

onMounted(async () => {
  await fetchPage()
})
</script>

<style scoped>
.admin-schools { padding: 24px; background:#f6f7fb; min-height:100vh }
.header { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px }
.controls { display:flex; gap:8px; align-items:center }
.list { display:flex; flex-direction:column; gap:8px }
.row { display:flex; justify-content:space-between; padding:12px; background:#fff; border-radius:8px }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center }
.modal { background:#fff; padding:16px; border-radius:8px; width:480px }
</style>


