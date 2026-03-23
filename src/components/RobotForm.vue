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
            <!-- 注意：这里保持 IP 字段名，确保与父组件映射一致 (ip_level -> IP) -->
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

        <!-- 第七行：图片上传 (已修改为真实上传逻辑) -->
        <el-col :span="24">
          <el-form-item label="产品详情图片">
            <el-upload action="#" :auto-upload="false" :limit="1" :file-list="fileList" list-type="picture-card"
              :on-change="handleFileChange" :on-remove="handleRemove" :disabled="uploading">
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

            <div class="uploader-tip">
              <span v-if="formData.detailImg">
                ✅ 图片已上传成功<br>
                地址：<b>{{ formData.detailImg }}</b>
              </span>
              <span v-else-if="uploading">
                ⏳ 正在上传，请稍候...
              </span>
              <span v-else>
                选择图片后将自动上传至服务器
              </span>
            </div>
          </el-form-item>
        </el-col>

      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch, ref } from 'vue';
import { Plus, Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

import { uploadImageCommon } from '@/api/common';

const emit = defineEmits(['update:modelValue']);
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  }
});

const fileList = ref([]);
const uploading = ref(false); // 上传状态锁

// 初始化表单数据
const formData = reactive({
  robotName: '',
  switchNum: '',
  maxWeight: '',
  maxArmSpan: '',
  perprecision: '',
  weight: '',
  IP: '',       // 对应后端的 ip_level
  insType: '',
  driveType: '',
  insRequire: '',
  authSupport: '',
  remark: '',
  detailImg: '' // 存储后端返回的真实 URL
});

/**
 * 处理文件选择变化 - 核心修改
 */
const handleFileChange = async (uploadFile) => {
  const rawFile = uploadFile.raw;

  if (!rawFile) return;

  // 1. 基础校验
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件！');
    fileList.value = [];
    formData.detailImg = '';
    return;
  }

  // 2. 锁定状态
  uploading.value = true;
  fileList.value = [uploadFile]; // 先显示本地预览

  try {
    // 3. 构建 FormData
    const fd = new FormData();
    fd.append('file', rawFile);
    fd.append('module', 'product'); // 根据后端要求添加 module 参数

    // 4. 调用上传接口
    console.log('🚀 开始上传详情图片...');
    const res = await uploadImageCommon(fd);

    if (res.code === 200 && res.data && res.data.url) {
      const realUrl = res.data.url;

      // 5. 更新数据
      formData.detailImg = realUrl;

      // 更新 fileList 中的 url，确保 el-upload 能正确显示回显
      fileList.value = [{
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
    fileList.value = [];
    formData.detailImg = '';
  } finally {
    uploading.value = false;
  }
};

/**
 * 处理文件删除
 */
const handleRemove = () => {
  fileList.value = [];
  formData.detailImg = '';
  console.log('图片已移除');
};

// 监听本地变化，同步给父组件
watch(formData, (newVal) => {
  emit('update:modelValue', { ...newVal });
}, { deep: true });

// 监听父组件传入的值 (编辑模式回显)
watch(() => props.modelValue, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    // 合并数据
    Object.assign(formData, newVal);

    // 如果有图片地址，还原 fileList 用于展示
    if (formData.detailImg) {
      fileList.value = [{
        name: 'detail-image.png',
        url: formData.detailImg
      }];
    } else {
      fileList.value = [];
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
    line-height: 1.5;

    b {
      color: #409EFF;
      word-break: break-all;
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