<template>
  <div class="solution-container">
    <!-- === 1. 搜索与操作栏 === -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="方案名称">
          <el-input v-model="searchForm.name" placeholder="请输入方案名称" clearable style="width: 240px"
            @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item label="所属行业">
          <el-select v-model="searchForm.industryId" placeholder="请选择行业" clearable style="width: 240px"
            @change="handleSearch">
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
        <div class="data-info">共找到 <span class="highlight">{{ filteredData.length }}</span> 条方案</div>
      </div>
    </el-card>

    <!-- === 2. 数据表格 === -->
    <el-card class="table-card" shadow="never">
      <el-table :data="paginatedData" style="width: 100%" v-loading="loading" border stripe
        header-cell-class-name="table-header-gray">
        <!-- 方案名称 (点击可编辑) -->
        <el-table-column label="方案名称" min-width="250">
          <template #default="scope">
            <span class="edit-link" @click="handleEdit(scope.row)" title="点击编辑">
              {{ scope.row.name }}
            </span>
          </template>
        </el-table-column>

        <!-- 所属行业 -->
        <el-table-column label="所属行业" width="150" align="center">
          <template #default="scope">
            <el-tag type="info" effect="plain">
              {{ getIndustryName(scope.row.fid) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 创建/更新时间 (模拟) -->
        <el-table-column label="更新时间" width="180" sortable>
          <template #default="scope">
            {{ scope.row.updateTime || '刚刚' }}
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
          layout="total, sizes, prev, pager, next, jumper" :total="filteredData.length" @size-change="handleSizeChange"
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

const router = useRouter();

// --- 1. 原始数据 (模拟后端) ---
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

const rawSolutions = ref([]);

// 初始化数据：包含你提供的数据 + 自动补充的其他行业数据
const initData = () => {
  const baseData = [
    { id: 11, name: "折弯解决方案", fid: 1, updateTime: '2026-03-10' },
    { id: 22, name: "张力控制解决方案", fid: 1, updateTime: '2026-03-12' },
    { id: 33, name: "压铸解决方案", fid: 1, updateTime: '2026-03-05' },
    { id: 44, name: "码垛解决方案", fid: 1, updateTime: '2026-03-15' },
    { id: 55, name: "焊接解决方案", fid: 1, updateTime: '2026-03-01' },
    { id: 66, name: "打磨解决方案", fid: 1, updateTime: '2026-03-18' },
  ];

  // 补充其他行业的数据，让列表看起来更丰富
  const extraData = [];
  let idCounter = 100;

  industryOptions.forEach(ind => {
    if (ind.id !== 1) { // 跳过汽车行业，因为上面已经有了
      extraData.push({
        id: idCounter++,
        name: `${ind.name}智能产线方案`,
        fid: ind.id,
        updateTime: '2026-02-20'
      });
      extraData.push({
        id: idCounter++,
        name: `${ind.name}自动化升级方案`,
        fid: ind.id,
        updateTime: '2026-02-25'
      });
    }
  });

  rawSolutions.value = [...baseData, ...extraData];
};

// --- 2. 搜索与过滤 ---
const searchForm = reactive({
  name: '',
  industryId: null
});

const filteredData = computed(() => {
  return rawSolutions.value.filter(item => {
    const matchName = !searchForm.name || item.name.includes(searchForm.name);
    const matchIndustry = !searchForm.industryId || item.fid === searchForm.industryId;
    return matchName && matchIndustry;
  });
});

// --- 3. 分页 ---
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});

const handleSizeChange = (val) => { pageSize.value = val; currentPage.value = 1; };
const handleCurrentChange = (val) => { currentPage.value = val; };

// --- 4. 操作方法 ---
const handleSearch = () => {
  currentPage.value = 1;
  loading.value = true;
  setTimeout(() => loading.value = false, 300);
};

const handleReset = () => {
  searchForm.name = '';
  searchForm.industryId = null;
  handleSearch();
};

const getIndustryName = (fid) => {
  const ind = industryOptions.find(i => i.id === fid);
  return ind ? ind.name : '未知行业';
};

const goToCreate = () => {
  router.push('/solution/solutionAddEdit'); // 对应路由 path
};

const handleEdit = (row) => {
  // 跳转编辑页，带上 ID
  router.push(`/solution/solutionAddEdit/${row.id}`);
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定删除方案 "${row.name}" 吗？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    loading.value = true;
    setTimeout(() => {
      rawSolutions.value = rawSolutions.value.filter(item => item.id !== row.id);
      ElMessage.success('删除成功');
      loading.value = false;
      if (paginatedData.value.length === 0 && currentPage.value > 1) currentPage.value--;
    }, 500);
  });
};

onMounted(() => {
  initData();
});
</script>

<style scoped lang="scss">
.solution-container {
  padding: 20px;
  background-color: #f5f7fa;
  height:100%;

  .search-card {
    margin-bottom: 20px;
    border-radius: 8px;
    // border:1px solid red;
    padding:10px;

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
      padding:10px;
    }
  }

  :deep(.table-header-gray) {
    background-color: #f5f7fa !important;
    font-weight: 600;
  }
}
</style>