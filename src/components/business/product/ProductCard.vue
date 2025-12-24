<template>
  <div class="product-card" @click="onView" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div class="product-image-container">
      <img :src="product.cover" :alt="product.title" class="product-image" @error="handleImageError" />
      <div class="product-overlay"><span class="view-details">查看详情</span></div>
    </div>
    <div class="product-info">
      <h3 class="product-title" :title="product.title">{{ product.title }}</h3>
      <div class="product-price">
        <span class="price-symbol">¥</span>
        <span class="price-value">{{ formatPrice(product.price) }}</span>
      </div>
      <div class="product-stats">
        <div class="product-rating" v-if="product.rate">
          <span class="stars">
            <span v-for="n in 5" :key="n" :class="['star', { filled: n <= Math.round(product.rate / 2) }]">★</span>
          </span>
          <span class="rate-text">{{ product.rate }}</span>
        </div>
        <div class="product-sales" v-if="product.salesCount">
          <span class="sales-text">{{ product.salesCount }}人购买</span>
        </div>
      </div>
      <div v-if="product.priority" class="priority-tag">{{ priorityLabel(product.priority) }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Product } from '@/api/modules/product';

export default defineComponent({
  name: 'ProductCard',
  props: {
    product: { type: Object as () => Product, required: true }
  },
  emits: ['view'],
  methods: {
    onView() { this.$emit('view', this.product.id); },
    handleImageError(e: Event) { const t = e.target as HTMLImageElement; t.onerror = null; t.src = ''; },
    formatPrice(p: number) { return (typeof p === 'number' ? p.toFixed(2) : '0.00'); },
    onMouseEnter() {},
    onMouseLeave() {},
    priorityLabel(v: string) {
      if (!v) return '';
      if (v === 'same_school') return '同校';
      if (v === 'same_city') return '同城';
      return '其他';
    }
  }
});
</script>

<style scoped>
.priority-tag { margin-top:6px; display:inline-block; padding:2px 6px; background:#fff0e6; color:#ff6b35; border-radius:12px; font-size:12px; }
/* product card styles reused from ProductList for visual parity */
.product-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
}
.product-card:hover {
  border-color: #ff6b35;
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.15);
  transform: translateY(-8px);
}
.product-image-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  overflow: hidden;
  background-color: #f8f8f8;
}
.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.product-card:hover .product-image {
  transform: scale(1.05);
}
.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.product-card:hover .product-overlay {
  opacity: 1;
}
.view-details {
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
  border: 2px solid white;
  border-radius: 20px;
  transition: all 0.3s ease;
}
.view-details:hover {
  background-color: white;
  color: #333;
}
.product-info {
  padding: 12px;
}
.product-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}
.product-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}
.price-symbol {
  font-size: 12px;
  color: #ff6b35;
  font-weight: 500;
}
.price-value {
  font-size: 18px;
  font-weight: 700;
  color: #ff6b35;
  margin-left: 1px;
}
.product-stats {
  padding: 0 12px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.stars { color: #ddd; margin-right: 4px; font-size: 10px; }
.star.filled { color: #ffc107; }
.rate-text { color: #666; font-size: 11px; }
.sales-text { color: #999; font-size: 11px; }
</style>


