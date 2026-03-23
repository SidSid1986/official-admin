<template>
  <div class="sport-form-wrapper">
    <el-divider content-position="left">🎛️ 运动控制器参数录入</el-divider>

    <el-form :model="formData" label-width="140px" size="default">

      <!-- 第一部分：核心基础信息 -->
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="产品型号名称" prop="name">
            <el-input v-model="formData.name" placeholder="例如：MC404-Z 4轴高性能运动控制器"
              style="font-weight: bold; font-size: 16px;" />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="产品详情描述">
            <el-input v-model="formData.detail" type="textarea" :rows="4" placeholder="请输入基于TRIO的高性能ARM...等详细技术描述" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="产品主图">
            <el-upload action="#" :auto-upload="false" :limit="1" :file-list="mainImageList" list-type="picture-card"
              :on-change="handleMainImageChange" :on-remove="handleMainImageRemove" :disabled="uploading">
              <div v-if="uploading" class="uploading-status">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                <span>上传中...</span>
              </div>
              <el-icon v-else>
                <Plus />
              </el-icon>
            </el-upload>

            <div class="upload-tip" v-if="formData.img">
              ✅ 图片已上传成功<br>
              地址：<span class="url-text">{{ formData.img }}</span>
            </div>
            <div class="upload-tip" v-else-if="uploading">
              ⏳ 正在上传，请稍候...
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">✨ 核心卖点 (Line Info)</el-divider>

      <!-- 第二部分：三大卖点 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="卖点1标题">
            <el-input v-model="titles.title1" placeholder="例如：编程灵活" disabled style="background:#f5f7fa" />
          </el-form-item>
          <el-form-item label="卖点1内容">
            <el-input v-model="formData.line1" type="textarea" :rows="3" placeholder="支持TRIO Basic以及IEC..." />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="卖点2标题">
            <el-input v-model="titles.title2" placeholder="例如：通讯丰富" disabled style="background:#f5f7fa" />
          </el-form-item>
          <el-form-item label="卖点2内容">
            <el-input v-model="formData.line2" type="textarea" :rows="3" placeholder="内置ETHERNET-IP/MODBUS..." />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="卖点3标题">
            <el-input v-model="titles.title3" placeholder="例如：认证齐全" disabled style="background:#f5f7fa" />
          </el-form-item>
          <el-form-item label="卖点3内容">
            <el-input v-model="formData.line3" type="textarea" :rows="3" placeholder="ROHS、UL、CE认证齐全" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">🔌 配件列表 (Sport Pram)</el-divider>

      <!-- 第三部分：配件列表 (动态表格) -->
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="dynamic-table-container">
            <el-table :data="formData.sportPram" border style="width: 100%" size="small">
              <el-table-column label="ID" width="80" prop="id" />
              <el-table-column label="配件名称 (lineName)" min-width="200">
                <template #default="scope">
                  <el-input v-model="scope.row.lineName" placeholder="例如：P317-P327" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="规格/描述 (lineValue)" min-width="200">
                <template #default="scope">
                  <el-input v-model="scope.row.lineValue" placeholder="例如：CAN I/O 模块" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="scope">
                  <el-button type="danger" link size="small" @click="removePram(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" link @click="addPram" style="margin-top: 10px">+ 添加一行配件</el-button>
          </div>
        </el-col>
      </el-row>

      <el-divider content-position="left">⚙️ 轴配置选项 (Sport Pram Two)</el-divider>

      <!-- 第四部分：轴配置 (动态表格) -->
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="dynamic-table-container">
            <el-table :data="formData.sportPramTwo" border style="width: 100%" size="small">
              <el-table-column label="ID" width="80" prop="id" />
              <el-table-column label="配置项 (lineName)" min-width="200">
                <template #default="scope">
                  <el-input v-model="scope.row.lineName" placeholder="例如：轴0 / 产品选项" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="配置值 (lineValue)" min-width="200">
                <template #default="scope">
                  <el-input v-model="scope.row.lineValue" placeholder="例如：标准 / 扩展轴 / P855" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="scope">
                  <el-button type="danger" link size="small" @click="removePramTwo(scope.$index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="primary" link @click="addPramTwo" style="margin-top: 10px">+ 添加一行配置</el-button>
          </div>
        </el-col>
      </el-row>

    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { Plus, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
// ✅ 引入上传 API
import { uploadImageCommon } from '@/api/common';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const titles = reactive({
  title1: '编程灵活',
  title2: '通讯丰富',
  title3: '认证齐全'
});

const mainImageList = ref([]);
const uploading = ref(false); // 上传状态锁

const formData = reactive({
  id: Date.now(),
  name: '',
  detail: '',
  line1: '',
  line2: '',
  line3: '',
  img: '', // 存储后端返回的真实 URL

  sportPram: [
    { id: 1, lineName: '', lineValue: '' }
  ],
  sportPramTwo: [
    { id: 1, lineName: '', lineValue: '' }
  ]
});

/**
 * 处理文件选择变化 - 核心修改
 */
const handleMainImageChange = async (uploadFile) => {
  const rawFile = uploadFile.raw;

  if (!rawFile) return;

  // 1. 基础校验
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('只能上传图片！');
    mainImageList.value = [];
    formData.img = '';
    return;
  }

  // 2. 锁定状态
  uploading.value = true;
  mainImageList.value = [uploadFile]; // 先显示本地预览

  try {
    // 3. 构建 FormData
    const fd = new FormData();
    fd.append('file', rawFile);
    fd.append('module', 'product');

    // 4. 调用上传接口
    console.log('🚀 开始上传控制器主图...');
    const res = await uploadImageCommon(fd);

    if (res.code === 200 && res.data && res.data.url) {
      const realUrl = res.data.url;

      // 5. 更新数据
      formData.img = realUrl;

      // 更新 fileList 中的 url，确保 el-upload 能正确显示回显
      mainImageList.value = [{
        name: rawFile.name,
        url: realUrl
      }];

      ElMessage.success('图片上传成功');
      console.log('✅ 图片上传完成，URL:', realUrl);
    } else {
      throw new Error(res.msg || '上传失败');
    }

  } catch (error) {
    console.error('图片上传错误:', error);
    ElMessage.error('图片上传失败：' + (error.message || '未知错误'));
    // 失败则清空
    mainImageList.value = [];
    formData.img = '';
  } finally {
    uploading.value = false;
  }
};

const handleMainImageRemove = () => {
  mainImageList.value = [];
  formData.img = '';
};

// --- 表格操作逻辑 ---
const addPram = () => {
  const newId = formData.sportPram.length > 0 ? Math.max(...formData.sportPram.map(i => i.id)) + 1 : 1;
  formData.sportPram.push({ id: newId, lineName: '', lineValue: '' });
};

const removePram = (index) => {
  formData.sportPram.splice(index, 1);
};

const addPramTwo = () => {
  const newId = formData.sportPramTwo.length > 0 ? Math.max(...formData.sportPramTwo.map(i => i.id)) + 1 : 1;
  formData.sportPramTwo.push({ id: newId, lineName: '', lineValue: '' });
};

const removePramTwo = (index) => {
  formData.sportPramTwo.splice(index, 1);
};

// --- 双向绑定同步 ---
watch(formData, (newVal) => {
  const dataToSend = JSON.parse(JSON.stringify(newVal));
  emit('update:modelValue', dataToSend);
}, { deep: true });

// 监听父组件传入的值 (编辑模式)
watch(() => props.modelValue, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.assign(formData, newVal);

    if (formData.img) {
      mainImageList.value = [{ name: 'product-img', url: formData.img }];
    } else {
      mainImageList.value = [];
    }
  }
}, { immediate: true, deep: true });

</script>

<style scoped lang="scss">
.sport-form-wrapper {
  background-color: #f9fafc;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  margin-top: 15px;

  :deep(.el-form-item__label) {
    font-weight: 600;
    color: #606266;
  }

  :deep(.el-textarea__inner) {
    font-family: "SourceHanSansCN-Regular", sans-serif;
  }

  .upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    line-height: 1.5;

    .url-text {
      color: #409EFF;
      word-break: break-all;
      font-family: monospace;
    }
  }

  .uploading-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #409EFF;
  }

  .dynamic-table-container {
    border: 1px solid #ebeef5;
    padding: 10px;
    border-radius: 4px;
    background: #fff;
  }
}
</style>