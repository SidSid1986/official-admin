<template>
  <div class="home-config-container">
    <div class="page-header">
      <h2>🖼️ 首页图片配置</h2>
      <p class="sub-title">管理首页轮播图、行业展示图及底部品牌图</p>
    </div>

    <!-- === 板块 1: 首页轮播图 === -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title-icon">🎡</span>
          <span>首页轮播图管理</span>
          <el-tag type="info" size="small">建议比例 1920x600</el-tag>
        </div>
      </template>
      
      <div class="upload-section">
        <el-upload 
          v-model:file-list="fileList" 
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          list-type="picture-card" 
          :on-preview="handlePictureCardPreview" 
          :on-remove="handleRemove"
          multiple
        >
          <el-icon class="uploader-icon"><Plus /></el-icon>
        </el-upload>
      </div>
    </el-card>

    <!-- === 板块 2: 行业图片 (限制3张) === -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title-icon">🏭</span>
          <span>核心行业展示图</span>
          <el-tag type="warning" size="small" effect="dark">最多 3 张</el-tag>
        </div>
      </template>
      
      <div class="upload-section">
        <el-upload 
          v-model:file-list="fileList2" 
          :class="fileList2.length >= 3 ? 'img-uploader-has-file' : ''"
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" 
          list-type="picture-card"
          :on-preview="handlePictureCardPreview2" 
          :on-remove="handleRemove2"
          :limit="3"
          :on-exceed="handleExceed"
        >
          <el-icon class="uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="tip-text">* 用于首页核心业务板块展示，建议尺寸一致。</div>
      </div>
    </el-card>

    <!-- === 板块 3: 底部图片 (限制1张) === -->
    <el-card class="config-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="title-icon">🔻</span>
          <span>首页底部品牌图</span>
          <el-tag type="success" size="small" effect="dark">限 1 张</el-tag>
        </div>
      </template>
      
      <div class="upload-section single-upload">
        <el-upload 
          class="avatar-uploader" 
          :class="fileList3.length > 0 ? 'avatar-uploader-has-file' : ''"
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" 
          list-type="picture-card"
          v-model:file-list="fileList3" 
          :limit="1" 
          :on-exceed="handleExceed" 
          :on-preview="handlePictureCardPreview3"
          :on-remove="handleRemove3"
        >
          <el-icon class="uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="tip-text">* 显示在页面最底部的合作伙伴或品牌标识。</div>
      </div>
    </el-card>

    <!-- 全局预览弹窗 -->
    <el-dialog v-model="dialogVisible" title="图片预览" width="80%" :append-to-body="true">
      <div class="preview-wrapper">
        <img :src="dialogImageUrl" alt="Preview Image" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// --- 数据状态 ---
const fileList = ref([]);
const fileList2 = ref([]);
const fileList3 = ref([]);

const dialogVisible = ref(false);
const dialogImageUrl = ref('');

// --- 通用处理方法 (复用弹窗逻辑) ---
const openPreview = (url) => {
  dialogImageUrl.value = url;
  dialogVisible.value = true;
};

const handleRemove = (uploadFile, uploadFiles) => {
  console.log('轮播图移除', uploadFile);
};
const handlePictureCardPreview = (uploadFile) => {
  openPreview(uploadFile.url);
};

const handleRemove2 = (uploadFile, uploadFiles) => {
  console.log('行业图移除', uploadFile);
};
const handlePictureCardPreview2 = (uploadFile) => {
  openPreview(uploadFile.url);
};

const handleRemove3 = (uploadFile, uploadFiles) => {
  console.log('底部图移除', uploadFile);
};
const handlePictureCardPreview3 = (uploadFile) => {
  openPreview(uploadFile.url);
};

const handleExceed = (files, fileList) => {
  const limit = fileList[0]?.length >= 3 ? 3 : 1; // 简单判断
  ElMessage.warning(`当前模块已达到最大上传数量限制 (${limit} 张)`);
};

// --- 模拟数据加载 ---
const getSwiperFunc = async () => {
  const mockRes = [
    { id: 1, name: 'banner1', url: '@/assets/homeCom/v1.png' },
    { id: 2, name: 'banner2', url: '@/assets/homeCom/v2.png' },
  ];

  mockRes.forEach(item => {
    item.url = getImageUrl(item.url);
  });

  fileList.value = mockRes;
  fileList2.value = [mockRes[0]]; 
  fileList3.value = [mockRes[1]];
};

const getImageUrl = (url) => {
  if (!url.startsWith('@/')) return url;
  const realPath = url.replace(/^@\//, 'src/');
  return `${window.location.origin}/${realPath}`;
};

onMounted(() => {
  getSwiperFunc();
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
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
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

      // 单图上传的特殊间距
      &.single-upload {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
    }
  }
}

// --- 上传组件深度样式定制 ---
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

// 列表项样式
:deep(.el-upload-list__item) {
  width: 148px;
  height: 148px;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s;

  &:hover {
    // 悬浮时稍微放大
    transform: scale(1.02); 
  }

  // 隐藏默认的删除提示文字，只保留图标
  .el-icon--close-tip {
    display: none !important;
  }
  
  // 自定义删除按钮样式 (可选)
  .el-upload-list__item-actions {
    background-color: rgba(0,0,0,0.5);
  }
}

// 预览图片在上传列表中的样式
:deep(.el-upload-list__item-thumbnail) {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

// 有文件时隐藏上传按钮
:deep(.avatar-uploader-has-file .el-upload--picture-card),
:deep(.img-uploader-has-file .el-upload--picture-card) {
  display: none !important;
}

// 弹窗样式
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  
  .preview-wrapper {
    text-align: center;
    padding: 20px;
    background: #000;
    border-radius: 4px;
    
    img {
      max-width: 100%;
      max-height: 80vh;
      object-fit: contain;
      box-shadow: 0 0 20px rgba(255,255,255,0.1);
    }
  }
}
</style>