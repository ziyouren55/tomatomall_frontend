<template>
  <div>
    <form @submit.prevent="issueCoupon">
      <div class="form-row">
        <div class="form-group">
          <label>选择优惠券</label>
          <select v-model="issueData.couponId" class="form-control" required>
            <option v-for="coupon in availableCoupons" :key="coupon.id" :value="coupon.id">
              {{ coupon.name }} ({{ discountText(coupon) }})
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>备注</label>
          <input v-model="issueData.remark" type="text" class="form-control" placeholder="可填写活动说明">
        </div>
      </div>

      <div class="checkbox">
        <input type="checkbox" v-model="issueData.specifyUser" id="specifyUser">
        <label for="specifyUser">指定用户发放</label>
      </div>
      <p class="hint">不勾选则视为全体用户发放（需后端支持）；勾选后请输入用户ID定向发放。</p>

      <div class="form-row" v-if="issueData.specifyUser">
        <div class="form-group">
          <label>用户ID</label>
          <input v-model="issueData.userIdInput" type="number" min="1" class="form-control" placeholder="输入目标用户ID">
        </div>
      </div>

      <button type="submit" class="btn btn-success">发放优惠券</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';
import type { Coupon } from '@/types/api.ts';

export default defineComponent({
  name: 'IssueCouponForm',
  props: {
    userId: {
        type: [String, Number],
        default: null
    }
  },
  emits: ['issued'],
  data() {
    return {
      availableCoupons: [] as Coupon[],
      issueData: {
        couponId: null as number | null,
        remark: '',
        userIdInput: '',
        specifyUser: false
      }
    };
  },
  async mounted() {
    await this.fetchAvailableCoupons();
  },
  methods: {
    async fetchAvailableCoupons(): Promise<void> {
      try {
        const response = await api.coupon.getAllCoupons();
        this.availableCoupons = response.data;
        if (this.availableCoupons.length) {
          this.issueData.couponId = this.availableCoupons[0].id;
        }
      } catch (error) {
        console.error('获取优惠券列表失败:', error);
      }
    },
    discountText(coupon: any): string {
      if (coupon.discountAmount) return `¥${coupon.discountAmount}`;
      if (coupon.discountPercentage) return `${coupon.discountPercentage}%`;
      if (coupon.discount) return `${coupon.discount}%`;
      return '优惠券';
    },
    async issueCoupon() {
      if (!this.issueData.couponId) {
        alert('请选择优惠券');
        return;
      }

      // 指定用户发放
      if (this.issueData.specifyUser) {
        const targetUserId = this.userId ?? this.issueData.userIdInput;
        const userIdNum = typeof targetUserId === 'string' ? parseInt(targetUserId, 10) : targetUserId;

        if (!userIdNum || isNaN(userIdNum as number)) {
          alert('请输入有效的用户ID');
          return;
        }

        try {
          const issueVO = {
            userId: userIdNum as number,
            couponId: this.issueData.couponId,
            remark: this.issueData.remark
          };

          await api.coupon.issueCouponToUser(issueVO);
          this.$emit('issued');
          alert('优惠券发放成功');
          this.issueData.remark = '';
          this.issueData.userIdInput = '';
        } catch (error) {
          console.error('发放优惠券失败:', error);
          alert('发放失败，请重试');
        }
      } else {
        alert('当前全体发放需后端支持，暂请勾选“指定用户”并填写用户ID。');
      }
    }
  }
});
</script>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-control, select, input[type="text"], input[type="number"] {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 10px;
}
.btn-success {
  background: linear-gradient(135deg, #2575fc 0%, #6a11cb 100%);
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.hint {
  color: #666;
  font-size: 13px;
  margin-bottom: 8px;
}
.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
</style>
