<template>
  <div class="product-list-container">
    <!-- === 1. 顶部搜索与操作栏 === -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入名称" clearable style="width: 200px"
            @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item label="产品型号">
          <el-input v-model="searchForm.modelNumber" placeholder="请输入型号" clearable style="width: 200px"
            @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item label="产品分类">
          <el-cascader v-model="searchForm.category" :options="categoryOptions" placeholder="请选择分类" clearable
            style="width: 240px" :props="{ expandTrigger: 'hover' }" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-bar">
        <el-button type="success" :icon="Plus" @click="goToCreate">新增产品</el-button>
        <div class="data-info">共找到 <span class="highlight">{{ rawTableData.length }}</span> 条数据</div>
      </div>
    </el-card>

    <!-- === 2. 数据表格 === -->
    <el-card class="table-card" shadow="never">
      <el-table :data="paginatedData" style="width: 100%" v-loading="loading" border stripe
        header-cell-class-name="table-header-gray">
        <!-- 图片列 -->
        <el-table-column label="产品图片" width="120" align="center">
          <template #default="scope">
            <div class="img-wrapper">
              <el-image v-if="scope.row.mainImageUrl" :src="scope.row.mainImageUrl" fit="cover" class="product-thumb"
                :preview-src-list="[scope.row.mainImageUrl]">
                <template #error>
                  <div class="image-error">
                    <el-icon>
                      <Picture />
                    </el-icon>
                  </div>
                </template>
              </el-image>
              <span v-else class="no-img">无图片</span>
            </div>
          </template>
        </el-table-column>

        <!-- 产品名称 -->
        <el-table-column prop="productName" label="产品名称" min-width="180" show-overflow-tooltip />

        <!-- 产品型号 -->
        <el-table-column prop="modelNumber" label="产品型号" width="150" show-overflow-tooltip>
          <template #default="scope">
            <el-tag effect="plain" size="small">{{ scope.row.modelNumber }}</el-tag>
          </template>
        </el-table-column>

        <!-- 产品分类 (级联展示) -->
        <el-table-column prop="categoryPath" label="所属分类" min-width="180">
          <template #default="scope">
            <el-tag v-if="scope.row.categoryPath" type="info" size="small">
              {{ scope.row.categoryPath }}
            </el-tag>
            <span v-else class="text-gray">未分类</span>
          </template>
        </el-table-column>

        <!-- 产品类型 -->
        <el-table-column prop="productType" label="类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.productType)" size="small" effect="dark">
              {{ getTypeLabel(scope.row.productType) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column prop="createTime" label="创建时间" width="160" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="scope">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-divider direction="vertical" />
            <el-button type="danger" link :icon="Delete" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- === 3. 分页器 === -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper" :total="filteredData.length" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Search, Refresh, Plus, Edit, Delete, Picture
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

// --- 1. 数据源 (分类选项 - 与新增页保持一致) ---
const categoryOptions = [
  {
    value: 1,
    label: '机器人',
    children: [
      { value: 11, label: 'SCARA 系列' },
      { value: 22, label: 'MINI 系列' },
      { value: 33, label: '中小负载系列' },
    ]
  },
  {
    value: 2,
    label: '运动控制器',
    children: [
      { value: 88, label: '系列 A' },
      { value: 99, label: '系列 B' },
    ]
  },
  {
    value: 3,
    label: '伺服驱动器',
    children: [
      { value: 66, label: '低压系列' },
    ]
  },
];

// --- 2. 模拟数据 (实际应从 API 获取) ---
const loading = ref(false);
const rawTableData = ref([]); // 原始全量数据

// 生成一些假数据用于演示
const generateMockData = () => {
  const types = ['ROBOT', 'SPORT_CONTROLLER', 'DRIVER'];
  const data = [];
  for (let i = 1; i <= 25; i++) {
    const type = types[i % 3];
    let catPath = '';
    let catIds = [];

    if (type === 'ROBOT') {
      catIds = [1, i % 2 === 0 ? 11 : 22];
      catPath = '机器人 / ' + (i % 2 === 0 ? 'SCARA 系列' : 'MINI 系列');
    } else if (type === 'SPORT_CONTROLLER') {
      catIds = [2, i % 2 === 0 ? 88 : 99];
      catPath = '运动控制器 / ' + (i % 2 === 0 ? '系列 A' : '系列 B');
    } else {
      catIds = [3, 66];
      catPath = '伺服驱动器 / 低压系列';
    }

    data.push({
      id: i,
      productName: `高性能${type === 'ROBOT' ? '机器人' : type === 'SPORT_CONTROLLER' ? '控制器' : '驱动器'} ${i}号`,
      modelNumber: `MD-${2026000 + i}`,
      mainImageUrl: i % 5 === 0 ? '' : 'https://placehold.co/100x100/16418A/FFF?text=IMG' + i, // 模拟部分无图
      category: catIds, // [fatherId, sonId]
      categoryPath: catPath,
      productType: type,
      createTime: new Date(Date.now() - i * 86400000).toISOString(),
      details: {} // 省略详情
    });
  }
  rawTableData.value = data;
};

// --- 3. 搜索与过滤逻辑 ---
const searchForm = reactive({
  productName: '',
  modelNumber: '',
  category: [] // 级联选择器绑定值 [father, son]
});

// 计算属性：根据搜索条件过滤数据
const filteredData = computed(() => {
  return rawTableData.value.filter(item => {
    // 1. 名称模糊匹配
    const matchName = !searchForm.productName || item.productName.includes(searchForm.productName);

    // 2. 型号模糊匹配
    const matchModel = !searchForm.modelNumber || item.modelNumber.includes(searchForm.modelNumber);

    // 3. 分类匹配 (如果选了父级，匹配父级；如果选了子级，必须完全匹配)
    let matchCategory = true;
    if (searchForm.category.length > 0) {
      if (searchForm.category.length === 1) {
        // 只选了父级
        matchCategory = item.category[0] === searchForm.category[0];
      } else {
        // 选了父子级
        matchCategory = item.category[0] === searchForm.category[0] &&
          item.category[1] === searchForm.category[1];
      }
    }

    return matchName && matchModel && matchCategory;
  });
});

// --- 4. 分页逻辑 ---
const currentPage = ref(1);
const pageSize = ref(10);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// --- 5. 操作方法 ---

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  loading.value = true;
  // 模拟网络请求延迟
  setTimeout(() => {
    loading.value = false;
    ElMessage.success('搜索完成');
  }, 300);
};

// 重置
const handleReset = () => {
  searchForm.productName = '';
  searchForm.modelNumber = '';
  searchForm.category = [];
  handleSearch();
};

// 跳转新增
const goToCreate = () => {
  router.push('/cms/productAddEdit'); // 确保路由配置中有这个路径
};

// 跳转编辑
const handleEdit = (row) => {
  // 跳转到编辑页，带上 ID
  router.push(`/cms/productAddEdit/${row.id}`);
};

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除产品 "${row.productName}" 吗？此操作不可恢复。`,
    '警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    loading.value = true;
    // 模拟删除 API
    setTimeout(() => {
      rawTableData.value = rawTableData.value.filter(item => item.id !== row.id);
      ElMessage.success('删除成功');
      loading.value = false;
      // 如果当前页数据为空且不是第一页，自动回到上一页
      if (paginatedData.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
    }, 500);
  }).catch(() => {
    // 取消删除
  });
};

// 辅助函数：格式化类型标签
const getTypeTag = (type) => {
  const map = {
    'ROBOT': 'warning',
    'SPORT_CONTROLLER': 'success',
    'DRIVER': 'info'
  };
  return map[type] || 'info';
};

const getTypeLabel = (type) => {
  const map = {
    'ROBOT': '机器人',
    'SPORT_CONTROLLER': '运动控制器',
    'DRIVER': '伺服驱动器'
  };
  return map[type] || type;
};

// 辅助函数：格式化时间
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  generateMockData();
});
</script>

<style scoped lang="scss">
.product-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;

    .search-form {
      margin-bottom: 10px;

      :deep(.el-form-item__label) {
        font-weight: 600;
      }
    }

    .action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #ebeef5;
      padding-top: 15px;

      .data-info {
        color: #606266;
        font-size: 14px;

        .highlight {
          color: #409EFF;
          font-weight: bold;
          font-size: 16px;
        }
      }
    }
  }

  .table-card {
    border-radius: 8px;

    .img-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;

      .product-thumb {
        width: 60px;
        height: 60px;
        border-radius: 4px;
        border: 1px solid #ebeef5;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .image-error {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 60px;
        height: 60px;
        background: #f5f7fa;
        color: #909399;
        border-radius: 4px;
      }

      .no-img {
        color: #c0c4cc;
        font-size: 12px;
      }
    }

    .text-gray {
      color: #909399;
      font-size: 12px;
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      padding: 10px 0;
    }
  }

  // 表头背景色微调
  :deep(.table-header-gray) {
    background-color: #f5f7fa !important;
    color: #606266;
    font-weight: 600;
  }
}
</style>