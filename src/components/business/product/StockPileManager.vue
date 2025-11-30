<style scoped>
.stockpile-manager {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stockpile-manager h3 {
  margin-top: 0;
  color: #333;
  margin-bottom: 15px;
}

.stockpile-info {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.info-item {
  flex: 1;
  min-width: 120px;
  padding: 10px;
  text-align: center;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.info-item .label {
  display: block;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.info-item .value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2196f3;
}

.stockpile-actions {
  background-color: white;
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stockpile-actions h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.adjustment-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: flex-end;
}

.form-group {
  flex: 1;
  min-width: 150px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.number-input {
  display: flex;
  align-items: center;
}

.number-input button {
  width: 36px;
  height: 36px;
  background-color: #e0e0e0;
  border: none;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.number-input button:first-child {
  border-radius: 4px 0 0 4px;
}

.number-input button:last-of-type {
  border-radius: 0 4px 4px 0;
}

.number-input input {
  width: 80px;
  height: 36px;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-left: none;
  border-right: none;
  font-size: 1rem;
}

.update-btn {
  padding: 10px 20px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.update-btn:hover {
  background-color: #1976d2;
}

.update-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
}

.update-message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.update-message.error {
  background-color: #ffebee;
  color: #c62828;
}

.loading, .error {
  padding: 20px;
  text-align: center;
  color: #666;
}

.error {
  color: #c62828;
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
      <h3>产品库存管理</h3>
      
      <!-- 库存列表 -->
      <div class="stockpile-list">
        <table>
          <thead>
            <tr>
              <th>产品ID</th>
              <th>可用库存</th>
              <th>冻结库存</th>
              <th>总库存</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in stockpiles" :key="item.productId">
              <td>{{ item.productId }}</td>
              <td>{{ item.amount }}</td>
              <td>{{ item.frozen }}</td>
              <td>{{ item.amount + item.frozen }}</td>
              <td>
                <button class="edit-btn" @click="selectStockpile(item)">调整库存</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 编辑库存表单 -->
      <div v-if="selectedStockpile" class="stockpile-edit">
        <h4>调整库存 - 产品ID: {{ selectedStockpile.productId }}</h4>
        
        <div class="stockpile-info">
          <div class="info-item">
            <span class="label">可用库存:</span>
            <span class="value">{{ selectedStockpile.amount }}</span>
          </div>
          <div class="info-item">
            <span class="label">冻结库存:</span>
            <span class="value">{{ selectedStockpile.frozen }}</span>
          </div>
          <div class="info-item">
            <span class="label">总库存:</span>
            <span class="value">{{ selectedStockpile.amount + selectedStockpile.frozen }}</span>
          </div>
        </div>
        
        <div class="stockpile-actions">
          <h4>调整库存</h4>
          
          <div class="adjustment-form">
            <div class="form-group">
              <label for="available">可用库存:</label>
              <div class="number-input">
                <button type="button" @click="decrementAmount">-</button>
                <input 
                  type="number" 
                  id="available" 
                  v-model.number="adjustment.amount" 
                  min="0"
                >
                <button type="button" @click="incrementAmount">+</button>
              </div>
            </div>
            
            <div class="form-group">
              <label for="frozen">冻结库存:</label>
              <div class="number-input">
                <button type="button" @click="decrementFrozen">-</button>
                <input 
                  type="number" 
                  id="frozen" 
                  v-model.number="adjustment.frozen" 
                  min="0"
                >
                <button type="button" @click="incrementFrozen">+</button>
              </div>
            </div>
            
            <div class="form-actions">
              <button class="cancel-btn" @click="cancelEdit">取消</button>
              <button class="update-btn" @click="updateStockpile">更新库存</button>
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
import axios from 'axios';

// 创建axios实例，用于直接调用API
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理常见错误
apiClient.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  (error: any) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

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
      selectedStockpile: null as any,
      loading: true,
      error: null as string | null,
      adjustment: {
        amount: 0,
        frozen: 0
      },
      updateMessage: '',
      updateSuccess: false
    };
  },
  mounted() {
    this.fetchAllStockpiles();
  },
  methods: {
    async fetchAllStockpiles() {
      this.loading = true;
      try {
        // 使用新的API获取所有库存
        const response = await apiClient.get('/products/stockpile');
        if (response.code === '200') {
          this.stockpiles = response.data;
          
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
    selectStockpile(stockpile) {
      this.selectedStockpile = stockpile;
      this.adjustment.amount = stockpile.amount;
      this.adjustment.frozen = stockpile.frozen;
    },
    cancelEdit() {
      this.selectedStockpile = null;
      this.adjustment.amount = 0;
      this.adjustment.frozen = 0;
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
        const updatedStockpile = {
          amount: this.adjustment.amount,
          frozen: this.adjustment.frozen,
          productId: this.selectedStockpile.productId
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