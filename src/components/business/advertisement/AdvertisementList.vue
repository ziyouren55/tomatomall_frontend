<template>
    <div class="advertisement-list">
      <h2>广告列表</h2>
      
      <div class="controls">
        <button class="btn btn-primary" @click="showCreateForm">添加新广告</button>
      </div>
      
      <div v-if="loading" class="text-center my-4">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
      </div>
      
      <div v-else-if="advertisements.length === 0" class="no-data">
        暂无广告数据
      </div>
      
      <div v-else class="advertisement-grid">
        <div 
          v-for="ad in advertisements" 
          :key="ad.id" 
          class="advertisement-card"
          @click="viewProductDetails(ad.productId)"
        >
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5>{{ ad.title }}</h5>
            <div class="action-buttons">
              <button class="btn btn-sm btn-outline-primary mx-1" @click.stop="editAdvertisement(ad)">
                编辑
              </button>
              <button class="btn btn-sm btn-outline-danger" @click.stop="confirmDelete(ad)">
                删除
              </button>
            </div>
          </div>
          
          <div class="card-image">
            <img :src="ad.imgUrl" :alt="ad.title" class="img-fluid">
          </div>
          
          <div class="card-content">
            <p>{{ ad.content }}</p>
            <div class="product-link">
              商品ID: {{ ad.productId }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal for create/edit -->
      <div class="modal fade" id="advertisementModal" tabindex="-1" aria-labelledby="advertisementModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="advertisementModalLabel">
                {{ editMode ? '编辑广告' : '添加新广告' }}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <advertisement-form 
                :advertisement="currentAdvertisement"
                @save="saveAdvertisement"
                @cancel="closeModal"
              />
            </div>
          </div>
        </div>
      </div>
  
      <!-- Confirmation Modal -->
      <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">确认删除</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              确定要删除广告" {{ adToDelete?.title }} "吗？
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
              <button type="button" class="btn btn-danger" @click="deleteAdvertisement">确认删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import api from '@/api';
  import AdvertisementForm from './AdvertisementDialog.vue';
  import type { Advertisement, AdvertisementFormData } from '@/types/api';
  
  const router = useRouter();
  const advertisements = ref<Advertisement[]>([]);
  const loading = ref(true);
  const editMode = ref(false);
  const currentAdvertisement = ref<Partial<Advertisement>>({
    title: '',
    content: '',
    imgUrl: '',
    productId: ''
  });
  const adToDelete = ref<Advertisement | null>(null);
      
      interface BootstrapModal {
        show(): void;
        hide(): void;
      }
      
      let advertisementModal: BootstrapModal | null = null;
      let confirmDeleteModal: BootstrapModal | null = null;
  
      onMounted(async () => {
        fetchAdvertisements();
        
        // Initialize Bootstrap modals
        // Assuming Bootstrap 5 is being used
        const modalElement = document.getElementById('advertisementModal');
        const confirmElement = document.getElementById('confirmDeleteModal');
        const bootstrap = (window as { bootstrap?: { Modal: new (element: HTMLElement) => BootstrapModal } }).bootstrap;
        if (modalElement && bootstrap) {
          advertisementModal = new bootstrap.Modal(modalElement);
        }
        if (confirmElement && bootstrap) {
          confirmDeleteModal = new bootstrap.Modal(confirmElement);
        }
      });
      
      const fetchAdvertisements = async () => {
        loading.value = true;
        try {
          const response = await api.advertisement.getAllAdvertisements();
          if (response.code === '200') {
            advertisements.value = response.data || [];
          } else {
            console.error('Failed to fetch advertisements:', response.msg);
          }
        } catch (error: unknown) {
          console.error('Error fetching advertisements:', error);
        } finally {
          loading.value = false;
        }
      };
      
      const viewProductDetails = (productId: number | string | undefined) => {
        if (productId) {
          router.push(`/product/${productId}`);
        }
      };
      
      const showCreateForm = () => {
        editMode.value = false;
        currentAdvertisement.value = {
          title: '',
          content: '',
          imgUrl: '',
          productId: ''
        };
        if (advertisementModal) {
          advertisementModal.show();
        }
      };
      
      const editAdvertisement = (ad: Advertisement) => {
        editMode.value = true;
        currentAdvertisement.value = { ...ad };
        if (advertisementModal) {
          advertisementModal.show();
        }
      };
      
      const confirmDelete = (ad: Advertisement) => {
        adToDelete.value = ad;
        if (confirmDeleteModal) {
          confirmDeleteModal.show();
        }
      };
      
      const deleteAdvertisement = async () => {
        if (!adToDelete.value) return;
        try {
          const response = await api.advertisement.deleteAdvertisement(adToDelete.value.id);
          if (response.code === '200') {
            fetchAdvertisements();
            if (confirmDeleteModal) {
              confirmDeleteModal.hide();
            }
          } else {
            console.error('Failed to delete advertisement:', response.msg);
          }
        } catch (error: unknown) {
          console.error('Error deleting advertisement:', error);
        }
      };
      
      const saveAdvertisement = async (advertisementData: AdvertisementFormData) => {
        try {
          let response;
          if (editMode.value) {
            response = await api.advertisement.updateAdvertisement(advertisementData);
          } else {
            response = await api.advertisement.createAdvertisement(advertisementData);
          }
          
          if (response.code === '200') {
            fetchAdvertisements();
            if (advertisementModal) {
              advertisementModal.hide();
            }
          } else {
            console.error('Failed to save advertisement:', response.msg);
            alert(`操作失败: ${response.msg || '未知错误'}`);
          }
        } catch (error: unknown) {
          console.error('Error saving advertisement:', error);
          alert('保存失败，请稍后重试');
        }
      };
      
      const closeModal = () => {
        if (advertisementModal) {
          advertisementModal.hide();
        }
      };
  </script>
  
  <style scoped>
  .advertisement-list {
    padding: 20px;
  }
  
  .controls {
    margin-bottom: 20px;
  }
  
  .advertisement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
  
  .advertisement-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  }
  
  .advertisement-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .card-header {
    padding: 15px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .card-image {
    height: 200px;
    overflow: hidden;
  }
  
  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .card-content {
    padding: 15px;
  }
  
  .product-link {
    margin-top: 10px;
    font-weight: bold;
    color: #007bff;
  }
  
  .no-data {
    text-align: center;
    padding: 50px 0;
    color: #6c757d;
  }
  </style>