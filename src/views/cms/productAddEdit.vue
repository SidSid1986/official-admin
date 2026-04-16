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
              <span>{{ formData.robotType }}</span> <!-- 这里显示的是分类名称 -->
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="是否放置首页" prop="ifMain">
              <el-radio-group v-model="formData.ifMain">
                <el-radio :value="1">是</el-radio>
                <el-radio :value="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 动态区域  currentProductType 有值 显示) -->
        <div v-if="currentProductType === 'robot'">
          <el-divider content-position="left">🤖 机器人固定参数</el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="最大臂展">
                <el-input v-model="robotFormData.maxArmSpan" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最大负载">
                <el-input v-model="robotFormData.maxWeight" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="轴数">
                <el-input v-model="robotFormData.switchNum" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="本体重量">
                <el-input v-model="robotFormData.weight" placeholder="请输入" clearable />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 自定义多表格模块 -->
          <el-divider content-position="left">📋 自定义参数表格</el-divider>
          <div style="margin-bottom: 12px">
            <el-button type="success" icon="Plus" @click="addCustomTable">
              添加新表格
            </el-button>
          </div>

          <div v-for="(table, idx) in customTables" :key="idx"
            style="margin-bottom: 24px; border: 1px solid #e4e7ed; padding: 16px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <el-input v-model="table.name" placeholder="表格名称（如：性能参数）" style="width: 280px" />
              <el-button type="danger" icon="Delete" size="small" @click="removeTable(idx)">删除此表格</el-button>
            </div>

            <el-table :data="table.rows" border style="width: 100%">
              <el-table-column label="参数名称" width="200">
                <template #default="scope">
                  <el-input v-model="scope.row.key" placeholder="参数名" />
                </template>
              </el-table-column>
              <el-table-column label="参数值">
                <template #default="scope">
                  <el-input v-model="scope.row.value" placeholder="参数值" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100">
                <template #default="scope">
                  <el-button type="text" danger @click="removeRow(idx, scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div style="margin-top: 8px; text-align: right">
              <el-button type="primary" icon="Plus" size="small" @click="addRow(idx)">添加参数行</el-button>
            </div>

            <!-- ====================== 表格图片上传 ====================== -->
            <div style="margin-top: 16px;">
              <div style="margin-bottom: 8px; font-weight: 500;">表格配套图片</div>
              <el-upload action="#" :auto-upload="false" :file-list="table.imageList" list-type="picture-card"
                :on-change="(f) => handleTableImageChange(f, idx)" :on-remove="(f) => handleTableImageRemove(f, idx)"
                :limit="5" :before-upload="beforeUpload">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-upload>
            </div>
          </div>
        </div>

        <div v-else-if="currentProductType === 'sport'">
          <el-divider content-position="left">🎮 控制器特有参数</el-divider>
          <SportForm v-model="sportFormData" :main-image-list="sportMainImageList"
            @main-image-change="handleSportMainImageChange" @main-image-remove="handleSportMainImageRemove" />
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
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Plus, Check } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import SportForm from '@/components/SportForm.vue';

import {
  categoryTree,
  saveProductRobot,
  saveProductsSport,
  getProductDetail,
  uploadRobotImage,
  uploadRobotTableImage,
  uploadSportImage
} from '@/api/common';

const route = useRoute();
const router = useRouter();

const formRef = ref(null);
const loading = ref(false);
const loadingDetail = ref(false);
const categoryOptions = ref([]);
const currentProductType = ref(''); // 用于决定渲染哪个表单
const mainImageList = ref([]);

const editMode = ref(false);
const currentProductId = ref(null);

const formData = reactive({
  category: [],
  productName: '',
  modelNumber: '',
  mainImageUrl: '',
  mainImageId: null, // 主图ID
  robotType: '', // 分类名称，例如 "SCARA系列"
  ifMain: 0,
});

const robotFormData = reactive({
  maxArmSpan: '',
  maxWeight: '',
  switchNum: '',
  weight: ''
});

const customTables = ref([]);
const sportFormData = reactive({});

// 运动控制器主图列表
const sportMainImageList = ref([]);

const productTypeMap = new Map(); // 用于快速判断分类ID属于哪个大类 (robot/sport)
const ROOT_ROBOT_ID = 4;
const ROOT_SPORT_ID = 11;

// 图片上传验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('上传图片大小不能超过 5MB!');
    return false;
  }
  return isImage && isLt5M;
};

// ====================== 表格操作 ======================
const addCustomTable = () => {
  customTables.value.push({
    name: '',
    rows: [{ key: '', value: '' }],
    images: [], // 存储 {id, url} 对象
    imageList: [] // 存储上传组件的文件对象
  });
};
const removeTable = (idx) => {
  // 移除整个表格，包括其图片状态
  customTables.value.splice(idx, 1);
};
const addRow = (tableIdx) => {
  customTables.value[tableIdx].rows.push({ key: '', value: '' });
};
const removeRow = (tableIdx, rowIdx) => {
  customTables.value[tableIdx].rows.splice(rowIdx, 1);
};

// ====================== 主图上传 ======================
const handleMainImageChange = async (uploadFile) => {
  // 清空之前的主图状态（但不清除图片本身，等提交时覆盖）
  mainImageList.value = [uploadFile];
  const raw = uploadFile.raw;
  if (!raw) return;

  try {
    const fd = new FormData();
    fd.append('file', raw);

    const res = await uploadRobotImage(fd);
    if (res.code === 200) {
      formData.mainImageUrl = res.data.url;
      formData.mainImageId = res.data.id; // 保存ID用于提交
      // 更新文件列表，显示上传成功的图片
      mainImageList.value = [{
        uid: uploadFile.uid,
        name: uploadFile.name,
        url: res.data.url,
        status: 'success'
      }];
      ElMessage.success('主图上传成功');
    } else {
      ElMessage.error('主图上传失败');
      mainImageList.value = [];
    }
  } catch (err) {
    console.error('主图上传错误:', err);
    ElMessage.error('主图上传失败');
    mainImageList.value = [];
  }
};

// ====================== 主图删除：仅清空状态，不删除服务器文件 ======================
const handleMainImageRemove = async () => {
  mainImageList.value = [];
  formData.mainImageUrl = '';
  formData.mainImageId = null;
};

// ====================== 运动控制器主图上传 ======================
const handleSportMainImageChange = async (uploadFile) => {
  // 清空之前的主图状态
  sportMainImageList.value = [uploadFile];
  const raw = uploadFile.raw;
  if (!raw) return;

  try {
    const fd = new FormData();
    fd.append('file', raw);

    const res = await uploadSportImage(fd);
    if (res.code === 200) {
      // 更新运动控制器数据中的主图信息
      sportFormData.main_image_url = res.data.url;
      sportFormData.main_image_id = res.data.id; // 保存ID用于提交
      // 更新文件列表，显示上传成功的图片
      sportMainImageList.value = [{
        uid: uploadFile.uid,
        name: uploadFile.name,
        url: res.data.url,
        status: 'success'
      }];
      ElMessage.success('主图上传成功');
    } else {
      ElMessage.error('主图上传失败');
      sportMainImageList.value = [];
    }
  } catch (err) {
    console.error('主图上传错误:', err);
    ElMessage.error('主图上传失败');
    sportMainImageList.value = [];
  }
};

// ====================== 运动控制器主图删除：仅清空状态 ======================
const handleSportMainImageRemove = async () => {
  sportMainImageList.value = [];
  sportFormData.main_image_url = '';
  sportFormData.main_image_id = null;
};

// ====================== 表格图片上传 ======================
const handleTableImageChange = async (uploadFile, tableIdx) => {
  const table = customTables.value[tableIdx];
  if (!table.images) table.images = [];
  if (!table.imageList) table.imageList = [];

  const exists = table.imageList.some(x => x.uid === uploadFile.uid);
  if (exists) return;

  // 添加到临时列表，等待上传完成后再真正添加
  table.imageList.push({ ...uploadFile, status: 'uploading' });

  const raw = uploadFile.raw;
  if (!raw) return;

  try {
    const fd = new FormData();
    fd.append('file', raw);
    const res = await uploadRobotTableImage(fd);
    if (res.code === 200) {
      table.images.push({
        id: res.data.id,
        url: res.data.url,
        uid: uploadFile.uid
      });

      // 更新上传状态
      const index = table.imageList.findIndex(x => x.uid === uploadFile.uid);
      if (index !== -1) {
        table.imageList[index] = {
          uid: uploadFile.uid,
          name: uploadFile.name,
          url: res.data.url,
          status: 'success'
        };
      }
      ElMessage.success('表格图片上传成功');
    } else {
      ElMessage.error('表格图片上传失败');
      table.imageList = table.imageList.filter(x => x.uid !== uploadFile.uid);
    }
  } catch (err) {
    console.error('表格图片上传错误:', err);
    ElMessage.error('表格图片上传失败');
    table.imageList = table.imageList.filter(x => x.uid !== uploadFile.uid);
  }
};

// ====================== 表格图片删除：仅清空状态 ======================
const handleTableImageRemove = async (uploadFile, tableIdx) => {
  const table = customTables.value[tableIdx];
  // 从状态数组中移除对应项
  table.imageList = table.imageList.filter(x => x.uid !== uploadFile.uid);
  table.images = table.images.filter(x => x.uid !== uploadFile.uid);
};

// ====================== 分类树 ======================
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
    if (node.children && node.children.length) {
      const found = findCategoryPath(node.children, targetId, [...path, node.value]);
      if (found) return found;
    }
  }
  return null;
};

const getCategoryOptions = async () => {
  try {
    const res = await categoryTree();
    if (res.code === 200) {
      productTypeMap.clear();
      categoryOptions.value = transformTree(res.data);
    }
  } catch (e) {
    ElMessage.error('分类加载失败');
  }
};



// ====================== 详情回填 ======================
const loadProductDetail = async (productType, id) => {
  loadingDetail.value = true;
  console.log('[3] 请求详情接口 GET /product/detail/', id);

  try {
    const res = await getProductDetail(productType, id);
    console.log(' [3] 接口返回数据:', res);

    if (res.code === 200 && res.data) {
      const data = res.data;
      console.log(' [4] 开始填充表单数据...');

      // --- 通用字段回填 ---
      formData.productName = data.product_name;
      formData.modelNumber = data.model_number;
      formData.mainImageUrl = data.main_image_url || '';
      // formData.mainImageId = data.main_image_id || null; // 如果需要
      // **关键修正**：在通用部分设置 ifMain
      formData.ifMain = data.if_main ? 1 : 0; // <--- 无论 robot 还是 sport 都设置
      formData.robotType = data.robot_type || ''; // <--- 确保回填 robot_type

      console.log(' [4.1] 通用字段填充后:', {
        name: formData.productName,
        model: formData.modelNumber,
        img: formData.mainImageUrl,
        ifMain: formData.ifMain, // <--- 检查日志
        robotType: formData.robotType // <--- 检查日志
      });

      // --- 通用主图列表回填 (仅针对 formData.mainImageUrl) ---
      if (formData.mainImageUrl) {
        mainImageList.value = [{ name: 'img', url: formData.mainImageUrl }];
        console.log('[4.2] 通用图片列表已更新');
      }

      const path = findCategoryPath(categoryOptions.value, data.category_id);
      console.log('  [4.3] 查找分类路径结果:', path, '目标 ID:', data.category_id);

      if (path) {
        formData.category = path;
        console.log('  [4.3] 级联器已赋值:', formData.category);
        // handleCategoryChange(path, true); // <--- 注释掉，因为 robot_type 已从详情获得
        // 直接设置类型
        const lastId = path[path.length - 1];
        const type = productTypeMap.get(lastId);
        currentProductType.value = type || '';
        console.log(' [5] 直接根据详情设置类型:', currentProductType.value);
      } else {
        console.warn(' [4.3] 未找到分类路径，无法选中级联器');
        currentProductType.value = data.product_type;
      }

      if (data.product_type === 'robot') {
        // --- 机器人特有字段回填 ---
        robotFormData.maxArmSpan = data.max_arm_span || '';
        robotFormData.maxWeight = data.max_weight || '';
        robotFormData.switchNum = data.switch_num || '';
        robotFormData.weight = data.weight || '';

        // --- 机器人自定义表格回填 (结合上方代码的图片处理逻辑) ---
        if (data.custom_tables && Array.isArray(data.custom_tables)) {
          customTables.value = data.custom_tables.map((t, idx) => { // <--- 添加索引 idx
            const tableObj = {
              name: t.name || '',
              rows: t.rows ? t.rows.map(r => ({ key: r[0] || '', value: r[1] || '' })) : [],
              images: [], // <--- 添加 images 数组
              imageList: [] // <--- 添加 imageList 数组
            };

            // 处理表格图片 (来自上方代码)
            if (t.images && Array.isArray(t.images)) {
              tableObj.images = t.images.map((img, imgIdx) => { // <--- 添加索引 imgIdx
                let id = null;
                let url = typeof img === 'string' ? img : (img.url || '');

                if (typeof img === 'object' && img.id) {
                  id = img.id;
                  url = img.url || '';
                }

                return {
                  id: id, // <--- 保留图片 ID
                  url: url, // <--- 保留图片 URL
                  uid: `${idx}-${imgIdx}` // <--- 为图片生成唯一 UID
                };
              });

              // 将图片信息转换为 el-upload 需要的格式
              tableObj.imageList = tableObj.images.map(img => ({
                uid: img.uid,
                name: 'table-image', // 或其他名称
                url: img.url, // <--- 图片 URL
                status: 'success' // <--- 状态设为 success
              }));
            }

            return tableObj;
          });
        }

        console.log(' [4.4] 机器人数据（含表格图片）已填充');
      } else if (data.product_type === 'sport') {
        // --- 运动控制器特有字段回填 (结合下方代码) ---
        const dictToArray = (obj) => {
          if (!obj || typeof obj !== 'object') return [];
          return Object.entries(obj).map(([k, v]) => ({
            lineName: k, lineValue: v, id: Math.random().toString(36).substr(2, 9)
          }));
        };

        // **关键修正**：确保 sportFormData.img 被正确回填
        Object.assign(sportFormData, {
          name: data.name || '',
          detail: data.detail || '',
          img: data.img || '', // <--- **关键**：回填 sport 特有主图
          line1: data.line1 || '',
          line2: data.line2 || '',
          line3: data.line3 || '',
          sportPram: dictToArray(data.sport_pram || {}), // <--- 确保有默认值
          sportPramTwo: dictToArray(data.sport_pram_two || {}) // <--- 确保有默认值
        });

        // --- 运动控制器主图列表回填 (如果 SportForm 内部管理) ---
        // SportForm 组件内部需要监听 sportFormData.img 的变化并更新其 el-upload 的 fileList
        // 这里不直接操作 sportMainImageList，而是依赖 SportForm 内部的逻辑

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
  if (!val.length) {
    currentProductType.value = '';
    formData.robotType = '';
    return;
  }
  const lastId = val[val.length - 1];

  // 1. 根据 ID 找到分类名称，设置到 robotType
  function findLabelById(nodes, id) {
    for (let node of nodes) {
      if (node.value === id) return node.label;
      if (node.children && node.children.length) {
        const found = findLabelById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }
  const typeName = findLabelById(categoryOptions.value, lastId);
  if (typeName) {
    formData.robotType = typeName; // 这里才是正确的分类名称
  } else {
    formData.robotType = '';
  }

  // 2. 根据 ID 判断是 robot 还是 sport，决定渲染哪个表单
  const type = productTypeMap.get(lastId);
  currentProductType.value = type || '';
};

// ====================== 提交 ======================
const handleSubmit = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return;

    loading.value = true;
    try {
      const base = {
        id: editMode.value ? currentProductId.value : null,
        product_name: formData.productName,
        model_number: formData.modelNumber,
        robot_type: formData.robotType, // 提交分类名称
        main_image_url: formData.mainImageUrl,
        main_image_id: formData.mainImageId, // 提交主图ID，用于覆盖
        category_id: formData.category.at(-1),
        if_main: formData.ifMain,
      };

      if (currentProductType.value === 'robot') {
        const tables = customTables.value.map(t => ({
          name: t.name,
          rows: t.rows.map(r => [r.key || '', r.value || '']),
          images: t.images.map(i => ({
            id: i.id,
            url: i.url
          }))
        }));

        const robotData = {
          max_arm_span: robotFormData.maxArmSpan,
          max_weight: robotFormData.maxWeight,
          switch_num: robotFormData.switchNum,
          weight: robotFormData.weight
        };

        const payload = {
          ...base,
          ...robotData,
          custom_tables: tables
        };

        const res = await saveProductRobot(payload);
        if (res.code === 200) {
          ElMessage.success('保存成功');
          router.push('/cms/productList');
        } else {
          ElMessage.error(res.msg || '保存失败');
        }
      } else if (currentProductType.value === 'sport') {
        const sportPayload = {
          ...base,
          name: sportFormData.name,
          detail: sportFormData.detail,
          img: sportFormData.img,
          line1: sportFormData.line1,
          line2: sportFormData.line2,
          line3: sportFormData.line3,

          sport_pram: { data: sportFormData.sportPram },
          sport_pram_two: { data: sportFormData.sportPramTwo },

          main_image_id: sportFormData.main_image_id // 提交运动控制器主图ID
        };

        const res = await saveProductsSport(sportPayload);
        if (res.code === 200) {
          ElMessage.success('保存成功');
          router.push('/cms/productList');
        } else {
          ElMessage.error(res.msg || '保存失败');
        }
      }

    } catch (e) {
      console.error('提交失败:', e);
      ElMessage.error(e.message || '提交失败');
    } finally {
      loading.value = false;
    }
  });
};

onMounted(async () => {
  const { id, productType } = route.params;
  if (id) {
    editMode.value = true;
    currentProductId.value = +id;
  }
  await getCategoryOptions();
  if (id) await loadProductDetail(productType, id);
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