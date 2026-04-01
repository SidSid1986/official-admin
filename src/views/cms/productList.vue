<template>
  <div class="product-list-container">
    <!-- === 1. 顶部搜索与操作栏 === -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入名称" clearable style="width: 200px"
            @change="handleSearch" />
        </el-form-item>

        <el-form-item label="产品型号">
          <el-input v-model="searchForm.modelNumber" placeholder="请输入型号" clearable style="width: 200px"
            @change="handleSearch" />
        </el-form-item>

        <el-form-item label="产品分类">
          <el-cascader v-model="searchForm.categoryIds" :options="categoryOptions" placeholder="请选择分类" clearable
            style="width: 220px"
            :props="{ expandTrigger: 'hover', value: 'value', label: 'label', children: 'children' }"
            @change="handleCategoryChange" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch" :loading="loading">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="success" :icon="Plus" @click="goToCreate">新增产品</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- === 2. 数据表格 === -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" height="50vh" style="width: 100%" v-loading="loading" border stripe
        header-cell-class-name="table-header-gray">

        <!-- 图片列 -->
        <el-table-column label="产品图片" width="120" align="center">
          <template #default="scope">
            <div class="img-wrapper">
              <el-image v-if="scope.row.mainImageUrl" :src="scope.row.mainImageUrl" fit="cover" class="product-thumb"
                :preview-src-list="[scope.row.mainImageUrl]">
                <template #error>
                  <div class="image-error"><el-icon>
                      <Picture />
                    </el-icon></div>
                </template>
              </el-image>
              <span v-else class="no-img">无图片</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="productName" label="产品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="modelNumber" label="产品型号" width="150" show-overflow-tooltip>
          <template #default="scope">
            <el-tag effect="plain" size="small">{{ scope.row.modelNumber }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="categoryPath" label="所属分类" min-width="180">
          <template #default="scope">
            <el-tag v-if="scope.row.categoryPath" type="info" size="small">
              {{ scope.row.categoryPath }}
            </el-tag>
            <span v-else class="text-gray">未分类</span>
          </template>
        </el-table-column>

        <el-table-column prop="productType" label="类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.productType)" size="small" effect="dark">
              {{ getTypeLabel(scope.row.productType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="160" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- === 3. 分页器 === -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="fetchData" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Refresh, Plus, Edit, Delete, Picture } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { productList, deleteProduct, categoryTree } from '@/api/common'; // 引入 API

const router = useRouter();

// --- 状态定义 ---
const loading = ref(false);
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索表单
const searchForm = reactive({
  productName: '',
  modelNumber: '',
  categoryIds: [], // 级联选择器绑定的值 [parentId, childId]
  parentId: null,  // 传递给后端的父级ID
  childId: null    // 传递给后端的子级ID
});

// 分类选项 (用于 Cascader)
const categoryOptions = ref([]);

// --- 方法 ---

// 1. 加载分类树 (初始化搜索框)
const fetchCategories = async () => {
  try {
    const res = await categoryTree();
    if (res.code === 200) {
      // 转换格式：后端返回 {id, label, children...} -> 前端需要 {value: id, label, children...}
      const transform = (nodes) => {
        return nodes.map(node => ({
          value: node.id,
          label: node.label, // 或者 node.type_name 如果想显示类型
          children: node.children ? transform(node.children) : []
        }));
      };
      categoryOptions.value = transform(res.data);
    }
  } catch (error) {
    ElMessage.error('加载分类失败');
  }
};

// 2. 加载产品数据
const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchForm.productName || undefined,
      model_number: searchForm.modelNumber || undefined,
      category_id: searchForm.childId || undefined,
      parent_category_id: searchForm.parentId || undefined
    };

    const res = await productList(params);
    if (res.code === 200) {
      tableData.value = res.data;
      total.value = res.total;
    } else {
      ElMessage.error(res.msg || '加载失败');
    }
  } catch (error) {
    ElMessage.error('网络错误');
  } finally {
    loading.value = false;
  }
};

// 级联选择器变化处理
const handleCategoryChange = (values) => {
  if (!values || values.length === 0) {
    searchForm.parentId = null;
    searchForm.childId = null;
  } else if (values.length === 1) {
    // 只选了父级
    searchForm.parentId = values[0];
    searchForm.childId = null;
  } else {
    // 选了父子级
    searchForm.parentId = values[0];
    searchForm.childId = values[1];
  }
  fetchData();

};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

// 重置
const handleReset = () => {
  searchForm.productName = '';
  searchForm.modelNumber = '';
  searchForm.categoryIds = [];
  searchForm.parentId = null;
  searchForm.childId = null;
  handleSearch();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchData();
};

// 跳转
const goToCreate = () => {
  router.push('/cms/productAddEdit');
};

const handleEdit = (row) => {
  router.push(`/cms/productAddEdit/${row.productType}/${row.id}`);
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除产品 "${row.productName}" 吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteProduct(row.id);
      ElMessage.success('删除成功');
      // 如果当前页只剩一个且不是第一页，回退一页
      if (tableData.value.length === 1 && currentPage.value > 1) {
        currentPage.value--;
      }
      fetchData();
    } catch (error) {
      ElMessage.error(error.response?.data?.detail || '删除失败');
    }
  });
};

// 辅助函数
const getTypeTag = (type) => {
  const map = { 'robot': 'warning', 'sport': 'success', 'servo': 'info', 'sensor': 'primary' };
  return map[type] || 'info';
};

const getTypeLabel = (type) => {
  const map = { 'robot': '机器人', 'sport': '运动控制器', 'servo': '伺服驱动器', 'sensor': '传感器' };
  return map[type] || type;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchCategories();
  fetchData();
});
</script>

<style scoped lang="scss">
/* 样式保持与你提供的代码一致，略 */
.product-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;
  box-sizing: border-box;

  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .search-form {
      display: flex;
      flex-wrap: wrap;

      .el-form-item {
        margin-bottom: 0;
        margin-right: 15px;
      }
    }
  }

  .table-card {
    border-radius: 8px;

    :deep(.el-card__body) {
      padding: 10px !important;
    }

    .img-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;

      .product-thumb {
        width: 60px;
        height: 60px;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          transform: scale(1.1);
        }
      }

      .no-img {
        color: #c0c4cc;
        font-size: 12px;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }

  :deep(.table-header-gray) {
    background-color: #f5f7fa !important;
    font-weight: 600;
  }
}
</style>