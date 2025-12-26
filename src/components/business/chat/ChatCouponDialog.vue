<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleVisibleChange"
    title="发放优惠券"
    width="500px"
    :close-on-click-modal="false"
    @close="handleCancel"
  >
    <div class="coupon-dialog">
      <el-form
        ref="couponFormRef"
        :model="couponForm"
        :rules="formRules"
        label-width="80px"
        size="small"
      >
        <!-- 商品选择 -->
        <el-form-item label="选择商品" prop="productId">
          <el-select
            v-model="couponForm.productId"
            placeholder="请选择要发放优惠券的商品"
            style="width: 100%"
            filterable
            @change="onProductChange"
          >
            <el-option
              v-for="product in merchantProducts"
              :key="product.id"
              :label="product.title"
              :value="product.id"
            />
          </el-select>
        </el-form-item>

        <!-- 优惠券名称（自动生成） -->
        <el-form-item label="优惠券名称">
          <el-input
            v-model="couponForm.couponName"
            readonly
            placeholder="根据商品自动生成"
          />
        </el-form-item>

        <!-- 优惠类型 -->
        <el-form-item label="优惠类型" prop="discountType">
          <el-radio-group v-model="couponForm.discountType">
            <el-radio label="amount">固定金额</el-radio>
            <el-radio label="percentage">百分比折扣</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 优惠金额 -->
        <el-form-item
          :label="couponForm.discountType === 'percentage' ? '折扣百分比' : '优惠金额'"
          prop="discountValue"
        >
          <el-input-number
            v-model="couponForm.discountValue"
            :min="0"
            :max="couponForm.discountType === 'percentage' ? 100 : undefined"
            :precision="2"
            style="width: 120px"
          />
          <span class="unit">{{ couponForm.discountType === 'percentage' ? '%' : '元' }}</span>
        </el-form-item>

        <!-- 最低消费 -->
        <el-form-item label="最低消费" prop="minimumPurchase">
          <el-input-number
            v-model="couponForm.minimumPurchase"
            :min="0"
            :precision="2"
            style="width: 120px"
          />
          <span class="unit">元</span>
        </el-form-item>

        <!-- 有效期 -->
        <el-form-item label="有效期" prop="validDays">
          <el-input-number
            v-model="couponForm.validDays"
            :min="1"
            :max="365"
            style="width: 120px"
          />
          <span class="unit">天</span>
        </el-form-item>

        <!-- 发放备注 -->
        <el-form-item label="备注">
          <el-input
            v-model="couponForm.remark"
            placeholder="可选：填写发放优惠券的原因"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="issuing">
          发放优惠券
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { ChatSessionVO } from '@/types/api'
import couponApi from '@/api/modules/coupon.ts'
import type { Product } from '@/types/api'

interface Props {
  session: ChatSessionVO | null
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'coupon-issued'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单引用
const couponFormRef = ref()

// 商家商品列表
const merchantProducts = ref<Product[]>([])

// 优惠券表单
const couponForm = reactive({
  productId: null as number | null,
  couponName: '',
  discountType: 'amount', // 'amount' | 'percentage'
  discountValue: 0,
  minimumPurchase: 0,
  validDays: 7,
  remark: ''
})

// 表单验证规则
const formRules = {
  productId: [
    { required: true, message: '请选择商品', trigger: 'change' }
  ],
  discountType: [
    { required: true, message: '请选择优惠类型', trigger: 'change' }
  ],
  discountValue: [
    { required: true, message: '请输入优惠金额', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value <= 0) {
          callback(new Error('优惠金额必须大于0'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  minimumPurchase: [
    { required: true, message: '请输入最低消费金额', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value < 0) {
          callback(new Error('最低消费金额不能为负数'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  validDays: [
    { required: true, message: '请输入有效期', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (value < 1 || value > 365) {
          callback(new Error('有效期必须在1-365天之间'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 发放状态
const issuing = ref(false)

// 监听对话框显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    loadMerchantProducts()
    resetForm()
  }
})

// 商品选择变化时更新优惠券名称
function onProductChange(productId: number) {
  const selectedProduct = merchantProducts.value.find(p => p.id === productId)
  if (selectedProduct) {
    couponForm.couponName = `${selectedProduct.title}专属优惠券`
  }
}

// 加载商家商品列表
async function loadMerchantProducts() {
  try {
    const response = await couponApi.getMerchantProducts()
    if (response.code === '200') {
      merchantProducts.value = response.data || []
    } else {
      ElMessage.error('获取商品列表失败')
    }
  } catch (error) {
    console.error('加载商家商品失败:', error)
    ElMessage.error('获取商品列表失败')
  }
}

// 重置表单
function resetForm() {
  couponForm.productId = null
  couponForm.couponName = ''
  couponForm.discountType = 'amount'
  couponForm.discountValue = 0
  couponForm.minimumPurchase = 0
  couponForm.validDays = 7
  couponForm.remark = ''

  couponFormRef.value?.clearValidate()
}

// 处理对话框显示状态变化
function handleVisibleChange(value: boolean) {
  emit('update:visible', value)
}

// 取消操作
function handleCancel() {
  handleVisibleChange(false)
}

// 确认发放优惠券
async function handleConfirm() {
  if (!props.session) {
    ElMessage.error('会话信息丢失')
    return
  }

  // 表单验证
  const valid = await couponFormRef.value?.validate().catch(() => false)
  if (!valid) {
    return
  }

  // 验证优惠券参数
  if (couponForm.discountValue <= 0) {
    ElMessage.error('优惠金额必须大于0')
    return
  }

  if (couponForm.minimumPurchase < 0) {
    ElMessage.error('最低消费金额不能为负数')
    return
  }

  issuing.value = true

  try {
    // 构建发放请求数据
    const issueData = {
      sessionId: props.session!.id,
      productId: couponForm.productId!,
      discountAmount: couponForm.discountType === 'amount' ? couponForm.discountValue : null,
      discountPercentage: couponForm.discountType === 'percentage' ? couponForm.discountValue : null,
      minimumPurchase: couponForm.minimumPurchase,
      validDays: couponForm.validDays,
      remark: couponForm.remark || `为${props.session!.customerName}发放${couponForm.couponName}`
    }

    const response = await couponApi.issueChatCoupon(issueData)

    if (response.code === '200') {
      ElMessage.success('优惠券发放成功！')
      emit('coupon-issued')
      handleVisibleChange(false)
    } else {
      ElMessage.error(response.msg || '发放优惠券失败')
    }
  } catch (error) {
    console.error('发放优惠券失败:', error)
    ElMessage.error('发放优惠券失败，请稍后重试')
  } finally {
    issuing.value = false
  }
}
</script>

<style scoped>
.coupon-dialog {
  padding: 10px 0;
}

.unit {
  margin-left: 8px;
  color: #909399;
  font-size: 14px;
}

.dialog-footer {
  text-align: right;
}

.el-form-item {
  margin-bottom: 16px;
}

.el-form-item:last-child {
  margin-bottom: 0;
}
</style>
