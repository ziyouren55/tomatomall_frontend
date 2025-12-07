<style scoped>
.stockpile-manager {
  padding: 32px;
}

.content-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 24px;
  padding: 20px;
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

.content-header h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 1.75rem;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.stockpile-list {
  margin-bottom: 32px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  stroke-width: 1.5;
  opacity: 0.5;
}

/* 网格布局 - 批量管理 */
.stockpile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.stockpile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stockpile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: #ff6b35;
}

.stockpile-card.editing {
  border-color: #ff6b35;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.2);
}

.card-header {
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e0e0e0;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  flex-shrink: 0;
}

.product-thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
}

.product-thumb.placeholder svg {
  width: 32px;
  height: 32px;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-id {
  font-size: 0.85rem;
  color: #999;
}

.card-body {
  padding: 16px;
}

.stock-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stock-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stock-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 6px;
}

.stock-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
}

.stock-value.available {
  color: #2e7d32;
}

.stock-value.frozen {
  color: #e65100;
}

.stock-value.total {
  color: #1565c0;
}

.card-actions {
  display: flex;
  justify-content: center;
}

.quick-edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
}

.quick-edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
}

.quick-edit-btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}

/* 快速编辑模式 */
.quick-edit {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #f0f0f0;
}

.edit-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
}

.number-input.compact {
  height: 40px;
}

.number-input.compact .number-btn {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.number-input.compact .number-btn svg {
  width: 16px;
  height: 16px;
}

.number-input.compact .number-input-field {
  height: 36px;
  font-size: 1rem;
}

.edit-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.save-btn, .cancel-edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.save-btn {
  background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  color: white;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.save-btn svg {
  width: 14px;
  height: 14px;
  stroke-width: 3;
}

.cancel-edit-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-edit-btn:hover {
  background: #e0e0e0;
}

.cancel-edit-btn svg {
  width: 14px;
  height: 14px;
  stroke-width: 2;
}

.stockpile-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.info-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.info-icon svg {
  width: 24px;
  height: 24px;
  stroke-width: 2;
}

.available-icon {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
}

.frozen-icon {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
}

.total-icon {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
}

.info-item .label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.info-item .value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.stockpile-edit {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border: 2px solid #ff6b35;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.edit-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.edit-icon {
  width: 24px;
  height: 24px;
  color: #ff6b35;
  stroke-width: 2;
}

.edit-header h4 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-edit-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
}

.close-edit-btn:hover {
  background: #e0e0e0;
  transform: rotate(90deg);
}

.close-edit-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.stockpile-actions {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.actions-title {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.adjustment-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.label-icon {
  width: 18px;
  height: 18px;
  color: #ff6b35;
  stroke-width: 2;
}

.number-input {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  overflow: visible;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 2px solid #e0e0e0;
  transition: border-color 0.3s ease;
}

.number-input:focus-within {
  border-color: #ff6b35;
  box-shadow: 0 2px 12px rgba(255, 107, 53, 0.2);
}

.number-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.number-btn:hover {
  background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
}

.number-btn:active {
  transform: scale(0.95);
}

.number-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 3;
}

.number-input-field {
  flex: 1;
  height: 40px;
  text-align: center;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  background: transparent;
  outline: none;
  min-width: 0;
}

.number-input-field::-webkit-inner-spin-button,
.number-input-field::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.cancel-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.update-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.update-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.update-btn:active {
  transform: translateY(0);
}

.update-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 3;
}

.update-message {
  margin-top: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  animation: slideIn 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.update-message.success {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  border: 2px solid #4caf50;
}

.update-message.error {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  border: 2px solid #f44336;
}

.loading {
  padding: 60px 20px;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
}

.loading::before {
  content: '';
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;
  vertical-align: middle;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  padding: 60px 20px;
  text-align: center;
  color: #c62828;
  font-size: 1.1rem;
  background: #ffebee;
  border-radius: 8px;
  border: 2px solid #f44336;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stockpile-manager {
    padding: 20px;
  }

  .stockpile-info {
    grid-template-columns: 1fr;
  }

  .adjustment-form {
    grid-template-columns: 1fr;
  }

  .table-wrapper {
    overflow-x: scroll;
  }

  .stockpile-table {
    min-width: 600px;
  }
}
</style>
<!-- src/components/StockpileManager.vue -->
<template>
  <div class="stockpile-manager">
    <div v-if="loading" class="loading">
      <p>正在加载库存信息...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    <div v-else class="stockpile-content">
      <div class="content-header">
        <h3>产品库存管理</h3>
        <p class="subtitle">查看和管理所有产品的库存信息</p>
      </div>

      <!-- 搜索框 -->
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
            placeholder="搜索产品名称..."
            class="search-input"
          />
          <button 
            v-if="searchKeyword" 
            @click="clearSearch" 
            class="clear-search-btn"
            title="清除搜索"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div v-if="searchKeyword && filteredStockpiles.length !== stockpiles.length" class="search-info">
          <span>搜索关键词: <strong>{{ searchKeyword }}</strong></span>
          <span class="result-count">找到 {{ filteredStockpiles.length }} / {{ stockpiles.length }} 个库存项</span>
        </div>
      </div>
      
      <!-- 库存列表 - 批量管理模式 -->
      <div class="stockpile-list">
        <div v-if="filteredStockpiles.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          </svg>
          <p>{{ searchKeyword ? '未找到匹配的库存信息' : '暂无库存信息' }}</p>
        </div>
        <div v-else class="stockpile-grid">
          <div 
            v-for="item in filteredStockpiles" 
            :key="item.productId" 
            class="stockpile-card"
            :class="{ 'editing': editingStockpiles.has(item.productId) }"
          >
            <div class="card-header">
              <div class="product-info">
                <img 
                  v-if="getProductInfo(item.productId)?.cover" 
                  :src="getProductInfo(item.productId).cover" 
                  :alt="getProductInfo(item.productId)?.title || '产品'"
                  class="product-thumb"
                  @error="handleImageError"
                >
                <div v-else class="product-thumb placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  </svg>
                </div>
                <div class="product-details">
                  <div class="product-name">{{ getProductInfo(item.productId)?.title || `产品 #${item.productId}` }}</div>
                  <div class="product-id">ID: {{ item.productId }}</div>
                </div>
              </div>
            </div>
            
            <div class="card-body">
              <div class="stock-info-grid">
                <div class="stock-item">
                  <span class="stock-label">可用</span>
                  <span class="stock-value available">{{ item.amount }}</span>
                </div>
                <div class="stock-item">
                  <span class="stock-label">冻结</span>
                  <span class="stock-value frozen">{{ item.frozen }}</span>
                </div>
                <div class="stock-item">
                  <span class="stock-label">总计</span>
                  <span class="stock-value total">{{ item.amount + item.frozen }}</span>
                </div>
              </div>
              
              <!-- 快速编辑模式 -->
              <div v-if="editingStockpiles.has(item.productId)" class="quick-edit">
                <div class="edit-controls">
                  <div class="control-group">
                    <label>可用库存</label>
                    <div class="number-input compact">
                      <button type="button" @click="decrementQuickAmount(item.productId)" class="number-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <input 
                        type="number" 
                        v-model.number="editingStockpiles.get(item.productId)!.amount" 
                        min="0"
                        class="number-input-field"
                      >
                      <button type="button" @click="incrementQuickAmount(item.productId)" class="number-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="control-group">
                    <label>冻结库存</label>
                    <div class="number-input compact">
                      <button type="button" @click="decrementQuickFrozen(item.productId)" class="number-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                      <input 
                        type="number" 
                        v-model.number="editingStockpiles.get(item.productId)!.frozen" 
                        min="0"
                        class="number-input-field"
                      >
                      <button type="button" @click="incrementQuickFrozen(item.productId)" class="number-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="edit-actions">
                  <button class="save-btn" @click="saveQuickEdit(item.productId)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    保存
                  </button>
                  <button class="cancel-edit-btn" @click="cancelQuickEdit(item.productId)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    取消
                  </button>
                </div>
              </div>
              
              <!-- 操作按钮 -->
              <div v-else class="card-actions">
                <button class="quick-edit-btn" @click="startQuickEdit(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  快速调整
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 编辑库存表单 -->
      <div v-if="selectedStockpile" class="stockpile-edit">
        <div class="edit-header">
          <div class="edit-title">
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <h4>调整库存 - 产品ID: {{ selectedStockpile.productId }}</h4>
          </div>
          <button class="close-edit-btn" @click="cancelEdit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="stockpile-info">
          <div class="info-item">
            <div class="info-icon available-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <span class="label">可用库存</span>
            <span class="value">{{ selectedStockpile.amount }}</span>
          </div>
          <div class="info-item">
            <div class="info-icon frozen-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
            <span class="label">冻结库存</span>
            <span class="value">{{ selectedStockpile.frozen }}</span>
          </div>
          <div class="info-item">
            <div class="info-icon total-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span class="label">总库存</span>
            <span class="value">{{ selectedStockpile.amount + selectedStockpile.frozen }}</span>
          </div>
        </div>
        
        <div class="stockpile-actions">
          <h4 class="actions-title">调整库存</h4>
          
          <div class="adjustment-form">
            <div class="form-group">
              <label for="available">
                <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                可用库存
              </label>
              <div class="number-input">
                <button type="button" @click="decrementAmount" class="number-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <input 
                  type="number" 
                  id="available" 
                  v-model.number="adjustment.amount" 
                  min="0"
                  class="number-input-field"
                >
                <button type="button" @click="incrementAmount" class="number-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="form-group">
              <label for="frozen">
                <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
                冻结库存
              </label>
              <div class="number-input">
                <button type="button" @click="decrementFrozen" class="number-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <input 
                  type="number" 
                  id="frozen" 
                  v-model.number="adjustment.frozen" 
                  min="0"
                  class="number-input-field"
                >
                <button type="button" @click="incrementFrozen" class="number-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="form-actions">
              <button class="cancel-btn" @click="cancelEdit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                取消
              </button>
              <button class="update-btn" @click="updateStockpile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                更新库存
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="updateMessage" class="update-message" :class="{ success: updateSuccess, error: !updateSuccess }">
        {{ updateMessage }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';

export default defineComponent({
  name: 'StockpileManager',
  props: {
    productId: {
      type: [String, Number],
      required: false,
      default: null
    }
  },
  data() {
    return {
      stockpiles: [] as any[],
      products: new Map<number, any>(), // 存储产品信息，key为productId
      selectedStockpile: null as any,
      loading: true,
      error: null as string | null,
      adjustment: {
        amount: 0,
        frozen: 0
      },
      updateMessage: '',
      updateSuccess: false,
      editingStockpiles: new Map<number, { amount: number; frozen: number }>(), // 批量编辑状态
      searchKeyword: '',
      searchTimer: null as any
    };
  },
  computed: {
    filteredStockpiles(): any[] {
      if (!this.searchKeyword.trim()) {
        return this.stockpiles;
      }
      
      const keyword = this.searchKeyword.toLowerCase().trim();
      return this.stockpiles.filter(item => {
        const product = this.getProductInfo(item.productId);
        if (!product) return false;
        
        const productName = (product.title || '').toLowerCase();
        const productId = String(item.productId);
        
        return productName.includes(keyword) || productId.includes(keyword);
      });
    }
  },
  mounted() {
    this.fetchAllStockpiles();
  },
  methods: {
    handleSearchInput() {
      // 防抖：如果用户停止输入500ms后自动搜索（前端过滤，无需API调用）
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
      }
      
      // 搜索是实时的，通过computed属性自动过滤
      // 这里可以添加其他逻辑，比如高亮等
    },
    clearSearch() {
      this.searchKeyword = '';
      if (this.searchTimer) {
        clearTimeout(this.searchTimer);
        this.searchTimer = null;
      }
    },
    async fetchAllStockpiles() {
      this.loading = true;
      try {
        // 使用统一的API模块获取所有库存
        const response = await api.product.getAllStockpile();
        if (response.code === '200') {
          this.stockpiles = response.data;
          
          // 获取所有产品的详细信息
          await this.fetchProductsInfo();
          
          // 如果有传入productId，则自动选中对应的库存
          if (this.productId) {
            const stockpile = this.stockpiles.find(s => s.productId == this.productId);
            if (stockpile) {
              this.selectStockpile(stockpile);
            }
          }
        } else {
          this.error = response.msg || '加载库存信息失败';
        }
      } catch (err) {
        this.error = '库存加载失败，请稍后再试';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchProductsInfo() {
      // 获取所有产品信息
      try {
        const productsResponse = await api.product.getAllProducts();
        if (productsResponse.code === '200' && productsResponse.data) {
          // 将产品信息存储到Map中，方便快速查找
          productsResponse.data.forEach((product: any) => {
            if (product.id) {
              this.products.set(product.id, product);
            }
          });
        }
      } catch (err) {
        console.warn('获取产品信息失败:', err);
        // 不影响库存显示，继续执行
      }
    },
    
    getProductInfo(productId: number) {
      return this.products.get(productId) || null;
    },
    selectStockpile(stockpile: any) {
      this.selectedStockpile = stockpile;
      this.adjustment.amount = stockpile.amount;
      this.adjustment.frozen = stockpile.frozen;
    },
    cancelEdit() {
      this.selectedStockpile = null;
      this.adjustment.amount = 0;
      this.adjustment.frozen = 0;
    },
    startQuickEdit(stockpile: any) {
      this.editingStockpiles.set(stockpile.productId, {
        amount: stockpile.amount,
        frozen: stockpile.frozen
      });
    },
    cancelQuickEdit(productId: number) {
      this.editingStockpiles.delete(productId);
    },
    incrementQuickAmount(productId: number) {
      const edit = this.editingStockpiles.get(productId);
      if (edit) {
        edit.amount++;
      }
    },
    decrementQuickAmount(productId: number) {
      const edit = this.editingStockpiles.get(productId);
      if (edit && edit.amount > 0) {
        edit.amount--;
      }
    },
    incrementQuickFrozen(productId: number) {
      const edit = this.editingStockpiles.get(productId);
      if (edit) {
        edit.frozen++;
      }
    },
    decrementQuickFrozen(productId: number) {
      const edit = this.editingStockpiles.get(productId);
      if (edit && edit.frozen > 0) {
        edit.frozen--;
      }
    },
    async saveQuickEdit(productId: number) {
      const edit = this.editingStockpiles.get(productId);
      if (!edit) return;
      
      try {
        const updatedStockpile = {
          amount: edit.amount
        };
        
        const response = await api.product.updateProductStockpile(productId, updatedStockpile);
        
        if (response.code === '200') {
          // 更新本地数据
          const index = this.stockpiles.findIndex(s => s.productId == productId);
          if (index !== -1) {
            this.stockpiles[index].amount = edit.amount;
            this.stockpiles[index].frozen = edit.frozen;
          }
          
          this.updateSuccess = true;
          this.updateMessage = '库存更新成功！';
          this.editingStockpiles.delete(productId);
          
          this.$emit('updated', { productId, ...edit });
        } else {
          this.updateSuccess = false;
          this.updateMessage = response.msg || '更新库存失败';
        }
        
        setTimeout(() => {
          this.updateMessage = '';
        }, 3000);
      } catch (err) {
        console.error('更新库存出错:', err);
        this.updateSuccess = false;
        this.updateMessage = '更新库存时发生错误';
        setTimeout(() => {
          this.updateMessage = '';
        }, 3000);
      }
    },
    handleImageError(event: Event) {
      const target = event.target as HTMLImageElement;
      if (target) {
        target.onerror = null;
        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E暂无图片%3C/text%3E%3C/svg%3E';
      }
    },
    incrementAmount() {
      this.adjustment.amount++;
    },
    decrementAmount() {
      if (this.adjustment.amount > 0) {
        this.adjustment.amount--;
      }
    },
    incrementFrozen() {
      this.adjustment.frozen++;
    },
    decrementFrozen() {
      if (this.adjustment.frozen > 0) {
        this.adjustment.frozen--;
      }
    },
    async updateStockpile() {
      if (!this.selectedStockpile) {
        return;
      }
      
      try {
        // 后端只接受amount字段
        const updatedStockpile = {
          amount: this.adjustment.amount
        };
        
        const response = await api.product.updateProductStockpile(this.selectedStockpile.productId, updatedStockpile);
        
        if (response.code === '200') {
          this.updateSuccess = true;
          this.updateMessage = '库存更新成功！';
          
          // 更新本地数据
          const index = this.stockpiles.findIndex(s => s.productId == this.selectedStockpile.productId);
          if (index !== -1) {
            this.stockpiles[index].amount = this.adjustment.amount;
            this.stockpiles[index].frozen = this.adjustment.frozen;
          }
          
          // 更新选中的库存
          this.selectedStockpile.amount = this.adjustment.amount;
          this.selectedStockpile.frozen = this.adjustment.frozen;
          
          // Emit success event for parent components
          this.$emit('updated', this.selectedStockpile);
        } else {
          this.updateSuccess = false;
          this.updateMessage = response.msg || '更新库存失败';
        }
        
        // Clear message after 3 seconds
        setTimeout(() => {
          this.updateMessage = '';
        }, 3000);
      } catch (err) {
        console.error('更新库存出错:', err);
        this.updateSuccess = false;
        this.updateMessage = '更新库存时发生错误';
        
        setTimeout(() => {
          this.updateMessage = '';
        }, 3000);
      }
    }
  }
});
</script>