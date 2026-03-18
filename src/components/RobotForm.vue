<template>
  <div class="robot-form-wrapper">
    <el-divider content-position="left">🤖 机器人详细参数录入</el-divider>

    <el-form :model="formData" label-width="140px" size="default">
      <el-row :gutter="20">

        <!-- 第一行：型号 -->
        <el-col :span="24">
          <el-form-item label="产品型号" prop="robotName">
            <el-input v-model="formData.robotName" placeholder="例如：IER50-1200-SR" style="font-weight: bold;" />
          </el-form-item>
        </el-col>

        <!-- 第二行：核心四大参数 -->
        <el-col :span="6">
          <el-form-item label="最大臂展">
            <el-input v-model="formData.maxArmSpan" placeholder="例如：1200MM" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="最大负载">
            <el-input v-model="formData.maxWeight" placeholder="例如：50KG" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="轴数">
            <el-input v-model="formData.switchNum" placeholder="例如：4轴" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="本体重量">
            <el-input v-model="formData.weight" placeholder="例如：145kg" />
          </el-form-item>
        </el-col>

        <!-- 第三行：精度与防护 -->
        <el-col :span="12">
          <el-form-item label="重复定位精度">
            <el-input v-model="formData.perprecision" type="textarea" :rows="2" placeholder="例如：J1+J2:±0.025mm..." />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="防护等级">
            <el-input v-model="formData.IP" placeholder="例如：IP54" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="安装形式">
            <el-input v-model="formData.insType" placeholder="例如：地面" />
          </el-form-item>
        </el-col>

        <!-- 第四行：驱动与认证 -->
        <el-col :span="12">
          <el-form-item label="驱动方式">
            <el-input v-model="formData.driveType" placeholder="例如：AC伺服电机驱动" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="支持认证">
            <el-input v-model="formData.authSupport" placeholder="例如：CE, UL, TUV" />
          </el-form-item>
        </el-col>

        <!-- 第五行：安装条件 -->
        <el-col :span="24">
          <el-form-item label="安装条件">
            <el-input v-model="formData.insRequire" type="textarea" :rows="6" placeholder="请输入温度、湿度等详细信息..." />
          </el-form-item>
        </el-col>

        <!-- 第六行：备注 -->
        <el-col :span="24">
          <el-form-item label="备注说明">
            <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="其他补充信息" />
          </el-form-item>
        </el-col>

        <!-- 第七行：图片上传 (核心修改部分) -->
        <el-col :span="24">
          <el-form-item label="产品详情图片">
            <el-upload 
              action="#" 
              :auto-upload="false" 
              :limit="1" 
              :file-list="fileList" 
              list-type="picture-card"
              :on-change="handleFileChange"
              :on-remove="handleRemove"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="uploader-tip">
              <span v-if="imageUrl">当前图片地址：<b>{{ imageUrl }}</b></span>
              <span v-else>上传图片后将自动生成地址</span>
            </div>
          </el-form-item>
        </el-col>

      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

// 定义 emits
const emit = defineEmits(['update:modelValue']);

// 定义 props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

// 状态变量
const fileList = ref([]);
const imageUrl = ref(''); // 存储生成的图片地址

// 初始化表单数据
const formData = reactive({
  robotName: '',
  switchNum: '',
  maxWeight: '',
  maxArmSpan: '',
  perprecision: '',
  weight: '',
  IP: '',
  insType: '',
  driveType: '',
  insRequire: '',
  authSupport: '',
  remark: '',
  detailImg: '' // 专门存放图片地址
});

/**
 * 处理文件选择变化
 */
const handleFileChange = (uploadFile) => {
  // 1. 更新文件列表，保持只有一张
  fileList.value = [uploadFile];

  // 2. 生成图片地址
  // 场景 A: 如果是真实后端，这里应该调用 API 上传文件，拿到后端返回的 URL
  // 场景 B: 本地预览/模拟，使用 URL.createObjectURL 生成 blob 地址
  const rawFile = uploadFile.raw;
  
  if (rawFile) {
    // 简单校验图片格式
    const isImage = rawFile.type.startsWith('image/');
    if (!isImage) {
      ElMessage.error('只能上传图片文件！');
      fileList.value = [];
      imageUrl.value = '';
      formData.detailImg = '';
      return;
    }

    // 生成本地预览地址 (例如: blob:http://localhost:5173/xxx-xxx-xxx)
    imageUrl.value = URL.createObjectURL(rawFile);
    
    // 3. 将地址同步到表单数据中，父组件就能拿到了
    formData.detailImg = imageUrl.value;
    
    console.log('图片已选择，生成地址:', imageUrl.value);
  }
};

/**
 * 处理文件删除
 */
const handleRemove = () => {
  fileList.value = [];
  imageUrl.value = '';
  formData.detailImg = ''; // 清空地址
  console.log('图片已删除');
};

// 监听本地变化，同步给父组件 (包含图片地址)
watch(formData, (newVal) => {
  emit('update:modelValue', { ...newVal });
}, { deep: true });

// 如果父组件传入了初始值 (编辑模式)，同步到本地
watch(() => props.modelValue, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    Object.assign(formData, newVal);
    
    // 如果编辑时有图片地址，需要还原 fileList 以便显示预览图
    if (formData.detailImg) {
      imageUrl.value = formData.detailImg;
      // 注意：编辑模式下，如果没有原始 File 对象，el-upload 可能无法完美展示预览
      // 这里做一个简单的模拟对象用于展示
      fileList.value = [{
        name: 'detail-image.png',
        url: formData.detailImg
      }];
    }
  }
}, { immediate: true, deep: true });

</script>

<style scoped lang="scss">
.robot-form-wrapper {
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
    font-family: "Courier New", Courier, monospace;
  }

  .uploader-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
    
    b {
      color: #409EFF;
      word-break: break-all;
    }
  }
  
  // 限制上传组件宽度，避免占满整行
  :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
  }
  
  :deep(.el-upload-list--picture-card .el-upload-list__item) {
    width: 100px;
    height: 100px;
  }
}
</style>