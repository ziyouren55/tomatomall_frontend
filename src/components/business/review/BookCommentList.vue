<template>
  <div class="book-review-list">
    <div class="header">
      <h2>书评与导读</h2>
      <button @click="showAddForm = !showAddForm" class="add-btn">
        {{ showAddForm ? '取消' : '发布书评' }}
      </button>
    </div>

    <!-- 发布书评表单 -->
    <div v-if="showAddForm" class="add-form">
      <h3>发布书评</h3>
      <form @submit.prevent="submitReview">
        <div class="form-group">
          <label>书评内容：</label>
          <textarea 
            v-model="newReview.commentText" 
            placeholder="请输入书评内容..."
            rows="6"
            required
          ></textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '发布中...' : '发布书评' }}
          </button>
          <button type="button" @click="cancelForm" class="cancel-btn">取消</button>
        </div>
      </form>
    </div>

    <!-- 书评列表 -->
    <div class="reviews-container">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="reviews.length === 0" class="no-reviews">
        暂无书评，快来发布第一条书评吧！
      </div>
      
      <div v-else class="reviews-list">
        <div 
          v-for="review in reviews" 
          :key="review.id" 
          class="review-item"
        >
          <div class="review-header">
            <div class="author-info">
              <span class="author-name">{{ review.name }}</span>
              <span class="publish-time" v-if="review.createTime">发布于：{{ review.createTime }}</span>
            </div>
            <button 
              v-if="canDeleteReview(review)" 
              @click="deleteReview(review.id)"
              class="delete-btn"
            >
              删除
            </button>
          </div>
          
          <div class="review-content">
            <p>{{ review.commentText }}</p>
          </div>
          
        </div>

        <div class="pagination" v-if="total > pageSize">
          <button :disabled="page === 0" @click="changePage(-1)">上一页</button>
          <span>第 {{ page + 1 }} / {{ Math.max(1, Math.ceil(total / pageSize)) }} 页</span>
          <button :disabled="(page + 1) * pageSize >= total" @click="changePage(1)">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/api';
import type { BookComment } from '@/types/api';

export default defineComponent({
  name: 'BookReviewList',
  props: {
    productId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      reviews: [] as BookComment[],
      loading: false,
      showAddForm: false,
      isSubmitting: false,
      newReview: {
        commentText: ''
      },
      page: 0,
      pageSize: 10,
      total: 0
    };
  },
  mounted() {
    this.loadReviews();
  },
  methods: {
    async loadReviews(): Promise<void> {
      this.loading = true;
      try {
        const response = await api.review.getBookComments(this.productId, this.page, this.pageSize);
        const pageData = response.data;
        this.reviews = pageData?.content || [];
        this.total = pageData?.totalElements || this.reviews.length;
      } catch (error: unknown) {
        console.error('加载书评失败:', error);
        ElMessage.error('加载书评失败');
      } finally {
        this.loading = false;
      }
    },
    
    async submitReview(): Promise<void> {
      if (!this.newReview.commentText.trim()) {
        ElMessage.warning('请填写书评内容');
        return;
      }
      
      this.isSubmitting = true;
      try {
        await api.review.addBookComment(this.productId, this.newReview);
        ElMessage.success('书评发布成功');
        this.cancelForm();
        this.loadReviews();
      } catch (error: unknown) {
        console.error('发布书评失败:', error);
        ElMessage.error('发布书评失败');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    cancelForm(): void {
      this.showAddForm = false;
      this.newReview = {
        commentText: ''
      };
    },
    
    async deleteReview(reviewId: number): Promise<void> {
      if (!confirm('确定要删除这条书评吗？')) {
        return;
      }
      
      try {
        await api.review.deleteBookComment(reviewId);
        ElMessage.success('删除成功');
        this.loadReviews();
      } catch (error: unknown) {
        console.error('删除书评失败:', error);
        ElMessage.error('删除失败');
      }
    },
    
    canDeleteReview(review: BookComment): boolean {
      // 这里可以根据实际业务逻辑判断用户是否可以删除书评
      // 例如：只有发布者本人或管理员可以删除
      const currentUserName = this.getCurrentUserName();
      return review.name === currentUserName;
    },
    
    getCurrentUserName(): string {
      // 这里应该从用户状态管理中获取当前用户姓名
      // 暂时返回一个默认值，实际项目中需要根据实际情况修改
      return localStorage.getItem('userName') || '匿名用户';
    },
    
    handleImageError(event: Event): void {
      // 防止无限循环触发error事件
      const target = event.target as HTMLImageElement;
      if (target) {
        target.onerror = null;
        // 使用占位符图片
        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E暂无图片%3C/text%3E%3C/svg%3E';
      }
    },

    changePage(delta: number): void {
      const newPage = this.page + delta;
      const maxPage = Math.max(0, Math.ceil(this.total / this.pageSize) - 1);
      if (newPage < 0 || newPage > maxPage) return;
      this.page = newPage;
      this.loadReviews();
    }
  }
});
</script>

<style scoped>
.book-review-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.add-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.add-btn:hover {
  background: #0056b3;
}

.add-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.add-form h3 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group textarea,
.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.submit-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.no-reviews {
  text-align: center;
  padding: 40px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

.review-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-name {
  font-weight: bold;
  color: #333;
}

.publish-time {
  color: #666;
  font-size: 12px;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn:hover {
  background: #c82333;
}

.pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  font-size: 14px;
  color: #666;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #d0d7de;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.pagination button:disabled {
  cursor: not-allowed;
  color: #bbb;
  border-color: #eee;
}

.pagination button:not(:disabled):hover {
  background: #f3f4f6;
}

.review-content {
  margin-bottom: 15px;
}

.review-content p {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

</style>