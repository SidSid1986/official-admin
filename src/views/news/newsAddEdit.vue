<template>
  <div class="news-edit-container">
    <el-card class="edit-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title-text">📰 发布新闻资讯</span>
          <el-button @click="backToList">返回列表</el-button>
        </div>
      </template>

      <div class="form-layout">
        <!-- 左侧主要编辑区 -->
        <div class="main-column">

          <!-- 标题 -->
          <div class="form-item">
            <label class="form-label required">新闻标题</label>
            <el-input v-model="newsData.title" placeholder="请输入吸引人的新闻标题" size="large" clearable />
          </div>

          <!-- 富文本内容 -->
          <div class="form-item content-editor">
            <label class="form-label required">新闻正文</label>
            <div class="editor-box">
              <WangEditor v-model="newsData.content" />
            </div>
          </div>

        </div>

        <!-- 右侧侧边栏 (配置项) -->
        <div class="side-column">

          <!-- 封面图 -->
          <div class="config-block">
            <div class="block-title">封面图片</div>
            <div class="upload-area">
              <el-upload class="avatar-uploader" :class="newsData.fileList.length > 0 ? 'avatar-uploader-has-file' : ''"
                action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" list-type="picture-card"
                v-model:file-list="newsData.fileList" :limit="1" :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove">
                <el-icon class="uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
              <div class="block-tip">建议尺寸 800x450</div>
            </div>
          </div>

          <!-- 发布时间 -->
          <div class="config-block">
            <div class="block-title">发布时间</div>
            <el-date-picker v-model="newsData.time" type="date" value-format="YYYY-MM-DD" placeholder="选择日期"
              style="width: 100%" size="default" />
          </div>

          <!-- 置顶开关 -->
          <div class="config-block">
            <div class="block-title">置顶设置</div>
            <div class="switch-row">
              <span class="switch-label">是否置顶：</span>
              <el-switch v-model="newsData.isTop" active-value="1" inactive-value="0" active-text="是" inactive-text="否"
                inline-prompt />
            </div>
            <div class="block-tip" v-if="newsData.isTop == '1'">
              <el-icon>
                <Star />
              </el-icon> 该新闻将显示在列表顶部
            </div>
          </div>

          <!-- 提交按钮 (固定在右侧底部) -->
          <div class="action-block">
            <el-button type="primary" size="large" @click="submitNews" :loading="submitting" style="width: 100%">
              立即发布
            </el-button>
          </div>

        </div>
      </div>
    </el-card>

    <!-- 预览弹窗 -->
    <el-dialog v-model="dialogVisible" title="封面预览" width="500px">
      <img style="width: 100%; border-radius: 4px;" :src="dialogImageUrl" alt="Cover" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { Plus, Star } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import WangEditor from '@/components/WangEditor.vue';
import { useRouter } from 'vue-router';
const router = useRouter();


const submitting = ref(false);
const dialogVisible = ref(false);
const dialogImageUrl = ref('');

const newsData = reactive({
  title: '',
  time: new Date().toISOString().split('T')[0], // 默认今天
  content: '',
  isTop: '0',
  fileList: []
});

const backToList = () => {
  router.push('/news/newsList');
};
const handleRemove = (uploadFile, uploadFiles) => {
  console.log('移除封面', uploadFile);
};

const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url;
  dialogVisible.value = true;
};

const submitNews = async () => {
  if (!newsData.title.trim()) {
    ElMessage.warning('请填写新闻标题');
    return;
  }
  if (!newsData.content || newsData.content === '<p><br></p>') {
    ElMessage.warning('请填写新闻正文');
    return;
  }
  if (newsData.fileList.length === 0) {
    ElMessage.warning('请上传封面图片');
    return;
  }

  submitting.value = true;

  // 模拟提交
  setTimeout(() => {
    console.log('提交数据:', newsData);
    ElMessage.success('新闻发布成功！');
    submitting.value = false;
    // 重置或跳转
  }, 1000);
};

// 模拟加载旧数据 (如果需要编辑功能)
const loadData = () => {
  // ... 类似之前的逻辑
};
</script>

<style scoped lang="scss">
.news-edit-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .edit-card {
    max-width: 1200px;
    margin: 0 auto;
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-text {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  // 左右分栏布局
  .form-layout {
    display: flex;
    gap: 30px;

    .main-column {
      flex: 1; // 占据剩余空间
      min-width: 0; // 防止flex子项溢出
    }

    .side-column {
      width: 320px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }

  // 表单元素通用样式
  .form-item {
    margin-bottom: 25px;

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

        &:focus-within {
          border-color: #409EFF;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
    }
  }

  // 侧边栏配置块
  .config-block {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 20px;

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
  }

  .action-block {
    margin-top: 10px;
  }
}

// 上传组件样式复用与微调
:deep(.avatar-uploader .el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  width: 100%; // 撑满侧边栏
  height: 180px; // 固定高度
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fbfdff;

  &:hover {
    border-color: #409EFF;
    background-color: #ecf5ff;
  }

  .uploader-icon {
    font-size: 32px;
    color: #8c939d;
  }
}

:deep(.avatar-uploader-has-file .el-upload--picture-card) {
  display: none !important;
}

:deep(.el-upload-list__item) {
  width: 100% !important;
  height: 180px !important;
  border-radius: 6px;

  .el-upload-list__item-thumbnail {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}

:deep(.el-upload-list__item-actions) {
  background-color: rgba(0, 0, 0, 0.6);
}

// 响应式：小屏幕下变为单列
@media (max-width: 900px) {
  .form-layout {
    flex-direction: column;

    .side-column {
      width: 100%;
    }
  }
}
</style>