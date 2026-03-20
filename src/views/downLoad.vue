<template>
  <div class="download-container">
    <div class="download-title">
      <span>资料下载</span>
    </div>
    <div class="download-content">

      <!-- 1. 文件上传组件 -->
      <!-- 
        action: 后端上传接口地址 
        :headers: 如果有 Token 认证，在这里添加
        :on-success: 上传成功回调
        :before-upload: 上传前校验
      -->
      <el-upload class="upload-demo" :action="uploadUrl" :headers="uploadHeaders" :auto-upload="true"
        :file-list="fileList" :on-success="handleUploadSuccess" :on-error="handleUploadError"
        :before-upload="beforeUpload" list-type="text">
        <el-button type="primary">
          <el-icon>
            <UploadFilled />
          </el-icon> 点击上传文件
        </el-button>
        <template #tip>
          <div class="el-upload__tip">
            请上传不超过 5MB 的文件，支持格式：doc, docx, pdf, zip, rar
          </div>
        </template>
      </el-upload>

      <!-- 2. 文件列表展示 -->
      <div class="file-list-container" v-if="fileList.length > 0">
        <div class="file-list-title">已上传文件列表</div>
        <el-table :data="fileList" border style="width: 100%; margin-top: 10px" v-loading="loading">

          <!-- 文件名列 (带下载链接) -->
          <el-table-column prop="name" label="文件名" min-width="300">
            <template #default="scope">
              <div style="display: flex; align-items: center;">
                <el-icon class="file-icon">
                  <Document />
                </el-icon>
                <!-- 点击文件名可下载/预览 -->
                <a :href="scope.row.url" target="_blank" class="file-name-link">
                  {{ scope.row.name }}
                </a>
              </div>
            </template>
          </el-table-column>

          <!-- 文件大小列 -->
          <el-table-column prop="size" label="文件大小" width="150">
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </el-table-column>

          <!-- 上传时间列 (可选) -->
          <el-table-column prop="upload_time" label="上传时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.upload_time) }}
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button type="danger" size="small" :loading="scope.row.deleting" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空状态提示 -->
      <el-empty v-else description="暂无文件，请上传" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Document, UploadFilled } from '@element-plus/icons-vue';
import axios from 'axios';
import { fileListApi, deleteFile } from '@/api/common.js';


const uploadUrl = `api/files/upload`;
// 如果有 Token，可以在这里配置
const uploadHeaders = {
  // 'Authorization': 'Bearer ' + token 
};

// --- 数据状态 ---
const fileList = ref([]);
const loading = ref(false);



// --- 方法：获取文件列表 ---
const fetchFileList = async () => {
  loading.value = true;
  try {

    const res = await fileListApi();

    console.log(res);

    if (res.code === 200) {

      // 后端: original_name, file_path, file_size, id, upload_time
      // 前端 el-upload 需要: name, url, size, uid
      fileList.value = res.data.map(item => ({
        uid: item.id, // 用数据库 ID 作为 uid，方便删除时定位
        name: item.original_name,
        url: item.file_path, // 用于下载/预览
        size: item.file_size,
        upload_time: item.upload_time,
        deleting: false // 自定义状态标记
      }));
    } else {
      ElMessage.error(res.data.msg || '加载失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('网络错误，无法加载文件列表');
  } finally {
    loading.value = false;
  }
};

// --- 方法：上传前校验 ---
const beforeUpload = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/pdf', // .pdf
    'application/zip', // .zip
    'application/x-rar-compressed', // .rar
    'application/x-zip-compressed'
  ];

  // 简单的后缀名校验 (因为 MIME type 有时不准)
  const extension = file.name.split('.').pop().toLowerCase();
  const allowedExts = ['doc', 'docx', 'pdf', 'zip', 'rar'];

  if (!allowedExts.includes(extension)) {
    ElMessage.error(`不支持的文件格式：.${extension}`);
    return false;
  }

  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 5MB');
    return false;
  }

  return true;
};

// --- 方法：上传成功回调 ---
const handleUploadSuccess = (response, file, uploadFiles) => {
  if (response.code === 200) {
    ElMessage.success('上传成功');
    // 重新加载列表以确保数据最新（包含后端生成的 ID 等）
    fetchFileList();
  } else {
    ElMessage.error(response.msg || '上传失败');
    // 如果失败，从列表中移除该临时文件
    const index = fileList.value.findIndex(item => item.uid === file.uid);
    if (index !== -1) {
      fileList.value.splice(index, 1);
    }
  }
};

// --- 方法：上传失败回调 ---
const handleUploadError = (error, file, uploadFiles) => {
  console.error(error);
  ElMessage.error('上传失败，请检查网络或服务器状态');
};

// --- 方法：删除文件 ---
const handleDelete = async (fileItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${fileItem.name}" 吗？此操作不可恢复。`,
      '删除确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
  } catch {
    return; // 用户取消
  }

  // 设置该行正在删除状态
  fileItem.deleting = true;


  const res = await deleteFile(fileItem.uid);
  console.log(res);

  if (res.code === 200) {
    ElMessage.success('删除成功');
    // 从本地列表移除
    fileList.value = fileList.value.filter(item => item.uid !== fileItem.uid);
  } else {
    ElMessage.error(res.data.msg || '删除失败');
  }
}


// --- 工具函数：格式化文件大小 ---
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// --- 工具函数：格式化日期 ---
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', { hour12: false });
};

// --- 生命周期：加载列表 ---
onMounted(() => {
  fetchFileList();
});
</script>

<style scoped>
.download-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.download-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
  color: #303133;
}

.upload-demo {
  margin-bottom: 20px;
}

.file-list-container {
  margin-top: 20px;
}

.file-list-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #606266;
}

.file-icon {
  margin-right: 8px;
  color: #409eff;
  font-size: 18px;
}

.file-name-link {
  color: #409eff;
  text-decoration: none;
  transition: color 0.2s;
}

.file-name-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}
</style>