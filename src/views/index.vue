<!--
 * @Author: Sid Li
 * @Date: 2026-03-17 10:15:00
 * @Description: 布局容器 (Layout) - 仅负责结构，内容由路由决定
-->
<template>
  <div class="admin-container">
    <!-- 顶部导航栏 -->
    <el-header class="admin-header">
      <div class="header-left">
        <el-icon size="32" class="toggle-sidebar" @click="toggleSidebar">
          <Fold v-if="sidebarOpened" />
          <Expand v-else />
        </el-icon>
        <span class="admin-title">CMS 内容管理系统</span>
      </div>
      <div class="header-right">
        <el-dropdown>
          <span class="user-info">
            <el-icon size="24">
              <User />
            </el-icon>
            管理员
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item>修改密码</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <div class="admin-main">
      <!-- 左侧侧边栏 -->
      <el-aside class="admin-sidebar" :width="sidebarOpened ? '220px' : '70px'">
        <!-- 
          关键修改 1: 添加 router 属性
          这样 el-menu-item 的 index 直接对应路由 path，点击自动跳转，无需 handleMenuSelect
        -->
        <!-- 
          关键修改 2: :default-active="$route.path"
          让菜单高亮状态始终跟随当前浏览器 URL，刷新页面也能保持高亮
        -->
        <el-menu :default-active="$route.path" class="admin-menu" :collapse="!sidebarOpened" background-color="#2e3b4e"
          text-color="#fff" active-text-color="#ffd04b" collapse-transition router>
          <!-- 仪表盘：index 对应 router/index.js 中的 path '/home' -->
          <el-menu-item index="/home">
            <el-icon size="24">
              <Monitor />
            </el-icon>
            <template #title>首页</template>
          </el-menu-item>


          <!-- 新闻news -->
          <el-sub-menu index="solution-group">
            <template #title>
              <el-icon size="24">
                <Document />
              </el-icon>
              <span>新闻管理</span>
            </template>
            <el-menu-item index="/news/newsList">新闻列表</el-menu-item>
            <el-menu-item index="/news/newsAddEdit">增加编辑新闻</el-menu-item>
          </el-sub-menu>
          <!-- 服务支持service -->
          <el-menu-item index="/service">
            <el-icon size="24">
              <Document />
            </el-icon>
            <template #title>服务支持</template>
          </el-menu-item>
          <!-- 关于我们about -->
          <el-menu-item index="/about">
            <el-icon size="24">
              <Document />
            </el-icon>
            <template #title>关于我们</template>
          </el-menu-item>
          <!-- 资料下载downLoad -->
          <el-menu-item index="/downLoad">
            <el-icon size="24">
              <Document />
            </el-icon>
            <template #title>资料下载</template>
          </el-menu-item>
          <!-- 产品管理 -->
          <el-sub-menu index="cms-group">
            <template #title>
              <el-icon size="24">
                <Document />
              </el-icon>
              <span>产品管理</span>
            </template>
            <el-menu-item index="/cms/productList">产品列表</el-menu-item>
            <el-menu-item index="/cms/productAddEdit">增加编辑产品</el-menu-item>
          </el-sub-menu>
          <!-- 解决方案solution -->
          <el-sub-menu index="solution-group">
            <template #title>
              <el-icon size="24">
                <Document />
              </el-icon>
              <span>解决方案</span>
            </template>
            <el-menu-item index="/solution/solutionList">解决方案列表</el-menu-item>
            <el-menu-item index="/solution/solutionAddEdit">增加编辑解决方案</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区域 -->
      <el-main class="admin-content">
        <!-- 
          关键修改 3: 动态面包屑
          不再使用硬编码的 menuMap，而是直接从当前路由的 meta 信息中读取
        -->
        <el-breadcrumb class="content-breadcrumb" separator="/">
          <el-breadcrumb-item v-for="(item, index) in currentBreadcrumb" :key="index" :to="getBreadcrumbPath(index)">
            {{ item }}
          </el-breadcrumb-item>
        </el-breadcrumb>

        <el-card class="content-card">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-card>
      </el-main>
    </div>

    <el-footer class="admin-footer">
      <span>© 2026 CMS 内容管理系统 - 官网数据管理平台</span>
    </el-footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Fold, Expand, User, Monitor, Document } from '@element-plus/icons-vue';

// 使用 useRoute 获取当前路由信息
const route = useRoute();
const router = useRouter();
const sidebarOpened = ref(true);

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpened.value = !sidebarOpened.value;
};

// 计算当前面包屑列表
// 逻辑：优先读取路由配置中 meta.breadcrumb 数组，如果没有则 fallback 到 meta.title
const currentBreadcrumb = computed(() => {
  if (route.meta && Array.isArray(route.meta.breadcrumb)) {
    return route.meta.breadcrumb;
  }
  // 兜底：如果没配面包屑，就显示当前页面标题
  return [route.meta.title || '当前页面'];
});

// 获取面包屑项的跳转路径
// 逻辑：除了最后一项（当前页），其他项都可以点击跳转
const getBreadcrumbPath = (index) => {
  const isLast = index === currentBreadcrumb.value.length - 1;
  if (isLast) return ''; // 最后一项不可点击

  const label = currentBreadcrumb.value[index];
  if (label === '首页') return '/home';

  // 如果有更多层级，可以在这里扩展逻辑，或者直接在 meta.breadcrumb 中存对象 { label, path }
  return '';
};

// 退出登录
const handleLogout = () => {
  localStorage.clear();
  ElMessage.success('退出登录成功');
  router.push('/login');
};

// 删除了原来的 handleMenuSelect，因为 el-menu 加了 router 属性后自动处理跳转
// 删除了原来的 menuMap 和 currentComponent 变量
</script>

<style scoped lang="scss">
.admin-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 16px;
}

.admin-header {
  height: 70px;
  line-height: 70px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;

    .toggle-sidebar {
      cursor: pointer;
      color: #333;
      transition: color 0.3s;

      &:hover {
        color: #1989fa;
      }
    }

    .admin-title {
      font-size: 20px;
      font-weight: 600;
      color: #2e3b4e;
    }
  }

  .header-right {
    .user-info {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #333;
      font-size: 16px;
      transition: color 0.3s;

      &:hover {
        color: #1989fa;
      }
    }
  }
}

.admin-main {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;

  .admin-sidebar {
    background-color: #2e3b4e;
    transition: width 0.3s ease;
    overflow-x: hidden;
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);

    .admin-menu {
      height: 100%;
      border-right: none;
      font-size: 16px;
      --el-menu-item-height: 60px;
      --el-sub-menu-title-height: 60px;

      &.el-menu--collapse {
        .el-sub-menu__icon-arrow {
          display: none;
        }

        .el-menu-item__title,
        .el-sub-menu__title span {
          display: none;
        }
      }
    }
  }

  .admin-content {
    flex: 1;
    background-color: #f5f7fa;
    padding: 30px;
    overflow-y: auto;
    font-size: 16px;
    display: flex;
    flex-direction: column;

    .content-breadcrumb {
      margin-bottom: 10px;
      font-size: 16px;
      // user-select: none;

      :deep(.el-breadcrumb__item) {
        font-size: 16px;

        &:last-child {
          color: #97a8be;
          cursor: default;
        }
      }
    }

    .content-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-radius: 4px;

      :deep(.el-card__body) {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
      }
    }
  }
}

.admin-footer {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: #fff;
  color: #666;
  font-size: 14px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

:deep(.el-dropdown-menu) {
  font-size: 14px;
}

/* 页面切换过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.25s ease-out;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>

<style lang="scss">
/* 全局重置与覆盖 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #333;
  background-color: #f5f7fa;
  font-size: 14px;
}

/* Element Plus 菜单自定义样式 */
.el-menu {
  --el-menu-text-color: #bfcbd9;
  --el-menu-active-text-color: #ffd04b;
  --el-menu-hover-text-color: #fff;
  --el-menu-bg-color: #2e3b4e;
  --el-menu-hover-bg-color: #1f2d3d;
  --el-menu-item-height: 60px;
  --el-menu-sub-item-height: 60px;
  --el-menu-icon-size: 20px;
  border-right: none !important;
}

.el-sub-menu__title:hover,
.el-menu-item:hover {
  background-color: #1f2d3d !important;
}

.el-menu-item.is-active {
  background-color: #1f2d3d !important;
  color: #ffd04b !important;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: #ffd04b;
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-track {
  background: #f0f0f0;
}
</style>