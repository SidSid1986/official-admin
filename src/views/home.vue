<template>
  <div class="home-com-container">
    <span>首页轮播图修改</span>

    <div>
      <el-upload v-model:file-list="fileList" action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        tip='123' list-type="picture-card" :on-preview="handlePictureCardPreview" :on-remove="handleRemove">
        <el-icon>
          <Plus />
        </el-icon>
      </el-upload>

      <el-dialog v-model="dialogVisible">
        <img w-full :src="dialogImageUrl" alt="Preview Image" />
      </el-dialog>
    </div>

    <div>行业图片修改（3张）</div>
    <div>
      <el-upload v-model:file-list="fileList2" :class="fileList2.length >= 3 ? 'img-uploader-has-file' : ''"
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" list-type="picture-card"
        :on-preview="handlePictureCardPreview2" :on-remove="handleRemove2">
        <el-icon>
          <Plus />
        </el-icon>
      </el-upload>
      <el-dialog v-model="dialogVisible2">
        <img w-full :src="dialogImageUrl2" alt="Preview Image" />
      </el-dialog>
    </div>

    <div>首页尾部图片修改（1张）</div>
    <el-upload class="avatar-uploader" :class="fileList3.length > 0 ? 'avatar-uploader-has-file' : ''"
      action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" list-type="picture-card"
      v-model:file-list="fileList3" :limit="1" :on-exceed="handleExceed" :on-preview="handlePictureCardPreview3"
      :on-remove="handleRemove3">
      <el-icon>
        <Plus />
      </el-icon>
    </el-upload>

    <!-- 预览弹窗 -->
    <el-dialog v-model="dialogVisible3">
      <img style="width: 100%" :src="dialogImageUrl3" alt="Preview Image" />
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, } from 'vue';
import { Plus } from '@element-plus/icons-vue'

const fileList = ref([]);
const fileList2 = ref([]);
const fileList3 = ref([]);

const dialogVisible = ref(false)
const dialogImageUrl = ref('')
const dialogVisible2 = ref(false)
const dialogImageUrl2 = ref('')

const dialogVisible3 = ref(false)
const dialogImageUrl3 = ref('')


const handleRemove = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url
  dialogVisible.value = true
}

const handleRemove2 = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview2 = (uploadFile) => {
  dialogImageUrl2.value = uploadFile.url
  dialogVisible2.value = true
}


const handleExceed = (files, fileList) => {
  ElMessage.warning(`最多只能上传 ${fileList.value.length + files.length - fileList.value.length} 张图片`);
}
const handleRemove3 = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview3 = (uploadFile) => {
  dialogImageUrl3.value = uploadFile.url
  dialogVisible3.value = true
}

const getSwiperFunc = async () => {
  //api 调用轮播图接口
  // const res = await getSwiper();
  //模拟轮播图数据
  // const res = [
  //   { id: 3, name: 'v3', url: v1Png },
  //   { id: 1, name: 'v1', url: v1Png },
  //   { id: 2, name: 'v2', url: v1Png },
  // ];

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

  // 赋值给 fileList
  fileList.value = res;
  // 赋值给 fileList2
  fileList2.value = res;

  //单独尾部图片
  fileList3.value = [res[0]]



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

<style scoped lang="scss">
:deep(.el-dialog) {
  width: 80%;

  img {
    width: 100%;
    height: auto;
  }
}

:deep(.el-upload-list__item .el-icon--close-tip) {
  display: none !important;
}

:deep(.el-upload) {
  img {
    width: 400px;
    height: auto;
  }
}

//有图片就隐藏上传按钮
:deep(.avatar-uploader-has-file .el-upload--picture-card) {
  display: none !important;
}

:deep(.img-uploader-has-file .el-upload--picture-card) {
  display: none !important;
}
</style>
