<template>
  <div class="news-list-container">
    <!--  搜索与新增按钮   -->
    <div class="header-actions">
      <el-input v-model="searchKeyword" placeholder="搜索新闻标题..." clearable style="width: 300px"
        @keyup.enter="handleSearch" @clear="handleSearch">
        <template #prefix>
          <el-icon>
            <Search />
          </el-icon>
        </template>
      </el-input>

      <el-button type="primary" :icon="Plus" @click="goToCreate">新增新闻</el-button>
    </div>

    <!--  新闻列表表格 -->
    <el-table :data="paginatedData" style="width: 100%; margin-top: 20px;" border stripe v-loading="loading">
      <!-- 标题列 -->
      <el-table-column prop="title" label="新闻标题">
        <template #default="scope">
          <span class="title-text">{{ scope.row.title }}</span>
        </template>
      </el-table-column>

      <!-- 发布日期列  -->
      <el-table-column prop="date" label="发布日期" align="center" sortable>
        <template #default="scope">
          {{ scope.row.date }}
        </template>
      </el-table-column>

      <!-- 是否置顶列 -->
      <el-table-column prop="isTop" label="是否置顶" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.isTop ? 'success' : 'info'" size="small" effect="plain">
            {{ scope.row.isTop ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="scope">
          <el-button type="primary" link size="small" :icon="Edit" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" link size="small" :icon="Delete" @click="handleDelete(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--  分页组件  -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { newsListApi, deleteNews } from '@/api/common.js';

const router = useRouter();



//  数据 (模拟) 
// const originalNewsData = [
//   {
//     id: 1,
//     title: "阜瑞快讯|埃斯顿机器人全国联保网络正式启动，华北授权网点高效服务保驾护航！",
//     name: "华北区域唯一授权联保网点烟台阜瑞智能装备有限公司|以山东为枢纽...",
//     pic: "/images/news/news-demo.png",
//     date: "2025-12-06",
//     isTop: true // 手动添加置顶字段
//   },
//   {
//     id: 2,
//     title: "阜瑞快讯 | 埃斯顿授权阜瑞智能为华北区域指定联保网点",
//     name: "华北区域唯一授权联保网点烟台阜瑞智能装备有限公司|以山东为枢纽...",
//     pic: "/images/news/news-demo.png",
//     date: "2025-12-06",
//     isTop: false
//   },
//   {
//     id: 3,
//     title: "方案速递|储能柜门板打磨解决方案",
//     name: "针对储能柜门板的打磨方案，通过“机器人+智能感知+工艺集成”的模式...",
//     pic: "/images/news/news-demo.png",
//     date: "2025-12-06",
//     isTop: false
//   },
//   // ... 这里放你完整的 newsContentItems 数组
//   // 为了演示，我复制了你的前3条，并给它们加上了 isTop 字段
// ];

//  状态管理  
const loading = ref(false);
const searchKeyword = ref('');
const newsData = ref([]); // 全量数据

// 分页状态
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
// 计算属性 

//  先过滤出所有符合条件的数据
const filteredData = computed(() => {
  if (!searchKeyword.value.trim()) {
    return newsData.value;
  }
  const keyword = searchKeyword.value.trim().toLowerCase();
  return newsData.value.filter(item =>
    item.title.toLowerCase().includes(keyword)
  );
});

//  基于过滤后的数据进行分页切片
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredData.value.slice(start, end);
});





// 搜索操作 (重置页码到第一页)
const handleSearch = () => {
  currentPage.value = 1;
};

// 每页数量变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 改变每页数量时，通常重置回第一页
};

// 页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  scrollToTop();
};

// 滚动到表格顶部
const scrollToTop = async () => {
  await nextTick();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 跳转到新增/编辑页面
const goToCreate = () => {
  router.push('/news/newsAddEdit');
};

const handleEdit = (row) => {
  router.push(`/news/newsAddEdit/${row.id}`);
};

const fetchNewsList = async (page, pageSize) => {
  loading.value = true; // 开启加载状态
  try {
    const res = await newsListApi(page, pageSize);
    console.log(res);
    // 接口返回但状态码非200的情况
    if (res.code === 200) {
      newsData.value = res.data;
      total.value = res.total;
    } else {
      ElMessage.error(res.msg || '获取新闻列表失败');
    }
  } catch (error) {
    console.error('获取新闻列表接口请求失败：', error);
    ElMessage.error('网络异常或服务器错误，请联系管理员');
  } finally {
    loading.value = false;
  }
};

// 删除操作
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除新闻 "${row.title}" 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    const res = await deleteNews(row.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      fetchNewsList(currentPage.value, pageSize.value);
    } else {
      ElMessage.error(res.msg || '删除新闻失败');
    }

  }).catch(() => { });
};

onMounted(() => {
  fetchNewsList(currentPage.value, pageSize.value);
});
</script>

<style scoped lang="scss">
.news-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  height: 100%;

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    @media (max-width: 600px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  :deep(.title-text) {
    color: #606266;
    font-weight: 500;

    &:hover {
      color: #409EFF;
      cursor: pointer;
      text-decoration: underline;
    }
  }

  :deep(.el-button--link) {
    margin: 0 5px;
  }

  :deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;
    background: #fff;

    .el-table__header th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
  }

  // 分页容器样式
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    background: #fff;
    padding: 15px 0;
    border-radius: 8px;
  }
}
</style>