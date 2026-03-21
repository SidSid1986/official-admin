<template>
  <div class="solution-page-container">

    <!-- 左侧：行业配置管理 -->
    <div class="left-panel">
      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span>🏭 行业分类配置</span>
            <el-button type="primary" size="small" @click="handleAddIndustry" :icon="Plus">
              新增行业
            </el-button>
          </div>
        </template>

        <div class="industry-list">
          <el-empty v-if="industryOptions.length === 0" description="暂无行业数据" :image-size="80" />

          <div v-else class="list-container">
            <div v-for="(item, index) in industryOptions" :key="item.id" class="industry-item"
              :class="{ 'is-active': formData.fid === item.id }">
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
              </div>

              <div class="item-actions">
                <el-button link type="primary" size="small" @click="handleEditIndustry(item)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteIndustry(item.id)"
                  :disabled="industryOptions.length <= 1">删除</el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-tip">
          <el-icon><Info-Filled /></el-icon>
          右侧表单的行业选项将同步此处配置
        </div>
      </el-card>
    </div>

    <!-- 右侧：解决方案编辑 -->
    <div class="right-panel">
      <el-card class="edit-card">
        <template #header>
          <div class="card-header">
            <span>{{ isEdit ? '编辑解决方案' : '新增解决方案' }}</span>
            <el-button @click="goBack">返回列表</el-button>
          </div>
        </template>

        <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" status-icon>

          <!-- 所属行业 -->
          <el-form-item label="所属行业" prop="fid">
            <el-select v-model="formData.fid" placeholder="请选择所属行业" style="width: 100%"
              :disabled="industryOptions.length === 0">
              <el-option v-for="item in industryOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
            <div v-if="industryOptions.length === 0" class="form-tip">
              请先在左侧添加行业分类
            </div>
          </el-form-item>

          <!-- 方案名称 & 封面图入口 -->
          <el-form-item label="方案名称" prop="name">
            <div style="display: flex; align-items: center; width:800px">
              <el-input v-model="formData.title" placeholder="例如：汽车焊接自动化方案" maxlength="100" show-word-limit
                style="flex: 1;" />

              <el-button style="margin-left: 15px;" type="primary" @click="handleAddSolutionImage" :icon="Plus">
                管理封面图
              </el-button>
            </div>
            <!-- 显示已上传的封面图缩略提示 -->
            <div v-if="formData.cover1 || formData.cover2" style="margin-top: 5px; font-size: 12px; color: #67c23a;">
              <span v-if="formData.cover1">✅ 封面1已上传</span>
              <span v-if="formData.cover2" style="margin-left: 10px;">✅ 封面2已上传</span>
            </div>
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
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 1. 行业编辑/新增 对话框 (保持不变) -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? '新增行业' : '编辑行业'" width="500px">
      <el-form :model="dialogForm" :rules="dialogRules" ref="dialogFormRef" label-width="90px">
        <el-form-item label="行业名称" prop="name">
          <el-input v-model="dialogForm.name" placeholder="输入行业名称" />
        </el-form-item>

        <el-form-item label="图标配置" prop="icon1">
          <div class="icon-upload-group">
            <!-- Icon 1 -->
            <div class="upload-slot">
              <div class="slot-title">默认状态 (Icon 1)</div>
              <div v-if="dialogForm.icon1" class="image-preview">
                <el-image :src="dialogForm.icon1" fit="contain" class="preview-img" />
                <el-button type="danger" size="small" circle @click="removeIcon('icon1')" class="remove-btn">
                  <el-icon>
                    <Close />
                  </el-icon>
                </el-button>
              </div>
              <el-upload v-else action="#" :http-request="(opt) => handleIconUpload(opt, 'icon1')"
                :show-file-list="false" accept="image/*">
                <el-button type="primary" plain icon="Plus">上传默认图</el-button>
              </el-upload>
            </div>
            <!-- Icon 2 -->
            <div class="upload-slot">
              <div class="slot-title">选中/高亮 (Icon 2)</div>
              <div v-if="dialogForm.icon2" class="image-preview">
                <el-image :src="dialogForm.icon2" fit="contain" class="preview-img" />
                <el-button type="danger" size="small" circle @click="removeIcon('icon2')" class="remove-btn">
                  <el-icon>
                    <Close />
                  </el-icon>
                </el-button>
              </div>
              <el-upload v-else action="#" :http-request="(opt) => handleIconUpload(opt, 'icon2')"
                :show-file-list="false" accept="image/*">
                <el-button type="warning" plain icon="Plus">上传选中图</el-button>
              </el-upload>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDialog" :loading="dialogLoading">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 2. 【新增】解决方案封面图管理对话框 -->
    <el-dialog v-model="coverDialogVisible" title="管理解决方案封面图" width="500px">
      <el-form :model="coverForm" label-width="90px">
        <el-form-item label="封面图配置">
          <div class="icon-upload-group">

            <!-- 左侧：封面图 1 (主图) -->
            <div class="upload-slot">
              <div class="slot-title">封面图 1 (主展示)</div>
              <div v-if="coverForm.cover1" class="image-preview">
                <el-image :src="coverForm.cover1" fit="contain" class="preview-img" />
                <el-button type="danger" size="small" circle @click="removeCover('cover1')" class="remove-btn">
                  <el-icon>
                    <Close />
                  </el-icon>
                </el-button>
              </div>
              <el-upload v-else action="#" :http-request="(opt) => handleCoverUpload(opt, 'cover1')"
                :show-file-list="false" accept="image/*">
                <el-button type="primary" plain icon="Plus">上传封面 1</el-button>
              </el-upload>
              <div class="slot-desc">建议尺寸 800x450px</div>
            </div>

            <!-- 右侧：封面图 2 (副图/ hover 图) -->
            <div class="upload-slot">
              <div class="slot-title">封面图 2 (可选)</div>
              <div v-if="coverForm.cover2" class="image-preview">
                <el-image :src="coverForm.cover2" fit="contain" class="preview-img" />
                <el-button type="danger" size="small" circle @click="removeCover('cover2')" class="remove-btn">
                  <el-icon>
                    <Close />
                  </el-icon>
                </el-button>
              </div>
              <el-upload v-else action="#" :http-request="(opt) => handleCoverUpload(opt, 'cover2')"
                :show-file-list="false" accept="image/*">
                <el-button type="warning" plain icon="Plus">上传封面 2</el-button>
              </el-upload>
              <div class="slot-desc">鼠标悬停时展示</div>
            </div>

          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="coverDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCoverDialog" :loading="coverDialogLoading">确认保存</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, InfoFilled, Close } from '@element-plus/icons-vue';
import WangEditor from '@/components/WangEditor.vue';

import { uploadImageCommon, industryListApi, addOrUpdateIndustry, deleteIndustry, solutionDetailApi, addOrUpdateSolution, deleteSolution, solutionListApi } from '@/api/common';

const route = useRoute();
const router = useRouter();
const formRef = ref(null);
const dialogFormRef = ref(null);
const submitting = ref(false);
const dialogLoading = ref(false);

// --- 1. 行业数据管理 ---
const industryOptions = ref([]);

const fetchIndustries = async () => {
  try {
    const res = await industryListApi();
    if (res.code === 200) {
      industryOptions.value = res.data;
    } else {
      ElMessage.error(res.msg || '获取行业列表失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('网络异常，获取行业列表失败');
  }
};

// --- 2. 弹窗逻辑 (行业配置) ---
const dialogVisible = ref(false);
const dialogMode = ref('add');

const dialogForm = reactive({
  id: null,
  name: '',
  sort: 0,
  icon1: '',
  icon2: '',
  is_active: true
});

const dialogRules = {
  name: [{ required: true, message: '请输入行业名称', trigger: 'blur' }]
};

const handleIconUpload = async (options, key) => {
  const { file } = options;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('module', 'industry');

  try {
    const res = await uploadImageCommon(formData);
    if (res.code === 200) {
      dialogForm[key] = res.data.url;
      ElMessage.success('上传成功');
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('上传失败');
  }
};

const removeIcon = (key) => {
  dialogForm[key] = '';
};

const handleAddIndustry = () => {
  dialogMode.value = 'add';
  dialogForm.id = null;
  dialogForm.name = '';
  dialogForm.sort = 0;
  dialogForm.icon1 = '';
  dialogForm.icon2 = '';
  dialogForm.is_active = true;
  dialogVisible.value = true;
};

const handleEditIndustry = (row) => {
  dialogMode.value = 'edit';
  Object.assign(dialogForm, {
    id: row.id,
    name: row.name,
    sort: row.sort || 0,
    icon1: row.icon1 || '',
    icon2: row.icon2 || '',
    is_active: row.is_active !== undefined ? row.is_active : true
  });
  dialogVisible.value = true;
};

const handleDeleteIndustry = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该行业吗？', '警告', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await deleteIndustry(id);
    ElMessage.success('删除成功');
    fetchIndustries();

    if (formData.fid === id) {
      formData.fid = null;
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const confirmDialog = async () => {
  if (!dialogFormRef.value) return;
  await dialogFormRef.value.validate(async (valid) => {
    if (valid) {
      dialogLoading.value = true;
      try {
        await addOrUpdateIndustry(dialogForm);
        ElMessage.success(dialogForm.id ? '修改成功' : '新增成功');
        dialogVisible.value = false;
        fetchIndustries();
      } catch (error) {
        ElMessage.error(error.response?.data?.detail || error.message || '操作失败');
      } finally {
        dialogLoading.value = false;
      }
    }
  });
};

// --- 3. 【新增】封面图弹窗逻辑 ---
const coverDialogVisible = ref(false);
const coverDialogLoading = ref(false);
const coverForm = reactive({
  cover1: '',
  cover2: ''
});

// 打开封面图弹窗
const handleAddSolutionImage = () => {
  // 将当前 formData 中的图片地址同步到弹窗表单
  coverForm.cover1 = formData.cover1 || '';
  coverForm.cover2 = formData.cover2 || '';
  coverDialogVisible.value = true;
};

// 上传封面图
const handleCoverUpload = async (options, key) => {
  const { file } = options;
  const formDataUpload = new FormData();
  formDataUpload.append('file', file);
  formDataUpload.append('module', 'solution'); // 模块标识改为 solution

  try {
    const res = await uploadImageCommon(formDataUpload);
    if (res.code === 200) {
      coverForm[key] = res.data.url;
      ElMessage.success(`${key === 'cover1' ? '封面1' : '封面2'}上传成功`);
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    ElMessage.error('上传失败');
  }
};

// 删除封面图
const removeCover = (key) => {
  coverForm[key] = '';
};

// 确认保存封面图
const confirmCoverDialog = () => {
  // 将弹窗中的数据同步回主表单 formData
  formData.cover1 = coverForm.cover1;
  formData.cover2 = coverForm.cover2;

  coverDialogVisible.value = false;
  ElMessage.success('封面图配置已更新');
  // 注意：这里只是更新了前端 formData，最终提交需点击右下角的“保存修改/立即创建”
};


// --- 4. 解决方案表单逻辑 (右侧) ---
const isEdit = computed(() => !!route.params.id);
const solutionId = route.params.id;

// 【修改】formData 增加 cover1, cover2 字段
const formData = reactive({
  title: '',
  fid: null,
  content: '',
  cover1: '', // 新增
  cover2: ''  // 新增
});

const rules = {
  title: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
  fid: [{ required: true, message: '请选择所属行业', trigger: 'change' }],
  content: [
    { required: true, message: '请输入方案详情内容', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value || value === '<p><br></p>' || value.trim() === '') {
          callback(new Error('方案详情不能为空'));
        } else {
          callback();
        }
      }, trigger: 'blur'
    }
  ]
};

const loadDetail = async () => {
  if (!isEdit.value) return;
  submitting.value = true;

  setTimeout(() => {
    const mockData = {
      title: "折弯解决方案 (编辑测试)",
      fid: 1,
      content: "<h2>这是详细内容...</h2>",
      cover1: "https://via.placeholder.com/800x450?text=Cover1", // 模拟数据
      cover2: "https://via.placeholder.com/800x450?text=Cover2"  // 模拟数据
    };
    formData.title = mockData.title;
    formData.fid = mockData.fid;
    formData.content = mockData.content;
    formData.cover1 = mockData.cover1;
    formData.cover2 = mockData.cover2;
    submitting.value = false;
  }, 500);
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      const payload = {
        id: isEdit.value ? solutionId : undefined,
        title: formData.title,
        fid: formData.fid,
        content: formData.content,
        cover1: formData.cover1, // 加入提交数据
        cover2: formData.cover2  // 加入提交数据
      };
      console.log('提交解决方案数据:', payload);


      await addOrUpdateSolution(payload);

      setTimeout(() => {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功');
        submitting.value = false;
        setTimeout(() => router.back(), 1000);
      }, 800);
    }
  });
};

const goBack = () => router.back();

onMounted(() => {
  fetchIndustries();
  loadDetail();
});
</script>

<style scoped lang="scss">
/* ... 原有的样式保持不变 ... */
.solution-page-container {
  height: 100%;
  width: 100%;
  display: flex;
  gap: 20px;
  box-sizing: border-box;
  background-color: #f5f7fa;
  overflow: hidden;

  .left-panel {
    width: 280px;
    flex-shrink: 0;
    height: 100%;
    display: flex;
    flex-direction: column;

    .config-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 8px;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: bold;
        font-size: 16px;
      }

      .industry-list {
        flex: 1;
        overflow-y: auto;
        padding: 10px 20px;

        .list-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .industry-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #fff;
          border: 1px solid #ebeef5;
          border-radius: 6px;
          transition: all 0.3s;
          cursor: pointer;

          &:hover {
            border-color: #409EFF;
            background: #ecf5ff;
          }

          &.is-active {
            border-color: #67c23a;
            background: #f0f9eb;
          }

          .item-info {
            display: flex;
            flex-direction: column;

            .item-name {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
            }
          }

          .item-actions {
            display: flex;
            gap: 5px;
          }
        }
      }

      .panel-tip {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #ebeef5;
        font-size: 12px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .right-panel {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;

    .edit-card {
      height: 100%;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      :deep(.el-card__header) {
        padding: 5px 10px !important;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 18px;
        font-weight: bold;
      }

      :deep(.el-card__body) {
        padding-top: 5px;
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;

        .el-form {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 0 10px;

          .el-form-item {
            flex-shrink: 0;

            &:has(.editor-wrapper) {
              flex: 1;
              display: flex;
              flex-direction: column;

              .editor-wrapper {
                flex: 1;
                height: 100%;
                min-height: 200px;
                border-radius: 4px;
              }
            }
          }

          .form-tip {
            font-size: 12px;
            color: #f56c6c;
          }
        }
      }
    }
  }

  /* 通用上传组样式 (复用给行业图标和解决方案封面) */
  .icon-upload-group {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    width: 100%;

    .upload-slot {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;

      .slot-title {
        font-size: 13px;
        color: #606266;
        margin-bottom: 8px;
        font-weight: 500;
      }

      .slot-desc {
        font-size: 12px;
        color: #909399;
        margin-top: 5px;
      }

      .image-preview {
        position: relative;
        width: 100%;
        max-width: 140px;
        /* 稍微调大一点以适应封面图预览 */
        aspect-ratio: 16/9;
        /* 保持 16:9 比例 */

        .preview-img {
          width: 100%;
          height: 100%;
          border: 1px solid #eee;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .remove-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          z-index: 10;
        }
      }
    }
  }
}

@media (max-width: 900px) {
  .solution-page-container {
    flex-direction: column;
    height: auto;
    overflow-y: auto;

    .left-panel {
      width: 100%;
      height: 400px;
    }

    .right-panel {
      height: auto;
      min-height: 600px;
    }
  }
}
</style>