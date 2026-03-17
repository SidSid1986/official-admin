<template>
  <div class="news-container">
    <!-- 1.标题
    2.时间
    3.内容
    4.封面图 -->

    <div class="news-title">
      <div>新闻标题</div>
      <el-input v-model="newsData.title" placeholder="请输入新闻标题" />
    </div>
    <div>是否置顶：<el-switch v-model="newsData.isTop" active-value="1" inactive-value="0" active-text="是"
        inactive-text="否" /></div>
    <div class="news-cover">
      <div>封面图片（1张）</div>
      <el-upload class="avatar-uploader" :class="newsData.fileList.length > 0 ? 'avatar-uploader-has-file' : ''"
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" list-type="picture-card"
        v-model:file-list="newsData.fileList" :limit="1" :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove">
        <el-icon>
          <Plus />
        </el-icon>
      </el-upload>

      <el-dialog v-model="dialogVisible">
        <img style="width: 100%" :src="dialogImageUrl" alt="Preview Image" />
      </el-dialog>
    </div>
    <div class="news-time">
      <div>发布时间</div>
      <el-date-picker v-model="newsData.time" type="date" value-format="YYYY-MM-DD" placeholder="选择发布时间" />
    </div>
    <div class="news-content">
      <div>新闻内容</div>
      <!-- wangEditor 富文本编辑器 -->
      <WangEditor v-model="newsData.content" />
    </div>

    <div>
      <!-- 提交 -->
      <el-button type="primary" @click="submitNews">提交</el-button>
    </div>


  </div>
</template>

<script setup>
import { ref, onMounted, } from 'vue';
import WangEditor from '@/components/WangEditor.vue'
import { ElMessage } from 'element-plus';


const dialogVisible = ref(false)
const dialogImageUrl = ref('')

// 定义新闻数据对象
const newsData = ref({
  title: '',
  time: '',
  content: '',
  isTop: 0,
  fileList: []
});
const handleContentChange = (html) => {
  console.log('编辑器内容：', html)
}
const handleRemove = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url
  dialogVisible.value = true
}

const submitNews = async () => {
  // 验证表单数据
  // if (!newsData.value.title || !newsData.value.time || !newsData.value.content) {
  //   ElMessage.error('请填写完整新闻信息');
  //   return;
  // }

  // 提交新闻数据到后端

  // await postNews(newsData.value);
  console.log(newsData.value);
  ElMessage.success('新闻发布成功');
  // 清空表单数据
  newsData.value = {
    title: '',
    time: '',
    content: '',
    isTop: 0,
    fileList: []
  };

}

const getSwiperFunc = async () => {
  //api 调用轮播图接口
  // const res = await getSwiper();

  const res = [
    { id: 3, name: 'v3', url: '@/assets/homeCom/v3.png' },
    { id: 1, name: 'v1', url: '@/assets/homeCom/v1.png' },
    { id: 2, name: 'v2', url: '@/assets/homeCom/v2.png' },
  ]

  // 处理图片URL
  res.forEach(item => {
    item.url = getImageUrl(item.url);
  });
  console.log(res);
  newsData.value.fileList = [res[0]]
}

const getImageUrl = (url) => {
  console.log('原始URL：', url);
  //   替换 @/ 为 src/（匹配vite.config的别名映射）
  const realPath = url.replace(/^@\//, 'src/');
  //  拼接项目根路径（localhost:5173/） + 真实路径
  const fullUrl = `${window.location.origin}/${realPath}`;
  console.log('最终正确URL：', fullUrl);
  return fullUrl;
};

onMounted(() => {
  console.log('组件挂载了');
  getSwiperFunc()
});

</script>

<style scoped>
:deep(.avatar-uploader-has-file .el-upload--picture-card) {
  display: none !important;
}

:deep(.el-upload-list__item .el-icon--close-tip) {
  display: none !important;
}
</style>
