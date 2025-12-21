<template>
  <div class="simple-stockpile-editor">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{{ error }}</p>
    </div>
    <div v-else class="editor-content">
      <!-- 当前库存信息 -->
      <div class="current-stock">
        <div class="stock-item">
          <span class="stock-label">当前可用库存</span>
          <span class="stock-value available">{{ stockpile?.amount || 0 }}</span>
        </div>
        <div class="stock-item">
          <span class="stock-label">当前冻结库存</span>
          <span class="stock-value frozen">{{ stockpile?.frozen || 0 }}</span>
        </div>
        <div class="stock-item">
          <span class="stock-label">总库存</span>
          <span class="stock-value total">{{ (stockpile?.amount || 0) + (stockpile?.frozen || 0) }}</span>
        </div>
      </div>

      <!-- 调整表单 -->
      <div class="adjustment-form">
        <div class="form-group">
          <label for="amount">
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
              id="amount" 
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
      </div>

      <!-- 消息提示 -->
      <div v-if="message" class="message" :class="{ success: success, error: !success }">
        <svg v-if="success" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ message }}</span>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button class="cancel-btn" @click="handleCancel">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          取消
        </button>
        <button class="update-btn" @click="updateStockpile" :disabled="isUpdating">
          <svg v-if="!isUpdating" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <div v-else class="btn-spinner"></div>
          {{ isUpdating ? '更新中...' : '更新库存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api'

export default defineComponent({
  name: 'SimpleStockpileEditor',
  props: {
    productId: {
      type: [Number, String],
      required: true
    },
    productTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      stockpile: null as any,
      loading: true,
      error: null as string | null,
      adjustment: {
        amount: 0,
        frozen: 0
      },
      message: '',
      success: false,
      isUpdating: false
    }
  },
  mounted() {
    this.fetchStockpile()
  },
  watch: {
    productId() {
      this.fetchStockpile()
    }
  },
  methods: {
    async fetchStockpile() {
      if (!this.productId) return
      
      this.loading = true
      this.error = null
      
      try {
        const response = await api.product.getProductStockpile(Number(this.productId))
        if (response.code === '200' && response.data) {
          this.stockpile = response.data
          this.adjustment.amount = response.data.amount || 0
          this.adjustment.frozen = response.data.frozen || 0
        } else {
          this.error = response.msg || '加载库存信息失败'
        }
      } catch (err) {
        this.error = '加载库存信息失败，请稍后再试'
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    incrementAmount() {
      this.adjustment.amount++
    },
    decrementAmount() {
      if (this.adjustment.amount > 0) {
        this.adjustment.amount--
      }
    },
    incrementFrozen() {
      this.adjustment.frozen++
    },
    decrementFrozen() {
      if (this.adjustment.frozen > 0) {
        this.adjustment.frozen--
      }
    },
    async updateStockpile() {
      if (!this.productId) return
      
      this.isUpdating = true
      this.message = ''
      
      try {
        const updatedStockpile = {
          amount: this.adjustment.amount
        }
        
        const response = await api.product.updateProductStockpile(Number(this.productId), updatedStockpile)
        
        if (response.code === '200') {
          this.success = true
          this.message = '库存更新成功！'
          
          // 更新本地数据
          if (this.stockpile) {
            this.stockpile.amount = this.adjustment.amount
            this.stockpile.frozen = this.adjustment.frozen
          }
          
          // 通知父组件
          this.$emit('updated', {
            productId: this.productId,
            amount: this.adjustment.amount,
            frozen: this.adjustment.frozen
          })
          
          // 2秒后关闭
          setTimeout(() => {
            this.$emit('close')
          }, 2000)
        } else {
          this.success = false
          this.message = response.msg || '更新库存失败'
        }
      } catch (err) {
        console.error('更新库存出错:', err)
        this.success = false
        this.message = '更新库存时发生错误'
      } finally {
        this.isUpdating = false
        if (this.message) {
          setTimeout(() => {
            this.message = ''
          }, 3000)
        }
      }
    },
    handleCancel() {
      this.$emit('close')
    }
  }
})
</script>

<style scoped>
.simple-stockpile-editor {
  padding: 0;
}

.loading-state, .error-state {
  padding: 40px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff6b35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #f44336;
  stroke-width: 2;
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 当前库存信息 */
.current-stock {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
}

.stock-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stock-label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.stock-value {
  display: block;
  font-size: 1.8rem;
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

/* 调整表单 */
.adjustment-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
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
  overflow: hidden;
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

/* 消息提示 */
.message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
}

.message.success {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  border: 2px solid #4caf50;
}

.message.error {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  color: #c62828;
  border: 2px solid #f44336;
}

.message svg {
  width: 18px;
  height: 18px;
  stroke-width: 2.5;
  flex-shrink: 0;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}

.cancel-btn, .update-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

.update-btn {
  background: linear-gradient(135deg, #ff6b35 0%, #e53935 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
}

.update-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.update-btn svg {
  width: 18px;
  height: 18px;
  stroke-width: 3;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 响应式 */
@media (max-width: 600px) {
  .adjustment-form {
    grid-template-columns: 1fr;
  }
  
  .current-stock {
    grid-template-columns: 1fr;
  }
}
</style>

