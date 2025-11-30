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
        <div class="form-group">
          <label>发布者姓名：</label>
          <input 
            type="text" 
            v-model="newReview.name" 
            placeholder="请输入您的姓名"
            required
          />
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
              <span class="publish-time">{{ formatDate(review.createTime) }}</span>
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
          
          <div class="review-actions">
            <button @click="toggleComments(review.id)" class="comment-btn">
              {{ showComments[review.id] ? '隐藏评论' : '查看评论' }}
              ({{ review.comments ? review.comments.length : 0 }})
            </button>
          </div>
          
          <!-- 评论区域 -->
          <div v-if="showComments[review.id]" class="comments-section">
            <!-- 添加评论表单 -->
            <div class="add-comment-form">
              <textarea 
                v-model="newComment[review.id]" 
                placeholder="写下您的评论..."
                rows="3"
              ></textarea>
              <button 
                @click="addComment(review.id)" 
                class="comment-submit-btn"
                :disabled="!newComment[review.id] || newComment[review.id].trim() === ''"
              >
                发表评论
              </button>
            </div>
            
            <!-- 评论列表 -->
            <div class="comments-list">
              <div 
                v-for="comment in review.comments" 
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-header">
                  <span class="commenter-name">{{ comment.name }}</span>
                  <span class="comment-time">{{ formatDate(comment.createTime) }}</span>
                </div>
                <div class="comment-content">
                  <p>{{ comment.commentText }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import api from '@/api';

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
      reviews: [] as any[],
      loading: false,
      showAddForm: false,
      isSubmitting: false,
      showComments: {} as Record<number, boolean>,
      newComment: {} as Record<number, string>,
      newReview: {
        commentText: '',
        name: ''
      }
    };
  },
  mounted() {
    this.loadReviews();
  },
  methods: {
    async loadReviews() {
      this.loading = true;
      try {
        const response = await api.review.getBookComments(this.productId);
        this.reviews = response.data || [];
      } catch (error) {
        console.error('加载书评失败:', error);
        this.$message?.error('加载书评失败');
      } finally {
        this.loading = false;
      }
    },
    
    async submitReview() {
      if (!this.newReview.commentText.trim() || !this.newReview.name.trim()) {
        this.$message?.warning('请填写完整信息');
        return;
      }
      
      this.isSubmitting = true;
      try {
        await api.review.addBookComment(this.productId, this.newReview);
        this.$message?.success('书评发布成功');
        this.cancelForm();
        this.loadReviews();
      } catch (error) {
        console.error('发布书评失败:', error);
        this.$message?.error('发布书评失败');
      } finally {
        this.isSubmitting = false;
      }
    },
    
    cancelForm() {
      this.showAddForm = false;
      this.newReview = {
        commentText: '',
        name: ''
      };
    },
    
    async deleteReview(reviewId) {
      if (!confirm('确定要删除这条书评吗？')) {
        return;
      }
      
      try {
        await api.review.deleteBookComment(reviewId);
        this.$message?.success('删除成功');
        this.loadReviews();
      } catch (error) {
        console.error('删除书评失败:', error);
        this.$message?.error('删除失败');
      }
    },
    
    toggleComments(reviewId) {
      this.$set(this.showComments, reviewId, !this.showComments[reviewId]);
    },
    
    async addComment(reviewId) {
      const commentText = this.newComment[reviewId];
      if (!commentText || !commentText.trim()) {
        return;
      }
      
      try {
        const commentData = {
          commentText: commentText.trim(),
          name: this.getCurrentUserName() // 获取当前用户姓名
        };
        
        await api.review.addBookComment(this.productId, commentData);
        this.$message?.success('评论发表成功');
        this.$set(this.newComment, reviewId, '');
        this.loadReviews();
      } catch (error) {
        console.error('发表评论失败:', error);
        this.$message?.error('发表评论失败');
      }
    },
    
    canDeleteReview(review) {
      // 这里可以根据实际业务逻辑判断用户是否可以删除书评
      // 例如：只有发布者本人或管理员可以删除
      const currentUserName = this.getCurrentUserName();
      return review.name === currentUserName;
    },
    
    getCurrentUserName() {
      // 这里应该从用户状态管理中获取当前用户姓名
      // 暂时返回一个默认值，实际项目中需要根据实际情况修改
      return localStorage.getItem('userName') || '匿名用户';
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    
    handleImageError(event: any): void {
      // 防止无限循环触发error事件
      event.target.onerror = null;
      // 使用占位符图片
      event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E暂无图片%3C/text%3E%3C/svg%3E';
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

.review-content {
  margin-bottom: 15px;
}

.review-content p {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

.review-actions {
  border-top: 1px solid #e9ecef;
  padding-top: 15px;
}

.comment-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.comment-btn:hover {
  background: #138496;
}

.comments-section {
  margin-top: 15px;
  border-top: 1px solid #e9ecef;
  padding-top: 15px;
}

.add-comment-form {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.add-comment-form textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.comment-submit-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.comment-submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.comment-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 10px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.commenter-name {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.comment-time {
  color: #666;
  font-size: 12px;
}

.comment-content p {
  margin: 0;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}
</style>