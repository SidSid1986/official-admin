<template>
  <div class="product-add-container">
    <div class="page-header">
      <h2>
        {{ editMode ? '编辑产品' : (currentProductType === 'robot' ? '新增机器人产品' : '新增运动控制器') }}
      </h2>
      <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">
        <el-icon style="margin-right: 5px">
          <Check />
        </el-icon>
        {{ editMode ? '保存修改' : '立即创建' }}
      </el-button>
    </div>

    <el-card class="form-card">

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px" v-loading="loadingDetail">

        <!-- 通用区域 -->
        <el-divider content-position="left">📦 通用基础信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品分类" prop="category">
              <el-cascader v-model="formData.category" :options="categoryOptions"
                :props="{ expandTrigger: 'hover', value: 'value', label: 'label', children: 'children' }"
                placeholder="请选择分类" style="width: 100%" @change="handleCategoryChange" />
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

          <el-col :span="12">
            <el-form-item label="产品主图">
              <el-upload action="#" :auto-upload="false" :limit="1" :file-list="mainImageList" list-type="picture-card"
                :on-change="handleMainImageChange" :on-remove="handleMainImageRemove">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-upload>
              <div class="upload-tip" v-if="formData.mainImageUrl && !formData.mainImageUrl.startsWith('blob')">
                图片已就绪 (旧图)
              </div>
              <div class="upload-tip" v-else-if="formData.mainImageUrl && formData.mainImageUrl.startsWith('blob')">
                注意：提交时将自动上传新图
              </div>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="产品类型" prop="robotType">
              <!-- <el-input v-model="formData.robotType" placeholder="例如：RBT-2026-Pro" clearable /> -->
              <span>{{ formData.robotType }}</span>

            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="是否放置首页" prop="ifMain">
              <el-radio-group v-model="formData.ifMain" @change="handleIfMainChange">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 动态区域  currentProductType 有值 显示) -->
        <div v-if="currentProductType === 'robot'">
          <el-divider content-position="left">🤖 机器人特有参数</el-divider>
          <RobotForm v-model="robotFormData" />
        </div>

        <div v-else-if="currentProductType === 'sport'">
          <el-divider content-position="left">🎮 控制器特有参数</el-divider>
          <SportForm v-model="sportFormData" />
        </div>

        <!-- 提示 -->
        <div v-if="!currentProductType && editMode && loadingDetail">
          <el-alert title="正在加载产品详情..." type="info" :closable="false" show-icon />
        </div>
        <div v-else-if="!currentProductType && !editMode && !formData.category.length">
          <el-alert title="请先在上方选择产品分类" type="info" :closable="false" show-icon />
        </div>
        <div v-else-if="!currentProductType && formData.category.length">
          <el-empty description="该分类下暂无对应的表单配置" :image-size="80" />
        </div>

      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Plus, Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import RobotForm from '@/components/RobotForm.vue';
import SportForm from '@/components/SportForm.vue';


import {
  categoryTree,
  saveProductRobot,
  saveProductsSport,
  uploadImageCommon,
  getProductDetail
} from '@/api/common';

const route = useRoute();
const router = useRouter();

const formRef = ref(null);
const loading = ref(false);
const loadingDetail = ref(false);
const categoryOptions = ref([]);
const currentProductType = ref('');
const mainImageList = ref([]);

const editMode = ref(false);
const currentProductId = ref(null);

const formData = reactive({
  category: [],
  productName: '',
  modelNumber: '',
  mainImageUrl: '',
  robotType: '',
  ifMain: 0,
});

const robotFormData = reactive({});
const sportFormData = reactive({});

const productTypeMap = new Map();
const ROOT_ROBOT_ID = 4;
const ROOT_SPORT_ID = 11;

const transformTree = (nodes) => {
  if (!nodes) return [];
  return nodes.map(node => {
    const newNode = {
      value: node.id,
      label: node.label || node.name,
      children: transformTree(node.children),
    };
    if (node.parentId === ROOT_ROBOT_ID) productTypeMap.set(node.id, 'robot');
    else if (node.parentId === ROOT_SPORT_ID) productTypeMap.set(node.id, 'sport');
    return newNode;
  });
};

const findCategoryPath = (nodes, targetId, path = []) => {
  for (let node of nodes) {
    if (node.value === targetId) return [...path, node.value];
    if (node.children && node.children.length > 0) {
      const found = findCategoryPath(node.children, targetId, [...path, node.value]);
      if (found) return found;
    }
  }
  return null;
};

const getCategoryOptions = async (productType, id) => {
  console.log(' [1] 开始加载分类树...');
  try {
    const response = await categoryTree();
    console.log(' [1] 分类树原始数据:', response);

    if (response.code === 200 && response.data) {
      productTypeMap.clear();
      categoryOptions.value = transformTree(response.data);
      console.log(' [1] 分类树转换完成，选项数量:', categoryOptions.value.length);

      //  树加载完后，如果是编辑模式，立即加载详情
      if (editMode.value && currentProductId.value) {
        console.log(' [2] 检测到编辑模式，ID:', currentProductId.value, '开始加载详情...');
        loadProductDetail(productType, id);
      } else {
        console.log('[2] 非编辑模式或无 ID，跳过详情加载');
      }
    } else {
      console.error(' [1] 分类树返回数据异常:', response);
    }
  } catch (error) {
    console.error(' [1] 获取分类树失败:', error);
    ElMessage.error('获取分类列表失败，请检查网络');
  }
};

const loadProductDetail = async (productType, id) => {
  loadingDetail.value = true;
  console.log('[3] 请求详情接口 GET /product/detail/', id);

  try {

    const res = await getProductDetail(productType, id);

    console.log(' [3] 接口返回数据:', res);

    if (res.code === 200 && res.data) {
      const data = res.data;
      console.log(' [4] 开始填充表单数据...');

      //  填充通用字段
      formData.productName = data.product_name;
      formData.modelNumber = data.model_number;
      formData.mainImageUrl = data.main_image_url || '';
      formData.ifMain = data.if_main || '';

      console.log(' [4.1] 通用字段填充后:', {
        name: formData.productName,
        model: formData.modelNumber,
        img: formData.mainImageUrl
      });

      // 图片回显
      if (formData.mainImageUrl) {
        mainImageList.value = [{ name: 'img', url: formData.mainImageUrl }];
        console.log('[4.2] 图片列表已更新');
      }

      //   处理级联选择器  
      const path = findCategoryPath(categoryOptions.value, data.category_id);
      console.log('  [4.3] 查找分类路径结果:', path, '目标 ID:', data.category_id);

      if (path) {
        formData.category = path;
        console.log('  [4.3] 级联器已赋值:', formData.category);
        handleCategoryChange(path, true);
      } else {
        console.warn(' [4.3] 未找到分类路径，无法选中级联器');
        currentProductType.value = data.product_type;
      }

      //  特有字段
      if (data.product_type === 'robot') {
        Object.assign(robotFormData, {
          robotName: data.robot_name,
          maxArmSpan: data.max_arm_span,
          maxWeight: data.max_weight,
          switchNum: data.switch_num,
          weight: data.weight,
          perprecision: data.perprecision,
          ipLevel: data.ip_level,
          insType: data.ins_type,
          driveType: data.drive_type,
          authSupport: data.auth_support,
          insRequire: data.ins_require,
          remark: data.remark,
          detailImg: data.detail_img
        });
        console.log(' [4.4] 机器人特有数据已填充');
      } else if (data.product_type === 'sport') {
        const dictToArray = (obj) => {
          if (!obj || typeof obj !== 'object') return [];
          return Object.entries(obj).map(([k, v]) => ({
            lineName: k, lineValue: v, id: Math.random().toString(36).substr(2, 9)
          }));
        };
        Object.assign(sportFormData, {
          name: data.name,
          detail: data.detail,
          img: data.img,
          line1: data.line1,
          line2: data.line2,
          line3: data.line3,
          sportPram: dictToArray(data.sport_pram),
          sportPramTwo: dictToArray(data.sport_pram_two)
        });
        console.log(' [4.4] 控制器特有数据已填充');
      }

      ElMessage.success('产品信息加载完成');
    } else {
      console.error('  [3] 接口返回 code 不为 200:', res);
      ElMessage.error('获取产品详情失败: ' + (res.msg || '未知错误'));
    }
  } catch (error) {
    console.error('  [3] 加载详情发生异常:', error);
    ElMessage.error('加载详情失败，请查看控制台报错');
  } finally {
    loadingDetail.value = false;
  }
};


const handleCategoryChange = (val, isInit = false) => {
  if (!val || val.length === 0) {
    currentProductType.value = '';
    formData.robotType = ''; // 清空 robotType
    return;
  }

  //  获取最后一级分类的 ID
  const selectedCategoryId = val[val.length - 1];

  //  根据 ID 查找对应的分类对象，从而获取其名称
  // 定义一个递归查找函数
  function findCategoryName(categories, targetId) {
    for (let cat of categories) {
      if (cat.value === targetId) {
        return cat.label; // 找到后返回其 label 
      }
      if (cat.children && cat.children.length > 0) {
        const foundName = findCategoryName(cat.children, targetId);
        if (foundName) return foundName; // 如果在子级找到了，也返回名称
      }
    }
    return null; // 没找到则返回 null
  }

  //   执行查找并赋值
  const categoryName = findCategoryName(categoryOptions.value, selectedCategoryId);
  if (categoryName) {
    formData.robotType = categoryName;
    console.log(`[5] 分类变化: "${categoryName}" -> formData.robotType`);
  } else {

    formData.robotType = '';
    console.warn('未能根据ID找到对应的分类名称:', selectedCategoryId);
  }


  const type = productTypeMap.get(selectedCategoryId);
  currentProductType.value = type || '';
  console.log(' [5] 分类变化触发，当前类型:', currentProductType.value);
};
const handleMainImageChange = (uploadFile) => {
  mainImageList.value = [uploadFile];
  const rawFile = uploadFile.raw;
  if (rawFile) {
    if (!rawFile.type.startsWith('image/')) {
      ElMessage.error('只能上传图片');
      mainImageList.value = [];
      formData.mainImageUrl = '';
      return;
    }
    formData.mainImageUrl = URL.createObjectURL(rawFile);
  }
};

const handleMainImageRemove = () => {
  mainImageList.value = [];
  formData.mainImageUrl = '';
};

const rules = {
  category: [{ required: true, message: '必选分类', trigger: 'change' }],
  productName: [{ required: true, message: '必填名称', trigger: 'blur' }],
  modelNumber: [{ required: true, message: '必填型号', trigger: 'blur' }],
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    if (!currentProductType.value) {
      ElMessage.warning('请先选择正确的分类');
      return;
    }

    loading.value = true;
    try {
      // 图片上传逻辑
      let finalImageUrl = formData.mainImageUrl;
      if (finalImageUrl && finalImageUrl.startsWith('blob:')) {
        const fd = new FormData();
        if (mainImageList.value[0]?.raw) {
          fd.append('file', mainImageList.value[0].raw);
          fd.append('module', 'product');
          const upRes = await uploadImageCommon(fd);
          if (upRes.code === 200) finalImageUrl = upRes.data.url;
          else throw new Error('图片上传失败');
        }
      }

      // 构造 Payload
      const basePayload = {
        ...(editMode.value ? { id: currentProductId.value } : {}),
        product_name: formData.productName,
        model_number: formData.modelNumber,
        robot_type: formData.robotType,
        main_image_url: finalImageUrl,
        category_id: formData.category[1],
        is_active: true,
        if_main: formData.ifMain,
      };

      let specificPayload = {};
      if (currentProductType.value === 'robot') {
        specificPayload = {
          robot_name: robotFormData.robotName,
          max_arm_span: robotFormData.maxArmSpan,
          max_weight: robotFormData.maxWeight,
          switch_num: robotFormData.switchNum,
          weight: robotFormData.weight,
          perprecision: robotFormData.perprecision,
          ip_level: robotFormData.ipLevel,
          ins_type: robotFormData.insType,
          drive_type: robotFormData.driveType,
          auth_support: robotFormData.authSupport,
          ins_require: robotFormData.insRequire,
          remark: robotFormData.remark,
          detail_img: robotFormData.detailImg
        };
      } else if (currentProductType.value === 'sport') {
        const toDict = (arr) => {
          if (!arr || !Array.isArray(arr)) return null;
          const res = {};
          arr.forEach(i => { if (i.lineName) res[i.lineName] = i.lineValue; });
          return res;
        };
        specificPayload = {
          name: sportFormData.name,
          detail: sportFormData.detail,
          img: sportFormData.img,
          line1: sportFormData.line1,
          line2: sportFormData.line2,
          line3: sportFormData.line3,
          sport_pram: toDict(sportFormData.sportPram),
          sport_pram_two: toDict(sportFormData.sportPramTwo)
        };
      }

      const payload = { ...basePayload, ...specificPayload };

      const res = currentProductType.value === 'robot'
        ? await saveProductRobot(payload)
        : await saveProductsSport(payload);

      if (res.code === 200 || res.code === 201) {
        ElMessage.success(editMode.value ? '更新成功' : '创建成功');
        setTimeout(() => router.push('/cms/productList'), 1500);
      } else {
        ElMessage.error(res.msg || '操作失败');
      }
    } catch (e) {
      console.error(e);
      ElMessage.error(e.response?.data?.detail || e.message || '提交失败');
    } finally {
      loading.value = false;
    }
  });
};
onMounted(() => {
  console.log(' [0] 组件挂载，当前路由 Params:', route.params);
  console.log(' [0] 当前路由 Query:', route.query);

  const id = route.params.id;
  const productType = route.params.productType;

  if (id) {
    editMode.value = true;
    currentProductId.value = parseInt(id);
    console.log(' [0] 识别为编辑模式，ID:', currentProductId.value);
  } else {
    console.log(' [0] 识别为新增模式');
  }

  getCategoryOptions(productType, id);
});
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