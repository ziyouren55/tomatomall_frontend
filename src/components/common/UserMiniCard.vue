<template>
  <div class="user-mini-card" @click="goToProfile" :title="userDisplayName">
    <img :src="userAvatar" :alt="userDisplayName" :style="{ width: size + 'px', height: size + 'px' }" class="avatar"/>
    <span v-if="showName" class="name">{{ userDisplayName }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import storeApi from '@/api/modules/store'

const props = defineProps<{
  merchantId?: number
  storeId?: number
  username?: string
  size?: number
  showName?: boolean
}>()

const emit = defineEmits<{}>()

const size = props.size ?? 36
const showName = props.showName ?? true

const router = useRouter()
const user = ref<any | null>(null)
const loading = ref(false)
const error = ref('')
const defaultAvatar = 'https://tse2-mm.cn.bing.net/th/id/OIP-C.UfPq2yu1ycxTGG9LfpogugHaHY?rs=1&pid=ImgDetMain&cb=idpwebpc2'

const userAvatar = computed(() => user.value?.avatar || defaultAvatar)
const userDisplayName = computed(() => user.value?.name || user.value?.username || '商家')

async function loadUser() {
  loading.value = true
  error.value = ''
  try {
    if (props.username) {
      const res = await api.user.getUserDetails(String(props.username))
      if (res && res.code === '200') user.value = res.data
    } else if (props.merchantId) {
      const res = await api.user.getUserById(props.merchantId)
      if (res && res.code === '200') user.value = res.data
    } else if (props.storeId) {
      const sres = await storeApi.getStoreById(props.storeId)
      if (sres && sres.code === '200' && sres.data && sres.data.merchantId) {
        const ures = await api.user.getUserById(sres.data.merchantId)
        if (ures && ures.code === '200') user.value = ures.data
      }
    }
  } catch (e: any) {
    console.warn('UserMiniCard load failed', e)
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

function goToProfile() {
  const username = user.value?.username
  if (username) {
    router.push(`/users/${username}`)
  }
}

onMounted(() => {
  loadUser()
})
</script>

<style scoped>
.user-mini-card {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.user-mini-card .avatar {
  border-radius: 50%;
  object-fit: cover;
  display: inline-block;
}
.user-mini-card .name {
  font-size: 14px;
  color: #333;
}
</style>


