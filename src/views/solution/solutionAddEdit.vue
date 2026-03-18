<template>
  <div class="solution-edit-container">
    <el-card class="edit-card">
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑解决方案' : '新增解决方案' }}</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>

      <el-form 
        ref="formRef" 
        :model="formData" 
        :rules="rules" 
        label-width="100px" 
        status-icon
      >
        <!-- 方案名称 -->
        <el-form-item label="方案名称" prop="name">
          <el-input 
            v-model="formData.name" 
            placeholder="例如：汽车焊接自动化方案" 
            maxlength="100" 
            show-word-limit
          />
        </el-form-item>

        <!-- 所属行业 (级联/下拉) -->
        <el-form-item label="所属行业" prop="fid">
          <el-select 
            v-model="formData.fid" 
            placeholder="请选择所属行业" 
            style="width: 100%"
          >
            <el-option 
              v-for="item in industryOptions" 
              :key="item.id" 
              :label="item.name" 
              :value="item.id" 
            />
          </el-select>
        </el-form-item>

        <!-- 富文本内容 -->
        <el-form-item label="方案详情" prop="content">
          <div class="editor-wrapper">
            <WangEditor v-model="formData.content" />
          </div>
        </el-form-item>

        <!-- 底部按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
            {{ isEdit ? '保存修改' : '立即创建' }}
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import WangEditor from '@/components/WangEditor.vue'; // 确保路径正确

const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const submitting = ref(false);

// --- 1. 行业选项 (与列表页保持一致) ---
const industryOptions = [
  { id: 1, name: "汽车行业" },
  { id: 2, name: "电子行业" },
  { id: 3, name: "锂电行业" },
  { id: 4, name: "光伏行业" },
  { id: 5, name: "金属加工" },
  { id: 6, name: "建材加工" },
  { id: 7, name: "包装物流" },
  { id: 8, name: "一般工业" },
  { id: 9, name: "钢铁行业" },
  { id: 10, name: "家电行业" },
  { id: 11, name: "食品烟酒" },
];

// --- 2. 状态判断 ---
const isEdit = computed(() => !!route.params.id);
const solutionId = route.params.id;

// --- 3. 表单数据 ---
const formData = reactive({
  name: '',
  fid: null, // 行业 ID
  content: '' // 富文本 HTML
});

// --- 4. 验证规则 ---
const rules = {
  name: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
  fid: [{ required: true, message: '请选择所属行业', trigger: 'change' }],
  content: [
    { required: true, message: '请输入方案详情内容', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        // 简单判断是否为空标签
        if (!value || value === '<p><br></p>' || value.trim() === '') {
          callback(new Error('方案详情不能为空'));
        } else {
          callback();
        }
      }, trigger: 'blur' 
    }
  ]
};

// --- 5. 方法 ---

// 加载数据 (编辑模式)
const loadDetail = async () => {
  if (!isEdit.value) return;
  
  submitting.value = true;
  // 模拟 API 请求
  setTimeout(() => {
    // 这里应该调用 API: const res = await api.getSolution(solutionId);
    // 模拟数据回填
    const mockData = {
      name: "折弯解决方案 (编辑测试)",
      fid: 1, // 汽车行业
      content: "<h2>这是从后端加载的详细内容...</h2><p>包含具体的工艺流程图和技术参数。</p>"
    };
    
    formData.name = mockData.name;
    formData.fid = mockData.fid;
    formData.content = mockData.content;
    
    submitting.value = false;
  }, 800);
};

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      
      const payload = {
        id: isEdit.value ? solutionId : undefined,
        name: formData.name,
        fid: formData.fid,
        content: formData.content
      };

      console.log('=== 提交数据 ===', payload);

      // 模拟提交 API
      setTimeout(() => {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
        submitting.value = false;
        // 返回上一页
        setTimeout(() => router.back(), 1000);
        
        // 真实代码:
        // if (isEdit.value) await api.updateSolution(payload);
        // else await api.createSolution(payload);
      }, 1000);
    }
  });
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadDetail();
});
</script>

<style scoped lang="scss">
.solution-edit-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .edit-card {
    max-width: 1000px;
    margin: 0 auto;
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
    }

    .editor-wrapper {
      width: 100%;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      overflow: hidden;
      
      // 防止编辑器高度塌陷，可根据你的 WangEditor 组件内部样式调整
      min-height: 400px; 
    }
  }
}
</style>