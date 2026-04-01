<template>
  <div class="category-container">
    <el-card shadow="never">
      <!-- === 1. 顶部操作栏 === -->
      <div class="header-actions">
        <h2 class="page-title">📂 产品分类管理</h2>
        <div>
          <el-button type="primary" :icon="Plus" @click="openDialog('add', null)" :loading="loading">
            新增一级分类
          </el-button>
          <el-button :icon="Refresh" circle @click="fetchData" style="margin-left: 10px" />
        </div>
      </div>

      <!-- === 2. 树形表格 === -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px" row-key="id" border default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" v-loading="loading">
        <el-table-column prop="label" label="分类名称" min-width="200">
          <template #default="scope">
            <!-- 注意：行内编辑仅允许修改名称，修改类型请走弹窗编辑 -->
            <div v-if="scope.row.isEditing" class="edit-input-wrapper">
              <el-input v-model="scope.row.tempLabel" size="small" placeholder="输入分类名"
                @keyup.enter="handleSaveEdit(scope.row)" @blur="handleSaveEdit(scope.row)" />
            </div>
            <span v-else>{{ scope.row.label }}</span>
          </template>
        </el-table-column>

        <!-- === 产品类型列 === -->
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

        <!-- <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column> -->

        <el-table-column label="操作" width="400" fixed="right" align="center">
          <template #default="scope">
            <!-- 编辑/保存 (名称) -->
            <el-button v-if="!scope.row.isEditing" type="primary" link :icon="Edit" @click="handleEdit(scope.row)">
              改名
            </el-button>
            <el-button v-else type="success" link :icon="Check" @click="handleSaveEdit(scope.row)"
              :loading="scope.row.saving">
              保存
            </el-button>

            <el-divider direction="vertical" />

            <!--  弹窗进行详细编辑  -->
            <el-button type="warning" link :icon="Setting" @click="openDialog('edit', scope.row)">
              详情/改型
            </el-button>

            <el-divider direction="vertical" />

            <!-- 新增子级 -->
            <el-button v-if="!scope.row.isEditing" type="primary" link :icon="Plus"
              @click="openDialog('add', scope.row)">
              子级
            </el-button>

            <el-divider direction="vertical" />

            <!-- 删除 -->
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)" :loading="scope.row.deleting">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑 对话框  -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm"
      :close-on-click-modal="false">
      <el-form :model="form" label-width="110px" :rules="rules" ref="formRef">

        <!--  编辑模式且是一级分类 -->
        <el-alert v-if="operateType === 'edit' && form.parent_id === null" title="正在编辑一级分类" type="info" show-icon
          :closable="false" style="margin-bottom: 15px;">
          您可以在此修改分类名称、<strong>产品类型</strong> 及其他属性。
        </el-alert>

        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" autofocus />
        </el-form-item>


        <!-- 显示条件：
            新增模式 + 无父级 (新增一级)
            编辑模式 + 无父级 (编辑一级，允许改类型)
        -->
        <el-form-item v-if="form.parent_id === null" label="产品类型" prop="category_type">
          <el-select v-model="form.category_type" placeholder="请选择该产品线类型" style="width: 100%" clearable>
            <el-option label="🤖 机器人 (robot)" value="robot" />
            <el-option label="🎮 运动控制器 (sport)" value="sport" />
            <el-option label="⚡ 伺服驱动器 (servo)" value="servo" />
            <el-option label="📡 传感器 (sensor)" value="sensor" />
          </el-select>
          <div class="form-tip">
            <el-icon><Info-Filled /></el-icon>
            一级分类必须指定类型。修改类型不会影响已有子分类，但会影响新产品的创建规则。
          </div>
        </el-form-item>

        <!-- 父级信息展示 -->
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
import { categoryTree, saveCategory, deleteCategory } from '@/api/common';

// --- 状态定义 ---
const tableData = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);
const operateType = ref('add'); // 'add' 或 'edit'

// 表单数据
const form = reactive({
  id: null,
  name: '',
  parent_id: null,
  category_type: '',
  sort_order: 0,
  is_active: true
});

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort_order: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  category_type: [
    {
      required: true,
      message: '一级分类必须指定产品类型',
      trigger: 'change',
      validator: (rule, value, callback) => {
        // 只要是一级分类 (parent_id === null)，无论是新增还是编辑，都必须有类型
        if (form.parent_id === null && !value) {
          callback(new Error('请选择产品类型'));
        } else {
          callback();
        }
      }
    }
  ]
};

// 计算属性：显示父级名称
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

// 辅助函数：获取 Tag 颜色
const getTypeTag = (type) => {
  const map = {
    'robot': 'warning',
    'sport': 'success',
    'servo': 'info',
    'sensor': 'primary'
  };
  return map[type] || '';
};

//  数据获取  

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await categoryTree();
    if (res.code === 200) {
      tableData.value = addUiFields(res.data);
    } else {
      ElMessage.error(res.msg || '获取数据失败');
    }
  } catch (error) {
    ElMessage.error('网络错误，无法加载分类');
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

/**
 * 打开对话框 (统一入口)
 * @param {string} type - 'add' 或 'edit'
 * @param {object} row - 当前行数据 (新增子级时传父级，编辑时传自身)
 */
const openDialog = (type, row) => {
  operateType.value = type;

  // 重置表单
  form.id = null;
  form.name = '';
  form.sort_order = 0;
  form.is_active = true;
  form.category_type = '';

  if (type === 'add') {
    if (row) {
      // 新增子级
      form.parent_id = row.id;
      form.sort_order = (row.children ? row.children.length : 0) + 1;
    } else {
      // 新增一级
      form.parent_id = null;
      form.sort_order = tableData.value.length + 1;
    }
  } else if (type === 'edit') {
    // 编辑模式：回填数据
    if (!row) return;
    form.id = row.id;
    form.name = row.label;
    form.parent_id = row.parentId; // 注意后端返回的是 parentId
    form.sort_order = row.sort;
    form.is_active = row.status === 1;
    form.category_type = row.category_type || ''; // 回填类型
  }

  dialogVisible.value = true;
};

// === 提交表单 ===
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
        category_type: form.category_type
      };

      const res = await saveCategory(payload);

      if (res.code === 200) {
        ElMessage.success(operateType.value === 'add' ? '新增成功' : '更新成功');
        dialogVisible.value = false;
        await fetchData();
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.detail || '操作失败');
    } finally {
      submitLoading.value = false;
    }
  });
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
};

// === 行内快速改名 (仅改名，不改类型) ===
const handleEdit = (row) => {
  row.tempLabel = row.label;
  row.isEditing = true;
};

const handleSaveEdit = async (row) => {
  if (!row.tempLabel || !row.tempLabel.trim()) {
    ElMessage.error('分类名称不能为空');
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
      category_type: row.category_type // 保持原类型不变
    };

    const res = await saveCategory(payload);
    if (res.code === 200) {
      row.label = payload.name;
      row.isEditing = false;
      ElMessage.success('名称已更新');
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '保存失败');
    row.isEditing = true;
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
    ElMessage.error('排序更新失败');
    fetchData();
  }
};

const handleDelete = async (row) => {
  if (row.children && row.children.length > 0) {
    ElMessageBox.alert(
      `无法删除 "${row.label}"，因为它下面还有 ${row.children.length} 个子分类。`,
      '提示',
      { type: 'warning', confirmButtonText: '知道了' }
    );
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除分类 "${row.label}" 吗？`,
      '警告',
      { confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'error' }
    );

    row.deleting = true;
    await deleteCategory(row.id);

    ElMessage.success('删除成功');
    await fetchData();
  } catch (actionError) {
    if (actionError !== 'cancel') {
      const msg = actionError.response?.data?.detail || '删除失败';
      ElMessage.error(msg);
    }
  } finally {
    row.deleting = false;
  }
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