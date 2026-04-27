<template>
  <div class="category-container">
    <el-card shadow="never">
      <!-- 顶部操作栏 -->
      <div class="header-actions">
        <h2 class="page-title">📂 产品分类管理</h2>
        <div>
          <el-button type="primary" :icon="Plus" @click="openDialog('add', null)" :loading="loading">
            新增一级分类
          </el-button>
          <el-button :icon="Refresh" circle @click="fetchData" style="margin-left: 10px" />
        </div>
      </div>

      <!-- 树形表格 -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px" row-key="id" border default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" v-loading="loading">
        <el-table-column prop="label" label="分类名称" min-width="200">
          <template #default="scope">
            <div v-if="scope.row.isEditing" class="edit-input-wrapper">
              <el-input v-model="scope.row.tempLabel" size="small" placeholder="输入分类名"
                @keyup.enter="handleSaveEdit(scope.row)" @blur="handleSaveEdit(scope.row)" />
            </div>
            <span v-else>{{ scope.row.label }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="category_type" label="产品类型" width="180" align="center">
          <template #default="scope">
            <el-tag v-if="!scope.row.parentId" :type="getTypeTag(scope.row.category_type)" effect="plain"
              style="font-weight: bold;">
              {{ scope.row.type_name || '未指定' }}
            </el-tag>
            <span v-else style="color: #909399; font-size: 12px;">
              <el-icon>
                <Connection />
              </el-icon> 继承父级
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column prop="sort" label="排序" width="150" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.sort" :min="0" size="small" controls-position="right"
              @change="handleSortChange(scope.row)" :disabled="scope.row.isEditing" />
          </template>
        </el-table-column>

        <el-table-column label="操作" width="400" fixed="right" align="center">
          <template #default="scope">
            <el-button v-if="!scope.row.isEditing" type="primary" link :icon="Edit" @click="handleEdit(scope.row)">
              改名
            </el-button>
            <el-button v-else type="success" link :icon="Check" @click="handleSaveEdit(scope.row)"
              :loading="scope.row.saving">
              保存
            </el-button>

            <el-divider direction="vertical" />

            <el-button type="warning" link :icon="Setting" @click="openDialog('edit', scope.row)">
              详情/改型
            </el-button>

            <el-divider direction="vertical" />

            <el-button v-if="!scope.row.isEditing" type="primary" link :icon="Plus"
              @click="openDialog('add', scope.row)">
              子级
            </el-button>

            <el-divider direction="vertical" />

            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)" :loading="scope.row.deleting">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm"
      :close-on-click-modal="false">
      <el-form :model="form" label-width="110px" :rules="rules" ref="formRef">

        <el-alert v-if="operateType === 'edit' && form.parent_id === null" title="正在编辑一级分类" type="info" show-icon
          :closable="false" style="margin-bottom: 15px;">
          您可以在此修改分类名称、<strong>产品类型</strong> 及其他属性。
        </el-alert>

        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" autofocus />
        </el-form-item>

        <el-form-item v-if="form.parent_id === null" label="产品类型" prop="category_type">
          <el-select v-model="form.category_type" placeholder="请选择该产品线类型" style="width: 100%" clearable>
            <el-option label="🤖 机器人 (robot)" value="robot" />
            <el-option label="运动控制器 (sport)" value="sport" />
            <el-option label="伺服驱动器 (servo)" value="servo" />
            <el-option label="传感器 (sensor)" value="sensor" />
          </el-select>
          <div class="form-tip">
            <el-icon><Info-Filled /></el-icon>
            一级分类必须指定类型。修改类型不会影响已有子分类，但会影响新产品的创建规则。
          </div>
        </el-form-item>

        <el-form-item label="所属父级" v-if="form.parent_id !== null">
          <el-tag>{{ parentCategoryName }}</el-tag>
          <span style="margin-left: 10px; color: #909399; font-size: 12px;">(子分类自动继承父级类型，不可单独修改)</span>
        </el-form-item>
        <el-form-item label="所属父级" v-else>
          <el-tag type="info">根节点 (一级分类)</el-tag>
        </el-form-item>

        <el-form-item label="排序权重" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>

        <el-form-item label="启用状态" prop="is_active">
          <el-switch v-model="form.is_active" :active-value="true" :inactive-value="false" />
        </el-form-item>

        <!-- 分类图片（和产品页完全一致） -->
        <el-form-item label="分类图片">
          <el-upload action="#" :auto-upload="false" :limit="1" :file-list="imageList" list-type="picture-card"
            :on-change="handleImageChange" :on-remove="handleImageRemove">
            <el-icon>
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>

      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">
            保存更改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { Plus, Edit, Delete, Check, Refresh, Connection, InfoFilled, Setting } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { categoryTree, saveCategory, deleteCategory, uploadRobotImage } from '@/api/common';

// --- 状态 ---
const tableData = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);
const operateType = ref('add');

const imageList = ref([]);

const form = reactive({
  id: null,
  name: '',
  parent_id: null,
  category_type: '',
  sort_order: 0,
  is_active: true,
  img: ''
});

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort_order: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  category_type: [
    {
      required: true,
      message: '一级分类必须指定产品类型',
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (form.parent_id === null && !value) {
          callback(new Error('请选择产品类型'));
        } else {
          callback();
        }
      }
    }
  ]
};

const parentCategoryName = computed(() => {
  if (!form.parent_id) return '无';
  const findNode = (nodes, id) => {
    for (let node of nodes) {
      if (node.id === id) return node.label;
      if (node.children) {
        const found = findNode(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  return findNode(tableData.value, form.parent_id) || '未知';
});

const dialogTitle = computed(() => {
  if (operateType.value === 'add') {
    return form.parent_id === null ? '新增一级分类' : `新增子分类 (父级：${parentCategoryName.value})`;
  } else {
    return `编辑分类：${form.name || '未命名'}`;
  }
});

const getTypeTag = (type) => {
  const map = { robot: 'warning', sport: 'success', servo: 'info', sensor: 'primary' };
  return map[type] || '';
};

// --- 数据 ---
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await categoryTree();
    if (res.code === 200) tableData.value = addUiFields(res.data);
    else ElMessage.error(res.msg || '获取数据失败');
  } catch (error) {
    ElMessage.error('网络错误');
  } finally {
    loading.value = false;
  }
};

const addUiFields = (nodes) => {
  return nodes.map(node => ({
    ...node,
    isEditing: false,
    tempLabel: node.label,
    saving: false,
    deleting: false,
    children: node.children ? addUiFields(node.children) : []
  }));
};

// --- 弹窗 ---
const openDialog = (type, row) => {
  operateType.value = type;
  form.id = null;
  form.name = '';
  form.sort_order = 0;
  form.is_active = true;
  form.category_type = '';
  form.img = '';
  imageList.value = [];

  if (type === 'add') {
    if (row) {
      form.parent_id = row.id;
      form.sort_order = (row.children?.length || 0) + 1;
    } else {
      form.parent_id = null;
      form.sort_order = tableData.value.length + 1;
    }
  } else if (type === 'edit') {
    if (!row) return;
    form.id = row.id;
    form.name = row.label;
    form.parent_id = row.parentId;
    form.sort_order = row.sort;
    form.is_active = row.status === 1;
    form.category_type = row.category_type || '';
    form.img = row.img || '';

    if (form.img) {
      imageList.value = [{ name: 'img', url: form.img }];
    }
  }

  dialogVisible.value = true;
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
  imageList.value = [];
};

// --- 提交 ---
const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      const payload = {
        id: form.id,
        name: form.name,
        parent_id: form.parent_id,
        sort_order: form.sort_order,
        is_active: form.is_active,
        category_type: form.category_type,
        img: form.img
      };
      const res = await saveCategory(payload);
      if (res.code === 200) {
        ElMessage.success(operateType.value === 'add' ? '新增成功' : '更新成功');
        dialogVisible.value = false;
        fetchData();
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.detail || '操作失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

// --- 行内编辑 ---
const handleEdit = (row) => {
  row.tempLabel = row.label;
  row.isEditing = true;
};

const handleSaveEdit = async (row) => {
  if (!row.tempLabel?.trim()) {
    ElMessage.error('名称不能为空');
    row.isEditing = true;
    return;
  }
  row.saving = true;
  try {
    const payload = {
      id: row.id,
      name: row.tempLabel.trim(),
      parent_id: row.parentId,
      sort_order: row.sort,
      is_active: row.status === 1,
      category_type: row.category_type
    };
    const res = await saveCategory(payload);
    if (res.code === 200) {
      row.label = payload.name;
      row.isEditing = false;
      ElMessage.success('已保存');
    }
  } catch (error) {
    ElMessage.error('保存失败');
  } finally {
    row.saving = false;
  }
};

const handleSortChange = async (row) => {
  try {
    const payload = {
      id: row.id,
      name: row.label,
      parent_id: row.parentId,
      sort_order: row.sort,
      is_active: row.status === 1,
      category_type: row.category_type
    };
    await saveCategory(payload);
    ElMessage.success({ message: '排序已更新', duration: 1000 });
    fetchData();
  } catch (error) {
    ElMessage.error('失败');
  }
};

// --- 删除 ---
const handleDelete = async (row) => {
  if (row.children?.length) {
    ElMessageBox.alert(`"${row.label}" 存在子分类，无法删除`, '提示', { type: 'warning' });
    return;
  }
  try {
    await ElMessageBox.confirm(`确定删除 "${row.label}"？`, '警告', { type: 'error' });
    row.deleting = true;
    await deleteCategory(row.id);
    ElMessage.success('删除成功');
    fetchData();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败');
  } finally {
    row.deleting = false;
  }
};

// ==================== 图片上传（和产品页完全一致） ====================
const handleImageChange = async (uploadFile) => {
  imageList.value = [uploadFile];
  const raw = uploadFile.raw;
  if (!raw) return;

  try {
    const fd = new FormData();
    fd.append('file', raw);
    const res = await uploadRobotImage(fd);
    if (res.code === 200) {
      form.img = res.data.url;
      imageList.value = [{
        uid: uploadFile.uid,
        name: uploadFile.name,
        url: res.data.url,
        status: 'success'
      }];
      ElMessage.success('上传成功');
    } else {
      ElMessage.error('上传失败');
      imageList.value = [];
    }
  } catch (err) {
    ElMessage.error('上传失败');
    imageList.value = [];
  }
};

const handleImageRemove = () => {
  imageList.value = [];
  form.img = '';
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped lang="scss">
.category-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .page-title {
      margin: 0;
      font-size: 20px;
      color: #303133;
      font-weight: 600;
    }
  }

  .edit-input-wrapper {
    width: 90%;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}
</style>