<!-- src/components/AdminProductManager.vue -->
<template>
    <div class="admin-product-manager">
      <div class="page-header">
        <h1>产品管理</h1>
        <button class="add-product-btn" @click="showAddProductForm">增添产品</button>
      </div>
      
      <div v-if="showForm" class="form-container">
        <ProductForm 
          :product="selectedProduct" 
          :isEdit="!!selectedProduct"
          @success="handleFormSuccess"
          @error="handleFormError"
          @cancel="closeForm"
        />
      </div>
      
      <div v-if="message" class="message" :class="{ success: messageType === 'success', error: messageType === 'error' }">
        {{ message }}
      </div>
      
      <div v-if="loading" class="loading">
        <p>正在加载产品...</p>
      </div>
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="products.length === 0" class="no-products">
        <p>暂无产品。添加您的第一个产品！</p>
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
                <img 
                  v-if="product.cover" 
                  :src="product.cover" 
                  :alt="product.title"
                  @error="handleImageError"
                >
                <div v-else class="no-image">无图片</div>
              </td>
              <td>{{ product.title }}</td>
              <td>¥{{ product.price.toFixed(2) }}</td>
              <td>{{ product.rate }}</td>
              <td class="actions">
                <button class="view-btn" @click="viewProduct(product.id)">查看</button>
                <button class="edit-btn" @click="editProduct(product)">编辑</button>
                <button class="inventory-btn" @click="manageInventory(product)">库存</button>
                <button class="delete-btn" @click="confirmDelete(product)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Stockpile Management Modal -->
      <div v-if="showStockpileModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>管理库存: {{ currentProduct?.title }}</h2>
            <button class="close-btn" @click="closeStockpileModal">&times;</button>
          </div>
          <div class="modal-body">
            <StockpileManager 
              :productId="currentProduct?.id"
              @updated="handleStockpileUpdated"
            />
          </div>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal">
        <div class="modal-content delete-confirmation">
          <div class="modal-header">
            <h2>确认删除</h2>
            <button class="close-btn" @click="closeDeleteModal">&times;</button>
          </div>
          <div class="modal-body">
            <p>您确定要删除 <strong>{{ currentProduct?.title }}</strong> 吗？</p>
            <p class="warning">此操作无法撤销。</p>
            <div class="modal-actions">
              <button class="cancel-btn" @click="closeDeleteModal">取消</button>
              <button class="delete-confirm-btn" @click="deleteProduct">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import api from '@/api';
  import ProductForm from './ProductForm.vue';
  import StockpileManager from './StockPileManager.vue';
  
  export default {
    name: 'AdminProductManager',
    components: {
      ProductForm,
      StockpileManager
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
        currentProduct: null
      };
    },
    mounted() {
      this.fetchProducts();
    },
    methods: {
      async fetchProducts() {
        this.loading = true;
        try {
          const response = await api.product.getAllProducts();
          if (response.code === '200') {
            this.products = response.data;
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
        this.fetchProducts(); // Refresh the product list
        
        // Clear message after 3 seconds
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      handleFormError(errorMsg) {
        this.messageType = 'error';
        this.message = errorMsg;
        
        // Clear message after 5 seconds
        setTimeout(() => {
          this.message = '';
        }, 5000);
      },
      manageInventory(product) {
        this.currentProduct = product;
        this.showStockpileModal = true;
      },
      closeStockpileModal() {
        this.showStockpileModal = false;
        this.currentProduct = null;
      },
      handleStockpileUpdated() {
        // Optionally do something when stockpile is updated
      },
      confirmDelete(product) {
        this.currentProduct = product;
        this.showDeleteModal = true;
      },
      closeDeleteModal() {
        this.showDeleteModal = false;
        this.currentProduct = null;
      },
      async deleteProduct() {
        if (!this.currentProduct) return;
        
        try {
          const response = await api.product.deleteProduct(this.currentProduct.id);
          
          if (response.code === 200) {
            this.messageType = 'success';
            this.message = '产品删除成功！';
            
            // Refresh product list
            this.fetchProducts();
          } else {
            this.messageType = 'error';
            this.message = response.msg || '删除产品失败';
          }
        } catch (err) {
          console.error('删除产品出错:', err);
          this.messageType = 'error';
          this.message = '删除产品时发生错误';
        }
        
        // Close the modal
        this.closeDeleteModal();
        
        // Clear message after 3 seconds
        setTimeout(() => {
          this.message = '';
        }, 3000);
      },
      viewProduct(id) {
        this.$router.push(`/product/${id}`);
      },
      handleImageError(event) {
        event.target.onerror = null;
        event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E暂无图片%3C/text%3E%3C/svg%3E';
      }
    }
  };
  </script>
  
  <style scoped>
  .admin-product-manager {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .page-header h1 {
    margin: 0;
  }
  
  .add-product-btn {
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .add-product-btn:hover {
    background-color: #388e3c;
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
  }
  
  .product-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }
  
  .product-table th,
  .product-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .product-table th {
    background-color: #f5f5f5;
    font-weight: 600;
  }
  
  .product-table tr:hover {
    background-color: #f9f9f9;
  }
  
  .product-image {
    width: 60px;
  }
  
  .product-image img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 4px;
  }
  
  .no-image {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 4px;
    font-size: 0.7rem;
    color: #666;
    text-align: center;
  }
  
  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .actions button {
    padding: 6px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }
  
  .view-btn {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  .edit-btn {
    background-color: #fff9c4;
    color: #f57f17;
  }
  
  .inventory-btn {
    background-color: #e0f2f1;
    color: #00796b;
  }
  
  .delete-btn {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .view-btn:hover {
    background-color: #bbdefb;
  }
  
  .edit-btn:hover {
    background-color: #fff59d;
  }
  
  .inventory-btn:hover {
    background-color: #b2dfdb;
  }
  
  .delete-btn:hover {
    background-color: #ffcdd2;
  }
  
  .loading, .error, .no-products {
    padding: 50px;
    text-align: center;
    color: #666;
  }
  
  .error {
    color: #c62828;
  }
  
  /* Modal styles */
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
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  .delete-confirmation {
    max-width: 400px;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .warning {
    color: #f44336;
    font-weight: 600;
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  
  .cancel-btn {
    padding: 8px 16px;
    background-color: #e0e0e0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .delete-confirm-btn {
    padding: 8px 16px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .cancel-btn:hover {
    background-color: #d0d0d0;
  }
  
  .delete-confirm-btn:hover {
    background-color: #d32f2f;
  }
  </style>