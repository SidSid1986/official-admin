<template>
  <div class="home-config-container">

    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title-icon">🎡</span>
          <span>关于我们轮播图管理</span>
        </div>
      </template>

      <div class="upload-section">
        <el-upload v-model:file-list="fileList" :action="uploadUrl" :headers="uploadHeaders"
          :data="{ img_type: 'banner' }" list-type="picture-card" :on-success="handleUploadSuccess"
          :on-error="handleUploadError" :on-preview="handlePictureCardPreview" :on-remove="handleRemove" multiple>
          <el-icon class="uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </div>
    </el-card>

    <!-- 2. 历程步骤管理 (新增部分) -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title-icon">🚩</span>
          <span>发展历程管理</span>
          <el-button type="primary" size="small" style="margin-left: auto;" @click="openStepDialog()">
            <el-icon>
              <Plus />
            </el-icon> 新增步骤
          </el-button>
        </div>
      </template>

      <el-table :data="stepList" style="width: 100%" border stripe v-loading="stepLoading">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="年份/标题" align="center" />
        <el-table-column label="图片预览" align="center">
          <template #default="{ row }">
            <el-image :src="row.img" :preview-src-list="[row.img]"
              style="width: 80px; height: 50px; border-radius: 4px; cursor: pointer;" fit="cover"
              :hide-on-click-modal="true" />
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序权重" width="120" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openStepDialog(row)">编辑</el-button>
            <el-popconfirm title="确定要删除这个步骤吗?" @confirm="deleteStep(row.id)">
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 3. 步骤新增/编辑弹窗 -->
    <el-dialog v-model="stepDialogVisible" :title="stepForm.id ? '编辑步骤' : '新增步骤'" width="500px">
      <el-form :model="stepForm" :rules="stepRules" ref="stepFormRef" label-width="100px">
        <el-form-item label="标题(年份)" prop="title">
          <el-input v-model="stepForm.title" placeholder="例如：2023" />
        </el-form-item>
        <el-form-item label="步骤图片" prop="img_url">
          <!-- 图片预览区域 -->
          <div v-if="stepForm.img_url" class="image-preview-wrapper">
            <el-image :src="stepForm.img_url" :preview-src-list="[stepForm.img_url]" fit="cover"
              style="width: 120px; height: 80px; border-radius: 4px; cursor: pointer; margin-bottom: 10px;"
              :hide-on-click-modal="true" />
          </div>
          <!-- 上传组件 -->
          <el-upload class="step-img-uploader" :action="uploadStepUrl" :headers="uploadHeaders" :show-file-list="false"
            :on-success="handleStepImgUploadSuccess" :on-error="handleUploadError" :before-upload="beforeStepImgUpload"
            :disabled="stepImgUploading">
            <el-button size="small" type="primary" :loading="stepImgUploading">
              {{ stepImgUploading ? '上传中...' : (stepForm.img_url ? '重新上传' : '点击上传') }}
            </el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="排序权重" prop="sort_order">
          <el-input-number v-model="stepForm.sort_order" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stepDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStepForm" :loading="stepSubmitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 4. 图片预览弹窗 (原有) -->
    <el-dialog v-model="dialogVisible" title="图片预览" width="80%" :append-to-body="true">
      <div class="preview-wrapper">
        <img :src="getFullUrl(dialogImageUrl)" alt="Preview Image" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { aboutImage, deleteBannerApi, stepListApi, addOrUpdateStep, deleteStepApi } from '@/api/common.js';


const uploadUrl = '/api/about/banner/upload';
const uploadStepUrl = '/api/about/step/img/upload';
const token = localStorage.getItem('token');
const uploadHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

const fileList = ref([]);
const dialogVisible = ref(false);
const dialogImageUrl = ref('');

const handleUploadSuccess = (response, uploadFile, uploadFiles) => {
  if (response.code === 200) {
    ElMessage.success('上传成功');
    uploadFile.url = getFullUrl(response.data.img_url);
    uploadFile.id = response.data.id;
    getAboutImage(); // 刷新列表
  } else {
    ElMessage.error(response.msg || '上传失败');
    const index = uploadFiles.indexOf(uploadFile);
    if (index !== -1) uploadFiles.splice(index, 1);
  }
};

const handleUploadError = (err) => {
  console.error(err);
  ElMessage.error('网络错误或服务器异常');
};

const getFullUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return path;
};

const handleRemove = (uploadFile) => {
  delImageFunc(uploadFile.id);
};

const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url;
  dialogVisible.value = true;
};

const getAboutImage = async () => {
  try {
    const res = await aboutImage();
    if (res.code === 200) {
      fileList.value = res.data.map(item => ({
        id: item.id,
        name: `banner-${item.id}`,
        url: getFullUrl(item.img_url)
      }));
    }
  } catch (err) {
    console.error(err);
  }
};

const delImageFunc = (image_id) => {
  deleteBannerApi(image_id).then((res) => {
    if (res.code === 200) {
      ElMessage.success('删除成功');
      getAboutImage();
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  });
};


const stepList = ref([]);
const stepLoading = ref(false);
const stepDialogVisible = ref(false);
const stepFormRef = ref(null);
const stepSubmitting = ref(false);
const stepImgUploading = ref(false);

// 表单数据
const stepForm = reactive({
  id: undefined,
  title: '',
  img_url: '',
  sort_order: 0
});

// 表单验证规则
const stepRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  img_url: [{ required: true, message: '请上传图片', trigger: 'change' }]
};

// 获取步骤列表
const getStepList = async () => {
  stepLoading.value = true;
  try {
    const res = await stepListApi();
    if (res.code === 200) {
      stepList.value = res.data;
    } else {
      ElMessage.error(res.msg || '获取列表失败');
    }
  } catch (err) {
    console.error(err);
    ElMessage.error('获取列表失败');
  } finally {
    stepLoading.value = false;
  }
};

// 打开弹窗 (新增或编辑)
const openStepDialog = (row = null) => {
  if (row) {
    // 编辑模式：回填数据
    stepForm.id = row.id;
    stepForm.title = row.title;
    stepForm.img_url = row.img;
    stepForm.sort_order = row.sort_order;
  } else {
    // 新增模式：重置数据
    stepForm.id = undefined;
    stepForm.title = '';
    stepForm.img_url = '';
    stepForm.sort_order = 0;
  }
  stepDialogVisible.value = true;
};

// 步骤图片上传成功回调
const handleStepImgUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    stepForm.img_url = getFullUrl(response.data.img_url);
    ElMessage.success('图片上传成功');

    if (stepFormRef.value) {
      stepFormRef.value.validateField('img_url');
    }
  } else {
    ElMessage.error(response.msg || '图片上传失败');
  }
  stepImgUploading.value = false;
};

// 步骤图片上传前校验
const beforeStepImgUpload = (rawFile) => {
  const isImage = rawFile.type?.startsWith('image/');
  const maxSize = rawFile.size / 1024 / 1024 < 5; // 限制5MB

  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG/GIF/WebP 格式的图片!');
    return false;
  }
  if (!maxSize) {
    ElMessage.error('图片大小不能超过 5MB!');
    return false;
  }
  stepImgUploading.value = true;
  return true;
};

// 提交表单
const submitStepForm = () => {
  if (!stepFormRef.value) return;

  stepFormRef.value.validate(async (valid) => {
    if (!valid) return;

    stepSubmitting.value = true;

    console.log(stepForm);


    const res = await addOrUpdateStep(stepForm);

    if (res.code === 200) {
      ElMessage.success(res.msg);
      stepDialogVisible.value = false;
      getStepList();
      stepSubmitting.value = false;
    } else {
      stepSubmitting.value = false;
      ElMessage.error(res.msg || '操作失败');
    }

  });
};

// 删除步骤
const deleteStep = async (id) => {
  try {

    const res = await deleteStepApi(id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      getStepList();
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  } catch (err) {
    console.error(err);
    ElMessage.error('删除异常');
  }
};

onMounted(() => {
  getAboutImage();
  getStepList();
});
</script>

<style scoped lang="scss">
.home-config-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .config-card {
    margin-bottom: 25px;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      font-size: 16px;
      color: #606266;

      .title-icon {
        font-size: 18px;
      }
    }

    .upload-section {
      padding: 10px 0;
    }
  }
}

// 上传组件样式
:deep(.el-upload-list--picture-card) {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

:deep(.el-upload--picture-card) {
  width: 148px;
  height: 148px;
  background-color: #fbfdff;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    border-color: #409EFF;
    color: #409EFF;
    background-color: #ecf5ff;
  }
}

:deep(.el-upload-list__item) {
  width: 148px;
  height: 148px;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.02);
  }
}

// 预览弹窗样式
.preview-wrapper {
  text-align: center;
  padding: 20px;

  img {
    max-width: 100%;
    max-height: 60vh;
    object-fit: contain;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  }
}

// 步骤图片上传区域样式
.image-preview-wrapper {
  margin-bottom: 10px;
}

.step-img-uploader {
  :deep(.el-upload) {
    width: 100%;
  }
}
</style>