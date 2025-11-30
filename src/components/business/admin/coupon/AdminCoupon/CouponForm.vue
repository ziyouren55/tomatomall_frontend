<template>
  <div>
    <h2>{{ isEditMode ? '编辑优惠券' : '创建新优惠券' }}</h2>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label>优惠券名称</label>
        <input v-model="formData.name" type="text" class="form-control" required>
      </div>
      <div class="form-group">
        <label>折扣率 (%)</label>
        <input v-model="formData.discount" type="number" min="1" max="100" class="form-control" required>
      </div>
      <div class="form-group">
        <label>有效期</label>
        <input v-model="formData.expiryDate" type="date" class="form-control" required>
      </div>
      <div class="form-group">
        <label>描述</label>
        <textarea v-model="formData.description" class="form-control"></textarea>
      </div>
      <button type="submit" class="btn btn-primary">{{ isEditMode ? '更新' : '创建' }}</button>
      <button @click="cancel" type="button" class="btn btn-secondary">取消</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';

interface CouponFormData {
  name: string
  discount: number
  expiryDate: string
  description: string
}

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
        discount: 10,
        expiryDate: '',
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
        const response = await api.coupon.getCouponById(this.couponId);
        this.formData = { ...response.data };
        // 转换日期格式
        if (this.formData.expiryDate) {
          this.formData.expiryDate = this.formatDateForInput(this.formData.expiryDate);
        }
      } catch (error) {
        console.error('获取优惠券失败:', error);
      }
    },
    async submitForm(): Promise<void> {
      try {
        if (this.isEditMode) {
          await api.coupon.updateCoupon(this.couponId, this.formData);
          this.$toast.success('优惠券更新成功');
        } else {
          await api.coupon.createCoupon(this.formData);
          this.$toast.success('优惠券创建成功');
        }
        this.$router.push('/admin/coupons');
      } catch (error) {
        console.error('操作失败:', error);
        this.$toast.error('操作失败，请重试');
      }
    },
    cancel(): void {
      this.$router.go(-1);
    },
    formatDateForInput(dateString: string): string {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    }
  }
});
</script>