<template>
  <div class="news-edit-container">
    <div class="card-header">
      <span>新闻标题:</span><el-input style="width:50%" v-model="formData.title" placeholder="请输入新闻标题" size="large"
        clearable />
      <el-button type="primary" @click="backToList">返回列表</el-button>
    </div>

    <div class="form-layout">
      <!-- 左侧主要编辑区 -->
      <div class="main-column">
        <!-- 标题 -->
        <div class="form-item">
          <span>新闻简介:</span><el-input style="width:80%" v-model="formData.summary" placeholder="请输入新闻简介" size="large"
            clearable />

        </div>

        <!-- 富文本内容 -->
        <div class="form-item content-editor">
          <label class="form-label required">新闻正文</label>
          <div class="editor-box">
            <WangEditor v-model="formData.content" moduleType="news" />
          </div>
        </div>
      </div>

      <!-- 右侧侧边栏 (配置项) -->
      <div class="side-column">

        <!-- 封面图 (参考 About 逻辑) -->
        <div class="config-block">
          <div class="block-title">封面图片</div>
          <div class="upload-area">
            <!-- 图片预览区域 -->
            <div class="image-preview-box" v-if="formData.coverImage">
              <el-image :src="formData.coverImage" fit="cover" class="preview-img"
                :preview-src-list="[formData.coverImage]">
                <template #error>
                  <div class="image-error">加载失败</div>
                </template>
              </el-image>
              <div class="remove-mask" @click="removeCoverImage">
                <el-icon>
                  <Delete />
                </el-icon>
              </div>
            </div>

            <!-- 上传按钮 -->
            <el-upload v-else class="avatar-uploader" :auto-upload="false" :show-file-list="false"
              :on-change="handleImageUpload" :disabled="uploading" accept="image/*">
              <el-icon class="uploader-icon" :class="{ 'is-loading': uploading }">
                <Plus v-if="!uploading" />
                <Loading v-else />
              </el-icon>
              <div class="upload-text">{{ uploading ? '上传中...' : '点击上传' }}</div>
            </el-upload>

            <div class="block-tip">建议尺寸 800x450，仅支持 jpg/png/webp</div>
          </div>
        </div>

        <!-- 发布时间 -->
        <div class="config-block">
          <div class="block-title">发布时间</div>
          <el-date-picker v-model="formData.publishDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期"
            style="width: 100%" size="default" />
        </div>

        <!-- 置顶开关 (布尔值) -->
        <div class="config-block">
          <div class="block-title">置顶设置</div>
          <div class="switch-row">
            <span class="switch-label">是否置顶：</span>
            <!-- 注意：active-value 和 inactive-value 设为 true/false 布尔值 -->
            <el-switch v-model="formData.isTop" active-value="true" inactive-value="false" active-text="是"
              inactive-text="否" inline-prompt />
          </div>
          <div class="block-tip warning-tip" v-if="formData.isTop === 'true' || formData.isTop === true">
            <el-icon>
              <Star />
            </el-icon> 开启后，该新闻将强制排在列表第一位，其他置顶自动取消。
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="action-block">
          <el-button type="primary" size="large" @click="submitNews" :loading="submitting" style="width: 100%">
            {{ isEdit ? '保存修改' : '立即发布' }}
          </el-button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { Plus, Star, Delete, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import WangEditor from '@/components/WangEditor.vue';
import { useRouter, useRoute } from 'vue-router';
 

import { saveNews, uploadImageCommon, newsDetailApi } from '@/api/common.js';


const router = useRouter();
const route = useRoute();

// 判断是编辑还是新增
const isEdit = ref(false);
const newsId = ref(null);



const detailUrl = '/api/news/';             

// --- 数据状态 ---
const uploading = ref(false);
const submitting = ref(false);

const formData = reactive({
  id: null,  
  title: '',
  content: '',
  coverImage: '',
  summary: '',            
  publishDate: new Date().toISOString().split('T')[0],  
  isTop: false        
});

//  编辑模式，加载数据  
const loadDetail = async () => {
  if (!newsId.value) return;


  const res = await newsDetailApi(newsId.value);
  if (res.code === 200) {
    const data = res.data;
    formData.id = data.id;
    formData.title = data.title;
    formData.summary = data.summary || '';
    formData.content = data.content;
    formData.coverImage = data.cover_image || '';
    formData.publishDate = data.publish_date;
    // 兼容后端返回的布尔值或 0/1
    formData.isTop = data.isTop === true || data.isTop === 1 || data.isTop === '1';
  } else {
    ElMessage.error('获取新闻详情失败');
  }
}


//  处理图片上传  
const handleImageUpload = async (uploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;

  // 校验
  if (!file.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件！');
    return;
  }
  if (file.size / 1024 / 1024 > 5) {  
    ElMessage.error('图片大小不能超过 5MB！');
    return;
  }

  uploading.value = true;

  try {
    const form = new FormData();
    form.append('file', file);
    form.append('module', 'news');
    const res = await uploadImageCommon(form);
    if (res.code === 200) {
      formData.coverImage = res.data.url;
      ElMessage.success('封面上传成功');
    } else {
      ElMessage.error(res.msg || '上传失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('网络错误，上传失败');
  } finally {
    uploading.value = false;
  }
};

// 移除封面
const removeCoverImage = () => {
  formData.coverImage = '';
};

// 提交保存 
const submitNews = async () => {
 
  if (!formData.title.trim()) {
    ElMessage.warning('请填写新闻标题');
    return;
  }
  if (!formData.content || formData.content.trim() === '' || formData.content === '<p><br></p>') {
    ElMessage.warning('请填写新闻正文');
    return;
  }
  if (!formData.coverImage) {
    ElMessage.warning('请上传封面图片');
    return;
  }
  if (!formData.publishDate) {
    ElMessage.warning('请选择发布日期');
    return;
  }

  submitting.value = true;


  const isTopBool = formData.isTop === true || formData.isTop === 'true';

  const payload = {
    id: isEdit.value ? newsId.value : undefined, // 编辑传 ID，新增不传 (或传 null)
    title: formData.title,
    content: formData.content,
    cover_image: formData.coverImage,
    publish_date: formData.publishDate,
    summary: formData.summary,
    is_top: isTopBool
  };

  const res = await saveNews(payload);

  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '修改成功' : '发布成功');
   
    setTimeout(() => {
      router.push('/news/newsList');
    }, 500);
  } else {
    ElMessage.error(res.msg || '操作失败');
  }

};

const backToList = () => {
  router.push('/news/newsList');
};

// 生命周期
onMounted(() => {
  const idParam = route.params.id;
  if (idParam) {
    isEdit.value = true;
    newsId.value = Number(idParam);
    loadDetail();
  } else {
    isEdit.value = false;
    newsId.value = null;
  }
});
</script>

<style scoped lang="scss">
.news-edit-container {
  padding: 10px;
  background-color: #f5f7fa;
  height: 100%;

  .card-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 20px;
    background: #fff;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .title-text {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .form-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;

    .main-column {
      flex: 1;
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    }

    .side-column {
      width: 320px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }

  .form-item {
    margin-bottom: 20px;

    .form-label {
      display: block;
      margin-bottom: 10px;
      font-size: 15px;
      font-weight: 500;
      color: #606266;

      &.required::before {
        content: '*';
        color: #f56c6c;
        margin-right: 4px;
      }
    }

    .content-editor {
      .editor-box {
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        overflow: hidden;
        min-height: 400px;
        background: #fff;
      }
    }
  }

  .config-block {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .block-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f2f6fc;
    }

    .block-tip {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
      display: flex;
      align-items: center;
      gap: 4px;

      &.warning-tip {
        color: #e6a23c;
        background: #fdf6ec;
        padding: 5px 8px;
        border-radius: 4px;
        margin-top: 10px;
      }
    }

    .switch-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .switch-label {
        color: #606266;
        font-size: 14px;
      }
    }

    // 图片上传区域样式
    .upload-area {
      .image-preview-box {
        position: relative;
        width: 100%;
        height: 180px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #ebeef5;

        .preview-img {
          width: 100%;
          height: 100%;
        }

        .remove-mask {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
          font-size: 24px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s;

          &:hover {
            opacity: 1;
          }
        }
      }

      .avatar-uploader {
        width: 100%;
        height: 180px;
        border: 1px dashed #dcdfe6;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        background: #fbfdff;


        :deep(.el-upload) {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-radius: 6px;
        }


        :deep(.el-upload-dragger) {

          width: 100%;
          height: 100%;
          padding: 0;
          border: none;
        }

        &:hover {
          border-color: #409EFF;
          background: #ecf5ff;


          :deep(.el-upload) {
            background: transparent;
          }
        }

        .uploader-icon {
          font-size: 32px;
          color: #8c939d;
          margin-bottom: 8px;

          pointer-events: none;

          &.is-loading {
            animation: rotating 2s linear infinite;
          }
        }

        .upload-text {
          font-size: 13px;
          color: #8c939d;
          pointer-events: none;
        }
      }
    }
  }

  .action-block {
    margin-top: 10px;
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .form-layout {
    flex-direction: column;

    .side-column {
      width: 100%;
    }
  }
}
</style>