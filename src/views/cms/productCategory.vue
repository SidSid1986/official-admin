<template>
  <div class="category-container">
    <el-card shadow="never">
      <!-- === 1. 顶部操作栏 === -->
      <div class="header-actions">
        <h2 class="page-title">📂 产品分类管理</h2>
        <el-button type="primary" :icon="Plus" @click="handleAddRoot">
          新增一级分类
        </el-button>
      </div>

      <!-- === 2. 树形表格 === -->
      <el-table :data="tableData" style="width: 100%; margin-top: 20px" row-key="id" border default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
        <el-table-column prop="label" label="分类名称" min-width="200">
          <template #default="scope">
            <div v-if="scope.row.isEditing" class="edit-input-wrapper">
              <el-input v-model="scope.row.tempLabel" size="small" placeholder="输入分类名"
                @keyup.enter="handleSaveEdit(scope.row)" @blur="handleSaveEdit(scope.row)" ref="inputRef" />
            </div>
            <span v-else>{{ scope.row.label }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column prop="sort" label="排序" width="200" align="center">
          <template #default="scope">
            <el-input-number v-model="scope.row.sort" :min="0" size="small" controls-position="right"
              @change="handleSortChange(scope.row)" />
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" size="small">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="scope">
            <!-- 编辑/保存 -->
            <el-button v-if="!scope.row.isEditing" type="primary" link :icon="Edit" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button v-else type="success" link :icon="Check" @click="handleSaveEdit(scope.row)">
              保存
            </el-button>

            <el-divider direction="vertical" />

            <!-- 新增子级 (仅一级分类显示) -->
            <el-button v-if="!scope.row.parentId" type="primary" link :icon="Plus" @click="handleAddChild(scope.row)">
              新增子级
            </el-button>

            <el-divider direction="vertical" />

            <!-- 删除 -->
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- === 3. 新增/编辑 对话框 (用于非行内编辑的场景，这里主要用作确认或扩展) === -->
    <!-- 本示例主要使用行内编辑，如需复杂表单可在此扩展 -->
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue';
import { Plus, Edit, Delete, Check } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// --- 1. 模拟数据 (实际应从 API 获取) ---
const tableData = ref([
  {
    id: 1,
    label: '机器人',
    parentId: null,
    sort: 1,
    status: 1,
    isEditing: false,
    tempLabel: '',
    children: [
      { id: 11, label: 'SCARA 系列', parentId: 1, sort: 1, status: 1, isEditing: false, tempLabel: '' },
      { id: 22, label: 'MINI 系列', parentId: 1, sort: 2, status: 1, isEditing: false, tempLabel: '' },
      { id: 33, label: '中小负载系列', parentId: 1, sort: 3, status: 1, isEditing: false, tempLabel: '' },
    ]
  },
  {
    id: 2,
    label: '运动控制器',
    parentId: null,
    sort: 2,
    status: 1,
    isEditing: false,
    tempLabel: '',
    children: [
      { id: 88, label: '系列 A', parentId: 2, sort: 1, status: 1, isEditing: false, tempLabel: '' },
      { id: 99, label: '系列 B', parentId: 2, sort: 2, status: 1, isEditing: false, tempLabel: '' },
    ]
  },
  {
    id: 3,
    label: '伺服驱动器',
    parentId: null,
    sort: 3,
    status: 1,
    isEditing: false,
    tempLabel: '',
    children: [
      { id: 66, label: '低压系列', parentId: 3, sort: 1, status: 1, isEditing: false, tempLabel: '' },
    ]
  }
]);

const inputRef = ref(null);

// --- 2. 逻辑处理 ---

// 生成唯一 ID (模拟)
const generateId = () => Date.now() + Math.floor(Math.random() * 1000);

// === 新增一级分类 ===
const handleAddRoot = () => {
  const newId = generateId();
  tableData.value.unshift({
    id: newId,
    label: '新分类',
    parentId: null,
    sort: 0,
    status: 1,
    isEditing: true,
    tempLabel: '新分类',
    children: []
  });
  ElMessage.info('请在表格中修改名称并保存');
};

// === 新增子分类 ===
const handleAddChild = (parentRow) => {
  const newId = generateId();
  const newChild = {
    id: newId,
    label: '新子分类',
    parentId: parentRow.id,
    sort: parentRow.children.length + 1,
    status: 1,
    isEditing: true,
    tempLabel: '新子分类'
  };

  if (!parentRow.children) {
    parentRow.children = [];
  }
  parentRow.children.push(newChild);

  // 自动展开父级 (el-table 默认 expand-all 已处理，若动态添加需刷新)
  ElMessage.info('子分类已添加，请修改名称并保存');
};

// === 进入编辑模式 ===
const handleEdit = (row) => {
  row.tempLabel = row.label; // 备份当前值
  row.isEditing = true;
  // 聚焦输入框 (需要 nextTick 等待 DOM 更新)
  nextTick(() => {
    // 这里简化处理，实际可能需要通过 ref 数组定位具体行的 input
  });
};

// === 保存编辑 ===
const handleSaveEdit = (row) => {
  if (!row.tempLabel || !row.tempLabel.trim()) {
    ElMessage.error('分类名称不能为空');
    row.isEditing = true; // 保持编辑状态
    return;
  }

  // 模拟 API 保存
  row.label = row.tempLabel.trim();
  row.isEditing = false;
  ElMessage.success('保存成功');

  // TODO: 调用后端 API 更新数据库
  // await updateCategoryApi({ id: row.id, label: row.label, sort: row.sort });
};

// === 排序变化 ===
const handleSortChange = (row) => {
  ElMessage.success(`排序已更新为 ${row.sort}`);
  // TODO: 调用后端 API 更新排序
};

// === 删除分类 ===
const handleDelete = (row) => {
  // 检查是否有子节点
  if (row.children && row.children.length > 0) {
    ElMessageBox.alert(
      `无法删除 "${row.label}"，因为它下面还有 ${row.children.length} 个子分类。请先删除或迁移子分类。`,
      '删除失败',
      { type: 'warning', confirmButtonText: '知道了' }
    );
    return;
  }

  ElMessageBox.confirm(
    `确定要删除分类 "${row.label}" 吗？\n注意：如果该分类下已有产品，可能会导致产品展示异常！`,
    '高危操作警告',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'error',
    }
  ).then(async () => {
    // 模拟删除
    if (row.parentId) {
      // 删除子节点：找到父节点并过滤
      const parent = findParentById(row.parentId);
      if (parent) {
        parent.children = parent.children.filter(child => child.id !== row.id);
      }
    } else {
      // 删除根节点
      tableData.value = tableData.value.filter(item => item.id !== row.id);
    }

    ElMessage.success('删除成功');
    // TODO: 调用后端 API 删除
  }).catch(() => { });
};

// 辅助函数：递归查找父节点
const findParentById = (parentId) => {
  return tableData.value.find(item => item.id === parentId);
};

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
}
</style>