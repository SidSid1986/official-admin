<template>
  <div class="product-add-container">
    <div class="page-header">
      <h2>新增产品</h2>
      <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">
        <el-icon style="margin-right: 5px">
          <Check />
        </el-icon>
        立即创建
      </el-button>
    </div>

    <el-card class="form-card">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px">

        <!-- === 通用区域：所有产品都有 === -->
        <el-divider content-position="left">📦 通用基础信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品分类" prop="category">
              <el-cascader v-model="formData.category" :options="categoryOptions" placeholder="请选择分类以加载对应参数"
                style="width: 100%" @change="handleCategoryChange" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="formData.productName" placeholder="请输入产品名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品型号" prop="modelNumber">
              <el-input v-model="formData.modelNumber" placeholder="例如：RBT-2026-Pro" clearable />
            </el-form-item>
          </el-col>

          <!-- 通用图片上传 -->
          <el-col :span="12">
            <el-form-item label="产品主图">
              <el-upload action="#" :auto-upload="false" :limit="1" :file-list="mainImageList" list-type="picture-card"
                :on-change="handleMainImageChange" :on-remove="handleMainImageRemove">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-upload>
              <div class="upload-tip" v-if="formData.productImgUrl">
                图片地址：<span class="url-text">{{ formData.productImgUrl }}</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- === 动态区域：根据分类切换组件 === -->

        <!-- 场景 1: 机器人 (FatherID=1) -->
        <!-- 绑定到独立的 robotFormData -->
        <div v-if="selectedSonId && robotCategoryIds.includes(selectedSonId)">
          <RobotForm v-model="robotFormData" />
        </div>

        <!-- 场景 2: 运动控制器 (FatherID=2) -->
        <!-- 绑定到独立的 sportFormData -->
        <div v-else-if="selectedSonId && sportCategoryIds.includes(selectedSonId)">
          <SportForm v-model="sportFormData" />
        </div>

        <!-- 场景 3: 伺服驱动器 (FatherID=3) -->
        <div v-else-if="selectedSonId && driverCategoryIds.includes(selectedSonId)">
          <el-empty description="伺服驱动器参数表单开发中..." :image-size="80" />
        </div>

        <!-- 未选择分类时的提示 -->
        <div v-else-if="!formData.category.length">
          <el-alert title="请先在上方选择产品分类，下方将自动加载对应的专用参数表" type="info" :closable="false" show-icon />
        </div>

      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Plus, Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import RobotForm from '@/components/RobotForm.vue';
import SportForm from '@/components/SportForm.vue';

// --- 1. 数据源 (树形结构) ---
const categoryOptions = [
  {
    value: 1,
    label: '机器人',
    children: [
      { value: 11, label: 'SCARA 系列' },
      { value: 22, label: 'MINI 系列' },
      { value: 33, label: '中小负载系列' },
      { value: 44, label: '大负载系列' },
      { value: 55, label: '超大负载系列' },
    ]
  },
  {
    value: 2,
    label: '运动控制器',
    children: [
      { value: 88, label: '系列 A' },
      { value: 99, label: '系列 B' },
    ]
  },
  {
    value: 3,
    label: '伺服驱动器',
    children: [
      { value: 66, label: '低压系列' },
      { value: 77, label: '高压系列' },
    ]
  },
];

// 分类 ID 映射
const robotCategoryIds = [11, 22, 33, 44, 55];
const sportCategoryIds = [88, 99];
const driverCategoryIds = [66, 77];

// --- 2. 表单状态 ---
const formRef = ref(null);
const loading = ref(false);
const selectedSonId = ref(null);

// 主图片列表 & 地址
const mainImageList = ref([]);

// 【修改点】通用基础数据 (不包含子组件数据)
const formData = reactive({
  category: [],
  productName: '',
  modelNumber: '',
  productImgUrl: '',
});

// 【修改点】独立的子组件数据容器
// 初始化为空对象，组件内部会填充默认值或通过 watch 同步
const robotFormData = reactive({});
const sportFormData = reactive({});
// const driverFormData = reactive({}); // 预留

// --- 3. 逻辑处理 ---

// 分类变化
const handleCategoryChange = (val) => {
  if (val && val.length === 2) {
    const newSonId = val[1];

    // 如果切换了不同的分类，清空对应的新旧数据，防止污染
    if (newSonId !== selectedSonId.value) {
      // 清空所有独立表单数据
      Object.keys(robotFormData).forEach(key => delete robotFormData[key]);
      Object.keys(sportFormData).forEach(key => delete sportFormData[key]);

      console.log('分类切换，已重置独立表单数据');
    }

    selectedSonId.value = newSonId;
  } else {
    selectedSonId.value = null;
  }
};

// 处理主图上传
const handleMainImageChange = (uploadFile) => {
  mainImageList.value = [uploadFile];
  const rawFile = uploadFile.raw;

  if (rawFile) {
    if (!rawFile.type.startsWith('image/')) {
      ElMessage.error('只能上传图片文件！');
      mainImageList.value = [];
      formData.productImgUrl = '';
      return;
    }
    formData.productImgUrl = URL.createObjectURL(rawFile);
  }
};

const handleMainImageRemove = () => {
  mainImageList.value = [];
  formData.productImgUrl = '';
};

// 校验规则
const rules = {
  category: [{ required: true, message: '必须选择分类', trigger: 'change' }],
  productName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  modelNumber: [{ required: true, message: '请输入型号', trigger: 'blur' }],
};

// 【核心】提交按钮
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      let specificData = {};
      let productType = '';

      // 1. 根据当前选中的分类，决定校验哪个独立对象，并获取数据
      if (selectedSonId.value && robotCategoryIds.includes(selectedSonId.value)) {
        if (!robotFormData.robotName) {
          ElMessage.warning('请填写机器人详细参数（至少填写型号）');
          document.querySelector('.robot-form-wrapper')?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        specificData = { ...robotFormData };
        productType = 'ROBOT';

      } else if (selectedSonId.value && sportCategoryIds.includes(selectedSonId.value)) {
        if (!sportFormData.name) {
          ElMessage.warning('请填写运动控制器详细参数（至少填写名称）');
          document.querySelector('.sport-form-wrapper')?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        specificData = { ...sportFormData };
        productType = 'SPORT_CONTROLLER';

      } else if (selectedSonId.value && driverCategoryIds.includes(selectedSonId.value)) {
        ElMessage.info('伺服驱动器表单尚未开发完成');
        return;
      } else {
        ElMessage.warning('请先选择有效的产品分类');
        return;
      }

      loading.value = true;

      // 2. 构造最终提交对象
      const finalProductData = {
        // 通用基础信息
        productName: formData.productName,
        modelNumber: formData.modelNumber,
        categoryId: formData.category[1],
        fatherId: formData.category[0],
        mainImageUrl: formData.productImgUrl,

        // 动态部分
        productType: productType,
        details: specificData, // 这里放入的是独立的 robotFormData 或 sportFormData

        createTime: new Date().toISOString()
      };

      // 3. 打印结果
      console.log('✅ === 准备提交的产品完整对象 === ✅');
      console.table(finalProductData);
      console.log('JSON 格式:', JSON.stringify(finalProductData, null, 2));

      setTimeout(() => {
        ElMessage.success('创建成功！请查看控制台输出的完整数据对象。');
        loading.value = false;
      }, 800);
    } else {
      ElMessage.error('请完善必填信息');
      return false;
    }
  });
};
</script>

<style scoped lang="scss">
.product-add-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 10px;

    h2 {
      margin: 0;
      color: #303133;
      font-size: 24px;
    }
  }

  .form-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    :deep(.el-row) {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;

    .url-text {
      color: #409EFF;
      word-break: break-all;
      font-family: monospace;
    }
  }
}
</style>