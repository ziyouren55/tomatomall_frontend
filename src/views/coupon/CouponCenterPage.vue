<template>
  <div>
    <NavigationBar />
    <div class="container">
      <h2 class="page-title">优惠券中心</h2>
      <div class="coupon-grid">
        <div v-for="item in coupons" :key="item.id" class="coupon-card">
          <div class="card-header">
            <div class="name">{{ item.name }}</div>
            <div class="discount">
              <span v-if="item.discountAmount">¥{{ item.discountAmount }}</span>
              <span v-else-if="item.discountPercentage">{{ item.discountPercentage }}%</span>
              <span v-else>优惠券</span>
            </div>
          </div>
          <div class="card-body">
            <p class="desc">{{ item.description || '无描述' }}</p>
            <p class="meta">满 {{ item.minimumPurchase || 0 }} 可用</p>
            <p class="meta">有效期：{{ formatRange(item.validFrom, item.validTo) }}</p>
            <p class="meta">
              所需积分：{{ item.pointsRequired ?? 0 }}
            </p>
          </div>
          <div class="card-footer">
            <button class="btn-claim" @click="claim(item)">
              兑换
            </button>
            <button class="btn-detail" @click="viewDetail(item.id)">详情</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import NavigationBar from '@/components/business/NavigationBar.vue'
import api from '@/api'

export default defineComponent({
  name: 'CouponCenterPage',
  components: { NavigationBar },
  data() {
    return {
      coupons: [] as any[],
      loading: false
    }
  },
  mounted() {
    this.fetchCoupons()
  },
  methods: {
    async fetchCoupons() {
      this.loading = true
      try {
        const res = await api.coupon.getAvailableCoupons()
        this.coupons = res.data || []
      } catch (e) {
        console.error('获取可领取优惠券失败', e)
        alert('获取可领取优惠券失败，请稍后再试')
      } finally {
        this.loading = false
      }
    },
    async claim(coupon: any) {
      try {
        const couponId = coupon.id
        // 统一使用兑换接口，0 积分优惠券相当于扣减 0 积分
        const res = await api.coupon.exchangeCoupon(couponId)

        if (res && res.code === '200') {
          alert('兑换成功')
          this.fetchCoupons()
        } else {
          const msg = res?.msg || ''
          if (msg.includes('积分不足')) {
            alert('积分不足，兑换失败!')
          } else {
            alert(msg || '兑换失败，请稍后重试')
          }
        }
      } catch (e: any) {
        console.error('兑换失败', e)
        const msg = e?.response?.data?.msg || e?.response?.data?.message || e?.message
        if (typeof msg === 'string' && msg.includes('积分不足')) {
          alert('积分不足，兑换失败!')
        } else {
          alert(msg || '兑换失败，请稍后重试')
        }
      }
    },
    viewDetail(couponId: number) {
      this.$router.push({ name: 'CouponDetail', params: { id: couponId } })
    },
    formatRange(start?: string, end?: string) {
      const s = start ? new Date(start).toLocaleDateString() : '即时'
      const e = end ? new Date(end).toLocaleDateString() : '长期'
      return `${s} ~ ${e}`
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
.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.coupon-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.name {
  font-size: 16px;
  font-weight: 600;
}
.discount {
  font-size: 20px;
  color: #e74c3c;
  font-weight: 700;
}
.desc {
  min-height: 32px;
  color: #555;
}
.meta {
  color: #666;
  font-size: 12px;
  margin: 2px 0;
}
.card-footer {
  display: flex;
  gap: 8px;
}
.btn-claim, .btn-detail {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-claim {
  background: #28a745;
  color: #fff;
}
.btn-detail {
  background: #f1f3f5;
  color: #333;
}
.btn-claim:hover { background: #218838; }
.btn-detail:hover { background: #e0e4e7; }
</style>

