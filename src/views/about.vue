<template>
  <div class="about-container">
    <div class="about-content">

      <!-- === 左侧区域 === -->
      <div class="left-section">
        <div class="image-placeholder">
          <!-- 如果有图片地址，显示图片；否则显示提示文字 -->
          <el-image v-if="imageUrl" :src="imageUrl" fit="cover" class="preview-image">
            <template #error>
              <div class="image-error">图片加载失败</div>
            </template>
          </el-image>
          <div v-else class="empty-tip">
            <el-icon :size="40">
              <Picture />
            </el-icon>
            <p>暂无图片</p>
          </div>
        </div>

        <!-- 上传图片组件 -->
        <el-upload class="upload-demo" action="#" :auto-upload="false" :show-file-list="false"
          :on-change="handleImageUpload" :disabled="uploading" accept="image/*">
          <el-button type="primary" :loading="uploading" style="width: 100%; margin-top: 10px;">
            <el-icon style="margin-right: 5px">
              <UploadFilled />
            </el-icon>
            {{ uploading ? '上传中...' : (imageUrl ? '更换图片' : '上传图片') }}
          </el-button>
        </el-upload>

        <div v-if="imageUrl" class="image-url-tip">
          当前地址：<span class="url-text">{{ imageUrl }}</span>
        </div>
      </div>

      <!-- === 右侧区域 === -->
      <div class="right-section">
        <h3>关于我们 / 内容</h3>
        <WangEditor v-model="aboutContent" />

        <div class="action-bar">
          <el-button type="primary" @click="submitAbout" :loading="submitting">
            提交保存
          </el-button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Picture, UploadFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'; // 修正导入
import WangEditor from '@/components/WangEditor.vue';

// --- 数据状态 ---
const aboutContent = ref('');
const imageUrl = ref(''); // 存储后端返回的图片地址
const uploading = ref(false); // 上传加载中
const submitting = ref(false); // 提交加载中

// --- 方法：处理图片上传 ---
const handleImageUpload = (uploadFile) => {
  const file = uploadFile.raw;

  if (!file) return;

  // 1. 基础校验
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2; // 限制 2MB

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！');
    return;
  }

  // 2. 开始上传模拟
  uploading.value = true;

  // --- 模拟后端上传请求 ---
  // 实际项目中请替换为真实的 axios 请求
  /*
  const formData = new FormData();
  formData.append('file', file);
  
  axios.post('/api/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => {
    imageUrl.value = res.data.url; // 假设后端返回 { url: '...' }
    ElMessage.success('上传成功');
  }).catch(err => {
    ElMessage.error('上传失败');
  }).finally(() => {
    uploading.value = false;
  });
  */

  // 模拟网络延迟 (2秒后返回一个假地址)
  setTimeout(() => {
    // 这里生成一个临时预览地址，实际应为后端返回的 CDN 地址
    imageUrl.value = URL.createObjectURL(file);
    // 或者模拟一个固定地址：imageUrl.value = 'https://placehold.co/600x400.png';

    ElMessage.success('图片上传成功，已获取地址');
    uploading.value = false;
    console.log('模拟后端返回的图片地址:', imageUrl.value);
  }, 1500);
};

// --- 方法：提交表单 ---
const submitAbout = () => {
  // 1. 校验
  if (!aboutContent.value || aboutContent.value.trim() === '<p><br></p>') {
    ElMessage.warning('请输入服务内容');
    return;
  }
  if (!imageUrl.value) {
    ElMessage.warning('请先上传左侧展示图片');
    return;
  }

  submitting.value = true;

  // 2. 构造提交数据
  const payload = {
    content: aboutContent.value,
    image: imageUrl.value
  };

  console.log('=== 准备提交的数据 ===');
  console.log(payload);

  // 3. 模拟提交请求
  setTimeout(() => {
    ElMessage.success('保存成功！');
    submitting.value = false;

    // 实际 axios 代码示例:
    // axios.post('/api/about', payload).then(...).catch(...).finally(...)
  }, 1000);
};
</script>

<style scoped lang="scss">
.about-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
  width: 100%;
  // border: 2px solid red;

  .about-content {
    display: flex;
    gap: 20px;
    background: #fff;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    max-width: 1200px;
    margin: 0 auto;

    // 左侧样式
    .left-section {
      width: 300px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-right: 1px solid #ebeef5;
      padding-right: 30px;

      .image-placeholder {
        width: 100%;
        height: 300px;
        background-color: #f9fafc;
        border: 1px dashed #dcdfe6;
        border-radius: 6px;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        position: relative;

        .preview-image {
          width: 100%;
          height: 100%;
        }

        .empty-tip {
          text-align: center;
          color: #909399;

          p {
            margin-top: 10px;
            font-size: 14px;
          }
        }

        .image-error {
          color: #f56c6c;
          font-size: 14px;
        }
      }

      .image-url-tip {
        margin-top: 10px;
        font-size: 12px;
        color: #909399;
        word-break: break-all;
        text-align: center;

        .url-text {
          color: #409EFF;
          font-family: monospace;
        }
      }
    }

    // 右侧样式
    .right-section {
      flex: 1;
      display: flex;
      flex-direction: column;

      h3 {
        margin-top: 0;
        margin-bottom: 20px;
        color: #303133;
      }

      .action-bar {
        margin-top: 20px;
        text-align: right;
      }
    }
  }
}
</style>