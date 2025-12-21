<template>
  <div class="product-manager">
    <div class="page-header">
      <div class="header-left">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="3" y1="9" x2="21" y2="9"></line>
        </svg>
        <div>
          <h1>{{ isAdmin ? '产品管理' : '本店产品' }}</h1>
          <p class="header-subtitle">{{ isAdmin ? '管理所有产品信息' : '管理本店产品' }}</p>
        </div>
      </div>
      <div class="header-meta">
        <span v-if="storeId !== null" class="store-badge">店铺ID: {{ storeId }}</span>
      </div>
      <button class="add-product-btn" @click="showAddProductForm">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        添加产品
      </button>
    </div>

    <div v-if="showForm" class="form-container">
      <ProductForm
        :product="selectedProduct"
        :isEdit="!!selectedProduct"
        :storeId="storeId"
        :isAdmin="isAdmin"
        @success="handleFormSuccess"
        @error="handleFormError"
        @cancel="closeForm"
      />
    </div>

    <div v-if="message" class="message" :class="{ success: messageType === 'success', error: messageType === 'error' }">
      {{ message }}
    </div>

    <div class="search-section">
      <div class="search-container">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          v-model="searchKeyword"
          @input="handleSearchInput"
          @keyup.enter="performSearch"
          placeholder="搜索产品名称、描述..."
          class="search-input"
        />
        <button v-if="searchKeyword" @click="clearSearch" class="clear-search-btn" title="清除搜索">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <button @click="performSearch" class="search-btn" :disabled="searching">
          {{ searching ? '搜索中...' : '搜索' }}
        </button>
      </div>
      <div v-if="isSearchMode" class="search-info">
        <span>搜索关键词: <strong>{{ searchKeyword }}</strong></span>
        <span class="result-count">找到 {{ products.length }} 个产品</span>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>正在加载产品...</p>
    </div>
    <div v-else-if="error" class="error">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{{ error }}</p>
    </div>

    <div v-else-if="products.length === 0" class="no-products">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="3" y1="9" x2="21" y2="9"></line>
      </svg>
      <p>暂无产品</p>
      <p class="empty-hint">点击上方"添加产品"按钮创建产品</p>
    </div>

    <div v-else class="product-table-container">
      <table class="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>封面</th>
            <th>标题</th>
            <th>价格</th>
            <th>评分</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.id }}</td>
            <td class="product-image">
              <img v-if="product.cover" :src="product.cover" :alt="product.title" @error="handleImageError" />
              <div v-else class="no-image">无图片</div>
            </td>
            <td>{{ product.title }}</td>
            <td>¥{{ (product.price || 0).toFixed(2) }}</td>
            <td>{{ product.rate }}</td>
            <td class="actions">
              <button class="view-btn" @click="viewProduct(product.id)" title="查看详情">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button class="edit-btn" @click="editProduct(product)" title="编辑产品">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="inventory-btn" @click="manageInventory(product)" title="管理库存">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="8" width="18" height="4" rx="1"></rect>
                  <path d="M12 8v13M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
              <button class="delete-btn" @click="confirmDelete(product)" title="删除产品">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
              <button v-if="isAdmin" class="forum-btn" @click="openForumModal(product)" title="论坛管理">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="8" r="3"></circle>
                  <path d="M21 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- pagination, modals, etc. reuse same logic as before -->
    <div v-if="!loading && products.length > 0 && !isSearchMode" class="pagination-container">
      <div class="pagination-info">
        显示第 {{ (currentPage * pageSize) + 1 }} - {{ Math.min((currentPage + 1) * pageSize, total) }} 条，共 {{ total }} 条
      </div>
      <div class="pagination">
        <button class="page-btn" :disabled="currentPage === 0" @click="changePage(0)" title="首页">««</button>
        <button class="page-btn" :disabled="currentPage === 0" @click="changePage(currentPage - 1)" title="上一页">‹</button>
        <template v-for="page in visiblePages" :key="page">
          <button class="page-btn" :class="{ active: page === currentPage }" @click="changePage(page)">{{ page + 1 }}</button>
        </template>
        <button class="page-btn" :disabled="currentPage >= totalPages - 1" @click="changePage(currentPage + 1)" title="下一页">›</button>
        <button class="page-btn" :disabled="currentPage >= totalPages - 1" @click="changePage(totalPages - 1)" title="末页">»»</button>
      </div>
    </div>

    <div v-if="showStockpileModal" class="modal" @click.self="closeStockpileModal">
      <div class="modal-content stockpile-modal">
        <div class="modal-header">
          <div class="modal-title">
            <svg class="modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="8" width="18" height="4" rx="1"></rect>
              <path d="M12 8v13M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"></path>
            </svg>
            <h2>管理库存 - {{ currentProduct?.title || currentProduct?.name || '产品' }}</h2>
          </div>
          <button class="close-btn" @click="closeStockpileModal" title="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <SimpleStockpileEditor
            :productId="currentProduct?.id"
            :productTitle="currentProduct?.title"
            @updated="handleStockpileUpdated"
            @close="closeStockpileModal"
          />
        </div>
      </div>
    </div>

    <!-- Forum create/check modal for a single product (admin only) -->
    <div v-if="showForumModal" class="modal" @click.self="closeForumModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">
            <h2>论坛管理 - {{ forumProduct?.title || '产品' }}</h2>
          </div>
          <button class="close-btn" @click="closeForumModal" title="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="forumError" class="error" style="color:#c62828;">{{ forumError }}</div>

          <div v-if="forumChecking" class="loading">
            <div class="spinner"></div>
            <span>正在检查论坛...</span>
          </div>

          <div v-else-if="forumExists === true">
            <p>该产品已存在论坛：<strong>{{ forumInfo?.name || '（未获取名称）' }}</strong></p>
            <div v-if="forumSuccess" class="form-group">
              <div class="message success">{{ forumSuccess }}</div>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-primary" @click="goToForum">前往论坛</button>
              <button class="btn btn-secondary" @click="closeForumModal">关闭</button>
            </div>
          </div>

          <div v-else-if="forumExists === false">
            <p>当前尚未为该产品创建论坛，是否现在创建？</p>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-primary" @click="confirmCreateForum" :disabled="forumCreating">
                {{ forumCreating ? '创建中...' : '创建论坛' }}
              </button>
              <button class="btn btn-secondary" @click="closeForumModal">取消</button>
            </div>
          </div>

          <div v-else>
            <p>准备检查该产品是否已有论坛...</p>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-primary" @click="checkForumExists(forumProduct?.id)" :disabled="forumChecking || !forumProduct">检查论坛是否存在</button>
              <button class="btn btn-secondary" @click="closeForumModal">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete modal and other UI reuse existing logic -->
  </div>
</template>

<script>
import api from '@/api';
import ProductForm from './ProductForm.vue';
import SimpleStockpileEditor from './SimpleStockpileEditor.vue';

export default {
  name: 'ProductManager',
  props: {
    storeId: {
      type: [String, Number],
      default: null
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ProductForm,
    SimpleStockpileEditor
  },
  data() {
    return {
      products: [],
      loading: true,
      error: null,
      showForm: false,
      selectedProduct: null,
      message: '',
      messageType: 'success',
      showStockpileModal: false,
      showDeleteModal: false,
      currentProduct: null,
      // forum management (admin)
      showForumModal: false,
      forumChecking: false,
      forumExists: null,
      forumInfo: null,
      forumError: '',
      forumCreating: false,
      forumSuccess: '',
      forumCreated: false,
      forumProduct: null,
      searchKeyword: '',
      isSearchMode: false,
      searching: false,
      searchTimer: null,
      currentPage: 0,
      pageSize: 20,
      total: 0,
      totalPages: 0
    };
  },
  computed: {
    visiblePages() {
      const pages = [];
      const maxVisible = 7;
      let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages - 1, start + maxVisible - 1);
      if (end - start < maxVisible - 1) {
        start = Math.max(0, end - maxVisible + 1);
      }
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    }
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      this.loading = true;
      try {
        const response = await api.product.getManageProducts(this.currentPage, this.pageSize);
        if (response.code === '200' && response.data) {
          let items = Array.isArray(response.data.products) ? response.data.products : [];
          if (this.storeId) {
            items = items.filter(p => String(p.storeId) === String(this.storeId));
          }
          this.products = items;
          this.total = this.products.length || response.data.total || 0;
          this.totalPages = response.data.totalPages || 0;
        } else {
          this.error = response.msg || '加载产品失败';
        }
      } catch (err) {
        this.error = '加载产品出错。请稍后再试。';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    changePage(page) {
      if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.fetchProducts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    async performSearch() {
      if (!this.searchKeyword.trim()) {
        this.clearSearch();
        return;
      }
      this.searching = true;
      this.isSearchMode = true;
      this.loading = true;
      this.error = null;
      this.currentPage = 0;
      try {
        const response = await api.product.searchProducts(this.searchKeyword.trim(), 0, 100, null, null);
        if (response.code === '200' && response.data) {
          let items = response.data.products || [];
          if (this.storeId) {
            items = items.filter(p => String(p.storeId) === String(this.storeId));
          }
          this.products = items;
          this.total = response.data.total || items.length;
          this.totalPages = response.data.totalPages || 0;
        } else {
          this.error = response.msg || '搜索失败';
          this.products = [];
          this.total = 0;
          this.totalPages = 0;
        }
      } catch (err) {
        console.error('搜索产品出错:', err);
        this.error = '搜索产品时发生错误，请稍后再试';
        this.products = [];
        this.total = 0;
        this.totalPages = 0;
      } finally {
        this.loading = false;
        this.searching = false;
      }
    },
    handleSearchInput() {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      if (!this.searchKeyword.trim()) {
        this.clearSearch();
        return;
      }
      this.searchTimer = setTimeout(() => this.performSearch(), 500);
    },
    clearSearch() {
      this.searchKeyword = '';
      this.isSearchMode = false;
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
        this.searchTimer = null;
      }
      this.currentPage = 0;
      this.fetchProducts();
    },
    showAddProductForm() {
      this.selectedProduct = null;
      this.showForm = true;
      this.message = '';
    },
    editProduct(product) {
      this.selectedProduct = { ...product };
      this.showForm = true;
      this.message = '';
    },
    closeForm() {
      this.showForm = false;
      this.selectedProduct = null;
    },
    handleFormSuccess(data) {
      this.showForm = false;
      this.messageType = 'success';
      this.message = this.selectedProduct ? '产品更新成功！' : '产品创建成功！';
      if (this.isSearchMode) this.performSearch(); else this.fetchProducts();
      setTimeout(() => { this.message = ''; }, 3000);
    },
    handleFormError(errorMsg) {
      this.messageType = 'error';
      this.message = errorMsg;
      setTimeout(() => { this.message = ''; }, 5000);
    },
    manageInventory(product) {
      this.currentProduct = product;
      this.showStockpileModal = true;
    },
    handleStockpileUpdated(payload) {
      // show a brief message and refresh product list
      this.messageType = 'success';
      this.message = '库存已更新';
      if (this.isSearchMode) this.performSearch(); else this.fetchProducts();
      this.closeStockpileModal();
      setTimeout(() => { this.message = ''; }, 3000);
    },
    closeStockpileModal() {
      this.showStockpileModal = false;
      this.currentProduct = null;
    },
    openForumModal(product) {
      this.forumProduct = product;
      this.showForumModal = true;
      this.forumChecking = false;
      this.forumExists = null;
      this.forumInfo = null;
      this.forumError = '';
      this.forumCreating = false;
      // auto-check
      this.checkForumExists(product?.id);
    },
    closeForumModal() {
      this.showForumModal = false;
      this.forumProduct = null;
      this.forumChecking = false;
      this.forumExists = null;
      this.forumInfo = null;
      this.forumError = '';
      this.forumCreating = false;
    },
    async checkForumExists(productId) {
      if (!productId) return;
      this.forumChecking = true;
      this.forumError = '';
      this.forumExists = null;
      this.forumInfo = null;
      try {
        const res = await api.forum.existsBookForum(Number(productId));
        if (res && res.data && typeof res.data.exists !== 'undefined') {
          this.forumExists = !!res.data.exists;
          if (this.forumExists) {
            // fetch details safely
            try {
              const infoRes = await api.forum.getForumByBookId(Number(productId));
              this.forumInfo = infoRes.data;
            } catch (e) {
              console.error('获取论坛详情失败:', e);
            }
          }
        } else {
          this.forumError = '接口返回格式异常';
        }
      } catch (err) {
        this.forumError = err?.response?.data?.msg || err?.message || '检查失败';
      } finally {
        this.forumChecking = false;
      }
    },
    async confirmCreateForum() {
      const productId = this.forumProduct?.id;
      if (!productId) {
        alert('无法获取产品 ID');
        return;
      }
      this.forumCreating = true;
      this.forumError = '';
      try {
        const res = await api.forum.createBookForum(Number(productId));
        if (res && res.data && res.data.id) {
          // don't navigate immediately — show success and convert to navigate button
          this.forumInfo = res.data;
          this.forumExists = true;
          this.forumCreated = true;
          this.forumSuccess = '论坛创建成功';
        } else {
          this.forumError = res.msg || '创建失败';
        }
      } catch (err) {
        this.forumError = err?.response?.data?.msg || err?.message || '创建失败';
      } finally {
        this.forumCreating = false;
      }
    },
    goToForum() {
      const id = this.forumInfo?.id;
      if (id) {
        this.$router.push(`/forums/${id}`);
        this.closeForumModal();
      } else {
        alert('无法获取论坛 ID，稍后重试');
      }
    },
    async confirmDelete(product) {
      this.currentProduct = product;
      this.showDeleteModal = true;
    },
    async deleteProduct() {
      if (!this.currentProduct) return;
      try {
        const response = await api.product.deleteProduct(this.currentProduct.id);
        if (response.code === '200') {
          this.messageType = 'success';
          this.message = '产品删除成功！';
          if (this.isSearchMode) await this.performSearch(); else await this.fetchProducts();
        } else {
          this.messageType = 'error';
          this.message = response.msg || '删除产品失败';
        }
      } catch (err) {
        console.error('删除产品出错:', err);
        this.messageType = 'error';
        this.message = '删除产品时发生错误';
      }
      this.closeDeleteModal();
      setTimeout(() => { this.message = ''; }, 3000);
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.currentProduct = null;
    },
    viewProduct(id) { this.$router.push(`/product/${id}`); },
    handleImageError(event) {
      const target = event.target; if (target) { target.onerror = null; target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E暂无图片%3C/text%3E%3C/svg%3E'; }
    }
  }
};
</script>

<style scoped>
.admin-product-manager, .product-manager {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 40px;
  height: 40px;
  color: #ff6b35;
  stroke-width: 2;
}

.page-header h1 {
  margin: 0 0 4px 0;
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
}

.header-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.add-product-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.add-product-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.add-product-btn:active {
  transform: translateY(0);
}

.btn-icon {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

.search-section {
  margin-bottom: 24px;
  padding: 20px 32px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-container {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  color: #999;
  stroke-width: 2;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  flex: 1;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #ff6b35;
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.clear-search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
}

.clear-search-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.clear-search-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
}

.search-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-info {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
}

.search-info strong {
  color: #ff6b35;
  font-weight: 600;
}

.result-count {
  color: #999;
  font-size: 0.85rem;
}

.form-container {
  margin-bottom: 30px;
}

.message {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.message.error {
  background-color: #ffebee;
  color: #c62828;
}

.product-table-container {
  overflow-x: auto;
  overflow-y: visible;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  scrollbar-width: thin;
  scrollbar-color: #c0c0c0 #f0f0f0;
  min-width: 100%;
}

.product-table-container::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.product-table-container::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}

.product-table-container::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 4px;
}

.product-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  background: white;
}

.product-table thead {
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: white;
}

.product-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.product-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  position: relative;
}

.product-table tbody tr:hover {
  background-color: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.product-table td {
  padding: 16px;
  color: #333;
  overflow: hidden;
  word-wrap: break-word;
}

.product-table td:nth-child(3) {
  white-space: normal;
  word-break: break-word;
  max-width: 300px;
}

.product-image {
  width: 80px;
}

.product-image img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-image img:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.no-image {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 8px;
  font-size: 0.7rem;
  color: #999;
  text-align: center;
  border: 2px solid #e0e0e0;
}

.product-table td:nth-child(4) {
  font-weight: 600;
  color: #ff6b35;
  font-size: 1.05rem;
}

.product-table td:nth-child(5) {
  color: #666;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.actions button svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.view-btn {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
}

.edit-btn {
  background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
  color: #f57f17;
}

.inventory-btn {
  background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);
  color: #00796b;
}

.delete-btn {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
}

.view-btn:hover {
  background: linear-gradient(135deg, #bbdefb 0%, #90caf9 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(25, 118, 210, 0.3);
}

.edit-btn:hover {
  background: linear-gradient(135deg, #fff59d 0%, #fff176 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(245, 127, 23, 0.3);
}

.inventory-btn:hover {
  background: linear-gradient(135deg, #b2dfdb 0%, #80cbc4 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 121, 107, 0.3);
}

.delete-btn:hover {
  background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(198, 40, 40, 0.3);
}

.loading {
  padding: 80px 20px;
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  padding: 60px 20px;
  text-align: center;
  color: #c62828;
  background: #ffebee;
  border-radius: 8px;
  border: 2px solid #f44336;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-icon {
  width: 48px;
  height: 48px;
  stroke-width: 2;
}

.no-products {
  padding: 80px 20px;
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  stroke-width: 1.5;
  opacity: 0.5;
  margin-bottom: 8px;
}

.empty-hint {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #999;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.stockpile-modal {
  max-width: 700px;
  max-height: 85vh;
  overflow-y: auto;
}

.delete-confirmation {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: white;
  border-radius: 12px 12px 0 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.close-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 2.5;
}

.modal-body {
  padding: 24px;
}

.warning {
  color: #f44336;
  font-weight: 600;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  margin-top: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.pagination-info {
  color: #666;
  font-size: 0.9rem;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 2px solid #e0e0e0;
  background: white;
  color: #333;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  border-color: #ff6b35;
  color: #ff6b35;
  background: #fff5f2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.2);
}

.page-btn.active {
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: white;
  border-color: #ff6b35;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.page-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
.store-badge {
  background: rgba(0,0,0,0.06);
  color: #333;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>


