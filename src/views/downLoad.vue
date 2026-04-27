<template>
  <div class="download-container">
    <div class="download-title">
      <span>资料下载</span>
    </div>
    <div class="download-content">

      <!-- 文件上传组件 -->
      <el-upload class="upload-demo" :action="uploadUrl" :headers="uploadHeaders" :auto-upload="true"
        :show-file-list="false" :file-list="fileList" :on-success="handleUploadSuccess" :on-error="handleUploadError"
        :before-upload="beforeUpload" list-type="text">
        <el-button type="primary">
          <el-icon>
            <UploadFilled />
          </el-icon> 点击上传文件
        </el-button>
      </el-upload>

      <!--  文件列表展示 -->
      <div class="file-list-container" v-if="total > 0 || loading">
        <div class="file-list-title">已上传文件列表</div>

        <el-table :data="fileList" border style="width: 100%; margin-top: 10px" v-loading="loading">

          <!-- 文件名列 -->
          <el-table-column prop="name" label="文件名" min-width="300">
            <template #default="scope">
              <div style="display: flex; align-items: center;">
                <el-icon class="file-icon">
                  <Document />
                </el-icon>
                <span @click="handleDownload(scope.row)" class="file-name-link" style="cursor: pointer;" title="点击下载">
                  {{ scope.row.name }}
                </span>
              </div>
            </template>
          </el-table-column>

          <!-- 文件大小列 -->
          <el-table-column prop="size" label="文件大小" width="150">
            <template #default="scope">
              {{ formatFileSize(scope.row.size) }}
            </template>
          </el-table-column>

          <!-- 上传时间列 -->
          <el-table-column prop="upload_time" label="上传时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.upload_time) }}
            </template>
          </el-table-column>

          <!-- 操作列 -->
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <div style="display: flex; gap: 5px;">
                <el-button type="primary" size="small" :loading="scope.row.downloading"
                  @click="handleDownload(scope.row)">
                  下载
                </el-button>
                <el-button type="danger" size="small" :loading="scope.row.deleting" @click="handleDelete(scope.row)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 3. 分页组件 -->
        <div class="pagination-container">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
        </div>
      </div>

      <!-- 空状态提示 -->
      <el-empty v-else description="暂无文件，请上传" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Document, UploadFilled, Download } from '@element-plus/icons-vue';
import axios from 'axios';
import { fileListApi, deleteFile } from '@/api/common.js';

const uploadUrl = `api/files/upload`;
const uploadHeaders = {};

// 数据状态
const fileList = ref([]);
const loading = ref(false);

// 分页状态 
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');

// 获取文件列表 
const fetchFileList = async (currentPage, pageSize) => {
  loading.value = true;

  try {
    const res = await fileListApi(
      currentPage,
      pageSize,
      // 搜索关键词 
      keyword.value
    );

    if (res.code === 200) {
      // 更新总数
      total.value = res.total;

      // 数据映射
      fileList.value = res.data.map(item => ({
        uid: item.id,
        name: item.original_name,
        url: item.file_path,
        size: item.file_size,
        upload_time: item.upload_time,
        deleting: false,
        downloading: false
      }));
    } else {
      ElMessage.error(res.msg || '加载失败');
    }
  } catch (error) {
    console.error('获取文件列表接口请求失败：', error);
    ElMessage.error('网络异常或服务器错误，请联系管理员');
  } finally {
    loading.value = false;
  }
}


//  分页事件处理  
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 改变每页数量时，重置到第一页
  fetchFileList(currentPage.value, pageSize.value);
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchFileList(currentPage.value, pageSize.value);
};

//  上传前校验  
const beforeUpload = (file) => {
  const maxSize = 100 * 1024 * 1024;
  const allowedExts = ['doc', 'docx', 'pdf', 'zip', 'rar'];
  const extension = file.name.split('.').pop().toLowerCase();

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

//  上传成功回调  
const handleUploadSuccess = (response, file, uploadFiles) => {
  if (response.code === 200) {
    ElMessage.success('上传成功');
    // 上传新文件后，通常希望看到最新的，所以重置到第一页
    currentPage.value = 1;
    fetchFileList(currentPage.value, pageSize.value);
  } else {
    ElMessage.error(response.msg || '上传失败');
  }
};

const handleUploadError = () => {
  ElMessage.error('上传失败，请检查网络或服务器状态');
};

//  删除文件 
const handleDelete = async (fileItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除文件 "${fileItem.name}" 吗？`, '删除确认', { type: 'warning' });
  } catch {
    return;
  }

  fileItem.deleting = true;
  try {
    const res = await deleteFile(fileItem.uid);
    if (res.code === 200) {
      ElMessage.success('删除成功');

      //  如果删除后当前页没有数据了，且不是第一页，则自动跳转到上一页
      if (fileList.value.length === 1 && currentPage.value > 1) {
        currentPage.value -= 1;
        fetchFileList(currentPage.value, pageSize.value);
      } else {

        fetchFileList(currentPage.value, pageSize.value);
      }
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  } catch (error) {
    if (error.response?.status !== 404) {
      ElMessage.error('网络错误，删除失败');
    }
  }
};

// 下载文件 
const handleDownload = async (fileItem) => {
  if (fileItem.downloading) return;

  fileItem.downloading = true;
  const loadingMsg = ElMessage({ message: '正在准备下载...', type: 'info', duration: 0 });

  try {
    const response = await axios.get(fileItem.url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileItem.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);

    ElMessage.success(`开始下载：${fileItem.name}`);
  } catch (error) {
    ElMessage.error('下载失败');
  } finally {
    fileItem.downloading = false;
    loadingMsg.close();
  }
};

// 工具函数  
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('zh-CN', { hour12: false });
};

onMounted(() => {
  fetchFileList(currentPage.value, pageSize.value);
});
</script>

<style scoped>
.download-container {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  height: 100%;
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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