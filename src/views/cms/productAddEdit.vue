<template>
  <div class="product-add-container">
    <div class="page-header">
      <h2>
        {{
          editMode
            ? "编辑产品"
            : currentProductType === "robot"
              ? "新增机器人产品"
              : "新增运动控制器"
        }}
      </h2>
      <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">
        <el-icon style="margin-right: 5px">
          <Check />
        </el-icon>
        {{ editMode ? "保存修改" : "立即创建" }}
      </el-button>
    </div>

    <el-card class="form-card">
      <el-form ref="formRef" :model="formData" label-width="140px" v-loading="loadingDetail">
        <el-divider content-position="left">📦 通用基础信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品分类" prop="category">
              <el-cascader v-model="formData.category" :options="categoryOptions" :props="{
                expandTrigger: 'hover',
                value: 'value',
                label: 'label',
                children: 'children',
              }" placeholder="请选择分类" style="width: 100%" @change="handleCategoryChange" />
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
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="产品类型" prop="robotType">
              <span>{{ formData.robotType }}</span>
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

        <div v-if="currentProductType === 'robot'">
          <RobotForm v-model="robotFormData" :tables="customTables" @update:tables="handleUpdateTables"
            :upload-table-image-api="uploadRobotTableImage" />
        </div>

        <div v-else-if="currentProductType === 'sport'">
          <el-divider content-position="left">🎮 控制器特有参数</el-divider>
          <SportForm v-model="sportFormData" :custom-tables="sportCustomTables"
            @update:custom-tables="handleUpdateSportTables" :selling-points="sportSellingPoints"
            @update:selling-points="handleUpdateSportSellingPoints" :upload-table-image-api="uploadRobotTableImage" />
        </div>

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
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Plus, Check } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import RobotForm from "@/components/RobotForm.vue";
import SportForm from "@/components/SportForm.vue";

import {
  categoryTree,
  saveProductRobot,
  saveProductsSport,
  getProductDetail,
  uploadRobotImage,
  uploadRobotTableImage,
  uploadSportImage,
} from "@/api/common";

const route = useRoute();
const router = useRouter();

const formRef = ref(null);
const loading = ref(false);
const loadingDetail = ref(false);
const categoryOptions = ref([]);
const currentProductType = ref("");
const mainImageList = ref([]);

const editMode = ref(false);
const currentProductId = ref(null);
const sportSellingPoints = ref([]);

const formData = reactive({
  category: [],
  productName: "",
  modelNumber: "",
  mainImageUrl: "",
  mainImageId: null,
  robotType: "",
  ifMain: 0,
});

const robotFormData = reactive({
  maxArmSpan: "",
  maxWeight: "",
  switchNum: "",
  weight: "",
  img: "",
  images: [],
});

const sportFormData = reactive({
  name: "",
  detail: "",
  img: "",
  images: [],
  sellingPoints: [],
});

const customTables = ref([]);
const sportCustomTables = ref([]);
const productTypeMap = new Map();

const beforeUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isImage) ElMessage.error("只能上传图片");
  if (!isLt5M) ElMessage.error("最大5M");
  return isImage && isLt5M;
};

const handleUpdateTables = (val) => customTables.value = val;
const handleUpdateSportTables = (val) => sportCustomTables.value = val;
const handleUpdateSportSellingPoints = (val) => sportSellingPoints.value = val;

const handleMainImageChange = async (uploadFile) => {
  mainImageList.value = [uploadFile];
  const raw = uploadFile.raw;
  if (!raw) return;
  try {
    const fd = new FormData();
    fd.append("file", raw);
    const res = await uploadRobotImage(fd);
    if (res.code === 200) {
      formData.mainImageUrl = res.data.url;
      formData.mainImageId = res.data.id;
      mainImageList.value = [{ uid: uploadFile.uid, name: uploadFile.name, url: res.data.url, status: "success" }];
      ElMessage.success("主图上传成功");
    }
  } catch (e) {
    ElMessage.error("上传失败");
  }
};

const handleMainImageRemove = () => {
  mainImageList.value = [];
  formData.mainImageUrl = "";
  formData.mainImageId = null;
};

const transformTree = (nodes) => {
  const map = (node, topType) => {
    let t = topType;
    if (node.parentId === null) t = node.category_type;
    if (t) productTypeMap.set(node.id, t);
    return {
      value: node.id,
      label: node.label || node.name,
      children: node.children?.map(c => map(c, t)) || [],
    };
  };
  return nodes.map(n => map(n));
};

const findCategoryPath = (nodes, id, p = []) => {
  for (let n of nodes) {
    if (n.value === id) return [...p, n.value];
    const f = findCategoryPath(n.children || [], id, [...p, n.value]);
    if (f) return f;
  }
  return null;
};

const getCategoryOptions = async () => {
  const res = await categoryTree();
  if (res.code === 200) categoryOptions.value = transformTree(res.data);
};

const loadProductDetail = async (t, id) => {
  loadingDetail.value = true;
  const res = await getProductDetail(t, id);
  if (res.code === 200 && res.data) {
    const d = res.data;
    formData.productName = d.product_name;
    formData.modelNumber = d.model_number;
    formData.mainImageUrl = d.main_image_url || "";
    formData.ifMain = d.if_main ? 1 : 0;
    formData.robotType = d.robot_type || "";

    if (formData.mainImageUrl) mainImageList.value = [{ url: formData.mainImageUrl }];

    const path = findCategoryPath(categoryOptions.value, d.category_id);
    if (path) formData.category = path;
    currentProductType.value = d.product_type;

    if (d.product_type === "robot") {
      robotFormData.maxArmSpan = d.max_arm_span || "";
      robotFormData.maxWeight = d.max_weight || "";
      robotFormData.switchNum = d.switch_num || "";
      robotFormData.weight = d.weight || "";
      robotFormData.img = d.img || "";
      robotFormData.images = d.images || [];
      customTables.value = d.custom_tables || [];
    }

    if (d.product_type === "sport") {
      sportFormData.name = d.name || "";
      sportFormData.detail = d.detail || "";
      sportFormData.img = d.img || "";
      sportFormData.images = d.images || [];
      sportSellingPoints.value = d.selling_points || [];
      sportCustomTables.value = d.custom_tables || [];
    }
  }
  loadingDetail.value = false;
};

const getCascaderLastLabel = (options, valueArr) => {
  let target = null;
  let list = options;
  for (const val of valueArr) {
    const item = list.find((i) => i.value === val);
    if (!item) break;
    target = item;
    list = item.children || [];
  }
  return target?.label || "";
};

const handleCategoryChange = (val) => {
  if (!val.length) {
    currentProductType.value = "";
    formData.robotType = ""; // 清空
    return;
  }

  const lastId = val.at(-1);
  currentProductType.value = productTypeMap.get(lastId) || "";
  const label = getCascaderLastLabel(categoryOptions.value, val);
  formData.robotType = label || "";
};

const handleSubmit = async () => {
  loading.value = true;
  const base = {
    id: editMode.value ? currentProductId.value : null,
    product_name: formData.productName,
    model_number: formData.modelNumber,
    robot_type: formData.robotType,
    main_image_url: formData.mainImageUrl,
    main_image_id: formData.mainImageId,
    category_id: formData.category.at(-1),
    if_main: formData.ifMain,
  };

  if (currentProductType.value === "robot") {
    const payload = {
      ...base,
      max_arm_span: robotFormData.maxArmSpan,
      max_weight: robotFormData.maxWeight,
      switch_num: robotFormData.switchNum,
      weight: robotFormData.weight,
      img: robotFormData.img,
      images: robotFormData.images,
      custom_tables: customTables.value.map(t => ({
        name: t.name,
        rows: t.rows.map(r => [r.key, r.value]),
        images: t.images || [],
      })),
    };
    await saveProductRobot(payload);
  }

  if (currentProductType.value === "sport") {
    const payload = {
      ...base,
      name: sportFormData.name,
      detail: sportFormData.detail,
      img: sportFormData.img,
      images: sportFormData.images,
      selling_points: sportSellingPoints.value,
      custom_tables: sportCustomTables.value.map(t => ({
        name: t.name,
        rows: t.rows.map(r => [r.key, r.value]),
        images: t.images || [],
      })),
    };
    await saveProductsSport(payload);
  }

  ElMessage.success("保存成功");
  router.push("/cms/productList");
  loading.value = false;
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
      color: #409eff;
      word-break: break-all;
      font-family: monospace;
    }
  }
}
</style>
