<template>
  <div class="home-config-container">

    <div class="page-header">
      <h2>🖼️ 首页图片配置</h2>
      <p class="sub-title">管理首页轮播图、行业展示图及底部品牌图</p>
    </div>

    <!--  首页轮播图 (type=banner)  -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title-icon">🎡</span>
          <span>首页轮播图管理</span>
          <!-- <el-tag type="info" size="small">建议比例 1920x600</el-tag> -->
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

    <!--  行业图片 (type=core)  -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title-icon">🏭</span>
          <span>核心行业展示图</span>
          <!-- <el-tag type="warning" size="small" effect="dark">最多 3 张</el-tag> -->
        </div>
      </template>

      <div class="upload-section">
        <!-- <el-upload v-model:file-list="fileList2" :action="uploadUrl" :headers="uploadHeaders"
          :data="{ img_type: 'core' }" :class="fileList2.length >= 3 ? 'img-uploader-has-file' : ''"
          list-type="picture-card" :on-success="handleUploadSuccess" :on-error="handleUploadError"
          :on-preview="handlePictureCardPreview2" :on-remove="handleRemove2" :limit="3" :on-exceed="handleExceed">
          <el-icon class="uploader-icon">
            <Plus />
          </el-icon>
        </el-upload> -->

        <el-upload v-model:file-list="fileList2" :action="uploadUrl" :headers="uploadHeaders"
          :data="{ img_type: 'core' }" list-type="picture-card" :on-success="handleUploadSuccess"
          :on-error="handleUploadError" :on-preview="handlePictureCardPreview2" :on-remove="handleRemove2"
          :on-exceed="handleExceed">
          <el-icon class="uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
        <!-- <div class="tip-text">* 用于首页核心业务板块展示，建议尺寸一致。</div> -->
      </div>
    </el-card>

    <!--  底部图片 (type=footer) -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title-icon">🔻</span>
          <span>首页底部品牌图</span>
          <el-tag type="success" size="small" effect="dark">限 1 张</el-tag>
        </div>
      </template>

      <div class="upload-section single-upload">
        <el-upload class="avatar-uploader" :class="fileList3.length > 0 ? 'avatar-uploader-has-file' : ''"
          :action="uploadUrl" :headers="uploadHeaders" :data="{ img_type: 'footer' }" list-type="picture-card"
          v-model:file-list="fileList3" :on-success="handleUploadSuccess" :on-error="handleUploadError"
          :on-preview="handlePictureCardPreview3" :on-remove="handleRemove3" :limit="1" :on-exceed="handleExceed">
          <el-icon class="uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
        <!-- <div class="tip-text">* 显示在页面最底部</div> -->
      </div>
    </el-card>

    <!-- 预览弹窗   -->
    <el-dialog v-model="dialogVisible" title="图片预览" width="80%" :append-to-body="true">
      <div class="preview-wrapper">

        <img :src="getFullUrl(dialogImageUrl)" alt="Preview Image" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { homeImage, deleteImage } from '@/api/common.js';

const uploadUrl = "/api/home/upload_image";
const token = localStorage.getItem('token');
const uploadHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

// 数据状态 
const fileList = ref([]);
const fileList2 = ref([]);
const fileList3 = ref([]);
const dialogVisible = ref(false);
const dialogImageUrl = ref('');

// 上传成功回调  
const handleUploadSuccess = (response, uploadFile, uploadFiles) => {
  console.log('上传响应:', response);

  if (response.code === 200) {
    ElMessage.success('上传成功');
    uploadFile.url = getFullUrl(response.data.img_url);
    uploadFile.id = response.data.id;
    uploadFile.rawType = response.data.type;
    // 刷新数据
    getHomeImage();
  } else {
    ElMessage.error(response.msg || '上传失败');

    const index = uploadFiles.indexOf(uploadFile);
    if (index !== -1) {
      uploadFiles.splice(index, 1);
    }
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

//  通用处理方法  
const openPreview = (url) => {
  dialogImageUrl.value = url;
  dialogVisible.value = true;
};


const handleRemove = (uploadFile, uploadFiles) => {
  console.log('移除文件', uploadFile);
  console.log(uploadFile.id);
  //  后端删除：
  delImageFunc(uploadFile.id);
};
const handlePictureCardPreview = (uploadFile) => {
  openPreview(uploadFile.url);
};

const handleRemove2 = (uploadFile, uploadFiles) => {
  console.log('行业图移除', uploadFile);
  delImageFunc(uploadFile.id);
};
const handlePictureCardPreview2 = (uploadFile) => {
  openPreview(uploadFile.url);
};

const handleRemove3 = (uploadFile, uploadFiles) => {
  console.log('底部图移除', uploadFile);
  delImageFunc(uploadFile.id);
};
const handlePictureCardPreview3 = (uploadFile) => {
  openPreview(uploadFile.url);
};

const handleExceed = (files, fileList) => {
  console.log(files);
  // const limit = fileList[0]?.length >= 3 ? 3 : 1;
  // ElMessage.warning(`当前模块已达到最大上传数量限制 (${limit} 张)`);
};

// 图片列表
const getHomeImage = async () => {
  try {
    const res = await homeImage();
    if (res.code === 200) {
      const data = res.data;


      if (data.banners) {
        fileList.value = data.banners.map(item => ({
          id: item.id,
          name: `banner-${item.id}`,
          url: getFullUrl(item.img_url)
        }));
      }

      if (data.cores) {
        fileList2.value = data.cores.map(item => ({
          id: item.id,
          name: `core-${item.id}`,
          url: getFullUrl(item.img_url)
        }));
      }

      if (data.footer) {
        fileList3.value = [{
          id: data.footer.id,
          name: `footer-${data.footer.id}`,
          url: getFullUrl(data.footer.img_url)
        }];
      }
    }
  } catch (error) {
    console.error("加载图片失败", error);
  }
};

//删除图片
const delImageFunc = (image_id) => {
  deleteImage(image_id).then((res) => {
    if (res.code === 200) {
      ElMessage.success('删除成功');
      getHomeImage();
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  });
}

onMounted(() => {
  getHomeImage();
});
</script>


<style scoped lang="scss">
.home-config-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;


  .page-header {
    margin-bottom: 25px;

    h2 {
      margin: 0;
      font-size: 24px;
      color: #303133;
      font-weight: 600;
    }

    .sub-title {
      margin-top: 8px;
      color: #909399;
      font-size: 14px;
    }
  }

  .config-card {
    margin-bottom: 25px;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      // transform: translateY(-2px);
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

      .tip-text {
        margin-top: 10px;
        font-size: 12px;
        color: #909399;
        line-height: 1.5;
      }

      &.single-upload {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }
}

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

  .uploader-icon {
    font-size: 28px;
    color: #8c939d;
  }

  &:hover .uploader-icon {
    color: #409EFF;
  }
}

:deep(.el-upload-list__item) {
  width: 148px;
  height: 148px;
  // border:2px solid red;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.02);
  }

  .el-icon--close-tip {
    display: none !important;
  }

  .el-upload-list__item-actions {
    background-color: rgba(0, 0, 0, 0.5);
  }
}

:deep(.el-upload-list__item-thumbnail) {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

:deep(.avatar-uploader-has-file .el-upload--picture-card),
:deep(.img-uploader-has-file .el-upload--picture-card) {
  display: none !important;
}


.preview-wrapper {

  text-align: center;
  padding: 20px;
  // background: #000;
  border-radius: 4px;

  img {
    max-width: 100%;
    max-height: 60vh;
    object-fit: contain;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  }
}
</style>