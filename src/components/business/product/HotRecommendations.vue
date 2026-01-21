<template>
  <div class="hot-block">
    <div class="block-header">
      <h3>热门推荐</h3>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="products.length === 0" class="no-products">暂无热门商品</div>
    <div v-else class="products-grid">
      <template v-if="products && products.length">
        <div
          v-for="p in products"
          :key="p.id"
          class="product-item"
        >
          <ProductCard
            :product="p"
            @view="viewProduct"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import ProductCard from './ProductCard.vue';

export default defineComponent({
  name: 'HotRecommendations',
  components: { ProductCard },
  setup() {
    const loading = ref(true);
    const error = ref('');
    const products = ref<any[]>([]);

    const load = async () => {
      loading.value = true;
      error.value = '';
      try {
        const res = await api.product.getHotRecommendations(0, 12);
        if (res && res.code === '200' && res.data) {
          // backend returns RecommendSearchResultVO with items array
          const payload: any = res.data as any;
          const items = payload.items || payload.products || payload;
          if (Array.isArray(items)) {
            // Hot recommendations return RecommendProductVO: { product: ProductVO, priority: string }
            const normalized = items.map((it: any) => {
              if (it && it.product) {
                // Inject priority into product for ProductCard compatibility
                it.product.priority = it.priority || it.product.priority;
                return it.product;
              }
              return it;
            });
            products.value = normalized;
          } else {
            products.value = [];
          }
        } else {
          error.value = res?.msg || '获取热门推荐失败';
        }
      } catch (e: any) {
        error.value = '网络错误，请稍后重试';
        console.error(e);
      } finally {
        loading.value = false;
      }
    };

    const router = useRouter();
    const viewProduct = (id: number | string) => {
      router.push(`/product/${id}`);
    };

    const handleImageError = (ev: Event) => {
      const t = ev.target as HTMLImageElement;
      t.onerror = null;
      t.src = '';
    };

    onMounted(load);

    return { loading, error, products, viewProduct, handleImageError };
  }
});
</script>

<style scoped>
.hot-block { margin-top: 24px; }
.block-header { margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center;}
.products-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; }
.product-card { background:white; border-radius:6px; overflow:hidden; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.product-image-container { width:100%; padding-bottom:66%; background:#f6f6f6; position:relative; }
.product-image { position:absolute; top:0; left:0; width:100%; height:100%; object-fit:cover; }
.product-info { padding:8px; }
.product-title { font-size:14px; margin:0 0 6px 0; color:#333; height:2.4em; overflow:hidden; }

/* 限制子项高度，防止长标题撑高卡片（与个人页做法一致） */
.products-grid .product-item {
  height: 320px;
  overflow: hidden;
  display: block;
  align-self: start;
}

/* 让内部的 ProductCard 充满父容器并使用列布局 */
.products-grid .product-item :deep(.product-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.products-grid .product-item :deep(.product-image-container) {
  flex: 0 0 auto;
}
.products-grid .product-item :deep(.product-info) {
  flex: 1 1 auto;
  overflow: hidden;
}
.product-price { color:#ff6b35; font-weight:700; }
.loading, .error, .no-products { padding:16px; text-align:center; color:#666; }
</style>
