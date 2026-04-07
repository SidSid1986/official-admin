<template>
  <div class="about-container">
    <div class="about-content">

      <!--  左侧区域  -->
      <div class="left-section">
        <div class="image-placeholder">
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

        <el-upload class="upload-demo" :action="uploadUrl" :auto-upload="false" :show-file-list="false"
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

      <!--  右侧区域  -->
      <div class="right-section">
        <h3>关于我们 / 内容</h3>
        <WangEditor v-model="aboutContent" moduleType="about" />
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
import { ref, onMounted } from 'vue';
import { Picture, UploadFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import WangEditor from '@/components/WangEditor.vue';
import axios from 'axios';

const uploadUrl = '/api/about/upload_image';

//  数据状态
const aboutContent = ref('');
const imageUrl = ref('');
const uploading = ref(false);
const submitting = ref(false);

//  初始化加载已有数据
const fetchAboutInfo = async () => {
  try {
    const res = await axios.get('/api/about/info');  
    if (res.data.code === 200) {
      const data = res.data.data;
      if (data.cover_image) {
        imageUrl.value = data.cover_image;
      }
      if (data.content) {
        aboutContent.value = data.content;
      }
    }
  } catch (error) {
    console.error('加载失败', error);
    // 静默失败即可，可能是第一次使用
  }
};

// 处理图片上传
const handleImageUpload = async (uploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;

  // 校验
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件！');
    return;
  }
  if (file.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB！');
    return;
  }

  uploading.value = true;

  try {
    const formData = new FormData();
    formData.append('file', file);
    

    // 调用后端上传接口
    const res = await axios.post('/api/about/upload_image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (res.data.code === 200) {
      imageUrl.value = res.data.data.url; // 获取后端返回的 URL
      ElMessage.success('图片上传成功');
    } else {
      ElMessage.error(res.data.msg || '上传失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('网络错误，上传失败');
  } finally {
    uploading.value = false;
  }
};

// 提交保存
const submitAbout = async () => {
  // 校验
  if (!imageUrl.value) {
    ElMessage.warning('请先上传封面图片');
    return;
  }
  // 富文本空值校验  
  if (!aboutContent.value || aboutContent.value.trim() === '' || aboutContent.value === '<p><br></p>') {
    ElMessage.warning('请输入内容');
    return;
  }

  submitting.value = true;

  try {
    // 构造 JSON 数据
    const payload = {
      cover_image: imageUrl.value,  
      content: aboutContent.value
    };

   
    const res = await axios.post('/api/about/save', payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.data.code === 200) {
      ElMessage.success('保存成功！');
    } else {
      ElMessage.error(res.data.msg || '保存失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('网络错误，保存失败');
  } finally {
    submitting.value = false;
  }
};

 
onMounted(() => {
  fetchAboutInfo();
});
</script>

 
<style scoped lang="scss">
 
.about-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
  width: 100%;

  .about-content {
    display: flex;
    gap: 20px;
    background: #fff;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    max-width: 1200px;
    margin: 0 auto;

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