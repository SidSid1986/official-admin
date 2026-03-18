<template>
  <div class="news-list-container">
    <!-- === 搜索与新增按钮 === -->
    <div class="header-actions">
      <el-input v-model="searchKeyword" placeholder="搜索新闻标题..." clearable style="width: 300px"
        @keyup.enter="filterData">
        <template #prefix><el-icon>
            <Search />
          </el-icon></template>
      </el-input>

      <el-button type="primary" :icon="Plus" @click="goToCreate">新增新闻</el-button>
    </div>

    <!-- === 新闻列表表格 === -->
    <el-table :data="filteredData" style="width: 100%; margin-top: 20px;" border stripe>
      <!-- 标题列 -->
      <el-table-column prop="title" label="新闻标题" min-width="300">
        <template #default="scope">
          <span class="title-text">{{ scope.row.title }}</span>
        </template>
      </el-table-column>

      <!-- 是否置顶列 -->
      <el-table-column prop="isTop" label="是否置顶" width="120" align="center">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();

// --- 1. 原始数据 (直接使用你提供的数据) ---
// 注意：你的原始数据中没有 `isTop` 字段，这里我们模拟添加
const originalNewsData = [
  {
    id: 1,
    title: "阜瑞快讯|埃斯顿机器人全国联保网络正式启动，华北授权网点高效服务保驾护航！",
    name: "华北区域唯一授权联保网点烟台阜瑞智能装备有限公司|以山东为枢纽...",
    pic: "/images/news/news-demo.png",
    date: "2025-12-06",
    isTop: true // 手动添加置顶字段
  },
  {
    id: 2,
    title: "阜瑞快讯 | 埃斯顿授权阜瑞智能为华北区域指定联保网点",
    name: "华北区域唯一授权联保网点烟台阜瑞智能装备有限公司|以山东为枢纽...",
    pic: "/images/news/news-demo.png",
    date: "2025-12-06",
    isTop: false
  },
  {
    id: 3,
    title: "方案速递|储能柜门板打磨解决方案",
    name: "针对储能柜门板的打磨方案，通过“机器人+智能感知+工艺集成”的模式...",
    pic: "/images/news/news-demo.png",
    date: "2025-12-06",
    isTop: false
  },
  // ... 这里放你完整的 newsContentItems 数组
  // 为了演示，我复制了你的前3条，并给它们加上了 isTop 字段
];

// --- 2. 状态管理 ---
const searchKeyword = ref('');
const newsData = ref(originalNewsData);

// --- 3. 计算属性：根据关键词过滤数据 ---
const filteredData = computed(() => {
  if (!searchKeyword.value.trim()) {
    return newsData.value;
  }

  const keyword = searchKeyword.value.trim().toLowerCase();
  return newsData.value.filter(item =>
    item.title.toLowerCase().includes(keyword)
  );
});

// --- 4. 方法 ---

// 跳转到新增/编辑页面
const goToCreate = () => {
  router.push('/news/newsAddEdit'); // 假设这是你的编辑页路由
};

const handleEdit = (row) => {
  router.push(`/news/newsAddEdit/${row.id}`);
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
  ).then(() => {
    // 模拟删除逻辑
    newsData.value = newsData.value.filter(item => item.id !== row.id);
    ElMessage.success('删除成功');
  });
};

// 重置搜索（清空输入框即可）
const filterData = () => {
  // 过滤逻辑已在 computed 中实现，无需额外操作
};
</script>

<style scoped lang="scss">
.news-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    // 在小屏幕上堆叠
    @media (max-width: 600px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  // 表格标题样式
  :deep(.title-text) {
    color: #606266;
    font-weight: 500;

    &:hover {
      color: #409EFF;
      cursor: pointer;
      text-decoration: underline;
    }
  }

  // 表格操作按钮间距
  :deep(.el-button--link) {
    margin: 0 5px;
  }

  // 表格样式微调
  :deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;

    .el-table__header th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
  }
}
</style>