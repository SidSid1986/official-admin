<template>
  <div class="solution-container">
    <!-- === 1. 搜索与操作栏 === -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="方案名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入方案名称" clearable style="width: 240px"
            @change="handleSearch" />
        </el-form-item>

        <el-form-item label="所属行业">
          <el-select v-model="searchForm.fid" placeholder="请选择行业" clearable style="width: 240px" @change="handleSearch">
            <el-option v-for="item in industryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
          <!-- 如果未来行业也有层级，可换回 el-cascader，目前看是平级行业 -->
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="action-bar">
        <el-button type="success" :icon="Plus" @click="goToCreate">新增解决方案</el-button>
        <div class="data-info">共找到 <span class="highlight">{{ total }}</span> 条方案</div>
      </div>
    </el-card>

    <!-- === 2. 数据表格 === -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" style="width: 100%" v-loading="loading" border stripe
        header-cell-class-name="table-header-gray">
        <!-- 方案名称 (点击可编辑) -->
        <el-table-column label="方案名称" min-width="250">
          <template #default="scope">
            <span class="edit-link" @click="handleEdit(scope.row)" title="点击编辑">
              {{ scope.row.title }}
            </span>
          </template>
        </el-table-column>

        <!-- 所属行业 -->
        <el-table-column label="所属行业" width="150" align="center">
          <template #default="scope">
            <el-tag type="info" effect="plain">
              {{ getIndustryName(scope.row) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建/更新时间 (模拟) -->
        <el-table-column label="更新时间" width="180" sortable>
          <template #default="scope">
            {{ scope.row.update_time || '刚刚' }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="200" fixed="right" align="center">
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
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 引入真实的 API 方法
import { solutionListApi, deleteSolution, industryListApi } from '@/api/common';

const router = useRouter();

// ---  数据状态 ---
const tableData = ref([]);
const industryOptions = ref([]); // 存储行业下拉选项 
const loading = ref(false);

//  搜索表单 
const searchForm = reactive({
  title: '',
  keyword: '',
  fid: null
});

//  分页配置 
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

//   获取列表  
const fetchList = async () => {
  loading.value = true;
  try {

    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      fid: searchForm.fid || undefined,
      keyword: searchForm.keyword,
      only_active: false // 是否只查启用的，根据需求调整
    };

    const res = await solutionListApi(params);

    if (res.code === 200) {
      console.log("chadaole");
      tableData.value = res.data;
      total.value = res.total || 0;
    } else {
      ElMessage.error(res.msg || '获取列表失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('网络异常，获取列表失败');
  } finally {
    loading.value = false;
  }
};

//  行业数据管理
const fetchIndustries = async () => {
  try {
    const res = await industryListApi();
    if (res.code === 200) {
      industryOptions.value = res.data || [];
    } else {
      ElMessage.error(res.msg || '获取行业列表失败');
    }
  } catch (error) {
    console.error(error);
    ElMessage.error('网络异常，获取行业列表失败');
  }
};



const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  fetchList();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchList();
};

// --- 7. 操作事件 ---
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
  fetchList(); // 重新请求或过滤
};

const handleReset = () => {
  searchForm.title = '';
  searchForm.fid = null;
  handleSearch();
};


const getIndustryName = (row) => {

  if (row.industry_name) return row.industry_name;
  return `行业ID:${row.fid}`;
};

const goToCreate = () => {
  // 跳转新增页 (不带 ID)
  router.push('/solution/solutionAddEdit');
};

const handleEdit = (row) => {
  // 跳转编辑页 (带 ID)
  router.push(`/solution/solutionAddEdit/${row.id}`);
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除方案 "${row.title}" 吗？\n注意：此操作不可恢复！`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    loading.value = true;
    try {
      const res = await deleteSolution(row.id);
      if (res.code === 200) {
        ElMessage.success('删除成功');

        await fetchList();

        //  如果当前页数据空了且不是第一页，跳回前一页
        if (paginatedData.value.length === 0 && currentPage.value > 1) {
          currentPage.value--;
        }
      } else {
        ElMessage.error(res.msg || '删除失败');
      }
    } catch (error) {
      ElMessage.error('删除操作异常');
    } finally {
      loading.value = false;
    }
  });
};


onMounted(() => {
  fetchList();
  fetchIndustries();
});
</script>

<style scoped lang="scss">
.solution-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;

  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;
    // border:1px solid red;
    padding: 10px;

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

    .edit-link {
      color: #409EFF;
      cursor: pointer;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    .pagination-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 20px;
      // border:1px solid red;
      padding: 10px;
    }
  }

  :deep(.table-header-gray) {
    background-color: #f5f7fa !important;
    font-weight: 600;
  }
}
</style>