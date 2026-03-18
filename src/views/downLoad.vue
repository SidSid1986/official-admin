<template>
  <div class="download-container">
    <div class="download-title">
      <span>资料下载</span>
    </div>
    <div class="download-content">
      <!-- 1. 文件上传组件 -->
      <el-upload class="upload-demo" :auto-upload="true" :file-list="fileList" :on-success="handleUploadSuccess"
        :on-remove="handleRemove" :before-remove="beforeRemove" action="#" list-type="text">
        <el-button type="primary" icon="el-icon-upload2">点击上传</el-button>
        <template #tip>
          <div class="el-upload__tip">
            请上传不超过 5MB 的文件，支持格式：doc、docx、pdf、zip、rar
          </div>
        </template>
      </el-upload>

      <!-- 2. 自定义文件列表展示（带默认图标） -->
      <div class="file-list-container" v-if="fileList.length > 0">
        <div class="file-list-title">已上传文件列表</div>
        <el-table :data="fileList" border style="width: 100%; margin-top: 10px">
          <el-table-column prop="name" label="文件名" width="500">
            <template #default="scope">
              <!-- 默认文件图标 -->
              <el-icon class="file-icon">
                <Document />
              </el-icon>
              <span class="file-name">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="文件大小(KB)" width="150">
            <template #default="scope">
              {{ (scope.row.size / 1024).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="scope">
              <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
// 引入文件图标
import { Document } from '@element-plus/icons-vue';

// 定义文件列表数据
const fileList = ref([
  {
    name: 'example.docx',
    size: 123456,
    uid: '1234567890'
  },
]);

onMounted(() => {
  console.log('组件挂载了');
});

// 上传成功回调
const handleUploadSuccess = (response, file, uploadFiles) => {
  // 这里可以处理上传成功后的逻辑（比如调用接口保存文件信息）
  // 模拟上传成功提示
  ElMessage.success(`${file.name} 上传成功`);
  // 更新文件列表
  fileList.value = uploadFiles;
};

// 删除前的确认提示（Element Upload 组件自带的删除钩子）
const beforeRemove = (file, files) => {
  return ElMessageBox.confirm(
    `确定要删除文件 ${file.name} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 更新文件列表
    fileList.value = files;
    ElMessage.success('文件删除成功');
  }).catch(() => {
    ElMessage.info('已取消删除');
    // 返回 false 阻止删除操作
    return false;
  });
};

// 自定义删除按钮的删除逻辑
const handleDelete = (file) => {
  ElMessageBox.confirm(
    `确定要删除文件 ${file.name} 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 过滤掉要删除的文件
    fileList.value = fileList.value.filter(item => item.uid !== file.uid);
    ElMessage.success('文件删除成功');
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
};

// Upload 组件移除文件的回调（可选）
const handleRemove = (file, files) => {
  console.log('文件已移除', file.name);
};
</script>

<style scoped>
.download-container {
  padding: 20px;
}

.download-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e6e6e6;
}

.upload-demo {
  margin-bottom: 30px;
}

.file-list-container {
  margin-top: 20px;
}

.file-list-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.file-icon {
  margin-right: 8px;
  color: #409eff;
}

.file-name {
  vertical-align: middle;
}
</style>