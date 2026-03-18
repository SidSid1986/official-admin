/*
 * @Author: Sid Li
 * @Date: 2026-03-16 15:03:38
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-03-18 17:00:02
 * @FilePath: \admin-demo\src\router\index.js
 * @Description:
 */
import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Layout",
    component: () => import("@/views/index.vue"), // 布局容器
    redirect: "/home",
    meta: { requiresAuth: true },
    children: [
      {
        path: "home",
        name: "Home",

        component: () => import("@/views/home.vue"),
        meta: {
          title: "首页",
          icon: "Monitor",
          breadcrumb: ["首页"],
        },
      },

      // 新闻news
      {
        path: "news/newsList",
        name: "NewsList",

        component: () => import("@/views/news/newsList.vue"),
        meta: {
          title: "新闻列表",
          icon: "Monitor",
          breadcrumb: ["新闻列表"],
        },
      },
      {
        path: `news/newsAddEdit/:id?`,
        name: "NewsAddEdit",

        component: () => import("@/views/news/newsAddEdit.vue"),
        meta: {
          title: "增加编辑新闻",
          icon: "Document",
          breadcrumb: ["增加编辑新闻"],
        },
      },
      //服务支持
      {
        path: "service",
        name: "Service",

        component: () => import("@/views/service.vue"),
        meta: {
          title: "服务支持",
          icon: "Document",
          breadcrumb: ["服务支持"],
        },
      },
      //关于我们
      {
        path: "about",
        name: "About",

        component: () => import("@/views/about.vue"),
        meta: {
          title: "关于我们",
          icon: "Document",
          breadcrumb: ["关于我们"],
        },
      },
      //资料下载
      {
        path: "download",
        name: "Download",

        component: () => import("@/views/download.vue"),
        meta: {
          title: "资料下载",
          icon: "Document",
          breadcrumb: ["资料下载"],
        },
      },
      //产品管理
      {
        path: "cms/productList",
        name: "ProductList",

        component: () => import("@/views/cms/productList.vue"),
        meta: {
          title: "产品列表",
          icon: "Document",
          breadcrumb: ["产品列表"],
        },
      },
      //增加编辑产品
      {
        path: `cms/productAddEdit/:id?`,
        name: "ProductAddEdit",

        component: () => import("@/views/cms/productAddEdit.vue"),
        meta: {
          title: "增加编辑产品",
          icon: "Document",
          breadcrumb: ["增加编辑产品"],
        },
      },

      //解决方案
      {
        path: "solution/solutionList",
        name: "SolutionList",
        component: () => import("@/views/solution/solutionList.vue"),
        meta: {
          title: "解决方案列表",
          icon: "Document",
          breadcrumb: ["解决方案列表"],
        },
      },
      {
        path: "solution/solutionAddEdit/:id?",
        name: "SolutionAddEdit",

        component: () => import("@/views/solution/solutionAddEdit.vue"),
        meta: {
          title: "增加编辑解决方案",
          icon: "Document",
          breadcrumb: ["增加编辑解决方案"],
        },
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/notFound.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// ... 路由守卫代码保持不变 ...
router.beforeEach((to, from, next) => {
  import("@/utils/crypto.js")
    .then(({ decrypt }) => {
      const encryptToken = localStorage.getItem("token");
      let isLogin = false;
      try {
        isLogin = encryptToken ? !!decrypt(encryptToken) : false;
      } catch (e) {
        isLogin = false;
      }

      const requiresAuth = to.meta.requiresAuth;

      if (requiresAuth) {
        if (isLogin) {
          next();
        } else {
          next("/login");
        }
      } else {
        if (to.path === "/login" && isLogin) {
          next("/");
        } else {
          next();
        }
      }
    })
    .catch(() => next("/login"));
});

export default router;
