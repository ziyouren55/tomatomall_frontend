<template>
  <div>
    <NavigationBar />
    <div class="container">
      <h2 class="page-title">我的优惠券</h2>
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="list" v-if="filteredCoupons.length">
        <div v-for="item in filteredCoupons" :key="item.id" class="coupon-row">
          <div>
            <div class="name">{{ item.couponName || item.name }}</div>
            <div class="desc">{{ item.couponDescription || item.description || '无描述' }}</div>
            <div class="meta">
              <span>优惠：{{ displayDiscount(item) }}</span>
              <span>门槛：满 {{ item.minimumPurchase || 0 }} 可用</span>
              <span>有效期：{{ formatDate(item.validTo || item.expiryDate) }}</span>
            </div>
          </div>
          <div class="actions">
            <span class="status" :class="statusClass(item)">{{ statusText(item) }}</span>
            <button class="btn-detail" @click="viewDetail(item)">详情</button>
          </div>
        </div>
      </div>
      <div v-else class="empty">暂无优惠券</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationBar from '@/components/business/NavigationBar.vue'
import api from '@/api'
import type { UserCoupon } from '@/types/api'

export default defineComponent({
  name: 'MyCouponsPage',
  components: { NavigationBar },
  data() {
    return {
      coupons: [] as UserCoupon[],
      activeTab: 'unused',
      tabs: [
        { key: 'unused', label: '未使用' },
        { key: 'used', label: '已使用' },
        { key: 'expired', label: '已过期' }
      ]
    }
  },
  mounted() {
    this.fetchCoupons()
  },
  computed: {
    filteredCoupons(): UserCoupon[] {
      return this.coupons.filter((c) => this.statusText(c) === this.tabLabel(this.activeTab))
    }
  },
  methods: {
    async fetchCoupons() {
      try {
        const res = await api.coupon.getUserOwnedCoupons()
        this.coupons = res.data || []
      } catch (e) {
        console.error('获取我的优惠券失败', e)
        alert('获取我的优惠券失败，请稍后重试')
      }
    },
    statusText(c: UserCoupon) {
      const expired = this.isExpired(c)
      if (expired) return '已过期'
      if (c.isUsed || c.status === 1 || c.usedTime) return '已使用'
      return '未使用'
    },
    statusClass(c: UserCoupon) {
      const text = this.statusText(c)
      if (text === '已过期') return 'expired'
      if (text === '已使用') return 'used'
      return 'unused'
    },
    isExpired(c: UserCoupon) {
      const end = c.validTo || c.expiryDate
      if (!end) return false
      return new Date(end).getTime() < Date.now()
    },
    tabLabel(key: string) {
      if (key === 'unused') return '未使用'
      if (key === 'used') return '已使用'
      return '已过期'
    },
    displayDiscount(c: UserCoupon) {
      if (c.discountAmount) return `¥${c.discountAmount}`
      if (c.discountPercentage) return `${c.discountPercentage}%`
      return '—'
    },
    formatDate(date?: string) {
      if (!date) return '长期'
      return new Date(date).toLocaleDateString()
    },
    viewDetail(c: UserCoupon) {
      const targetId = c.couponId || c.id;
      if (!targetId) {
        alert('缺少优惠券ID，无法查看详情');
        return;
      }
      this.$router.push({ path: `/coupon/${targetId}` })
    }
  }
})
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 15px 40px;
}
.page-title {
  margin: 10px 0 20px;
  font-size: 22px;
  font-weight: 600;
}
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.tab-btn {
  padding: 8px 14px;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
}
.tab-btn.active {
  background: #2575fc;
  color: #fff;
  border-color: #2575fc;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.coupon-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.name {
  font-size: 16px;
  font-weight: 600;
}
.desc {
  color: #555;
  margin: 4px 0 6px;
}
.meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}
.actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 120px;
}
.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
}
.status.unused { background: #28a745; }
.status.used { background: #6c757d; }
.status.expired { background: #dc3545; }
.btn-detail {
  border: 1px solid #2575fc;
  color: #2575fc;
  padding: 6px 10px;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
.btn-detail:hover {
  background: #2575fc;
  color: #fff;
}
.empty {
  text-align: center;
  color: #666;
  padding: 40px 0;
}
</style>

