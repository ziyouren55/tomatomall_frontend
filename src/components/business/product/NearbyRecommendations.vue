<template>
  <div class="nearby-block">
    <div class="block-header">
      <h3>附近推荐</h3>
    </div>

    <div v-if="needCert" class="cert-prompt">
      <p>要查看附近推荐，请先完成学校认证。</p>
      <button @click="goToCert" class="cert-btn">去认证</button>
    </div>

      <div v-else>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="products.length === 0" class="no-products">暂无推荐</div>
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import ProductCard from './ProductCard.vue';

export default defineComponent({
  name: 'NearbyRecommendations',
  components: { ProductCard },
  setup() {
    const needCert = ref(false);
    const loading = ref(true);
    const error = ref('');
    const products = ref<any[]>([]);

    const load = async () => {
      loading.value = true;
      error.value = '';
      needCert.value = false;
      try {
        const res = await api.product.getNearbyRecommendations(0, 12);
        if (res && res.code === '200' && res.data) {
          // backend may return {items} or {products}
          const payload: any = res.data as any;
          const items = payload.items || payload.products || payload;
          if (Array.isArray(items)) {
            // 新后端可能返回 RecommendProductVO: { product: ProductVO, priority: string }
            const normalized = items.map((it: any) => {
              if (it && it.product) {
                // 将 priority 注入到 product 上，方便前端复用现有 ProductCard 逻辑
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
          // handle not verified case via message
          if (res && res.msg && res.msg.includes('SCHOOL_NOT_VERIFIED')) {
            needCert.value = true;
          } else {
            error.value = res?.msg || '获取附近推荐失败';
          }
        }
      } catch (e: any) {
        // network or server error may include specific message
        if (e?.response?.data?.msg && String(e.response.data.msg).includes('SCHOOL_NOT_VERIFIED')) {
          needCert.value = true;
        } else {
          error.value = '网络错误，请稍后重试';
          console.error(e);
        }
      } finally {
        loading.value = false;
      }
    };

    const goToCert = () => {
      router.push({ path: '/profile', query: { openVerify: '1' } });
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

    return { needCert, loading, error, products, goToCert, viewProduct, handleImageError };
  }
});
</script>

<style scoped>
.nearby-block { margin-top: 24px; }
.block-header { margin-bottom: 12px; display:flex; justify-content:space-between; align-items:center;}
.cert-prompt { padding: 16px; background:#fff5f0; border:1px solid #ffd6cb; border-radius:6px; }
.cert-btn { margin-top:8px; background:#ff6b35; color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer; }
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


