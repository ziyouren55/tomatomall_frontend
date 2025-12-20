<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h2>{{ isEditMode ? '编辑优惠券' : '创建新优惠券' }}</h2>
        <p class="sub">支持直减、折扣、门槛、时间窗口与积分兑换</p>
      </div>
      <div class="header-actions">
        <button type="button" class="btn ghost" @click="cancel">返回</button>
        <button type="submit" form="coupon-form" class="btn-primary">{{ isEditMode ? '保存修改' : '创建优惠券' }}</button>
      </div>
    </div>

    <form id="coupon-form" class="form-card" @submit.prevent="submitForm">
      <div class="row">
        <div class="field">
          <label>优惠券名称</label>
          <input v-model="formData.name" type="text" required placeholder="如：满100减20 / 9折券">
        </div>
        <div class="field">
          <label>描述</label>
          <input v-model="formData.description" type="text" placeholder="简介/使用说明（可选）">
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>直减金额（¥）</label>
          <input v-model.number="formData.discountAmount" type="number" min="0" step="0.01" placeholder="留空则不使用直减">
        </div>
        <div class="field">
          <label>折扣百分比（1-100）</label>
          <input v-model.number="formData.discountPercentage" type="number" min="1" max="100" step="0.01" placeholder="如 10 表示10%off；与直减二选一">
        </div>
        <div class="field">
          <label>使用门槛（满多少可用）</label>
          <input v-model.number="formData.minimumPurchase" type="number" min="0" step="0.01" placeholder="0 表示无门槛">
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>生效时间</label>
          <input v-model="formData.validFrom" type="datetime-local" required>
        </div>
        <div class="field">
          <label>失效时间</label>
          <input v-model="formData.validTo" type="datetime-local" required>
        </div>
        <div class="field">
          <label>积分兑换需求</label>
          <input v-model.number="formData.pointsRequired" type="number" min="0" step="1" placeholder="0 表示可直接领取">
        </div>
      </div>

      <div class="row">
        <div class="field checkbox">
          <label class="checkbox-label">
            <input v-model="formData.isActive" type="checkbox">
            <span>上架（允许领取/发放）</span>
          </label>
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';
import type { CouponFormData } from '@/types/api';

export default defineComponent({
  name: 'CouponForm',
  props: {
    couponId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      formData: {
        name: '',
        discountAmount: undefined,
        discountPercentage: undefined,
        minimumPurchase: 0,
        validFrom: '',
        validTo: '',
        pointsRequired: 0,
        isActive: true,
        description: ''
      } as CouponFormData
    };
  },
  computed: {
    isEditMode(): boolean {
      return !!this.couponId;
    }
  },
  async mounted() {
    if (this.isEditMode) {
      await this.fetchCoupon();
    }
  },
  methods: {
    async fetchCoupon(): Promise<void> {
      try {
        const couponIdNum = typeof this.couponId === 'string' ? parseInt(this.couponId, 10) : this.couponId;
        if (isNaN(couponIdNum as number)) {
          throw new Error('优惠券ID格式错误');
        }
        const response = await api.coupon.getCouponById(couponIdNum as number);
        const couponData = response.data;
        // 安全地赋值，确保所有必需字段都有值
        this.formData = {
          name: couponData.name || '',
          discountAmount: couponData.discountAmount,
          discountPercentage: couponData.discountPercentage || (couponData as any).discount,
          minimumPurchase: couponData.minimumPurchase,
          validFrom: couponData.validFrom ? this.formatDateTimeForInput(couponData.validFrom) : '',
          validTo: couponData.validTo ? this.formatDateTimeForInput(couponData.validTo) : '',
          pointsRequired: couponData.pointsRequired || 0,
          isActive: couponData.isActive !== undefined ? couponData.isActive : true,
          description: couponData.description || ''
        };
      } catch (error) {
        console.error('获取优惠券失败:', error);
      }
    },
    async submitForm(): Promise<void> {
      try {
        if (this.isEditMode) {
          const couponIdNum = typeof this.couponId === 'string' ? parseInt(this.couponId, 10) : this.couponId;
          await api.coupon.updateCoupon(couponIdNum as number, this.formData);
          alert('优惠券更新成功');
        } else {
          await api.coupon.createCoupon(this.formData);
          alert('优惠券创建成功');
        }
        this.$router.push('/admin/coupons');
      } catch (error) {
        console.error('操作失败:', error);
        alert('操作失败，请重试');
      }
    },
    cancel(): void {
      this.$router.go(-1);
    },
    formatDateTimeForInput(dateString: string): string {
      const date = new Date(dateString);
      const iso = date.toISOString();
      return iso.substring(0, 16); // yyyy-MM-ddTHH:mm
    }
  }
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.page-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}
.sub {
  margin: 4px 0 0;
  color: #666;
  font-size: 13px;
}
.header-actions {
  display: flex;
  gap: 10px;
}
.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  border: 1px solid #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.field label {
  font-weight: 600;
  color: #444;
}
.field input {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}
.field input:focus {
  outline: none;
  border-color: #2575fc;
  box-shadow: 0 0 0 2px rgba(37,117,252,0.1);
}
.field.checkbox {
  flex-direction: row;
  align-items: center;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #444;
}
.btn-primary {
  background: linear-gradient(135deg, #2575fc 0%, #6a11cb 100%);
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: all 0.2s ease;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.btn.ghost {
  background: #f1f3f5;
  color: #333;
  border: 1px solid #e5e7eb;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.btn.ghost:hover { background: #e2e6ea; }

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>